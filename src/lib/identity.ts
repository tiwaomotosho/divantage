// Identity-first engine: TypeScript port of spec/spec-assets/reference_engine.py (18 §4 and §7).
// Outputs must match the Python reference (TC-079, TC-081). Framework-free.
import type {
  ComposedLens,
  Family,
  Identity,
  Lens,
  Level,
  Need,
  PathItem,
  RegistryEntry,
  Roadmap,
  Sector,
} from "./types";
import { LEVELS } from "./types";

export interface EngineData {
  identities: Identity[];
  families: Family[];
  sectors: Sector[];
  needs: Need[];
  universal: string[];
  registry: RegistryEntry[];
  roadmaps: Roadmap[];
  lenses: Lens[];
}

export interface Resolved {
  core: string[];
  sector: string[];
  universal: string[];
}

const uniq = <T,>(xs: T[]): T[] => [...new Set(xs)];

export const toolIdFromSlug = (slug: string) => "tool_" + slug.replace(/-/g, "_");

export class Engine {
  ids = new Map<string, Identity>();
  fams = new Map<string, Family>();
  secs = new Map<string, Sector>();
  needs = new Map<string, Need>();
  universal: string[];
  reg = new Map<string, RegistryEntry>();
  roadmaps = new Map<string, Roadmap>();
  lenses = new Map<string, Lens>();
  private toolRoadmap = new Map<string, Roadmap>();
  private resolveCache = new Map<string, Resolved>();

  constructor(d: EngineData) {
    for (const i of d.identities) this.ids.set(i.slug, i);
    for (const f of d.families) this.fams.set(f.slug, f);
    for (const s of d.sectors) this.secs.set(s.slug, s);
    for (const n of d.needs) this.needs.set(n.slug, n);
    this.universal = d.universal;
    for (const r of d.registry) this.reg.set(r.id, r);
    for (const r of d.roadmaps) {
      this.roadmaps.set(r.slug, r);
      // Python picks the first roadmap (glob order) containing the tool; keep the first one seen.
      for (const t of r.tool_ids) if (!this.toolRoadmap.has(t)) this.toolRoadmap.set(t, r);
    }
    for (const l of d.lenses) this.lenses.set(lensKey(l.roadmap, l.need), l);
  }

  /** Core (own + parent + family) → sector → universal, de-duplicated, order preserved. */
  resolve(slug: string): Resolved {
    const hit = this.resolveCache.get(slug);
    if (hit) return hit;
    const i = this.ids.get(slug);
    if (!i) throw new Error(`Unknown identity: ${slug}`);
    const parent = i.parent ? this.ids.get(i.parent) : undefined;
    const own = [...i.needs, ...(parent ? parent.needs : [])];
    const core = uniq([...own, ...(this.fams.get(i.family)?.needs ?? [])]);
    const sector = (this.secs.get(i.sector)?.needs ?? []).filter((n) => !core.includes(n));
    const universal = this.universal.filter((n) => !core.includes(n) && !sector.includes(n));
    const r = { core, sector, universal };
    this.resolveCache.set(slug, r);
    return r;
  }

  roadmapForTool(toolId: string): Roadmap | undefined {
    return this.toolRoadmap.get(toolId);
  }

  lens(roadmapSlug: string, needSlug: string): Lens | undefined {
    return this.lenses.get(lensKey(roadmapSlug, needSlug));
  }

  /** Auto-lens title (04 S29): needs are action phrases, so 'Using {tool} to {need}'. */
  autoTitle(rm: Roadmap, needSlug: string): string {
    return autoLensTitle(rm.title, this.needs.get(needSlug)!.label);
  }

  /** Lens path: flagship priority modules, then need-tagged modules (core); the rest are 'also useful'. */
  compose(roadmapSlug: string, needSlug: string): ComposedLens {
    const rm = this.roadmaps.get(roadmapSlug)!;
    return composeLens(rm, this.lens(roadmapSlug, needSlug), needSlug, this.needs.get(needSlug)!.label);
  }

  /** 18 §7: first resolved need using the tool that has a flagship lens; else first need using the tool. */
  pickLens(identity: string, toolSlug: string) {
    const tid = toolIdFromSlug(toolSlug);
    const rm = this.roadmapForTool(tid);
    const r = this.resolve(identity);
    const order = [...r.core, ...r.sector, ...r.universal];
    const cands = order.filter((n) => this.needs.get(n)?.tool_ids.includes(tid));
    if (!rm || cands.length === 0) {
      return {
        need: null as string | null,
        note: "Tool not part of this identity's toolkit; show full roadmap + better-fit tools.",
        others: [] as string[],
        lens: undefined as ComposedLens | undefined,
      };
    }
    const best = cands.find((n) => this.lenses.has(lensKey(rm.slug, n))) ?? cands[0];
    return {
      need: best as string | null,
      note: undefined as string | undefined,
      lens: this.compose(rm.slug, best),
      others: cands.filter((n) => n !== best),
    };
  }

  /** Who uses each tool: sector label → identity slugs, for every tool, in one pass. */
  whoUsesAll(): Map<string, Map<string, string[]>> {
    const out = new Map<string, Map<string, string[]>>();
    const toolNeeds = new Map<string, Set<string>>(); // need -> non-universal tool ids
    for (const [slug, n] of this.needs) if (!n.universal) toolNeeds.set(slug, new Set(n.tool_ids));
    for (const [slug, i] of this.ids) {
      const r = this.resolve(slug);
      const tools = new Set<string>();
      for (const n of [...r.core, ...r.sector]) for (const t of toolNeeds.get(n) ?? []) tools.add(t);
      for (const t of tools) {
        let bySector = out.get(t);
        if (!bySector) out.set(t, (bySector = new Map()));
        const list = bySector.get(i.sector) ?? [];
        list.push(slug);
        bySector.set(i.sector, list);
      }
    }
    return out;
  }
}

export const lensKey = (roadmap: string, need: string) => `${roadmap}::${need}`;

export function autoLensTitle(roadmapTitle: string, needLabel: string) {
  const name = roadmapTitle.replace(/ skill roadmap$/, "");
  return `Using ${name} to ${needLabel[0].toLowerCase() + needLabel.slice(1)}`;
}

/** Standalone compose (also used in the browser by S28). Same rules as Engine.compose. */
export function composeLens(rm: Roadmap, fl: Lens | undefined, needSlug: string, needLabel: string): ComposedLens {
  const mods = LEVELS.flatMap((lv) => rm.levels[lv] ?? []);
  const order = uniq([
    ...(fl ? fl.priority_modules : []),
    ...mods.filter((m) => m.need_tags.includes(needSlug)).map((m) => m.slug),
  ]);
  const path: Record<Level, PathItem[]> = { beginner: [], intermediate: [], expert: [] };
  if (fl) {
    for (const x of fl.extra_modules) path[x.level].push({ title: x.title, relevance: "core", specific: true });
  }
  const rank = (slug: string) => (order.includes(slug) ? order.indexOf(slug) : 999);
  // Stable sort, like Python's sorted().
  const sorted = mods.map((m, i) => ({ m, i })).sort((a, b) => rank(a.m.slug) - rank(b.m.slug) || a.i - b.i);
  for (const { m } of sorted) {
    path[m.level].push({ title: m.title, slug: m.slug, relevance: order.includes(m.slug) ? "core" : "also_useful" });
  }
  return {
    flagship: Boolean(fl),
    title: fl ? fl.title : autoLensTitle(rm.title, needLabel),
    path,
    tailored: order.length > 0,
  };
}
