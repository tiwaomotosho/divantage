// Build-time content loader (11 §2). Reads content/ from disk and builds page data for route loaders
// and scripts/build-data.ts. Never shipped to the browser (.server module).
import fs from "node:fs";
import path from "node:path";
import { Engine, lensKey, toolIdFromSlug } from "./identity";
import { plural } from "./format";
import type {
  Family,
  Helper,
  Identity,
  Lens,
  Level,
  Need,
  PilotProfile,
  RegistryEntry,
  Roadmap,
  Sector,
  Skill,
} from "./types";
import { LEVELS } from "./types";
import { lensLevels, roadmapLevels, type ModuleView } from "./lensview";
export type { ModuleView };

const ROOT = path.resolve(process.cwd(), "content");
const read = <T = any>(p: string): T => JSON.parse(fs.readFileSync(path.join(ROOT, p), "utf8"));
const readDir = <T = any>(p: string): T[] =>
  fs
    .readdirSync(path.join(ROOT, p))
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) => read<T>(path.join(p, f)));

export interface ToolRow {
  slug: string;
  name: string;
  hue: string;
  /** Pricing label for profiled tools; null for registry-only tools ("Profile coming soon"). */
  pricing: string | null;
  starts: boolean;
  guide: boolean;
}

export interface NeedCardData {
  slug: string;
  label: string;
  description: string;
  family: string;
  tools: ToolRow[];
  lensTool: { slug: string; name: string } | null;
  more: number;
}

function load() {
  const identities = read<{ values: Identity[] }>("taxonomy/identities/identities.json").values;
  const families = read<{ values: Family[] }>("taxonomy/identities/families.json").values;
  const sectors = read<{ values: Sector[] }>("taxonomy/identities/sectors.json").values.sort((a, b) => a.order - b.order);
  const needsFile = read<{ values: Need[]; universal: string[] }>("taxonomy/needs.json");
  const registry = read<{ values: RegistryEntry[] }>("registry/tools-registry.json").values;
  const roadmaps = readDir<Roadmap>("records/roadmaps");
  const lenses = readDir<Lens>("records/lenses");
  const engine = new Engine({
    identities,
    families,
    sectors,
    needs: needsFile.values,
    universal: needsFile.universal,
    registry,
    roadmaps,
    lenses,
  });
  const skillsFile = read<{ values: Skill[]; groups: { slug: string; label: string; order: number }[] }>("taxonomy/skills.json");
  const helpers = read<{ values: Helper[] }>("taxonomy/helpers.json").values;
  const pilot = read<{ values: PilotProfile[] }>("taxonomy/pilot-profiles.json").values;
  const categories = read<{ values: any[] }>("taxonomy/categories.json").values;
  const taskFamilies = read<{ values: any[] }>("taxonomy/task-families.json").values;
  const vocab = read<any>("taxonomy/vocabularies.json");
  const flagsFile = read<any>("config/feature-flags.json");
  const homeFeatured = read<{ popular: string[]; ribbon: string[] }>("config/home-featured.json");
  const lensIndex = read<{ values: { roadmap: string; need: string; kind: string; core_modules: number }[] }>(
    "generated/lens-index.json",
  ).values;
  const records = {
    tools: readDir<any>("records/tools"),
    tasks: readDir<any>("records/tasks"),
    resources: readDir<any>("records/resources"),
    playbooks: readDir<any>("records/playbooks"),
    comparisons: readDir<any>("records/comparisons"),
  };
  const whatsNew = fs.existsSync(path.join(ROOT, "whats-new.json")) ? read<any>("whats-new.json") : { weeks: [] };
  const contributors = fs.existsSync(path.join(ROOT, "contributors.json")) ? read<any>("contributors.json") : { values: [] };
  return {
    identities,
    families,
    sectors,
    needsFile,
    registry,
    roadmaps,
    lenses,
    engine,
    skillsFile,
    helpers,
    pilot,
    categories,
    taskFamilies,
    vocab,
    flagsFile,
    homeFeatured,
    lensIndex,
    records,
    whatsNew,
    contributors,
  };
}

type DB = ReturnType<typeof load> & ReturnType<typeof derive>;
let cache: DB | undefined;

