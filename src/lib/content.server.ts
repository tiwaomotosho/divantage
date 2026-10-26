// Build-time content loader (11 §2, V2.8). Reads content/ and the asset maps from disk and builds page data for
// route loaders and scripts/build-data.ts. Never shipped to the browser (.server module).
import fs from "node:fs";
import path from "node:path";
import { Engine, lensKey, toolIdFromSlug } from "./identity";
import { plural } from "./format";
import type { Family, Helper, Identity, Lens, Need, RegistryEntry, Roadmap, Sector, Skill } from "./types";
import { LEVELS } from "./types";
import type { GoalDoc } from "./search";
import { depthFromAuthoring, depthLabel, PRICE, shortDate, type Depth, type Hue, type TileVisual, type ToolMention, type Trust } from "./view";

const ROOT = path.resolve(process.cwd(), "content");
const read = <T = any>(p: string): T => JSON.parse(fs.readFileSync(path.join(ROOT, p), "utf8"));
const readDir = <T = any>(p: string): T[] =>
  fs
    .readdirSync(path.join(ROOT, p))
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) => read<T>(path.join(p, f)));
const readPublic = <T = any>(p: string): T => JSON.parse(fs.readFileSync(path.resolve(process.cwd(), "public", p), "utf8"));

export interface Goal {
  id: string;
  slug: string;
  label: string;
  need: string;
  markets: string[];
  search_terms: string[];
  tool_ids: string[];
  intents?: string[];
  expert_validation?: { status: string };
}
export interface Kit {
  slug: string;
  title: string;
  promise: string;
  markets: string[];
  goal_ids: string[];
  goal_slugs: string[];
  search_phrases: string[];
  safety_tags?: string[];
}
export interface Profile {
  slug: string;
  description: string;
  pricing_model: string;
  free_tier: string;
  price_note: string;
  verification: { level: string; checked: string | null; source: string | null; checked_on: string | null };
  preview: { shown: boolean; unchecked: string[]; label: string };
}

function load() {
  const identities = read<{ values: Identity[] }>("taxonomy/identities/identities.json").values;
  const families = read<{ values: Family[] }>("taxonomy/identities/families.json").values;
  const sectors = read<{ values: Sector[] }>("taxonomy/identities/sectors.json").values.sort((a, b) => a.order - b.order);
  const needsFile = read<{ values: Need[]; universal: string[] }>("taxonomy/needs.json");
  const registry = read<{ values: RegistryEntry[] }>("registry/tools-registry.json").values;
  const roadmaps = readDir<Roadmap>("records/roadmaps");
  const lenses = readDir<Lens>("records/lenses");
  const engine = new Engine({ identities, families, sectors, needs: needsFile.values, universal: needsFile.universal, registry, roadmaps, lenses });
  return {
    identities,
    families,
    sectors,
    needsFile,
    registry,
    roadmaps,
    lenses,
    engine,
    skillsFile: read<{ values: Skill[]; groups: { slug: string; label: string; order: number }[] }>("taxonomy/skills.json"),
    helpers: read<{ values: Helper[] }>("taxonomy/helpers.json").values,
    categories: read<{ values: any[] }>("taxonomy/categories.json").values,
    taskFamilies: read<{ values: any[] }>("taxonomy/task-families.json").values,
    vocab: read<any>("taxonomy/vocabularies.json"),
    flagsFile: read<any>("config/feature-flags.json"),
    homeFeatured: read<{ popular: string[]; ribbon: string[] }>("config/home-featured.json"),
    lensIndex: read<{ values: { roadmap: string; need: string; kind: string; core_modules: number }[] }>("generated/lens-index.json").values,
    profiles: read<{ values: Profile[] }>("registry/tool-profiles.json").values,
    goals: read<{ values: Goal[] }>("taxonomy/goals.json").values,
    kits: read<{ values: Kit[] }>("taxonomy/goal-kits.json").values,
    goalLinks: read<{ values: Record<string, { related_goals: string[]; next_steps: any[]; kits: string[]; safety_tags: string[] }> }>("taxonomy/goal-links.json").values,
    safety: read<{ rules: { tag: string; label: string; what_to_know: string; red_flags: string[]; where_to_get_help: string }[]; goal_tags: Record<string, string[]> }>("taxonomy/goal-safety.json"),
    intents: read<{ values: { slug: string; label: string; promise: string; needs: string[] }[] }>("taxonomy/intents.json").values,
    alternatives: read<{ values: { tool_id: string; alternative_ids: string[] }[] }>("taxonomy/alternatives.json").values,
    availability: read<{ values: { tool_id: string; not_available_in: string[]; since: string; note: string }[] }>("taxonomy/tool-availability.json").values,
    markets: read<{ values: { tool_id: string; markets: string[] }[] }>("taxonomy/tool-markets.json").values,
    kitHints: read<{ values: Record<string, string[]> }>("taxonomy/identity-kit-hints.json").values,
    visuals: readPublic<any>("assets/maps/taxonomy-visuals.json"),
    photos: readPublic<any>("assets/photos/manifest.json").photos as Record<string, { alt: string; tags: string[] }>,
    records: {
      tools: readDir<any>("records/tools"),
      tasks: readDir<any>("records/tasks"),
      resources: readDir<any>("records/resources"),
      playbooks: readDir<any>("records/playbooks"),
      comparisons: readDir<any>("records/comparisons"),
    },
    whatsNew: fs.existsSync(path.join(ROOT, "whats-new.json")) ? read<any>("whats-new.json") : { entries: [] },
    contributors: fs.existsSync(path.join(ROOT, "contributors.json")) ? read<any>("contributors.json") : { values: [] },
  };
}

