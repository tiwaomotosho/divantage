// Lazy loaders for the build-time indexes (fetched on first use, cached for the session).
import {
  createContentSearch,
  createIdentitySearch,
  createSkillSearch,
  type ContentIndexFile,
  type IdentityDoc,
  type SkillDoc,
  type ToolName,
} from "~/lib/search";
import { useEffect, useState } from "react";

const cache = new Map<string, Promise<unknown>>();
export function fetchJson<T>(url: string): Promise<T> {
  let p = cache.get(url) as Promise<T> | undefined;
  if (!p) {
    p = fetch(url).then((r) => {
      if (!r.ok) throw new Error(`${r.status} ${url}`);
      return r.json() as Promise<T>;
    });
    p.catch(() => cache.delete(url));
    cache.set(url, p);
  }
  return p;
}

let identity: Promise<ReturnType<typeof createIdentitySearch>> | undefined;
export const loadIdentitySearch = () =>
  (identity ??= fetchJson<IdentityDoc[]>("/api/v1/identities-index.json").then(createIdentitySearch).catch((e) => {
    identity = undefined;
    throw e;
  }));

let skills: Promise<ReturnType<typeof createSkillSearch>> | undefined;
export const loadSkillSearch = () =>
  (skills ??= fetchJson<SkillDoc[]>("/api/v1/skills-index.json").then(createSkillSearch).catch((e) => {
    skills = undefined;
    throw e;
  }));

let content: Promise<ReturnType<typeof createContentSearch>> | undefined;
export const loadContentSearch = () =>
  (content ??= fetchJson<ContentIndexFile>("/api/v1/search-index.json").then(createContentSearch).catch((e) => {
    content = undefined;
    throw e;
  }));

export const loadToolNames = () => fetchJson<ToolName[]>("/api/v1/tools-index.json");

export type LoadState<T> = { status: "idle" | "loading" | "ready" | "error"; value?: T };

/** Start loading when `enabled` turns true (e.g. on first focus). */
export function useLazy<T>(loader: () => Promise<T>, enabled: boolean): LoadState<T> {
  const [state, setState] = useState<LoadState<T>>({ status: "idle" });
  useEffect(() => {
    if (!enabled || state.status === "ready" || state.status === "loading") return;
    let live = true;
    setState({ status: "loading" });
    loader().then(
      (value) => live && setState({ status: "ready", value }),
      () => live && setState({ status: "error" }),
    );
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);
  return state;
}

import { createGoalSearch, type GoalDoc } from "~/lib/search";
export interface GoalIndexFile {
  docs: GoalDoc[];
  kits: Record<string, { title: string; promise: string; steps: number; photo: string | null }>;
  safety: Record<string, { label: string; what: string }>;
  goalTags: Record<string, string[]>;
}
let goals: Promise<{ search: ReturnType<typeof createGoalSearch>; file: GoalIndexFile }> | undefined;
export const loadGoalSearch = () =>
  (goals ??= fetchJson<GoalIndexFile>("/api/v1/goals-index.json")
    .then((file) => ({ search: createGoalSearch(file.docs), file }))
    .catch((e) => {
      goals = undefined;
      throw e;
    }));
