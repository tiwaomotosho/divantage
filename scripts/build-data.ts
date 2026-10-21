// Build-time data generation (09 §3): type-ahead indexes, search documents, per-identity and per-tool JSON
// for client-rendered routes (S27 combined, S28), helper panel data, sitemap, robots, export and flags.
// Run with: bun run scripts/build-data.ts
import fs from "node:fs";
import path from "node:path";
import {
  db,
  helperPanelData,
  listedHelpers,
  prerenderPaths,
  resolveFlags,
  needCard,
  toolRow,
} from "../src/lib/content.server";
import type { ContentDoc, ContentIndexFile, IdentityDoc, SkillDoc } from "../src/lib/search";
import { plural } from "../src/lib/format";
import { toolIdFromSlug } from "../src/lib/identity";

const t0 = Date.now();
const PUB = path.resolve("public");
const GEN = path.resolve("app/generated");
const write = (p: string, data: unknown) => {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, typeof data === "string" ? data : JSON.stringify(data));
};
for (const d of ["api/v1", "data"]) fs.rmSync(path.join(PUB, d), { recursive: true, force: true });

const D = db();
const E = D.engine;
const flags = resolveFlags();
const SITE_URL = (process.env.SITE_URL ?? "https://digital-advantage.vercel.app").replace(/\/$/, "");
const buildDate = new Date().toISOString().slice(0, 10);

// ---- Flags + build info for the client bundle ----
write(path.join(GEN, "build.json"), { flags, listedHelpers: listedHelpers(), buildDate, siteUrl: SITE_URL, brand: process.env.BRAND_NAME ?? "Digital Advantage" });

// ---- Identity type-ahead index (search-config identity_search) ----
const identityDocs: IdentityDoc[] = D.identities.map((i) => ({
  s: i.slug,
  l: i.label,
  a: i.aliases.join(" | "),
  p: i.parent ? (E.ids.get(i.parent)?.label ?? "") : "",
  f: E.fams.get(i.family)?.label ?? "",
  c: E.secs.get(i.sector)?.label ?? "",
  k: i.kind,
}));
write(path.join(PUB, "api/v1/identities-index.json"), identityDocs);

// ---- Skills index ----
const skillDocs: SkillDoc[] = D.skillsFile.values.map((s) => ({
  id: s.slug,
  label: s.label,
  group: s.group,
  kw: (s.keywords ?? []).join(" | "),
  desc: s.description,
  needs: s.need_ids.map((n) => D.needById.get(n)?.label ?? "").join(" | "),
  tools: s.tool_ids.slice(0, 12).map((t) => D.regById.get(t)?.name ?? "").join(" | "),
}));
write(path.join(PUB, "api/v1/skills-index.json"), skillDocs);

// ---- Tool names (tool type-ahead, "<tool> for <identity>" routing) ----
write(
  path.join(PUB, "api/v1/tools-index.json"),
  D.registry.map((r) => ({ slug: r.slug, name: r.name })),
);

// ---- Content search documents (reference-harness.mjs, extended with registry, needs, skills, helpers) ----
const cfg = JSON.parse(fs.readFileSync("spec/spec-assets/search/search-config.json", "utf8"));
const cats = new Map(D.categories.map((c) => [c.id, c]));
const fams = new Map(D.taskFamilies.map((f) => [f.slug, f]));
const swp = new Map<string, boolean>(D.vocab.pricing_model.values.map((v: any) => [v.id, Boolean(v.starts_without_paying)]));
const docs: ContentDoc[] = [];
const kinds: [keyof typeof D.records, ContentDoc["type"], string][] = [
  ["tools", "tool", "/tools/"],
  ["tasks", "task", "/tasks/"],
  ["resources", "resource", "/resources/"],
  ["playbooks", "playbook", "/playbooks/"],
  ["comparisons", "comparison", "/compare/"],
];
for (const [k, type, base] of kinds) {
  for (const r of D.records[k] as any[]) {
    const catIds: string[] = r.category_ids ?? [];
    docs.push({
      id: r.id,
      type,
      url: base + r.slug,
      title: r.name || [r.title, r.short_title].filter(Boolean).join(" "),
      aliases: [...(r.search_aliases ?? []), ...catIds.flatMap((c) => cats.get(c)?.aliases ?? [])].join(" "),
      summary: r.summary || r.problem_statement || r.outcome || r.decision_question || "",
      taxonomy: [...catIds.map((c) => cats.get(c)?.label ?? ""), r.family_id ? (fams.get(r.family_id)?.label ?? "") : ""].join(" "),
      description: r.description || r.expected_outcome || r.learning_outcome || "",
      body: [
        ...(r.steps ?? []).map((s: any) => `${s.title} ${s.instructions ?? ""}`),
        ...(r.best_for ?? []),
        ...(r.key_capabilities ?? []).map((x: any) => x.text),
      ].join(" "),
      starts: type === "tool" ? (swp.get(r.pricing.model) ?? false) : type === "resource" ? r.cost_status === "free" : null,
      platforms: r.platforms?.verification_status !== "unverified" ? (r.platforms?.values ?? []) : [],
    });
  }
}
const fullIds = new Set(docs.map((d) => d.id));
for (const r of D.registry) {
  if (fullIds.has(r.id)) continue;
  const pilot = D.pilotByTool.get(r.slug);
  docs.push({
    id: r.id,
    type: "tool",
    url: `/tools/${r.slug}`,
    title: r.name,
    aliases: [r.slug.replace(/-/g, " "), r.publisher ?? ""].join(" "),
    summary: pilot?.summary ?? "",
    taxonomy: cats.get(`cat_${(r.category_id ?? "").replace(/-/g, "_")}`)?.label ?? "",
    description: "",
    body: "",
    starts: null,
    platforms: [],
    stub: true,
  });
}
for (const n of D.needsFile.values) {
  docs.push({
    id: n.id,
    type: "need",
    url: `/needs/${n.slug}`,
    title: n.label,
    aliases: "",
    summary: n.description,
    taxonomy: fams.get(n.task_family)?.label ?? "",
    description: "",
    body: n.tool_ids.map((t) => D.regById.get(t)?.name ?? "").join(" "),
    starts: null,
    platforms: [],
  });
}
for (const s of D.skillsFile.values) {
  docs.push({
    id: s.id,
    type: "skill",
    url: `/skills/${s.slug}`,
    title: s.label,
    aliases: s.keywords.join(" "),
    summary: s.description,
    taxonomy: "",
    description: "",
    body: "",
    starts: null,
    platforms: [],
  });
}
for (const h of D.helpers.filter((x) => listedHelpers().includes(x.slug))) {
  docs.push({
    id: `helper_${h.slug}`,
    type: "helper",
    url: `/helpers/${h.slug}`,
    title: h.title,
    aliases: h.identities.join(" "),
    summary: h.promise,
    taxonomy: "",
    description: h.intro,
    body: h.stages.map((s) => s.title + " " + s.goal).join(" "),
    starts: null,
    platforms: [],
  });
}
const costRule = cfg.ranking_adjustments.find((r: any) => r.rule === "cost_intent");
const platRule = cfg.ranking_adjustments.find((r: any) => r.rule === "platform_intent");
const contentIndex: ContentIndexFile = {
  options: {
    stopwords: cfg.options.stopwords,
    spelling_variants: cfg.options.spelling_variants,
    synonyms: cfg.options.synonyms,
    boost: cfg.options.boost,
    cost_terms: costRule.trigger_terms,
    platform_terms: platRule.trigger_terms,
  },
  docs,
};
write(path.join(PUB, "api/v1/search-index.json"), contentIndex);

