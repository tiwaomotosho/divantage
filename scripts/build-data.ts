// Build-time data generation (09 §3, V2.8): type-ahead and goal indexes, per-identity and per-tool JSON for
// client-rendered routes (learning paths, combined toolkits), kits and helper data, sitemap, robots, export,
// flags, and the closed asset maps the React components import (icons, photos).
// Run with: bun run scripts/build-data.ts
import fs from "node:fs";
import path from "node:path";
import {
  db,
  helperPanelData,
  kitVisual,
  listedHelpers,
  needCard,
  prerenderPaths,
  resolveFlags,
  trustFor,
  goalIndexDocs,
} from "../src/lib/content.server";
import type { ContentDoc, ContentIndexFile, IdentityDoc, SkillDoc } from "../src/lib/search";
import { plural } from "../src/lib/format";
import { depthFromAuthoring } from "../src/lib/view";

const t0 = Date.now();
const PUB = path.resolve("public");
const GEN = path.resolve("app/generated");
const write = (p: string, data: unknown) => {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, typeof data === "string" ? data : JSON.stringify(data));
};
for (const d of ["api/v1", "data", "export"]) fs.rmSync(path.join(PUB, d), { recursive: true, force: true });

const D = db();
const E = D.engine;
const flags = resolveFlags();
const SITE_URL = (process.env.SITE_URL ?? "https://digital-advantage.vercel.app").replace(/\/$/, "");
const buildDate = new Date().toISOString().slice(0, 10);

// ---- Client constants and the closed asset maps (doc 29 L3) ----
write(path.join(GEN, "build.json"), { flags, listedHelpers: listedHelpers(), buildDate, siteUrl: SITE_URL, brand: process.env.BRAND_NAME ?? "Digital Advantage" });
fs.copyFileSync(path.join(PUB, "assets/icons/icons.ts"), path.join(GEN, "icons.ts"));
const photos = Object.fromEntries(
  Object.entries(JSON.parse(fs.readFileSync(path.join(PUB, "assets/photos/manifest.json"), "utf8")).photos).map(([k, p]: [string, any]) => [
    k,
    { alt: p.alt, focal: p.focal, variants: Object.fromEntries(Object.entries(p.variants).map(([r, v]: [string, any]) => [r, { widths: v.widths, aspect: v.aspect, lqip: v.lqip }])) },
  ]),
);
write(path.join(GEN, "photos.json"), photos);
const overrideDir = path.join(PUB, "assets/tool-logos/overrides");
write(path.join(GEN, "logo-overrides.json"), fs.existsSync(overrideDir) ? fs.readdirSync(overrideDir).filter((f) => f.endsWith(".svg")).map((f) => f.replace(/\.svg$/, "")) : []);

// ---- Identity type-ahead (search-config identity_search) ----
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

// ---- Skills and tools ----
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
write(path.join(PUB, "api/v1/tools-index.json"), D.registry.map((r) => ({ slug: r.slug, name: r.name, price: trustFor(r.slug).price })));

// ---- Goal + kit index ("I want to…", doc 26 §6) ----
const goalDocs = goalIndexDocs();
write(path.join(PUB, "api/v1/goals-index.json"), {
  docs: goalDocs,
  kits: Object.fromEntries(D.kits.map((k) => [k.slug, { title: k.title, promise: k.promise, steps: k.goal_slugs.length, photo: kitVisual(k.slug).photo ?? null }])),
  safety: Object.fromEntries(D.safety.rules.map((r) => [r.tag, { label: r.label, what: r.what_to_know }])),
  goalTags: D.safety.goal_tags,
});