function derive(d: ReturnType<typeof load>) {
  const idsByFamily = new Map<string, Identity[]>();
  const idsByParent = new Map<string, Identity[]>();
  for (const i of d.identities) {
    idsByFamily.set(i.family, [...(idsByFamily.get(i.family) ?? []), i]);
    if (i.parent) idsByParent.set(i.parent, [...(idsByParent.get(i.parent) ?? []), i]);
  }
  const needSkillGroup = new Map<string, string>();
  for (const s of d.skillsFile.values) for (const n of s.need_ids) if (!needSkillGroup.has(n)) needSkillGroup.set(n, s.group);
  const goalsByNeed = new Map<string, Goal[]>();
  for (const g of d.goals) goalsByNeed.set(g.need, [...(goalsByNeed.get(g.need) ?? []), g]);
  const goalsByTool = new Map<string, Goal[]>();
  for (const g of d.goals) for (const t of g.tool_ids) goalsByTool.set(t, [...(goalsByTool.get(t) ?? []), g]);
  const kitsByGoal = new Map<string, Kit[]>();
  for (const k of d.kits) for (const g of k.goal_slugs) kitsByGoal.set(g, [...(kitsByGoal.get(g) ?? []), k]);
  const helperTools = new Map<string, string[]>();
  for (const h of d.helpers) for (const s of h.stages) for (const st of s.steps) helperTools.set(st.tool, [...new Set([...(helperTools.get(st.tool) ?? []), h.slug])]);
  return {
    regById: new Map(d.registry.map((r) => [r.id, r])),
    regBySlug: new Map(d.registry.map((r) => [r.slug, r])),
    profileBySlug: new Map(d.profiles.map((p) => [p.slug, p])),
    goalBySlug: new Map(d.goals.map((g) => [g.slug, g])),
    goalById: new Map(d.goals.map((g) => [g.id, g])),
    kitBySlug: new Map(d.kits.map((k) => [k.slug, k])),
    altByTool: new Map(d.alternatives.map((a) => [a.tool_id, a.alternative_ids])),
    unavailable: new Map(d.availability.map((a) => [a.tool_id, a])),
    marketsByTool: new Map(d.markets.map((m) => [m.tool_id, m.markets])),
    safetyRule: new Map(d.safety.rules.map((r) => [r.tag, r])),
    lensIdx: new Map(d.lensIndex.map((l) => [lensKey(l.roadmap, l.need), l])),
    needById: new Map(d.needsFile.values.map((n) => [n.id, n])),
    needSkillGroup,
    goalsByNeed,
    goalsByTool,
    kitsByGoal,
    idsByFamily,
    idsByParent,
    helperTools,
    whoUses: undefined as Map<string, Map<string, string[]>> | undefined,
  };
}

type DB = ReturnType<typeof load> & ReturnType<typeof derive>;
let cache: DB | undefined;
export function db(): DB {
  if (!cache) {
    const d = load();
    cache = Object.assign(d, derive(d));
  }
  return cache;
}

// ---------------- Flags (22 §6.5) ----------------

export type Flags = Record<string, boolean>;
/** Owner decision (26 Oct 2026): every feature is on. Account-, user- and activity-dependent features run on
 * clearly labelled demo data until launch. FLAG_<NAME>=off still turns one flag off for a build. */
export function resolveFlags(env: Record<string, string | undefined> = process.env): Flags {
  const f = db().flagsFile.flags as Record<string, { default: boolean; launch: boolean }>;
  const out: Flags = {};
  for (const k of Object.keys(f)) {
    out[k] = true;
    const o = env[`FLAG_${k.toUpperCase()}`];
    if (o === "off" || o === "false") out[k] = false;
  }
  return out;
}
export const listedHelpers = (): string[] => db().flagsFile.flags.helpers.listed;

// ---------------- Visuals (D-096: taxonomy-visuals.json is the only source of icon and hue) ----------------

export function sectorVisual(sector: string): TileVisual {
  const v = db().visuals.sectors[sector];
  return { icon: v?.icon ?? "grid", hue: (v?.hue ?? "slate") as Hue };
}
export function needVisual(needSlug: string): TileVisual {
  const D = db();
  const n = D.engine.needs.get(needSlug);
  const g = n ? D.needSkillGroup.get(n.id) : undefined;
  const v = g ? D.visuals.skill_groups[g] : undefined;
  return { icon: v?.icon ?? "target", hue: (v?.hue ?? "violet") as Hue };
}
export function kitVisual(slug: string): TileVisual & { photo?: string } {
  const v = db().visuals.kits[slug];
  return { icon: v?.icon ?? "layers", hue: (v?.hue ?? "violet") as Hue, photo: v?.photo };
}
export function intentVisual(slug: string): TileVisual {
  const v = db().visuals.intents[slug];
  return { icon: v?.icon ?? "target", hue: (v?.hue ?? "slate") as Hue };
}
export const safetyIcon = (tag: string): string => db().visuals.safety_tags[tag] ?? "shield";