// ---- Per-identity toolkit data (combined toolkit /for/a+b, S28 better-fit tools) ----
for (const i of D.identities) {
  write(path.join(PUB, `data/id/${i.slug}.json`), {
    identity: { slug: i.slug, label: i.label, plural: plural(i.label), pluralTitle: plural(i.label, { lower: false }) },
    sector: { slug: i.sector, label: E.secs.get(i.sector)?.label ?? i.sector },
    resolved: E.resolve(i.slug),
  });
}
write(path.join(PUB, "data/need-cards.json"), Object.fromEntries(D.needsFile.values.map((n) => [n.slug, needCard(n.slug)])));

// ---- Per-tool data for S28 (/for/{identity}/{tool}) ----
for (const r of D.registry) {
  const rm = E.roadmapForTool(r.id);
  const needs = D.needsFile.values
    .filter((n) => n.tool_ids.includes(r.id))
    .map((n) => ({ slug: n.slug, label: n.label, description: n.description }));
  write(path.join(PUB, `data/tool/${r.slug}.json`), {
    tool: { slug: r.slug, name: r.name, row: toolRow(r.id) },
    roadmap: rm ?? null,
    lenses: rm ? D.lenses.filter((l) => l.roadmap === rm.slug) : [],
    lensNeeds: rm ? D.lensIndex.filter((l) => l.roadmap === rm.slug).map((l) => l.need) : [],
    needs,
  });
}

// ---- Helper panel data (S41) ----
write(path.join(PUB, "data/helpers.json"), helperPanelData());

// ---- Machine export ----
write(path.join(PUB, "export/catalogue-v2.json"), {
  version: "2.5",
  generated: buildDate,
  licence: "CC BY 4.0",
  tools: D.records.tools,
  tasks: D.records.tasks,
  resources: D.records.resources,
  playbooks: D.records.playbooks,
  comparisons: D.records.comparisons,
});

// ---- Sitemap and robots (FR-066: disallow everything while noindex_site is on) ----
const paths = prerenderPaths().filter((p) => !["/search", "/suggest", "/report", "/report/thanks"].includes(p));
write(
  path.join(PUB, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths
    .map((p) => `<url><loc>${SITE_URL}${p}</loc></url>`)
    .join("\n")}\n</urlset>\n`,
);
write(
  path.join(PUB, "robots.txt"),
  flags.noindex_site ? "User-agent: *\nDisallow: /\n" : `User-agent: *\nAllow: /\nDisallow: /suggest\nDisallow: /search\nSitemap: ${SITE_URL}/sitemap.xml\n`,
);

// ---- Sanity: the helper and home curated slugs exist (validate_feature_matrix.py checks the same) ----
const missing = [
  ...D.homeFeatured.popular.filter((s) => !E.ids.has(s)).map((s) => `home-featured popular: ${s}`),
  ...D.homeFeatured.ribbon.filter((s) => !E.ids.has(s)).map((s) => `home-featured ribbon: ${s}`),
  ...D.helpers.flatMap((h) => h.stages.flatMap((s) => s.steps.filter((st) => !D.regBySlug.has(st.tool)).map((st) => `helper ${h.slug}: tool ${st.tool}`))),
];
if (missing.length) console.warn("Missing slugs:\n  " + missing.join("\n  "));

console.log(
  `build-data: ${identityDocs.length} identities, ${docs.length} search docs, ${prerenderPaths().length} prerender paths, plural sample "${plural("Medical Doctor")}" (${Date.now() - t0} ms)`,
);
void toolIdFromSlug;
