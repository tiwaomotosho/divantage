// Rule-based suggestions (doc 24 §9 R1–R8, doc 26 §7 R9–R12). No machine learning; every card says why.
// R1–R8 run for signed-in people who allowed "Use my profile to suggest things"; others get R1 and R9–R12.
// Caps: 5 cards, 2 per kind; dismissed items stay away 30 days.
import type { DeviceState, HelperState, Retention, TicksState } from "./store";
import { isDismissed } from "./store";

export interface Card {
  key: string;
  kind: string;
  tag: string;
  icon: string;
  hue: string;
  title: string;
  sub: string;
  why: string;
  url: string;
}

export interface RecoInput {
  dev: DeviceState;
  ticks: TicksState;
  helper: HelperState | null;
  ret: Retention;
  profile: boolean;
  roles: { slug: string; label: string }[];
  kits: Record<string, { title: string; icon: string; hue: string; steps: { slug: string; label: string }[] }>;
  hints: string[];
  coreGoals: { slug: string; label: string; need: string }[];
  trending: { slug: string; label: string; group?: string }[];
  fresh: { title: string; url?: string; body: string }[];
  tools: Record<string, { name: string; alternatives: { slug: string; name: string }[] }>;
}

const days = (iso: string) => (Date.now() - Date.parse(iso)) / 86400000;

export function recommend(x: RecoInput): Card[] {
  const out: Card[] = [];
  const add = (c: Card) => {
    if (isDismissed(x.ret, c.key) || x.dev.dismissed[c.key]) return;
    if (out.some((o) => o.url === c.url)) return;
    if (out.filter((o) => o.kind === c.kind).length >= 2) return;
    out.push(c);
  };
  const learning = Object.entries(x.ticks.ticks)
    .map(([rm, m]) => ({ rm, n: Object.values(m).filter(Boolean).length }))
    .filter((p) => p.n > 0);

  // R1 Continue.
  if (x.dev.last) add({ key: `r1:${x.dev.last.url}`, kind: "continue", tag: "Continue", icon: "route", hue: "violet", title: x.dev.last.title, sub: x.dev.last.kicker, why: "You were here last.", url: x.dev.last.url });

  if (x.profile) {
    // R2 Next module.
    for (const p of learning) add({ key: `r2:${p.rm}`, kind: "next-module", tag: "Next module", icon: "book-open", hue: "blue", title: `Keep going with ${x.tools[p.rm]?.name ?? p.rm.replace(/-/g, " ")}`, sub: `${p.n} modules ticked`, why: `You're learning ${x.tools[p.rm]?.name ?? p.rm}.`, url: `/tools/${p.rm}/roadmap` });
    // R3 Starred, not started.
    for (const s of Object.values(x.dev.stars))
      if (s.type === "tool" && days(s.at) > 3 && !x.ticks.ticks[s.slug]) add({ key: `r3:${s.slug}`, kind: "starred", tag: "Starred, not started", icon: "star", hue: "amber", title: `Start learning ${s.label}`, sub: "First module · about 1 hour", why: `You starred it ${Math.round(days(s.at))} days ago.`, url: `/tools/${s.slug}/roadmap` });
    // R4 Core goals for you.
    for (const g of x.coreGoals) add({ key: `r4:${g.slug}`, kind: "core-goal", tag: `For ${x.roles[0]?.label.toLowerCase() ?? "you"}`, icon: "target", hue: "violet", title: g.label, sub: g.need, why: `Part of the work of a ${x.roles[0]?.label.toLowerCase() ?? "person in your role"}.`, url: `/goals/${g.slug}` });
    // R5 Next level.
    for (const p of learning.filter((l) => l.n >= 3)) add({ key: `r5:${p.rm}`, kind: "next-level", tag: "Next level", icon: "trending-up", hue: "green", title: `Intermediate ${x.tools[p.rm]?.name ?? p.rm}`, sub: "Move up a level", why: "You've done the beginner modules.", url: `/tools/${p.rm}/roadmap` });
    // R6 Compare an alternative.
    for (const p of learning) {
      const alt = x.tools[p.rm]?.alternatives[0];
      if (alt) add({ key: `r6:${alt.slug}`, kind: "alternative", tag: "Compare", icon: "layers", hue: "teal", title: `See how ${alt.name} compares`, sub: "Also used for the same job", why: `A common alternative to ${x.tools[p.rm]?.name ?? p.rm}.`, url: `/tools/${alt.slug}` });
    }
    // R7 Trending in your field.
    for (const t of x.trending.slice(0, 2)) add({ key: `r7:${t.slug}`, kind: "trending", tag: "Trending this week", icon: "trending-up", hue: "blue", title: t.label, sub: t.group ?? "Goal", why: "Many people in your area worked on this this week.", url: `/goals/${t.slug}` });
    // R8 Fresh.
    for (const f of x.fresh) if (f.url) add({ key: `r8:${f.url}`, kind: "fresh", tag: "Updated", icon: "refresh", hue: "teal", title: f.title, sub: f.body, why: "Changed recently, and you starred it.", url: f.url });
  }
  // R9 Next in your kit.
  for (const [slug, done] of Object.entries(x.dev.kits)) {
    const k = x.kits[slug];
    if (!k || !done.length) continue;
    const next = k.steps.findIndex((_, i) => !done.includes(i + 1));
    if (next >= 0) add({ key: `r9:${slug}`, kind: "kit", tag: "Next in your kit", icon: "layers", hue: "violet", title: k.steps[next].label, sub: `${k.title} · step ${next + 1} of ${k.steps.length}`, why: "The next step of a kit you started.", url: `/goals/${k.steps[next].slug}` });
  }
  // R10 Kits for people like you.
  for (const slug of x.hints) {
    const k = x.kits[slug];
    if (k && !x.dev.kits[slug]?.length) add({ key: `r10:${slug}`, kind: "kit-hint", tag: `For ${x.roles[0]?.label.toLowerCase() ?? "you"}`, icon: k.icon, hue: k.hue, title: k.title, sub: `${k.steps.length} steps`, why: `Often useful for a ${x.roles[0]?.label.toLowerCase() ?? "person like you"}.`, url: `/kits/${slug}` });
  }
  // R12 Check first.
  add({ key: "r12:stay-safe", kind: "check", tag: "Check first", icon: "shield", hue: "amber", title: "Spot scams, fake alerts and phishing", sub: "5 minutes · safety", why: "Everyone online meets scams. It takes five minutes.", url: "/kits/stay-safe-online" });
  return out.slice(0, 5);
}