function derive(d: ReturnType<typeof load>) {
  const regById = new Map(d.registry.map((r) => [r.id, r]));
  const regBySlug = new Map(d.registry.map((r) => [r.slug, r]));
  const fullTools = new Map<string, any>(d.records.tools.map((t) => [t.id, t]));
  const pilotByTool = new Map(d.pilot.map((p) => [p.tool, p]));
  const catHue = new Map<string, string>();
  for (const c of d.categories) {
    catHue.set(c.slug, c.hue);
    catHue.set(c.id, c.hue);
  }
  const pricingLabel = new Map<string, { label: string; starts: boolean }>(
    d.vocab.pricing_model.values.map((v: any) => [v.id, { label: v.label, starts: Boolean(v.starts_without_paying) }]),
  );
  const lensIdx = new Map(d.lensIndex.map((l) => [lensKey(l.roadmap, l.need), l]));
  const idsByFamily = new Map<string, Identity[]>();
  const idsByParent = new Map<string, Identity[]>();
  for (const i of d.identities) {
    idsByFamily.set(i.family, [...(idsByFamily.get(i.family) ?? []), i]);
    if (i.parent) idsByParent.set(i.parent, [...(idsByParent.get(i.parent) ?? []), i]);
  }
  const needById = new Map(d.needsFile.values.map((n) => [n.id, n]));
  const helperTools = new Map<string, string[]>(); // tool slug -> helper slugs
  for (const h of d.helpers)
    for (const s of h.stages) for (const st of s.steps) helperTools.set(st.tool, [...new Set([...(helperTools.get(st.tool) ?? []), h.slug])]);
  return {
    regById,
    regBySlug,
    fullTools,
    pilotByTool,
    catHue,
    pricingLabel,
    lensIdx,
    idsByFamily,
    idsByParent,
    needById,
    helperTools,
    whoUses: undefined as Map<string, Map<string, string[]>> | undefined,
  };
}

export function db(): DB {
  if (!cache) {
    const d = load();
    cache = Object.assign(d, derive(d));
  }
  return cache;
}

// ---------------- Feature flags (22 §6.5) ----------------

export type Flags = Record<string, boolean>;

/** Flag values for this build: defaults (beta), or launch values with FLAG_PROFILE=launch; FLAG_<NAME>=on|off overrides. */
export function resolveFlags(env: Record<string, string | undefined> = process.env): Flags {
  const f = db().flagsFile.flags as Record<string, { default: boolean; launch: boolean }>;
  const out: Flags = {};
  const launch = env.FLAG_PROFILE === "launch";
  for (const [k, v] of Object.entries(f)) {
    out[k] = launch ? v.launch : v.default;
    const o = env[`FLAG_${k.toUpperCase()}`];
    if (o === "on" || o === "true") out[k] = true;
    if (o === "off" || o === "false") out[k] = false;
  }
  return out;
}

export function listedHelpers(): string[] {
  return db().flagsFile.flags.helpers.listed;
}

// ---------------- Shared builders ----------------

export function toolRow(toolId: string): ToolRow | null {
  const D = db();
  const r = D.regById.get(toolId);
  if (!r) return null;
  const full = D.fullTools.get(toolId);
  const p = full ? D.pricingLabel.get(full.pricing.model) : undefined;
  return {
    slug: r.slug,
    name: r.name,
    hue: D.catHue.get(r.category_id ?? "") ?? "slate",
    pricing: p ? p.label : null,
    starts: p ? p.starts : false,
    guide: hasGuide(r.slug),
  };
}

export function hasGuide(toolSlug: string) {
  const D = db();
  return D.fullTools.has(toolIdFromSlug(toolSlug)) || D.pilotByTool.has(toolSlug);
}

/** The lens page path for a tool and need, if the site renders that lens (lens-index). */
export function lensAvailable(toolSlug: string, needSlug: string): boolean {
  const D = db();
  const rm = D.engine.roadmapForTool(toolIdFromSlug(toolSlug));
  return Boolean(rm && D.lensIdx.has(lensKey(rm.slug, needSlug)));
}

/** A tool slug whose canonical roadmap is rm (so its lens and roadmap pages exist); prefers tools in `prefer`. */
export function roadmapToolSlug(rm: Roadmap, prefer: string[] = []): string | undefined {
  const D = db();
  const ok = rm.tool_ids.filter((id) => D.regById.has(id) && D.engine.roadmapForTool(id)?.slug === rm.slug);
  const id = ok.find((x) => prefer.includes(x)) ?? ok[0];
  return id ? D.regById.get(id)!.slug : undefined;
}