/** Photo for a page about a sector, from the closed photo set (D-097). */
const SECTOR_PHOTO: Record<string, string> = {
  health: "nurse-tablet",
  agriculture: "farmer-field",
  technology: "developer-laptop",
  data: "developer-laptop",
  education: "teacher-class",
  creative: "musician-studio",
  business: "shop-owner",
  marketing: "tailor-phone",
};
export function photoFor(sector: string, identitySlug?: string): string {
  const D = db();
  if (identitySlug) {
    const tagged = Object.entries(D.photos).find(([, p]) => p.tags.includes(`identity-${identitySlug}`));
    if (tagged) return tagged[0];
  }
  return SECTOR_PHOTO[sector] ?? "remote-worker";
}

// ---------------- Tools: trust, depth, learn target ----------------

export function trustFor(slug: string): Trust {
  const p = db().profileBySlug.get(slug);
  const price = PRICE[p?.pricing_model ?? "unknown"] ?? PRICE.unknown;
  const priceChecked = p && !p.preview.shown && p.verification.level === "web_seen" && p.verification.checked_on;
  return {
    price: price.label,
    hue: price.hue,
    checked: priceChecked ? shortDate(p!.verification.checked_on!) : null,
    partly: p && p.verification.level === "web_seen" && p.verification.checked_on ? `${p.verification.checked} (${shortDate(p.verification.checked_on)})` : null,
    unchecked: p?.preview.unchecked ?? ["price and plan limits"],
    note: p?.price_note ?? "",
  };
}

/** The tool slug whose canonical roadmap is rm (so its path pages resolve). */
export function roadmapToolSlug(rm: Roadmap, prefer: string[] = []): string | undefined {
  const D = db();
  const ok = rm.tool_ids.filter((id) => D.regById.has(id) && D.engine.roadmapForTool(id)?.slug === rm.slug);
  const id = ok.find((x) => prefer.includes(x)) ?? ok[0];
  return id ? D.regById.get(id)!.slug : undefined;
}

/** DepthLabel and learn target for a tool in a context (doc 31 §4, FR-110). */
export function depthAndLearn(toolId: string, ctx: { identity?: string; need?: string } = {}): { depth: Depth; learn: string } {
  const D = db();
  const E = D.engine;
  const slug = D.regById.get(toolId)?.slug ?? toolId.replace(/^tool_/, "").replace(/_/g, "-");
  const rm = E.roadmapForTool(toolId);
  if (!rm) return { depth: depthLabel("general"), learn: `/tools/${slug}` };
  const idn = ctx.identity ? E.ids.get(ctx.identity) : undefined;
  // A flagship lens written for this identity, or for the need in context.
  const forId = idn ? D.lenses.find((l) => l.roadmap === rm.slug && l.for_identities.includes(idn.slug)) : undefined;
  if (forId && idn) return { depth: depthLabel("role", plural(idn.label)), learn: `/tools/${slug}/for/${idn.slug}` };
  if (ctx.need) {
    const fl = E.lens(rm.slug, ctx.need);
    if (fl) {
      const who = idn ? plural(idn.label) : fl.for_identities[0] ? plural(E.ids.get(fl.for_identities[0])?.label ?? "") : undefined;
      return { depth: depthLabel("role", who), learn: idn ? `/tools/${slug}/for/${idn.slug}` : `/tools/${slug}/for/${ctx.need}` };
    }
  }
  return { depth: depthFromAuthoring(rm.authoring), learn: idn ? `/tools/${slug}/for/${idn.slug}` : `/tools/${slug}/roadmap` };
}

export function mention(toolId: string, ctx: { identity?: string; need?: string; desc?: boolean } = {}): ToolMention | null {
  const D = db();
  const r = D.regById.get(toolId);
  if (!r) return null;
  const { depth, learn } = depthAndLearn(toolId, ctx);
  const m: ToolMention = { slug: r.slug, name: r.name, trust: trustFor(r.slug), depth, learn, url: r.official_url ?? null };
  if (ctx.desc) m.desc = D.profileBySlug.get(r.slug)?.description;
  const na = D.unavailable.get(toolId);
  if (na) m.notIn = na.not_available_in;
  return m;
}

/** Compact tool chip: logo slug, name and price label (alternatives, similar tools). */
export function toolLite(toolId: string) {
  const r = db().regById.get(toolId);
  return r ? { slug: r.slug, name: r.name, price: trustFor(r.slug).price } : null;
}

export function identityLite(i: Identity) {
  return { slug: i.slug, label: i.label, plural: plural(i.label) };
}

export function whoUses(toolSlug: string) {
  const D = db();
  if (!D.whoUses) D.whoUses = D.engine.whoUsesAll();
  const m = D.whoUses.get(toolIdFromSlug(toolSlug)) ?? new Map<string, string[]>();
  const groups = [...m.entries()].sort((a, b) => b[1].length - a[1].length);
  const total = groups.reduce((a, [, s]) => a + s.length, 0);
  const sample = groups.slice(0, 4).map(([, s]) => s[0]).map((s) => D.engine.ids.get(s)!.label);
  return { total, sectors: groups.length, sample };
}

