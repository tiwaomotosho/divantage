// Turns a composed lens (identity.ts composeLens) into module cards per level. Shared by S29 (build) and S28 (browser).
import { composeLens } from "./identity";
import type { Lens, Level, Roadmap, RoadmapModule } from "./types";
import { LEVELS } from "./types";

export interface ModuleView {
  slug: string;
  title: string;
  outcome: string;
  topics: string[];
  practice: string;
  hours: number | null;
  signature: boolean;
  relevance?: "core" | "also_useful";
  specific?: boolean;
}

export function moduleView(m: RoadmapModule): ModuleView {
  return {
    slug: m.slug,
    title: m.title,
    outcome: m.outcome,
    topics: m.topics,
    practice: m.practice,
    hours: m.estimated_hours?.value ?? null,
    signature: /^(signature skills in|advanced) /i.test(m.title),
  };
}

export function roadmapLevels(rm: Roadmap): Record<Level, ModuleView[]> {
  return Object.fromEntries(LEVELS.map((lv) => [lv, (rm.levels[lv] ?? []).map(moduleView)])) as Record<Level, ModuleView[]>;
}

export function lensLevels(rm: Roadmap, fl: Lens | undefined, needSlug: string, needLabel: string) {
  const comp = composeLens(rm, fl, needSlug, needLabel);
  const bySlug = new Map(LEVELS.flatMap((lv) => rm.levels[lv] ?? []).map((m) => [m.slug, m]));
  const levels = Object.fromEntries(
    LEVELS.map((lv) => [
      lv,
      comp.path[lv].map((p): ModuleView => {
        if (p.slug && bySlug.has(p.slug)) return { ...moduleView(bySlug.get(p.slug)!), relevance: p.relevance };
        const x = fl!.extra_modules.find((e) => e.title === p.title)!;
        return {
          slug: `extra-${lv}-${x.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
          title: x.title,
          outcome: x.outcome ?? "",
          topics: x.topics ?? [],
          practice: x.practice ?? "",
          hours: null,
          signature: false,
          relevance: "core",
          specific: true,
        };
      }),
    ]),
  ) as Record<Level, ModuleView[]>;
  return { comp, levels };
}