export function needCard(needSlug: string, maxTools = 4): NeedCardData {
  const D = db();
  const n = D.engine.needs.get(needSlug)!;
  const tools = n.tool_ids.map(toolRow).filter((t): t is ToolRow => Boolean(t));
  const lensTool = tools.find((t) => lensAvailable(t.slug, needSlug));
  return {
    slug: n.slug,
    label: n.label,
    description: n.description,
    family: n.task_family,
    tools: tools.slice(0, maxTools),
    lensTool: lensTool ? { slug: lensTool.slug, name: lensTool.name } : null,
    more: Math.max(0, tools.length - maxTools),
  };
}

export function identityLite(i: Identity) {
  const D = db();
  return {
    slug: i.slug,
    label: i.label,
    plural: plural(i.label),
    sector: i.sector,
    sectorLabel: D.engine.secs.get(i.sector)?.label ?? i.sector,
    hue: sectorHue(i.sector),
  };
}

const SECTOR_HUES = ["violet", "teal", "coral", "amber", "blue", "green", "pink", "slate"];
export function sectorHue(sector: string) {
  const s = db().engine.secs.get(sector);
  return SECTOR_HUES[(s?.order ?? 0) % SECTOR_HUES.length];
}

export function whoUses(toolSlug: string) {
  const D = db();
  if (!D.whoUses) D.whoUses = D.engine.whoUsesAll();
  const m = D.whoUses.get(toolIdFromSlug(toolSlug)) ?? new Map<string, string[]>();
  return [...m.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .map(([sector, slugs]) => ({
      sector,
      label: D.engine.secs.get(sector)?.label ?? sector,
      count: slugs.length,
      identities: slugs.slice(0, 8).map((s) => identityLite(D.engine.ids.get(s)!)),
    }));
}

// ---------------- Page data ----------------

export function homeData() {
  const D = db();
  const pick = (slugs: string[]) =>
    slugs
      .map((s) => D.engine.ids.get(s))
      .filter((i): i is Identity => Boolean(i))
      .map((i) => ({ slug: i.slug, label: i.label }));
  const universalPopular = D.needsFile.universal.slice(0, 8).map((s) => ({ slug: s, label: D.engine.needs.get(s)!.label }));
  return {
    popular: pick(D.homeFeatured.popular),
    ribbon: pick(D.homeFeatured.ribbon),
    cards: pick(D.homeFeatured.ribbon.slice(0, 12)).map((c) => ({ ...c, plural: plural(c.label, { lower: false }) })),
    helpers: helperCards(),
    goals: universalPopular,
    skillGroups: D.skillsFile.groups.sort((a, b) => a.order - b.order),
    sectors: D.sectors.map((s) => ({
      slug: s.slug,
      label: s.label,
      hue: sectorHue(s.slug),
      count: D.identities.filter((i) => i.sector === s.slug).length,
    })),
    tasks: D.records.tasks.map((t) => ({ slug: t.slug, title: t.short_title ?? t.title })),
    counts: {
      identities: D.identities.length,
      tools: D.registry.length,
      roadmaps: D.roadmaps.length,
      skills: D.skillsFile.values.length,
    },
  };
}

export function helperCards() {
  const D = db();
  const listed = listedHelpers();
  return listed
    .map((slug) => D.helpers.find((h) => h.slug === slug))
    .filter((h): h is Helper => Boolean(h))
    .map((h, idx) => ({
      slug: h.slug,
      title: h.title,
      short: h.title.replace(/^The /, "").replace(/ Helper$/, ""),
      promise: h.promise,
      stages: h.stage_count,
      tools: h.tool_count,
      tint: (["highlight", "secondary-soft", "accent-soft", "primary-soft"] as const)[idx % 4],
      identities: h.identities
        .map((s) => D.engine.ids.get(s))
        .filter((i): i is Identity => Boolean(i))
        .map((i) => ({ slug: i.slug, label: i.label })),
    }));
}

export function toolkitData(slug: string) {
  const D = db();
  const E = D.engine;
  const i = E.ids.get(slug);
  if (!i) return null;
  const r = E.resolve(slug);
  const fam = E.fams.get(i.family);
  const sec = E.secs.get(i.sector)!;
  const parent = i.parent ? E.ids.get(i.parent) : undefined;
  const specialisms = (D.idsByParent.get(slug) ?? []).map((x) => ({ slug: x.slug, label: x.label }));

  // Start learning: flagship lenses written for this identity, else top roadmaps from core needs.
  const flagship = D.lenses
    .filter((l) => l.for_identities.includes(slug))
    .slice(0, 3)
    .map((l) => {
      const rm = E.roadmaps.get(l.roadmap)!;
      const toolSlug = roadmapToolSlug(rm) ?? l.roadmap;
      return { title: l.title, url: `/tools/${toolSlug}/for/${l.need}`, kind: "flagship" as const };
    });
  const start = [...flagship];
  for (const n of [...r.core, ...r.sector]) {
    if (start.length >= 3) break;
    const need = E.needs.get(n)!;
    const tid = need.tool_ids.find((t) => E.roadmapForTool(t) && D.regById.has(t));
    if (!tid) continue;
    const t = D.regById.get(tid)!;
    const url = lensAvailable(t.slug, n) ? `/tools/${t.slug}/for/${n}` : `/tools/${t.slug}/roadmap`;
    if (start.some((s) => s.url === url)) continue;
    start.push({ title: `${t.name} for ${need.label.toLowerCase()}`, url, kind: "flagship" as const });
  }

  // Related identities: same family, then same parent, then identities sharing ≥ 3 core needs (03 §6.4).
  const related: Identity[] = [];
  const add = (x: Identity) => {
    if (x.slug !== slug && !related.some((y) => y.slug === x.slug) && related.length < 8) related.push(x);
  };
  (D.idsByFamily.get(i.family) ?? []).forEach(add);
  if (parent) (D.idsByParent.get(parent.slug) ?? []).forEach(add);
  if (related.length < 8) {
    const core = new Set(r.core);
    for (const x of D.identities) {
      if (related.length >= 8) break;
      if (E.resolve(x.slug).core.filter((n) => core.has(n)).length >= 3) add(x);
    }
  }

  // Skills you'll use: the 6 skills containing the most core needs.
  const coreIds = new Set(r.core.map((n) => E.needs.get(n)!.id));
  const skills = D.skillsFile.values
    .map((s) => ({ s, k: s.need_ids.filter((n) => coreIds.has(n)).length }))
    .filter((x) => x.k > 0)
    .sort((a, b) => b.k - a.k)
    .slice(0, 6)
    .map(({ s }) => ({ slug: s.slug, label: s.label }));

  const helper = D.helpers.find((h) => listedHelpers().includes(h.slug) && h.identities.includes(slug));

  return {
    identity: {
      slug: i.slug,
      label: i.label,
      plural: plural(i.label),
      pluralTitle: plural(i.label, { lower: false }),
      kind: i.kind,
      aliases: i.aliases,
      validation: i.expert_validation?.status ?? "pending",
    },
    family: fam ? { slug: fam.slug, label: fam.label } : null,
    sector: { slug: sec.slug, label: sec.label },
    parent: parent ? { slug: parent.slug, label: parent.label } : null,
    specialisms,
    core: r.core.map((n) => needCard(n)),
    sectorNeeds: r.sector.map((n) => needCard(n)),
    universal: r.universal.map((n) => needCard(n, 2)),
    start,
    related: related.map((x) => ({ slug: x.slug, label: x.label })),
    skills,
    helper: helper ? { slug: helper.slug, title: helper.title } : null,
  };
}
export type ToolkitData = NonNullable<ReturnType<typeof toolkitData>>;

function roadmapTools(rm: Roadmap) {
  return rm.tool_ids.map(toolRow).filter((t): t is ToolRow => Boolean(t));
}

function depth(rm: Roadmap): "in_depth" | "standard" | "reviewed" {
  if (rm.expert_validation?.status === "validated") return "reviewed";
  return rm.authoring === "archetype+signature" ? "standard" : "in_depth";
}

export function toolData(toolSlug: string) {
  const D = db();
  const E = D.engine;
  const r = D.regBySlug.get(toolSlug);
  if (!r) return null;
  const full = D.fullTools.get(r.id) ?? null;
  const pilot = D.pilotByTool.get(toolSlug) ?? null;
  const rm = E.roadmapForTool(r.id);
  const who = whoUses(toolSlug);
  const lenses = rm
    ? D.lensIndex
        .filter((l) => l.roadmap === rm.slug && E.needs.get(l.need)?.tool_ids.includes(r.id))
        .map((l) => ({
          need: l.need,
          title: E.lens(rm.slug, l.need)?.title ?? E.autoTitle(rm, l.need),
          flagship: l.kind === "flagship",
        }))
        .sort((a, b) => Number(b.flagship) - Number(a.flagship))
    : [];
  // Surprising uses (03 §6.4): the sectors beyond the tool's home sector, largest first, each with a lens.
  const surprising = who
    .slice(1)
    .map((s) => {
      const first = E.ids.get(s.identities[0].slug)!;
      const res = E.resolve(first.slug);
      const need = [...res.core, ...res.sector].find((n) => E.needs.get(n)?.tool_ids.includes(r.id));
      if (!need) return null;
      return {
        sector: s.label,
        identity: s.identities[0],
        need,
        needLabel: E.needs.get(need)!.label,
        lens: lensAvailable(toolSlug, need),
      };
    })
    .filter(Boolean)
    .slice(0, 3);

  let pricing = null as null | { label: string; starts: boolean; checked: string; details?: string; paid?: string; points: any[] };
  if (full) {
    const p = D.pricingLabel.get(full.pricing.model)!;
    pricing = {
      label: p.label,
      starts: p.starts,
      checked: full.pricing.checked_at,
      details: full.pricing.free_tier_details,
      paid: full.pricing.paid_plan_summary,
      points: full.pricing.price_points ?? [],
    };
  }
  const platformVocab = new Map<string, string>(D.vocab.platform.values.map((v: any) => [v.id, v.label]));
  const helpersHere = (D.helperTools.get(toolSlug) ?? [])
    .filter((h) => listedHelpers().includes(h))
    .map((h) => {
      const helper = D.helpers.find((x) => x.slug === h)!;
      const stage = helper.stages.find((s) => s.steps.some((st) => st.tool === toolSlug))!;
      const step = stage.steps.find((st) => st.tool === toolSlug)!;
      return { slug: h, title: helper.title, stage: stage.n, stageTitle: stage.title, what: step.what };
    });
  return {
    tool: {
      id: r.id,
      slug: r.slug,
      name: r.name,
      publisher: full?.developer_or_publisher ?? r.publisher ?? null,
      url: full?.official_url ?? r.official_url ?? null,
      hue: D.catHue.get(r.category_id ?? "") ?? "slate",
      note: r.note ?? null,
      category: D.categories.find((c) => c.slug === r.category_id || c.id === r.category_id)?.label ?? null,
    },
    full: full
      ? {
          summary: full.summary,
          description: full.description,
          platforms:
            full.platforms.verification_status === "unverified"
              ? null
              : full.platforms.values.map((p: string) => platformVocab.get(p) ?? p),
          capabilities: full.key_capabilities,
          limitations: full.limitations,
          bestFor: full.best_for,
          notIdeal: full.not_ideal_for,
          gettingStarted: full.getting_started ?? [],
          sources: full.sources ?? [],
          editorial: full.editorial,
          alternatives: (full.alternative_tool_ids ?? []).map(toolRow).filter(Boolean),
          tasks: (full.task_ids ?? [])
            .map((t: string) => D.records.tasks.find((x) => x.id === t))
            .filter(Boolean)
            .map((t: any) => ({ slug: t.slug, title: t.short_title ?? t.title })),
          availability: full.availability_status,
        }
      : null,
    pricing,
    pilot,
    who,
    whoTotal: who.reduce((a, s) => a + s.count, 0),
    surprising,
    roadmap: rm
      ? {
          slug: rm.slug,
          title: rm.title.replace(/ skill roadmap$/, ""),
          depth: depth(rm),
          firsts: LEVELS.map((lv) => ({ level: lv, title: rm.levels[lv]?.[0]?.title ?? "", count: rm.levels[lv]?.length ?? 0 })),
        }
      : null,
    lenses,
    helpers: helpersHere,
  };
}
export type ToolData = NonNullable<ReturnType<typeof toolData>>;

export function roadmapData(toolSlug: string) {
  const D = db();
  const r = D.regBySlug.get(toolSlug);
  if (!r) return null;
  const rm = D.engine.roadmapForTool(r.id);
  if (!rm) return null;
  const levels = roadmapLevels(rm);
  const skills = D.skillsFile.values.filter((s) => (s.roadmaps ?? []).includes(rm.slug) || s.tool_ids.includes(r.id)).slice(0, 6);
  return {
    tool: { slug: r.slug, name: r.name },
    roadmap: { slug: rm.slug, title: rm.title.replace(/ skill roadmap$/, ""), depth: depth(rm), validation: rm.expert_validation },
    appliesTo: roadmapTools(rm),
    levels,
    skills: skills.map((s) => ({ slug: s.slug, label: s.label })),
  };
}

export function lensData(toolSlug: string, needSlug: string) {
  const D = db();
  const E = D.engine;
  const r = D.regBySlug.get(toolSlug);
  const need = E.needs.get(needSlug);
  if (!r || !need) return null;
  const rm = E.roadmapForTool(r.id);
  if (!rm || !D.lensIdx.has(lensKey(rm.slug, needSlug))) return null;
  const fl = E.lens(rm.slug, needSlug);
  const { comp, levels } = lensLevels(rm, fl, needSlug, need.label);
  const forIds = (fl?.for_identities ?? [])
    .map((s) => E.ids.get(s))
    .filter((i): i is Identity => Boolean(i))
    .map(identityLite);
  // Auto lens: identities with this need (first 12, via resolved core needs).
  const withNeed = fl
    ? []
    : D.identities
        .filter((i) => E.resolve(i.slug).core.includes(needSlug))
        .slice(0, 12)
        .map(identityLite);
  return {
    tool: { slug: r.slug, name: r.name },
    roadmap: { slug: rm.slug, title: rm.title.replace(/ skill roadmap$/, ""), depth: depth(rm) },
    need: { slug: need.slug, label: need.label, description: need.description },
    title: comp.title,
    flagship: comp.flagship,
    tailored: comp.tailored,
    why: fl?.why ?? null,
    different: fl?.what_is_different ?? null,
    starter: fl?.starter_project ?? null,
    pitfalls: fl?.pitfalls ?? [],
    pairs: (fl?.pairs_with ?? []).map(toolRow).filter(Boolean) as ToolRow[],
    forIdentities: forIds,
    withNeed,
    levels,
    validation: fl?.expert_validation ?? rm.expert_validation,
  };
}
export type LensData = NonNullable<ReturnType<typeof lensData>>;

export function needData(needSlug: string) {
  const D = db();
  const E = D.engine;
  const n = E.needs.get(needSlug);
  if (!n) return null;
  const who = new Map<string, Identity[]>();
  for (const i of D.identities) {
    const r = E.resolve(i.slug);
    if (r.core.includes(needSlug) || r.sector.includes(needSlug)) who.set(i.sector, [...(who.get(i.sector) ?? []), i]);
  }
  const lenses = D.lensIndex
    .filter((l) => l.need === needSlug)
    .map((l) => {
      const rm = E.roadmaps.get(l.roadmap)!;
      const t = roadmapToolSlug(rm, n.tool_ids);
      return t ? { url: `/tools/${t}/for/${needSlug}`, title: E.lens(l.roadmap, needSlug)?.title ?? E.autoTitle(rm, needSlug), flagship: l.kind === "flagship" } : null;
    })
    .filter(Boolean);
  const skills = D.skillsFile.values.filter((s) => s.need_ids.includes(n.id)).map((s) => ({ slug: s.slug, label: s.label }));
  return {
    need: { slug: n.slug, label: n.label, description: n.description, universal: n.universal, validation: n.expert_validation?.status },
    tools: n.tool_ids.map(toolRow).filter(Boolean) as ToolRow[],
    who: n.universal
      ? []
      : [...who.entries()]
          .sort((a, b) => b[1].length - a[1].length)
          .map(([sector, ids]) => ({ sector, label: E.secs.get(sector)?.label ?? sector, count: ids.length, identities: ids.slice(0, 8).map(identityLite) })),
    lenses,
    skills,
    related: D.needsFile.values
      .filter((x) => x.task_family === n.task_family && x.slug !== n.slug)
      .slice(0, 8)
      .map((x) => ({ slug: x.slug, label: x.label })),
  };
}

export function sectorData(sectorSlug: string) {
  const D = db();
  const E = D.engine;
  const s = E.secs.get(sectorSlug);
  if (!s) return null;
  const fams = D.families
    .filter((f) => f.sector === sectorSlug)
    .map((f) => ({
      slug: f.slug,
      label: f.label,
      identities: (D.idsByFamily.get(f.slug) ?? []).filter((i) => !i.parent).map((i) => ({ slug: i.slug, label: i.label })),
    }))
    .filter((f) => f.identities.length);
  const toolCount = new Map<string, number>();
  for (const i of D.identities.filter((x) => x.sector === sectorSlug))
    for (const n of E.resolve(i.slug).core) for (const t of E.needs.get(n)?.tool_ids ?? []) toolCount.set(t, (toolCount.get(t) ?? 0) + 1);
  return {
    sector: { slug: s.slug, label: s.label },
    needs: s.needs.map((n) => needCard(n)),
    families: fams,
    tools: [...toolCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([t]) => toolRow(t))
      .filter(Boolean) as ToolRow[],
  };
}

export function skillsIndexData() {
  const D = db();
  return {
    groups: D.skillsFile.groups
      .sort((a, b) => a.order - b.order)
      .map((g) => ({
        slug: g.slug,
        label: g.label,
        skills: D.skillsFile.values
          .filter((s) => s.group === g.slug)
          .map((s) => ({ slug: s.slug, label: s.label, description: s.description, tools: s.tool_ids.length, professions: s.identity_count ?? 0 })),
      })),
  };
}

export function skillData(skillSlug: string) {
  const D = db();
  const s = D.skillsFile.values.find((x) => x.slug === skillSlug);
  if (!s) return null;
  const needs = s.need_ids.map((id) => D.needById.get(id)).filter((n): n is Need => Boolean(n));
  // Skill tool ranking (03 §7.4).
  const score = new Map<string, number>();
  for (const n of needs) n.tool_ids.forEach((t, i) => score.set(t, (score.get(t) ?? 0) + Math.max(1, 10 - i)));
  const regOrder = new Map(D.registry.map((r, i) => [r.id, i]));
  const ranked = [...score.entries()].sort((a, b) => b[1] - a[1] || (regOrder.get(a[0]) ?? 0) - (regOrder.get(b[0]) ?? 0)).map(([t]) => t);
  const tools = ranked.map(toolRow).filter(Boolean) as ToolRow[];
  const needSlugs = new Set(needs.map((n) => n.slug));
  const who = new Map<string, Identity[]>();
  for (const i of D.identities) {
    if (D.engine.resolve(i.slug).core.some((n) => needSlugs.has(n))) who.set(i.sector, [...(who.get(i.sector) ?? []), i]);
  }
  const group = D.skillsFile.groups.find((g) => g.slug === s.group);
  return {
    skill: { slug: s.slug, label: s.label, description: s.description, levels: s.levels, validation: s.expert_validation?.status ?? "pending" },
    group: group ? { slug: group.slug, label: group.label } : null,
    needs: needs.map((n) => needCard(n.slug)),
    tools: tools.slice(0, 8).map((t) => ({ ...t, roadmap: Boolean(D.engine.roadmapForTool(toolIdFromSlug(t.slug))) })),
    toolTotal: tools.length,
    who: [...who.entries()]
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 8)
      .map(([sector, ids]) => ({ sector, label: D.engine.secs.get(sector)?.label ?? sector, count: ids.length, identities: ids.slice(0, 8).map(identityLite) })),
  };
}