// ---------------- Safety (D-087) ----------------

export function safetyFor(goalSlugs: string[]) {
  const D = db();
  const tags = [...new Set(goalSlugs.flatMap((g) => D.safety.goal_tags[g] ?? []))];
  const priority = ["kids", "jobs", "money", "health", "legal", "official-fees", "privacy", "ai", "content"];
  tags.sort((a, b) => priority.indexOf(a) - priority.indexOf(b));
  const r = tags.length ? D.safetyRule.get(tags[0]) : undefined;
  if (!r) return null;
  return { tag: r.tag, icon: safetyIcon(r.tag), label: r.label, what: r.what_to_know, flags: r.red_flags.map((f) => f[0].toUpperCase() + f.slice(1)), help: r.where_to_get_help, tags };
}

// ---------------- Need cards (S27) ----------------

export interface NeedCardData {
  slug: string;
  label: string;
  tile: TileVisual;
  depth: Depth;
  logos: string[];
  more: number;
}

export function needCard(needSlug: string, identity?: string): NeedCardData {
  const D = db();
  const n = D.engine.needs.get(needSlug)!;
  const tools = n.tool_ids.filter((t) => D.regById.has(t));
  let depth: Depth = depthLabel("general");
  const idn = identity ? D.engine.ids.get(identity) : undefined;
  for (const t of tools) {
    const d = depthAndLearn(t, { identity, need: needSlug }).depth;
    if (d.kind === "role") {
      depth = idn ? depthLabel("role", plural(idn.label)) : d;
      break;
    }
    if (d.kind === "deep") depth = d;
  }
  return { slug: n.slug, label: n.label, tile: needVisual(n.slug), depth, logos: tools.slice(0, 3).map((t) => D.regById.get(t)!.slug), more: Math.max(0, tools.length - 3) };
}

// ---------------- Pages ----------------

export function homeData() {
  const D = db();
  const pick = (slugs: string[]) => slugs.map((s) => D.engine.ids.get(s)).filter((i): i is Identity => Boolean(i)).map((i) => ({ slug: i.slug, label: i.label }));
  const examples = pick(["student", "nurse", "accountant", "small-business-owner", "teacher", "farmer"]);
  const kits = ["get-a-remote-job", "teach-kids-programming", "become-a-freelancer", "edit-a-short-video", "sell-on-whatsapp", "learn-ai-skills"]
    .map((s) => D.kitBySlug.get(s) ?? D.kits.find((k) => k.slug.startsWith(s)))
    .filter((k): k is Kit => Boolean(k))
    .map(kitCard);
  const intents = D.intents.map((it) => ({ slug: it.slug, label: it.label, icon: intentVisual(it.slug).icon }));
  return { examples, kits, intents, kitCount: D.kits.length, identityCount: D.identities.length, popular: pick(D.homeFeatured.popular) };
}

export function kitCard(k: Kit) {
  const v = kitVisual(k.slug);
  return { slug: k.slug, title: k.title, icon: v.icon, hue: v.hue };
}

/** Float card on the home mosaic for a sample identity (real counts). */
export function identitySummary(slug: string) {
  const D = db();
  const r = D.engine.resolve(slug);
  const tools = new Set(r.core.flatMap((n) => D.engine.needs.get(n)!.tool_ids));
  const paths = D.lenses.filter((l) => l.for_identities.includes(slug)).length;
  const i = D.engine.ids.get(slug)!;
  return {
    label: i.label,
    hue: sectorVisual(i.sector).hue,
    icon: sectorVisual(i.sector).icon,
    needs: r.core.length,
    tools: tools.size,
    paths,
    logos: [...tools].slice(0, 3).map((t) => D.regById.get(t)?.slug).filter(Boolean) as string[],
  };
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
  const pl = plural(i.label);
  const needSlugs = [...r.core, ...r.sector];
  const needs = needSlugs.map((n) => needCard(n, slug));
  const goals = needSlugs.flatMap((n) => (D.goalsByNeed.get(n) ?? []).slice(0, 2)).slice(0, 12).map((g) => goalRow(g));
  const toolIds = [...new Set(needSlugs.flatMap((n) => E.needs.get(n)!.tool_ids))].filter((t) => D.regById.has(t)).slice(0, 12);
  const tools = toolIds.map((t) => mention(t, { identity: slug })!).filter(Boolean);
  // Learning paths written for this identity first, then the top tools' guides.
  const own = D.lenses.filter((l) => l.for_identities.includes(slug));
  const paths = [
    ...own.map((l) => {
      const rm = E.roadmaps.get(l.roadmap)!;
      const t = roadmapToolSlug(rm) ?? l.roadmap;
      return { title: l.title, url: `/tools/${t}/for/${slug}`, tool: t, depth: depthLabel("role", pl) };
    }),
    ...tools
      .filter((t) => !own.some((l) => roadmapToolSlug(E.roadmaps.get(l.roadmap)!) === t.slug))
      .slice(0, 6)
      .map((t) => ({ title: `${t.name} for ${pl}`, url: t.learn, tool: t.slug, depth: t.depth! })),
  ].slice(0, 8);
  const first = paths[0];
  const next = first
    ? {
        kicker: "Your next step · 2 minutes",
        title: `Open the ${D.regBySlug.get(first.tool)?.name ?? first.tool} path for ${pl}`,
        sub: first.depth.kind === "role" ? "Written for your kind of work." : "Start with the first module. Tick it off when you can do it.",
        url: first.url,
        cta: "Start",
      }
    : { kicker: "Your next step", title: "Pick a goal", sub: "See what you can get done.", url: "/goals", cta: "Open goals" };
  const helper = D.helpers.find((h) => listedHelpers().includes(h.slug) && h.identities.includes(slug));
  return {
    identity: {
      slug: i.slug,
      label: i.label,
      plural: pl,
      pluralTitle: plural(i.label, { lower: false }),
      kind: i.kind,
      aliases: i.aliases.slice(0, 4),
      isco: i.isco08_units?.[0] ?? null,
      validation: i.expert_validation?.status ?? "pending",
    },
    sector: { slug: sec.slug, label: sec.label, hue: sectorVisual(sec.slug).hue },
    family: fam ? { slug: fam.slug, label: fam.label } : null,
    parent: parent ? { slug: parent.slug, label: parent.label } : null,
    photo: photoFor(i.sector, i.slug),
    needs,
    goals,
    tools,
    paths,
    next,
    helper: helper ? { slug: helper.slug, title: helper.title } : null,
  };
}
export type ToolkitData = NonNullable<ReturnType<typeof toolkitData>>;

