// Search runtime: port of spec/spec-assets/search/reference-harness.mjs and identity-harness.mjs
// (search-config.json). Documents are built at build time (scripts/build-data.ts) and indexed in the browser.
import MiniSearch from "minisearch";

export type ContentType = "tool" | "task" | "resource" | "playbook" | "comparison" | "need" | "skill" | "helper";

export interface ContentDoc {
  id: string;
  type: ContentType;
  title: string;
  url: string;
  aliases: string;
  summary: string;
  taxonomy: string;
  description: string;
  body: string;
  starts: boolean | null;
  platforms: string[];
  /** Registry-only tools are indexed by name and aliases only, at a lower weight. */
  stub?: boolean;
}

export interface SearchOptionsConfig {
  stopwords: string[];
  spelling_variants: Record<string, string>;
  synonyms: Record<string, string[]>;
  boost: Record<string, number>;
  cost_terms: string[];
  platform_terms: Record<string, string>;
}

export interface ContentIndexFile {
  options: SearchOptionsConfig;
  docs: ContentDoc[];
}

export interface ContentResult {
  id: string;
  type: ContentType;
  title: string;
  url: string;
  summary: string;
  starts: boolean | null;
  stub?: boolean;
  score: number;
}

const FIELDS = ["title", "aliases", "summary", "taxonomy", "description", "body"];

