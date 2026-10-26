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

// ---- V2.8 device stores (D-079 stars, kit progress, market, helper bar, need feedback, continue card) ----
export interface StarItem {
  type: "tool" | "goal" | "kit" | "helper" | "skill" | "role";
  slug: string;
  label: string;
  at: string;
}
export interface DeviceState {
  v: 1;
  stars: Record<string, StarItem>;
  kits: Record<string, number[]>;
  market: "ng" | "africa" | "other";
  helperHidden: boolean;
  coachSeen: boolean;
  dismissed: Record<string, boolean>;
  last: { url: string; title: string; kicker: string; tool?: string; at: string } | null;
  /** Skill state per learning path: the person's own claim that they can do it (D-079). */
  canDo?: Record<string, boolean>;
}
const DEVICE_KEY = "da.device.v1";
const emptyDevice: DeviceState = { v: 1, stars: {}, kits: {}, market: "ng", helperHidden: false, coachSeen: false, dismissed: {}, last: null };
export const getDevice = () => readJson<DeviceState>(DEVICE_KEY, (x) => x?.v === 1, emptyDevice);
function setDevice(next: Partial<DeviceState>) {
  setRaw(DEVICE_KEY, JSON.stringify({ ...getDevice(), ...next }));
  emit();
}
export function useDevice(): DeviceState | null {
  return useSyncExternalStore(subscribe, getDevice, () => null);
}
export const deviceActions = {
  toggleStar(item: Omit<StarItem, "at">) {
    const s = { ...getDevice().stars };
    const k = `${item.type}:${item.slug}`;
    if (s[k]) delete s[k];
    else s[k] = { ...item, at: new Date().toISOString() };
    setDevice({ stars: s });
    return Boolean(s[k]);
  },
  setKitStep(kit: string, step: number, done: boolean) {
    const k = { ...getDevice().kits };
    const set = new Set(k[kit] ?? []);
    if (done) set.add(step);
    else set.delete(step);
    k[kit] = [...set].sort((a, b) => a - b);
    setDevice({ kits: k });
  },
  setMarket(market: DeviceState["market"]) {
    setDevice({ market });
  },
  hideHelper(hidden: boolean) {
    setDevice({ helperHidden: hidden });
  },
  coachSeen() {
    setDevice({ coachSeen: true });
  },
  dismiss(key: string) {
    setDevice({ dismissed: { ...getDevice().dismissed, [key]: true } });
  },
  setCanDo(rm: string, v: boolean) {
    setDevice({ canDo: { ...(getDevice().canDo ?? {}), [rm]: v } });
  },
  visit(last: DeviceState["last"]) {
    setDevice({ last });
  },
  clear() {
    setRaw(DEVICE_KEY, null);
    emit();
  },
};

/** Need feedback hides a need for this visit only (D-102). */
export function sessionHidden(key: string): boolean {
  return sessionGet(`da.hide.${key}`) === "1";
}
export function setSessionHidden(key: string, v: boolean) {
  sessionSet(`da.hide.${key}`, v ? "1" : null);
  emit();
}

// ---- Demo accounts (S44/S46). Owner decision 26 Oct 2026: accounts run in demo mode on this device until the
// real auth stack (Spike S-2) and database are in place. No data leaves the device. ----
export interface Consent {
  on: boolean;
  at: string | null;
}
export interface Account {
  v: 1;
  demo: true;
  name: string;
  email: string;
  method: "google" | "email";
  created: string;
  consents: { progress: Consent; recommend: Consent; trending: Consent } | null;
  syncedAt: string | null;
}
const ACCOUNT_KEY = "da.account.v1";
export const getAccount = () => readJson<Account | null>(ACCOUNT_KEY, (x) => x?.v === 1, null);
export function useAccount(): Account | null {
  return useSyncExternalStore(subscribe, getAccount, () => null);
}
const nameFromEmail = (e: string) => {
  const n = e.split("@")[0].split(/[._-]/)[0];
  return n ? n[0].toUpperCase() + n.slice(1) : "Friend";
};
export const accountActions = {
  signIn(method: "google" | "email", email: string) {
    const em = email.trim() || "demo.user@example.com";
    setRaw(ACCOUNT_KEY, JSON.stringify({ v: 1, demo: true, name: nameFromEmail(em), email: em, method, created: new Date().toISOString(), consents: null, syncedAt: null } satisfies Account));
    emit();
  },
  setConsents(c: Account["consents"]) {
    const a = getAccount();
    if (!a) return;
    setRaw(ACCOUNT_KEY, JSON.stringify({ ...a, consents: c, syncedAt: c?.progress.on ? new Date().toISOString() : null }));
    emit();
  },
  rename(name: string) {
    const a = getAccount();
    if (a) setRaw(ACCOUNT_KEY, JSON.stringify({ ...a, name: name.slice(0, 40) }));
    emit();
  },
  signOut() {
    setRaw(ACCOUNT_KEY, null);
    emit();
  },
};

// ---- Retention loop (doc 24 §11): suggestions sent, stage outputs, outcomes, dated dismissals ----
export interface Retention {
  v: 1;
  suggestions: { ref: string; on: string; type: string; at: string }[];
  outputs: Record<string, { text: string; at: string }>;
  outcomes: { key: string; label: string; value: string; at: string }[];
  dismissedAt: Record<string, string>;
  promptedAt: string | null;
}
const RET_KEY = "da.retention.v1";
const emptyRet: Retention = { v: 1, suggestions: [], outputs: {}, outcomes: [], dismissedAt: {}, promptedAt: null };
export const getRetention = () => readJson<Retention>(RET_KEY, (x) => x?.v === 1, emptyRet);
export function useRetention(): Retention | null {
  return useSyncExternalStore(subscribe, getRetention, () => null);
}
function setRet(p: Partial<Retention>) {
  setRaw(RET_KEY, JSON.stringify({ ...getRetention(), ...p }));
  emit();
}
export const retentionActions = {
  suggestionSent(ref: string, on: string, type: string) {
    setRet({ suggestions: [{ ref, on, type, at: new Date().toISOString() }, ...getRetention().suggestions].slice(0, 20) });
  },
  saveOutput(key: string, text: string) {
    setRet({ outputs: { ...getRetention().outputs, [key]: { text: text.slice(0, 280), at: new Date().toISOString() } } });
  },
  outcome(key: string, label: string, value: string) {
    setRet({ outcomes: [{ key, label, value, at: new Date().toISOString() }, ...getRetention().outcomes.filter((o) => o.key !== key)] });
  },
  /** "Not for me" / "I already know this": hidden for 30 days (doc 24 §9). */
  dismiss(key: string) {
    setRet({ dismissedAt: { ...getRetention().dismissedAt, [key]: new Date().toISOString() } });
  },
  prompted() {
    setRet({ promptedAt: new Date().toISOString() });
  },
};
export function isDismissed(r: Retention | null, key: string) {
  const at = r?.dismissedAt[key];
  return Boolean(at && Date.now() - Date.parse(at) < 30 * 86400000);
}