export function goalRow(g: Goal) {
  const D = db();
  const n = D.engine.needs.get(g.need);
  return {
    slug: g.slug,
    label: g.label,
    need: n?.label ?? "",
    safety: (D.safety.goal_tags[g.slug] ?? []).length > 0,
    logos: g.tool_ids.slice(0, 3).map((t) => D.regById.get(t)?.slug).filter(Boolean) as string[],
  };
}

export function browseData() {
  const D = db();
  const sectors = D.sectors.map((s) => ({
    slug: s.slug,
    label: s.label,
    ...sectorVisual(s.slug),
    count: D.identities.filter((i) => i.sector === s.slug).length,
  }));
  const az = D.identities
    .filter((i) => !i.parent)
    .map((i) => ({ slug: i.slug, label: i.label }))
    .sort((a, b) => a.label.localeCompare(b.label));
  const life = D.identities.filter((i) => i.kind === "life_role").map((i) => ({ slug: i.slug, label: i.label }));
  return { total: D.identities.length, sectors, az, life };
}

export function sectorData(sectorSlug: string) {
  const D = db();
  const E = D.engine;
  const s = E.secs.get(sectorSlug);
  if (!s) return null;
  return {
    sector: { slug: s.slug, label: s.label, ...sectorVisual(s.slug) },
    needs: s.needs.map((n) => needCard(n)),
    families: D.families
      .filter((f) => f.sector === sectorSlug)
      .map((f) => ({ slug: f.slug, label: f.label, identities: (D.idsByFamily.get(f.slug) ?? []).filter((i) => !i.parent).map((i) => ({ slug: i.slug, label: i.label })) }))
      .filter((f) => f.identities.length),
  };
}

export function goalsIndexData() {
  const D = db();
  const counts = Object.fromEntries(D.intents.map((it) => [it.slug, D.goals.filter((g) => (g.intents ?? []).includes(it.slug)).length]));
  const families = D.taskFamilies
    .map((f) => {
      const gs = D.goals.filter((g) => D.engine.needs.get(g.need)?.task_family === f.slug);
      return { slug: f.slug, label: f.label, goals: gs.map((g) => ({ slug: g.slug, label: g.label, intents: g.intents ?? [] })) };
    })
    .filter((f) => f.goals.length);
  return {
    total: D.goals.length,
    intents: D.intents.map((it) => ({ slug: it.slug, label: it.label, promise: it.promise, count: counts[it.slug] ?? 0, ...intentVisual(it.slug) })),
    families,
  };
}