// ---- Content search (tools, needs, skills, helpers; reference-harness.mjs extended) ----
const cfg = JSON.parse(fs.readFileSync("spec/spec-assets/search/search-config.json", "utf8"));
const docs: ContentDoc[] = [];
for (const r of D.registry) {
  const p = D.profileBySlug.get(r.slug);
  docs.push({ id: r.id, type: "tool", url: `/tools/${r.slug}`, title: r.name, aliases: [r.slug.replace(/-/g, " "), r.publisher ?? ""].join(" "), summary: p?.description ?? "", taxonomy: "", description: "", body: "", starts: null, platforms: [], stub: !p });
}
for (const n of D.needsFile.values) docs.push({ id: n.id, type: "need", url: `/needs/${n.slug}`, title: n.label, aliases: "", summary: n.description, taxonomy: "", description: "", body: "", starts: null, platforms: [] });
for (const s of D.skillsFile.values) docs.push({ id: s.id, type: "skill", url: `/skills/${s.slug}`, title: s.label, aliases: s.keywords.join(" "), summary: s.description, taxonomy: "", description: "", body: "", starts: null, platforms: [] });
const costRule = cfg.ranking_adjustments.find((r: any) => r.rule === "cost_intent");
const platRule = cfg.ranking_adjustments.find((r: any) => r.rule === "platform_intent");
const contentIndex: ContentIndexFile = {
  options: { stopwords: cfg.options.stopwords, spelling_variants: cfg.options.spelling_variants, synonyms: cfg.options.synonyms, boost: cfg.options.boost, cost_terms: costRule.trigger_terms, platform_terms: platRule.trigger_terms },
  docs,
};
write(path.join(PUB, "api/v1/search-index.json"), contentIndex);

// ---- Per-identity data (combined toolkits, learning paths, workbench suggestions) ----
for (const i of D.identities) {
  write(path.join(PUB, `data/id/${i.slug}.json`), {
    identity: { slug: i.slug, label: i.label, plural: plural(i.label), pluralTitle: plural(i.label, { lower: false }) },
    sector: { slug: i.sector, label: E.secs.get(i.sector)?.label ?? i.sector },
    resolved: E.resolve(i.slug),
    kits: D.kitHints[i.slug] ?? [],
  });
}
write(path.join(PUB, "data/need-cards.json"), Object.fromEntries(D.needsFile.values.map((n) => [n.slug, needCard(n.slug)])));

// ---- Per-tool data for learning-path pages (S30, S29/role paths) ----
const idLite = (s: string) => {
  const i = E.ids.get(s);
  return i ? { slug: i.slug, label: i.label, plural: plural(i.label) } : null;
};
for (const r of D.registry) {
  const rm = E.roadmapForTool(r.id);
  const lenses = rm ? D.lenses.filter((l) => l.roadmap === rm.slug) : [];
  write(path.join(PUB, `data/tool/${r.slug}.json`), {
    tool: { slug: r.slug, name: r.name },
    trust: trustFor(r.slug),
    roadmap: rm ?? null,
    depth: rm ? depthFromAuthoring(rm.authoring) : null,
    lenses,
    lensIds: Object.fromEntries([...new Set(lenses.flatMap((l) => l.for_identities))].map((s) => [s, idLite(s)]).filter(([, v]) => v)),
    lensNeeds: rm ? D.lensIndex.filter((l) => l.roadmap === rm.slug).map((l) => l.need) : [],
    needs: D.needsFile.values.filter((n) => n.tool_ids.includes(r.id)).map((n) => ({ slug: n.slug, label: n.label, description: n.description })),
    alternatives: (D.altByTool.get(r.id) ?? []).slice(0, 3).map((a) => D.regById.get(a)).filter(Boolean).map((a) => ({ slug: a!.slug, name: a!.name })),
  });
}

// ---- Kits (workbench suggestions), helpers (helper bar) ----
write(
  path.join(PUB, "data/kits.json"),
  Object.fromEntries(D.kits.map((k) => [k.slug, { title: k.title, ...kitVisual(k.slug), steps: k.goal_slugs.map((s) => ({ slug: s, label: D.goalBySlug.get(s)?.label ?? s })) }])),
);
write(path.join(PUB, "data/helpers.json"), helperPanelData());