export function browseData() {
  const D = db();
  const lifeFirst = [...D.sectors].sort((a, b) => Number(b.slug === "everyday-life") - Number(a.slug === "everyday-life") || a.order - b.order);
  return {
    sectors: lifeFirst.map((s) => ({
      slug: s.slug,
      label: s.label,
      families: D.families
        .filter((f) => f.sector === s.slug)
        .map((f) => ({
          slug: f.slug,
          label: f.label,
          identities: (D.idsByFamily.get(f.slug) ?? [])
            .filter((i) => !i.parent)
            .sort((a, b) => a.label.localeCompare(b.label))
            .map((i) => ({
              slug: i.slug,
              label: i.label,
              children: (D.idsByParent.get(i.slug) ?? []).map((c) => ({ slug: c.slug, label: c.label })),
            })),
        }))
        .filter((f) => f.identities.length),
    })),
  };
}

export function helperData(slug: string) {
  const D = db();
  if (!listedHelpers().includes(slug)) return null;
  const h = D.helpers.find((x) => x.slug === slug);
  if (!h) return null;
  const idx = listedHelpers().indexOf(slug);
  return {
    helper: {
      ...h,
      short: h.title.replace(/^The /, "").replace(/ Helper$/, ""),
      tint: (["highlight", "secondary-soft", "accent-soft", "primary-soft"] as const)[idx % 4],
      identities: h.identities
        .map((s) => D.engine.ids.get(s))
        .filter((i): i is Identity => Boolean(i))
        .map((i) => ({ slug: i.slug, label: i.label })),
    },
    tools: Object.fromEntries(
      [...new Set(h.stages.flatMap((s) => s.steps.map((st) => st.tool)))].map((t) => {
        const reg = D.regBySlug.get(t);
        return [t, { name: reg?.name ?? t, exists: Boolean(reg), guide: hasGuide(t) }];
      }),
    ),
    others: helperCards().filter((c) => c.slug !== slug),
  };
}