export function goalData(slug: string) {
  const D = db();
  const g = D.goalBySlug.get(slug);
  if (!g) return null;
  const n = D.engine.needs.get(g.need);
  const links = D.goalLinks[slug] ?? { related_goals: [], next_steps: [], kits: [], safety_tags: [] };
  const tools = g.tool_ids.map((t) => mention(t, { need: g.need, desc: true })).filter((t): t is ToolMention => Boolean(t));
  const shown = tools.slice(0, 3);
  const altIds = [...g.tool_ids.slice(3), ...(D.altByTool.get(g.tool_ids[0]) ?? [])];
  const alternatives = [...new Set(altIds)].filter((t) => !shown.some((s) => `tool_${s.slug.replace(/-/g, "_")}` === t)).map(toolLite).filter(Boolean).slice(0, 7) as { slug: string; name: string; price: string }[];
  const kits = (D.kitsByGoal.get(slug) ?? []).map((k) => ({ slug: k.slug, title: k.title, step: k.goal_slugs.indexOf(slug) + 1, total: k.goal_slugs.length, steps: k.goal_slugs }));
  const kit = kits[0] ?? null;
  const nextGoal = kit && kit.step < kit.total ? D.goalBySlug.get(kit.steps[kit.step]) : undefined;
  const prevGoal = kit && kit.step > 1 ? D.goalBySlug.get(kit.steps[kit.step - 2]) : undefined;
  const related = links.related_goals.map((s) => D.goalBySlug.get(s)).filter((x): x is Goal => Boolean(x)).slice(0, 3).map((x) => ({ slug: x.slug, label: x.label }));
  const top = shown[0];
  const next = nextGoal
    ? { kicker: `Your next step · Kit step ${kit!.step + 1} of ${kit!.total}`, title: nextGoal.label, sub: `Uses ${nextGoal.tool_ids.slice(0, 2).map((t) => D.regById.get(t)?.name).filter(Boolean).join(" and ")}`, url: `/goals/${nextGoal.slug}`, cta: "Continue" }
    : top
      ? { kicker: "Your next step · Learn the top pick", title: `Learn ${top.name}`, sub: `${top.depth?.label ?? "Learning path"} · start with the first module`, url: top.learn, cta: "Start" }
      : { kicker: "Your next step", title: related[0]?.label ?? "Find another goal", sub: "A related goal", url: related[0] ? `/goals/${related[0].slug}` : "/goals", cta: "Continue" };
  return {
    goal: { slug: g.slug, label: g.label, markets: g.markets, intents: (g.intents ?? []).map((it) => ({ slug: it, label: it[0].toUpperCase() + it.slice(1), ...intentVisual(it) })), validation: g.expert_validation?.status ?? "pending" },
    need: n ? { slug: n.slug, label: n.label, description: n.description } : null,
    tools: shown,
    alternatives,
    kit: kit ? { slug: kit.slug, title: kit.title, step: kit.step, total: kit.total, prev: prevGoal?.slug ?? null, next: nextGoal?.slug ?? null } : null,
    safety: safetyFor([slug]),
    related,
    next,
  };
}
export type GoalData = NonNullable<ReturnType<typeof goalData>>;

export function kitsData() {
  const D = db();
  const featured = ["teach-kids-programming", "get-a-remote-job"].map((s) => D.kitBySlug.get(s)).filter((k): k is Kit => Boolean(k));
  const feat = featured.map((k, i) => {
    const v = kitVisual(k.slug);
    const logos = k.goal_ids.flatMap((id) => D.goalById.get(id)?.tool_ids.slice(0, 1) ?? []).map((t) => D.regById.get(t)?.slug).filter(Boolean).slice(0, 4) as string[];
    return { slug: k.slug, title: k.title, promise: k.promise, photo: v.photo ?? "remote-worker", icon: v.icon, hue: v.hue, label: i === 0 ? "Technology education" : "Most started", logos };
  });
  return { total: D.kits.length, featured: feat, kits: D.kits.filter((k) => !featured.includes(k)).map(kitCard) };
}

export function kitData(slug: string) {
  const D = db();
  const k = D.kitBySlug.get(slug);
  if (!k) return null;
  const v = kitVisual(k.slug);
  const steps = k.goal_slugs
    .map((gs) => D.goalBySlug.get(gs))
    .filter((g): g is Goal => Boolean(g))
    .map((g) => ({
      slug: g.slug,
      label: g.label,
      tools: g.tool_ids.slice(0, 3).map((t) => D.regById.get(t)).filter(Boolean).map((t) => ({ slug: t!.slug, name: t!.name })),
      safety: (D.safety.goal_tags[g.slug] ?? [])[0] ?? null,
    }));
  const goodFor = Object.entries(D.kitHints)
    .filter(([, ks]) => ks[0] === slug)
    .slice(0, 4)
    .map(([s]) => D.engine.ids.get(s))
    .filter((i): i is Identity => Boolean(i))
    .map((i) => ({ slug: i.slug, label: i.label }));
  return {
    kit: { slug: k.slug, title: k.title, promise: k.promise, markets: k.markets, photo: v.photo ?? "remote-worker", icon: v.icon, hue: v.hue },
    steps,
    safety: safetyFor(k.goal_slugs),
    goodFor,
  };
}