// ---- Demo data (owner decision 26 Oct 2026): user-dependent features run on labelled sample data until launch ----
// Deterministic so builds and visual baselines are stable.
function rng(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 3432918353), (h = (h << 13) | (h >>> 19));
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}
const WEEK = "2026-10-19";
const kitGoals = new Set(D.kits.flatMap((k) => k.goal_slugs));
function trendingFor(market: "ng" | "africa" | "all") {
  const r = rng(`${WEEK}:${market}`);
  const pickGoals = D.goals
    .filter((g) => kitGoals.has(g.slug) && (market === "all" || g.markets.includes(market) || g.markets.includes("all")))
    .map((g) => ({ g, w: r() * (g.markets.includes(market) ? 1.6 : 1) }))
    .sort((a, b) => b.w - a.w)
    .slice(0, 10);
  const count = (i: number) => Math.round(220 / (i + 1.4) + r() * 25) + 10;
  const delta = () => Math.round(r() * 26) - 6;
  const goals = pickGoals.map(({ g }, i) => ({ slug: g.slug, label: g.label, group: E.needs.get(g.need)?.label ?? "", count: count(i), delta: delta() }));
  const skills = [...D.skillsFile.values].sort(() => r() - 0.5).slice(0, 5).map((s, i) => ({ slug: s.slug, label: s.label, count: count(i), delta: delta() }));
  const identities = D.homeFeatured.ribbon.map((s) => E.ids.get(s)).filter(Boolean).sort(() => r() - 0.5).slice(0, 5).map((i, k) => ({ slug: i!.slug, label: i!.label, count: count(k), delta: delta() }));
  const toolIds = [...new Set(pickGoals.flatMap(({ g }) => g.tool_ids.slice(0, 1)))].slice(0, 5);
  const tools = toolIds.map((t, i) => ({ slug: D.regById.get(t)!.slug, name: D.regById.get(t)!.name, count: count(i), delta: delta() }));
  return { goals, skills, identities, tools };
}
write(path.join(PUB, "data/trending.json"), { demo: true, week: WEEK, people: 1284, markets: { ng: trendingFor("ng"), africa: trendingFor("africa"), all: trendingFor("all") } });
// Goals per need (recommendation rule R4, "Core goals for you").
write(path.join(PUB, "data/goals-by-need.json"), Object.fromEntries([...D.goalsByNeed.entries()].map(([n, gs]) => [n, gs.slice(0, 4).map((g) => ({ slug: g.slug, label: g.label, intents: g.intents ?? [] }))])));
// What's new entries for "personal what's new" (R8).
write(path.join(PUB, "data/whats-new.json"), D.whatsNew.entries ?? []);

// ---- Machine export ----
write(path.join(PUB, "export/catalogue-v2.json"), { version: "2.8", generated: buildDate, licence: "CC BY 4.0", goals: D.goals, kits: D.kits, profiles: D.profiles, tools: D.registry });

// ---- Sitemap and robots (FR-066: disallow everything while noindex_site is on) ----
const paths = prerenderPaths().filter((p) => !["/search", "/suggest", "/report", "/report/thanks", "/me", "/me/profile"].includes(p));
write(path.join(PUB, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths.map((p) => `<url><loc>${SITE_URL}${p}</loc></url>`).join("\n")}\n</urlset>\n`);
write(path.join(PUB, "robots.txt"), flags.noindex_site ? "User-agent: *\nDisallow: /\n" : `User-agent: *\nAllow: /\nDisallow: /suggest\nDisallow: /search\nDisallow: /me\nSitemap: ${SITE_URL}/sitemap.xml\n`);

// ---- Sanity checks ----
const missing = [
  ...D.helpers.flatMap((h) => h.stages.flatMap((s) => s.steps.filter((st) => !D.regBySlug.has(st.tool)).map((st) => `helper ${h.slug}: tool ${st.tool}`))),
  ...D.goals.flatMap((g) => g.tool_ids.filter((t) => !D.regById.has(t)).map((t) => `goal ${g.slug}: ${t}`)),
  ...D.kits.flatMap((k) => k.goal_slugs.filter((g) => !D.goalBySlug.has(g)).map((g) => `kit ${k.slug}: ${g}`)),
];
if (missing.length) console.warn(`Missing references (${missing.length}):\n  ` + missing.slice(0, 20).join("\n  "));
console.log(`build-data: ${identityDocs.length} identities, ${D.goals.length} goals, ${D.kits.length} kits, ${D.registry.length} tools, ${prerenderPaths().length} prerender paths (${Date.now() - t0} ms)`);