/** Compact helper definitions for the global helper panel (S41). */
export function helperPanelData() {
  const D = db();
  return listedHelpers()
    .map((slug) => D.helpers.find((h) => h.slug === slug))
    .filter((h): h is Helper => Boolean(h))
    .map((h) => ({
      slug: h.slug,
      title: h.title,
      stages: h.stages.map((s) => ({
        n: s.n,
        title: s.title,
        goal: s.goal,
        done: s.done.length,
        steps: s.steps.map((st) => ({ tool: st.tool, name: D.regBySlug.get(st.tool)?.name ?? st.tool, what: st.what, first_win: st.first_win })),
      })),
    }));
}

export function toolsDirectory() {
  const D = db();
  return D.registry
    .map((r) => ({ slug: r.slug, name: r.name, hue: D.catHue.get(r.category_id ?? "") ?? "slate", guide: hasGuide(r.slug) }))
    .sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }));
}

export function recordBySlug(kind: keyof DB["records"], slug: string) {
  return db().records[kind].find((r: any) => r.slug === slug) ?? null;
}

export function toolName(id: string) {
  const r = db().regById.get(id);
  return r ? { slug: r.slug, name: r.name } : null;
}

export function categoriesData() {
  const D = db();
  const recs = [...D.records.tools, ...D.records.tasks, ...D.records.playbooks, ...D.records.comparisons];
  return D.categories.map((c) => {
    const items = recs.filter((r) => (r.category_ids ?? []).includes(c.id) || (r.category_ids ?? []).includes(c.slug));
    return { slug: c.slug, id: c.id, label: c.label, description: c.description, hue: c.hue, icon: c.icon, count: items.length, visible: items.length >= 3 };
  });
}