export function toolData(toolSlug: string) {
  const D = db();
  const E = D.engine;
  const r = D.regBySlug.get(toolSlug);
  if (!r) return null;
  const p = D.profileBySlug.get(toolSlug);
  const rm = E.roadmapForTool(r.id);
  const cat = D.categories.find((c) => c.slug === r.category_id || c.id === r.category_id);
  const na = D.unavailable.get(r.id);
  const alts = (D.altByTool.get(r.id) ?? []).map(toolLite).filter(Boolean) as { slug: string; name: string; price: string }[];
  const paths: { title: string; url: string; modules: number; hours: number; depth: Depth }[] = [];
  if (rm) {
    const count = LEVELS.reduce((a, l) => a + (rm.levels[l]?.length ?? 0), 0);
    const hrs = LEVELS.reduce((a, l) => a + (rm.levels[l] ?? []).reduce((b, m) => b + (m.estimated_hours?.value ?? 0), 0), 0);
    for (const l of D.lenses.filter((x) => x.roadmap === rm.slug)) {
      const who = l.for_identities[0] ? E.ids.get(l.for_identities[0]) : undefined;
      paths.push({ title: l.title, url: who ? `/tools/${toolSlug}/for/${who.slug}` : `/tools/${toolSlug}/for/${l.need}`, modules: count + l.extra_modules.length, hours: hrs, depth: depthLabel("role", who ? plural(who.label) : undefined) });
    }
    const d = depthFromAuthoring(rm.authoring);
    paths.push({ title: d.kind === "deep" ? `${r.name}: beginner to advanced` : `${r.name}: general guide`, url: `/tools/${toolSlug}/roadmap`, modules: count, hours: hrs, depth: d });
  }
  const goals = (D.goalsByTool.get(r.id) ?? []).slice(0, 4).map((g) => ({ slug: g.slug, label: g.label }));
  const who = whoUses(toolSlug);
  const helpersHere = (D.helperTools.get(toolSlug) ?? []).filter((h) => listedHelpers().includes(h)).map((h) => D.helpers.find((x) => x.slug === h)!).map((h) => ({ slug: h.slug, title: h.title }));
  const g0 = goals[0];
  const next = g0
    ? { kicker: "Your next step · After this tool", title: g0.label, sub: `Goal · uses ${r.name}`, url: `/goals/${g0.slug}`, cta: "Continue" }
    : { kicker: "Your next step", title: `Learn ${r.name}`, sub: "Start with the first module", url: paths[0]?.url ?? "/goals", cta: "Start" };
  return {
    tool: { id: r.id, slug: r.slug, name: r.name, publisher: r.publisher ?? null, url: r.official_url ?? null, category: cat?.label ?? null, urlStatus: r.url_status ?? null },
    description: p?.description ?? null,
    trust: trustFor(toolSlug),
    freeTier: p?.free_tier ?? "unknown",
    unavailable: na ? { notIn: na.not_available_in, since: na.since, note: na.note, instead: alts.slice(0, 2) } : null,
    // Two job-specific paths at most, then the tool's own path, so the main path is never pushed out.
    paths: [...paths.filter((p) => p.depth.kind === "role").slice(0, 2), ...paths.filter((p) => p.depth.kind !== "role")],
    goals,
    who,
    alternatives: alts.slice(0, 5),
    helpers: helpersHere,
    next,
  };
}
export type ToolData = NonNullable<ReturnType<typeof toolData>>;

export function needData(needSlug: string) {
  const D = db();
  const E = D.engine;
  const n = E.needs.get(needSlug);
  if (!n) return null;
  const goals = (D.goalsByNeed.get(needSlug) ?? []).map(goalRow);
  const tools = n.tool_ids.map((t) => mention(t, { need: needSlug, desc: true })).filter((t): t is ToolMention => Boolean(t)).slice(0, 8);
  return { need: { slug: n.slug, label: n.label, description: n.description, ...needVisual(n.slug), validation: n.expert_validation?.status ?? "pending" }, goals, tools };
}

export function skillsIndexData() {
  const D = db();
  return {
    groups: D.skillsFile.groups
      .sort((a, b) => a.order - b.order)
      .map((g) => ({
        slug: g.slug,
        label: g.label,
        icon: D.visuals.skill_groups[g.slug]?.icon ?? "grid",
        hue: (D.visuals.skill_groups[g.slug]?.hue ?? "slate") as Hue,
        skills: D.skillsFile.values.filter((s) => s.group === g.slug).map((s) => ({ slug: s.slug, label: s.label, description: s.description, tools: s.tool_ids.length, professions: s.identity_count ?? 0 })),
      })),
  };
}

export function skillData(skillSlug: string) {
  const D = db();
  const s = D.skillsFile.values.find((x) => x.slug === skillSlug);
  if (!s) return null;
  const needs = s.need_ids.map((id) => D.needById.get(id)).filter((n): n is Need => Boolean(n));
  const score = new Map<string, number>();
  for (const n of needs) n.tool_ids.forEach((t, i) => score.set(t, (score.get(t) ?? 0) + Math.max(1, 10 - i)));
  const ranked = [...score.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t);
  const group = D.skillsFile.groups.find((g) => g.slug === s.group);
  return {
    skill: { slug: s.slug, label: s.label, description: s.description, levels: s.levels, validation: s.expert_validation?.status ?? "pending" },
    group: group ? { slug: group.slug, label: group.label, icon: D.visuals.skill_groups[group.slug]?.icon ?? "grid", hue: (D.visuals.skill_groups[group.slug]?.hue ?? "slate") as Hue } : null,
    needs: needs.map((n) => needCard(n.slug)),
    tools: ranked.slice(0, 6).map((t) => mention(t, {})).filter(Boolean) as ToolMention[],
  };
}

export function helperCards() {
  const D = db();
  return listedHelpers()
    .map((slug) => D.helpers.find((h) => h.slug === slug))
    .filter((h): h is Helper => Boolean(h))
    .map((h) => ({ slug: h.slug, title: h.title, short: h.title.replace(/^The /, "").replace(/ Helper$/, ""), promise: h.promise, stages: h.stage_count, tools: h.tool_count, ...helperVisual(h.slug) }));
}

export function helperVisual(slug: string): { icon: string; photo: string } {
  const D = db();
  const tagged = Object.entries(D.photos).find(([, p]) => p.tags.includes(`helper-${slug}`));
  const icon = slug === "musician" ? "music" : slug === "data-analyst" ? "chart" : slug === "entrepreneur" ? "store" : "route";
  return { icon, photo: tagged?.[0] ?? (slug === "data-analyst" ? "developer-laptop" : "remote-worker") };
}