export function createContentSearch(file: ContentIndexFile) {
  const cfg = file.options;
  const stop = new Set(cfg.stopwords);
  const sp = cfg.spelling_variants;
  const syn: Record<string, Set<string>> = {};
  for (const [k, vs] of Object.entries(cfg.synonyms)) {
    for (const w of [k, ...vs]) {
      syn[w] = new Set([...(syn[w] ?? []), k, ...vs].filter((x) => x !== w && !x.includes(" ")));
    }
  }
  const norm = (t: string) => {
    t = t.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();
    return sp[t] ?? t;
  };
  const processTerm = (t: string) => {
    t = norm(t);
    return stop.has(t) ? null : t;
  };
  const byId = new Map(file.docs.map((d) => [d.id, d]));
  const ms = new MiniSearch<ContentDoc>({
    fields: FIELDS,
    storeFields: ["type", "starts", "platforms", "title", "url", "summary", "stub"],
    processTerm,
    searchOptions: {
      boost: cfg.boost,
      fuzzy: (term) => (term.length >= 5 ? 0.2 : term.length >= 4 ? 0.1 : false),
      processTerm,
    },
  });
  ms.addAll(file.docs);
  const flat = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

  return function search(qRaw: string): { results: ContentResult[]; andEmpty: boolean } {
    const q = qRaw.slice(0, 120);
    const terms = q.toLowerCase().split(/[^a-z0-9+#.]+/).filter(Boolean);
    const content = terms.map(processTerm).filter((t): t is string => Boolean(t));
    if (!content.length) return { results: [], andEmpty: true };
    const tree = (comb: "AND" | "OR") => ({
      combineWith: comb,
      queries: content.map((t) => ({ combineWith: "OR" as const, queries: [t, ...(syn[t] ?? [])] })),
    });
    const opts = {
      prefix: (_term: string, i: number, arr: string[]) => i === arr.length - 1,
      boostTerm: (term: string) => (content.includes(term) ? 1 : 0.6),
    };
    let res = ms.search(tree("AND") as never, { ...opts, combineWith: "AND" });
    const andEmpty = res.length === 0;
    if (!res.length) res = ms.search(tree("OR") as never, { ...opts, combineWith: "OR" });
    const nq = flat(q);
    const lq = q.toLowerCase();
    const cost = cfg.cost_terms.some((w) => lq.includes(w));
    const plat = Object.entries(cfg.platform_terms)
      .filter(([w]) => terms.includes(w))
      .map(([, p]) => p);
    const nl = content.length >= 3 || /^(how|what|where|which)\b/i.test(q);
    const out: ContentResult[] = res.map((r) => {
      const d = byId.get(String(r.id))!;
      let s = r.score;
      if (d.stub) s *= 0.5;
      if (cost && d.starts === true) s *= 1.4;
      if (plat.length && plat.some((p) => d.platforms.includes(p))) s *= 1.3;
      if (nl && (d.type === "task" || d.type === "playbook")) s *= 1.2;
      if ([d.title, ...d.aliases.split(" ")].some((x) => flat(x) === nq)) s += 1e6;
      return { id: d.id, type: d.type, title: d.title, url: d.url, summary: d.summary, starts: d.starts, stub: d.stub, score: s };
    });
    out.sort((a, b) => b.score - a.score);
    return { results: out, andEmpty };
  };
}

// ---------- Identity search (search-config.json → identity_search) ----------

export interface IdentityDoc {
  /** slug */
  s: string;
  /** label */
  l: string;
  /** aliases joined by " | " */
  a: string;
  /** parent label */
  p: string;
  /** family label */
  f: string;
  /** sector label */
  c: string;
  /** kind */
  k: string;
}

export interface IdentityHit {
  slug: string;
  label: string;
  parent: string;
  family: string;
  sector: string;
  kind: string;
  score: number;
}

export const stem = (t: string) => {
  t = t.toLowerCase();
  if (t.length > 4) {
    if (/(sses|xes|ches|shes)$/.test(t)) return t.slice(0, -2);
    if (t.endsWith("s") && !t.endsWith("ss")) return t.slice(0, -1);
  }
  return t;
};

const cleanQuery = (q: string) =>
  q
    .toLowerCase()
    .replace(/^\s*(i am an?|i'm an?|im an?|i work as an?|as an?|for an?)\s+/, "")
    .trim();

const tokenize = (s: string) => s.split(/[\s,|/()&-]+/).filter(Boolean);
const flat = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

export function createIdentitySearch(docs: IdentityDoc[]) {
  const rows = docs.map((d) => ({
    id: d.s,
    label: d.l,
    aliases: d.a,
    parent: d.p,
    family: d.f,
    sector: d.c,
    kind: d.k,
    isParent: !d.p,
  }));
  const ms = new MiniSearch({
    fields: ["label", "aliases", "parent", "family", "sector"],
    storeFields: ["label", "aliases", "kind", "isParent", "parent", "family", "sector"],
    processTerm: (t) => stem(t),
    tokenize,
    searchOptions: {
      boost: { label: 4, aliases: 3, parent: 0.6, family: 0.5, sector: 0.3 },
      prefix: true,
      fuzzy: (t) => (t.length >= 5 ? 0.2 : false),
      processTerm: (t) => stem(t),
    },
  });
  ms.addAll(rows);
  return function searchIdentities(q: string, limit = 8): IdentityHit[] {
    const c = cleanQuery(q);
    if (!c) return [];
    const nq = flat(c);
    const nqs = flat(c.split(/\s+/).map(stem).join(" "));
    let res = ms.search(c, { combineWith: "AND" });
    if (!res.length) res = ms.search(c, { combineWith: "OR" });
    const scored = res.map((r) => {
      let s = r.score;
      const names = [r.label, ...String(r.aliases).split(" | ")].map(flat);
      if (names.includes(nq) || names.includes(nqs)) s += 1e6;
      else if (flat(r.label).startsWith(nq)) s *= 2;
      if (r.isParent) s *= 1.05;
      if (r.kind === "life_role") s *= 0.95;
      return {
        slug: String(r.id),
        label: r.label,
        parent: r.parent,
        family: r.family,
        sector: r.sector,
        kind: r.kind,
        score: s,
      } as IdentityHit;
    });
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit);
  };
}

// ---------- Skills search ----------

export interface SkillDoc {
  id: string;
  label: string;
  group: string;
  kw: string;
  desc: string;
  needs: string;
  tools: string;
}

export function createSkillSearch(docs: SkillDoc[]) {
  const ms = new MiniSearch<SkillDoc>({
    fields: ["label", "kw", "needs", "tools", "desc"],
    storeFields: ["label", "desc", "group"],
    processTerm: (t) => stem(t),
    tokenize,
    searchOptions: {
      boost: { label: 4, kw: 3, needs: 2, tools: 2, desc: 1 },
      prefix: true,
      fuzzy: (t) => (t.length >= 5 ? 0.2 : false),
      processTerm: (t) => stem(t),
    },
  });
  ms.addAll(docs);
  return function searchSkills(q: string, limit = 6) {
    if (!q.trim()) return [];
    let r = ms.search(q, { combineWith: "AND" });
    if (!r.length) r = ms.search(q, { combineWith: "OR" });
    return r.slice(0, limit).map((x) => ({ slug: String(x.id), label: x.label as string, desc: x.desc as string }));
  };
}

// ---------- "<tool> for <identity>" routing ----------

export interface ToolName {
  slug: string;
  name: string;
}

export function routeToolForIdentity(
  q: string,
  tools: ToolName[],
  searchIdentities: (q: string) => IdentityHit[],
): { url: string; tool: string; identity: string } | null {
  const m = q.toLowerCase().split(" for ");
  if (m.length !== 2) return null;
  const left = m[0].trim();
  const tool = tools.find((t) =>
    [t.name, t.slug, t.name.replace(/^Microsoft |^Google |^Adobe /, "")].map((x) => x.toLowerCase()).includes(left),
  );
  if (!tool) return null;
  const id = searchIdentities(m[1])[0];
  if (!id) return null;
  return { url: `/for/${id.slug}/${tool.slug}`, tool: tool.name, identity: id.label };
}

// ---------- Goal and kit search ("I want to…", doc 26 §6; port of goal-harness.mjs) ----------

export interface GoalDoc {
  /** goal slug, or "kit:{slug}" */
  id: string;
  label: string;
  terms: string;
  need: string;
  tools: string;
  top: string;
  markets: string[];
  /** top tool slugs for logos */
  logos: string[];
  safety: boolean;
}

const LEAD =
  /^(i (really )?(want|need|wish|would like|'d like|wanna|have) to |i'd like to |i want a |i need a |i want |how (do|can|should) i |how to |help me( to)? |can you help me( to)? |where (can|do) i |what is the best way to |show me how to |i am looking for |i'm looking for |looking for )/i;

const FILLER = new Set(["a", "an", "the", "that", "this", "in", "on", "to", "for", "of", "and", "or", "my", "me", "i", "it", "is", "with", "from", "at", "by", "your", "our", "can", "do"]);

export function cleanGoalQuery(q: string) {
  let x = q.trim().replace(/[?!.]+$/, "");
  for (let i = 0; i < 2; i++) x = x.replace(LEAD, "");
  return x.replace(/\b(please|pls|for free online)\b/gi, "").trim() || q;
}

export function createGoalSearch(docs: GoalDoc[]) {
  const boost = { label: 4, terms: 3, top: 2, tools: 1.5, need: 0.6 };
  const byId = new Map(docs.map((d) => [d.id, d]));
  const ms = new MiniSearch<GoalDoc>({
    fields: Object.keys(boost),
    storeFields: ["label"],
    processTerm: (t) => stem(t),
    tokenize,
    searchOptions: { boost, prefix: true, fuzzy: (t) => (t.length >= 5 ? 0.2 : false), processTerm: (t) => stem(t) },
  });
  ms.addAll(docs);
  return function searchGoals(q0: string, market?: string) {
    const q = cleanGoalQuery(q0);
    if (!q.trim()) return Object.assign([] as { doc: GoalDoc; score: number; coverage: number }[], { andEmpty: true, weak: true });
    let r = ms.search(q, { combineWith: "AND" });
    const andEmpty = r.length === 0;
    if (andEmpty) r = ms.search(q, { combineWith: "OR" });
    else {
      // Kits answer outcomes in people's own words, so they also get a partial-match pass (doc 26 §6).
      const seen = new Set(r.map((x) => x.id));
      r = [...r, ...ms.search(q, { combineWith: "OR", filter: (x) => String(x.id).startsWith("kit:") && !seen.has(x.id) })];
    }
    const words = [...new Set(tokenize(q.toLowerCase()).filter((w) => !FILLER.has(w)).map(stem))];
    const out = r
      .map((x) => {
        const d = byId.get(String(x.id))!;
        let s = x.score * (d.id.startsWith("kit:") ? 1.3 : 1);
        if (market && d.markets.includes(market)) s *= 1.25;
        if (flat(d.label).includes(flat(q))) s *= 1.5;
        const matched = new Set((x.queryTerms ?? []).map(stem));
        const coverage = words.length ? words.filter((w) => matched.has(w)).length / words.length : 1;
        return { doc: d, score: s, coverage };
      })
      .sort((a, b) => b.score - a.score);
    /** No answer when even the best result matches under half of the meaningful words (27-no-results). */
    const weak = out.length === 0 || Math.max(...out.slice(0, 10).map((o) => o.coverage)) < 0.5;
    return Object.assign(out.filter((o) => o.coverage >= 0.4), { andEmpty, weak });
  };
}