// ---------------- Prerender list (ADR-008) ----------------

export function prerenderPaths(): string[] {
  const D = db();
  const E = D.engine;
  const paths = new Set<string>([
    "/",
    "/who-are-you",
    "/tools",
    "/skills",
    "/helpers",
    "/tasks",
    "/playbooks",
    "/resources",
    "/discover",
    "/learn",
    "/search",
    "/suggest",
    "/report",
    "/report/thanks",
    "/whats-new",
    "/contributors",
    "/about",
    "/about/editorial-standards",
    "/about/how-we-review",
    "/contact",
    "/privacy",
    "/terms",
    "/accessibility",
  ]);
  for (const i of D.identities) paths.add(`/for/${i.slug}`);
  for (const r of D.registry) {
    paths.add(`/tools/${r.slug}`);
    const rm = E.roadmapForTool(r.id);
    if (rm) paths.add(`/tools/${r.slug}/roadmap`);
  }
  for (const l of D.lensIndex) {
    const rm = E.roadmaps.get(l.roadmap);
    const need = E.needs.get(l.need);
    if (!rm || !need) continue;
    for (const tid of rm.tool_ids) {
      const t = D.regById.get(tid);
      if (t && E.roadmapForTool(tid)?.slug === rm.slug) paths.add(`/tools/${t.slug}/for/${l.need}`);
    }
  }
  for (const n of D.needsFile.values) paths.add(`/needs/${n.slug}`);
  for (const s of D.sectors) paths.add(`/sectors/${s.slug}`);
  for (const s of D.skillsFile.values) paths.add(`/skills/${s.slug}`);
  for (const h of listedHelpers()) paths.add(`/helpers/${h}`);
  for (const t of D.records.tasks) paths.add(`/tasks/${t.slug}`);
  for (const p of D.records.playbooks) paths.add(`/playbooks/${p.slug}`);
  for (const r of D.records.resources) paths.add(`/resources/${r.slug}`);
  for (const c of D.records.comparisons) paths.add(`/compare/${c.slug}`);
  for (const c of categoriesData()) paths.add(`/categories/${c.slug}`);
  return [...paths];
}