export function helperData(slug: string) {
  const D = db();
  if (!listedHelpers().includes(slug)) return null;
  const h = D.helpers.find((x) => x.slug === slug);
  if (!h) return null;
  return {
    helper: {
      slug: h.slug,
      title: h.title,
      short: h.title.replace(/^The /, "").replace(/ Helper$/, ""),
      promise: h.promise,
      intro: h.intro,
      stage_count: h.stage_count,
      tool_count: h.tool_count,
      ...helperVisual(h.slug),
      stages: h.stages.map((s) => ({
        n: s.n,
        title: s.title,
        goal: s.goal,
        time: s.time,
        done: s.done,
        steps: s.steps.map((st) => ({ ...st, name: D.regBySlug.get(st.tool)?.name ?? st.tool, exists: D.regBySlug.has(st.tool) })),
      })),
    },
  };
}

/** Compact helper definitions for the global helper bar (S41). */
export function helperPanelData() {
  const D = db();
  return listedHelpers()
    .map((slug) => D.helpers.find((h) => h.slug === slug))
    .filter((h): h is Helper => Boolean(h))
    .map((h) => ({
      slug: h.slug,
      title: h.title,
      icon: helperVisual(h.slug).icon,
      stages: h.stages.map((s) => ({ n: s.n, title: s.title, goal: s.goal, done: s.done.length, steps: s.steps.map((st) => ({ tool: st.tool, name: D.regBySlug.get(st.tool)?.name ?? st.tool, what: st.what, first_win: st.first_win })) })),
    }));
}

export function toolsDirectory() {
  return db()
    .registry.map((r) => ({ slug: r.slug, name: r.name, price: trustFor(r.slug).price }))
    .sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }));
}

export function recordBySlug(kind: keyof DB["records"], slug: string) {
  return db().records[kind].find((r: any) => r.slug === slug) ?? null;
}

export function toolName(id: string) {
  const r = db().regById.get(id);
  return r ? { slug: r.slug, name: r.name } : null;
}

// ---------------- Goal + kit search documents ("I want to…", doc 26 §6) ----------------

export function goalIndexDocs(): GoalDoc[] {
  const D = db();
  const E = D.engine;
  const docs: GoalDoc[] = D.goals.map((g) => ({
    id: g.slug,
    label: g.label,
    terms: g.search_terms.join(" | "),
    need: E.needs.get(g.need)?.label ?? "",
    tools: g.tool_ids.map((t) => D.regById.get(t)?.name ?? "").join(" | "),
    top: g.tool_ids.slice(0, 3).map((t) => D.regById.get(t)?.name ?? "").join(" | "),
    markets: g.markets,
    logos: g.tool_ids.slice(0, 3).map((t) => D.regById.get(t)?.slug).filter(Boolean) as string[],
    safety: (D.safety.goal_tags[g.slug] ?? []).length > 0,
  }));
  for (const k of D.kits) {
    docs.push({ id: `kit:${k.slug}`, label: k.title, terms: `${k.search_phrases.join(" | ")} | ${k.promise}`, need: "Kit", tools: "", top: "", markets: [...k.markets, "all"], logos: [], safety: (k.safety_tags ?? []).length > 0 });
  }
  return docs;
}

// ---------------- Prerender list (ADR-008) ----------------
// Learning-path pages (/tools/{tool}/roadmap, /tools/{tool}/for/{x}) render in the browser from /data/tool/*.json
// to keep the static output under the host's limits (checklist 11.3, docs/deviations.md).
export function prerenderPaths(): string[] {
  const D = db();
  const paths = new Set<string>([
    "/", "/for", "/tools", "/skills", "/helpers", "/goals", "/kits", "/me", "/me/profile", "/tasks", "/playbooks", "/resources",
    "/search", "/suggest", "/report", "/report/thanks", "/whats-new", "/contributors", "/trending", "/admin/report", "/me/welcome", "/offline",
    "/about", "/about/editorial-standards", "/about/how-we-review", "/contact", "/privacy", "/terms", "/accessibility",
  ]);
  for (const i of D.identities) paths.add(`/for/${i.slug}`);
  for (const r of D.registry) paths.add(`/tools/${r.slug}`);
  for (const g of D.goals) paths.add(`/goals/${g.slug}`);
  for (const k of D.kits) paths.add(`/kits/${k.slug}`);
  for (const n of D.needsFile.values) paths.add(`/needs/${n.slug}`);
  for (const s of D.sectors) paths.add(`/sectors/${s.slug}`);
  for (const s of D.skillsFile.values) paths.add(`/skills/${s.slug}`);
  for (const h of listedHelpers()) paths.add(`/helpers/${h}`);
  for (const t of D.records.tasks) paths.add(`/tasks/${t.slug}`);
  for (const p of D.records.playbooks) paths.add(`/playbooks/${p.slug}`);
  for (const r of D.records.resources) paths.add(`/resources/${r.slug}`);
  for (const c of D.records.comparisons) paths.add(`/compare/${c.slug}`);
  return [...paths];
}
