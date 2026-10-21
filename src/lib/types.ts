// Shapes of the content files in content/ (see schemas/*.json for the full contracts).

export interface ExpertValidation {
  status: string;
  note?: string;
}

export interface Identity {
  id: string;
  slug: string;
  label: string;
  aliases: string[];
  kind: string;
  sector: string;
  family: string;
  parent: string | null;
  isco08_submajor?: string;
  needs: string[];
  expert_validation: ExpertValidation;
  isco08_units?: string[];
}

export interface Family {
  id: string;
  slug: string;
  label: string;
  sector: string;
  needs: string[];
  description?: string;
}

export interface Sector {
  id: string;
  slug: string;
  label: string;
  needs: string[];
  order: number;
  description?: string;
}

export interface Need {
  id: string;
  slug: string;
  label: string;
  task_family: string;
  section?: string;
  universal: boolean;
  description: string;
  tool_ids: string[];
  expert_validation: ExpertValidation;
}

export interface RegistryEntry {
  id: string;
  slug: string;
  name: string;
  publisher?: string;
  official_url?: string;
  url_status?: string;
  category_id?: string;
  profile_status?: string;
  pricing_model?: string;
  note?: string;
  aliases?: string[];
}

export interface RoadmapModule {
  id: string;
  slug: string;
  title: string;
  outcome: string;
  topics: string[];
  practice: string;
  need_tags: string[];
  estimated_hours?: { value: number; is_estimate: boolean };
  level: Level;
}

export type Level = "beginner" | "intermediate" | "expert";
export const LEVELS: Level[] = ["beginner", "intermediate", "expert"];

export interface Roadmap {
  id: string;
  slug: string;
  title: string;
  tool_ids: string[];
  levels: Record<Level, RoadmapModule[]>;
  authoring?: string;
  archetype?: string;
  expert_validation: ExpertValidation;
}

export interface LensExtraModule {
  level: Level;
  title: string;
  outcome?: string;
  topics?: string[];
  practice?: string;
}

export interface Lens {
  id: string;
  roadmap: string;
  need: string;
  title: string;
  kind: string;
  for_identities: string[];
  why: string;
  what_is_different: string;
  priority_modules: string[];
  extra_modules: LensExtraModule[];
  starter_project: string;
  pitfalls: string[];
  pairs_with: string[];
  expert_validation: ExpertValidation;
}

export interface Skill {
  id: string;
  slug: string;
  label: string;
  group: string;
  description: string;
  keywords: string[];
  levels: Record<Level, string>;
  need_ids: string[];
  tool_ids: string[];
  roadmaps?: string[];
  identity_count?: number;
  expert_validation?: ExpertValidation;
}

export interface HelperStep {
  tool: string;
  need: string;
  what: string;
  first_win: string;
}

export interface HelperStage {
  n: number;
  title: string;
  goal: string;
  time: string;
  steps: HelperStep[];
  done: string[];
}

export interface Helper {
  slug: string;
  title: string;
  promise: string;
  intro: string;
  identities: string[];
  profiled_tools: string[];
  stage_count: number;
  tool_count: number;
  stages: HelperStage[];
}

export interface PilotProfile {
  tool: string;
  summary: string;
  cost: string;
  platforms: string[];
  best_for: string[];
  first_hour: string[];
  learn_next: string[];
  watch_out: string[];
  review_status: string;
}

/** Composed lens path entry (reference_engine.compose). */
export interface PathItem {
  title: string;
  relevance: "core" | "also_useful";
  specific?: boolean;
  slug?: string;
}

export interface ComposedLens {
  flagship: boolean;
  title: string;
  path: Record<Level, PathItem[]>;
  tailored: boolean;
}
