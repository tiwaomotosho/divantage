// On-device stores (FR-054, FR-069, D-053). Nothing here is ever sent to a server.
// Keys: da.helper.v1 (helpers), da.ticks.v1 (roadmap module ticks), da.identities.v1 (returning visitor), da-theme.
import { useSyncExternalStore } from "react";

export interface HelperProgress {
  ticks: Record<string, boolean>;
  opened: Record<string, boolean>;
}
export interface HelperState {
  v: 1;
  active: string | null;
  paused: boolean;
  /** "self" or "someone" (helping someone else); never an identity slug. */
  label: "self" | "someone";
  progress: Record<string, HelperProgress>;
  updated: string;
}
export interface TicksState {
  v: 1;
  ticks: Record<string, Record<string, boolean>>;
}
export interface IdentityMemory {
  v: 1;
  slugs: { slug: string; label: string }[];
}

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => e.key?.startsWith("da.") && l();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(l);
    window.removeEventListener("storage", onStorage);
  };
};

/** In-memory fallback so ticks still work for the session when storage is blocked (S40 states). */
const memory = new Map<string, string>();
let storageOk: boolean | null = null;
export function storageAvailable(): boolean {
  if (storageOk !== null) return storageOk;
  try {
    const k = "da.__probe";
    localStorage.setItem(k, "1");
    localStorage.removeItem(k);
    storageOk = true;
  } catch {
    storageOk = false;
  }
  return storageOk;
}
function getRaw(key: string): string | null {
  try {
    if (storageAvailable()) return localStorage.getItem(key);
  } catch {
    /* fall through */
  }
  return memory.get(key) ?? null;
}
function setRaw(key: string, value: string | null) {
  try {
    if (storageAvailable()) {
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, value);
    }
  } catch {
    /* ignore */
  }
  if (value === null) memory.delete(key);
  else memory.set(key, value);
}

const snapshots = new Map<string, { raw: string | null; value: unknown }>();
function readJson<T>(key: string, valid: (x: any) => boolean, fallback: T): T {
  const raw = getRaw(key);
  const hit = snapshots.get(key);
  if (hit && hit.raw === raw) return hit.value as T;
  let value: T = fallback;
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      // An unknown version is ignored, not guessed at (04 S41).
      if (valid(parsed)) value = parsed;
    } catch {
      /* ignore */
    }
  }
  snapshots.set(key, { raw, value });
  return value;
}

const HELPER_KEY = "da.helper.v1";
const TICKS_KEY = "da.ticks.v1";
const IDS_KEY = "da.identities.v1";

const emptyHelper: HelperState = { v: 1, active: null, paused: false, label: "self", progress: {}, updated: "" };
const emptyTicks: TicksState = { v: 1, ticks: {} };
const emptyIds: IdentityMemory = { v: 1, slugs: [] };

export const getHelper = () => readJson<HelperState>(HELPER_KEY, (x) => x?.v === 1, emptyHelper);
export const getTicks = () => readJson<TicksState>(TICKS_KEY, (x) => x?.v === 1, emptyTicks);
export const getIdentities = () => readJson<IdentityMemory>(IDS_KEY, (x) => x?.v === 1, emptyIds);

function setHelper(next: HelperState) {
  setRaw(HELPER_KEY, JSON.stringify({ ...next, updated: new Date().toISOString() }));
  emit();
}

export const helperActions = {
  start(slug: string, label: "self" | "someone" = "self") {
    const s = getHelper();
    setHelper({ ...s, active: slug, paused: false, label, progress: { ...s.progress, [slug]: s.progress[slug] ?? { ticks: {}, opened: {} } } });
  },
  pause() {
    setHelper({ ...getHelper(), paused: true });
  },
  resume() {
    setHelper({ ...getHelper(), paused: false });
  },
  stop() {
    setHelper({ ...getHelper(), active: null, paused: false });
  },
  tick(slug: string, key: string, value: boolean) {
    const s = getHelper();
    const p = s.progress[slug] ?? { ticks: {}, opened: {} };
    setHelper({ ...s, progress: { ...s.progress, [slug]: { ...p, ticks: { ...p.ticks, [key]: value } } } });
  },
  opened(slug: string, tool: string) {
    const s = getHelper();
    const p = s.progress[slug] ?? { ticks: {}, opened: {} };
    if (p.opened[tool]) return;
    setHelper({ ...s, progress: { ...s.progress, [slug]: { ...p, opened: { ...p.opened, [tool]: true } } } });
  },
  /** "Clear my progress" clears helper and roadmap ticks (04 §9 amendment to S30). */
  clearAll() {
    setRaw(HELPER_KEY, null);
    setRaw(TICKS_KEY, null);
    emit();
  },
};

export const tickActions = {
  set(roadmap: string, module: string, value: boolean) {
    const s = getTicks();
    setRaw(TICKS_KEY, JSON.stringify({ ...s, ticks: { ...s.ticks, [roadmap]: { ...(s.ticks[roadmap] ?? {}), [module]: value } } }));
    emit();
  },
};

export const identityActions = {
  remember(slugs: { slug: string; label: string }[]) {
    setRaw(IDS_KEY, JSON.stringify({ v: 1, slugs: slugs.slice(0, 3) }));
    emit();
  },
  forget() {
    setRaw(IDS_KEY, null);
    emit();
  },
};

export function useHelperState(): HelperState | null {
  return useSyncExternalStore(subscribe, getHelper, () => null);
}
export function useTicks(): TicksState | null {
  return useSyncExternalStore(subscribe, getTicks, () => null);
}
export function useIdentityMemory(): IdentityMemory | null {
  return useSyncExternalStore(subscribe, getIdentities, () => null);
}
const noop = () => () => {};
/** False during prerender/hydration, true once running in the browser. */
export function useHydrated(): boolean {
  return useSyncExternalStore(noop, () => true, () => false);
}

// ---- Theme (06 §8) ----
export type Theme = "system" | "light" | "dark";
export function getTheme(): Theme {
  try {
    const t = localStorage.getItem("da-theme");
    if (t === "light" || t === "dark") return t;
  } catch {
    /* ignore */
  }
  return "system";
}
export function setTheme(t: Theme) {
  try {
    if (t === "system") localStorage.removeItem("da-theme");
    else localStorage.setItem("da-theme", t);
  } catch {
    /* ignore */
  }
  if (t === "system") document.documentElement.removeAttribute("data-theme");
  else document.documentElement.setAttribute("data-theme", t);
  emit();
}
export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, getTheme, () => "system");
}

// ---- Session-only flags ----
export function sessionGet(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}
export function sessionSet(key: string, value: string | null) {
  try {
    if (value === null) sessionStorage.removeItem(key);
    else sessionStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}
