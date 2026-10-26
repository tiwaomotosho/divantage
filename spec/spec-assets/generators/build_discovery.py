"""Build the discovery layer (V2.7): goal kits, goal links, goal safety, entry paths.
Usage: python3 -I build_discovery.py <source-dir> <pack-root>
Sources: goal_kits.txt, goal_safety.txt (+ goals.json and registry built earlier)."""
import sys, os, re, json, collections
SRC, ROOT = sys.argv[1], sys.argv[2]
TAX = os.path.join(ROOT, "spec-assets/taxonomy"); CAT = os.path.join(ROOT, "08_Starter_Catalogue")
goals = json.load(open(f"{TAX}/goals.json"))["values"]
gby = {g["slug"]: g for g in goals}
needs = {n["slug"]: n for n in json.load(open(f"{TAX}/needs.json"))["values"]}
errors = []
reg = {"tool_" + r["slug"].replace("-", "_"): r for r in json.load(open(f"{CAT}/registry/tools-registry.json"))["values"]}
def rows(name, n):
    out = []
    for ln, l in enumerate(open(os.path.join(SRC, name), encoding="utf-8"), 1):
        l = l.rstrip("\n")
        if not l.strip() or l.startswith("#"): continue
        p = [x.strip() for x in l.split(" | ")]
        if len(p) != n: errors.append(f"{name}:{ln}: expected {n} fields, got {len(p)}"); continue
        out.append((ln, p))
    return out
# ---- kits ----
kits = []
for ln, p in rows("goal_kits.txt", 6):
    slug, title, promise, markets, gl, phrases = p
    gs = [x.strip() for x in gl.split(",") if x.strip()]
    for s in gs:
        if s not in gby: errors.append(f"goal_kits.txt:{ln}: unknown goal {s}")
    if len(gs) != len(set(gs)): errors.append(f"goal_kits.txt:{ln}: repeated goal in {slug}")
    if not 3 <= len(gs) <= 12: errors.append(f"goal_kits.txt:{ln}: {slug} needs 3-12 goals")
    if markets not in ("all", "ng", "africa", "ng,africa"): errors.append(f"goal_kits.txt:{ln}: bad markets")
    # a market-tagged kit may not contain a goal for another market only
    if markets != "all":
        for s in gs:
            if s in gby and not (set(gby[s]["markets"]) & (set(markets.split(",")) | {"africa", "all"})):
                errors.append(f"goal_kits.txt:{ln}: {s} is not for market {markets}")
    kits.append({"slug": slug, "title": title, "promise": promise, "markets": markets.split(","),
                 "goal_ids": [gby[s]["id"] for s in gs if s in gby], "goal_slugs": gs,
                 "search_phrases": [x.strip() for x in phrases.split(";") if x.strip()]})
kit_of = collections.defaultdict(list)
for k in kits:
    for s in k["goal_slugs"]: kit_of[s].append(k["slug"])
# ---- safety ----
rules = []
for ln, p in rows("goal_safety.txt", 6):
    tag, label, kw, know, flags, help_ = p
    rules.append({"tag": tag, "label": label, "keywords": [x.strip() for x in kw.split(",") if x.strip()],
                  "what_to_know": know, "red_flags": [x.strip() for x in flags.split(";") if x.strip()], "where_to_get_help": help_})
if len({r["tag"] for r in rules}) != len(rules): errors.append("goal_safety.txt: duplicate tag")
def has(text, kw):
    tail = r"(?![a-z0-9])" if len(kw) <= 4 else ""   # short keywords (jamb, cac, tax, ai) must match a whole word
    return re.search(r"(?<![a-z0-9])" + re.escape(kw) + tail, text) is not None
tags_of = {}
for g in goals:
    text = " ".join([g["slug"].replace("-", " "), g["label"].lower()] + [t.lower() for t in g["search_terms"]])
    tags_of[g["slug"]] = [r["tag"] for r in rules if any(has(text, k) for k in r["keywords"])]
# ---- links ----
tool_goals = collections.defaultdict(list)
for g in goals:
    for t in g["tool_ids"]: tool_goals[t].append(g["slug"])
links = {}
for g in goals:
    sc = collections.Counter()
    tools = set(g["tool_ids"])
    cand = set()
    for t in tools: cand.update(tool_goals[t])
    for o in cand:
        if o == g["slug"]: continue
        sh = len(tools & set(gby[o]["tool_ids"]))
        sc[o] += 2 * sh + (3 if gby[o]["need"] == g["need"] else 0) + (4 if set(kit_of[o]) & set(kit_of[g["slug"]]) else 0)
    for o in gby:  # same need even with no shared tool
        if gby[o]["need"] == g["need"] and o != g["slug"] and o not in sc: sc[o] = 1
    if len(sc) < 3:  # pad with goals that share the first tool's registry category
        cats = {reg[t]["category_id"] for t in g["tool_ids"][:2] if t in reg}
        for o in gby:
            if o != g["slug"] and o not in sc and any(reg.get(t, {}).get("category_id") in cats for t in gby[o]["tool_ids"][:2]): sc[o] = 0.5
            if len(sc) >= 6: break
    related = [o for o, _ in sorted(sc.items(), key=lambda kv: (-kv[1], kv[0]))[:6]]
    nxt = []
    for k in kits:
        if g["slug"] in k["goal_slugs"]:
            i = k["goal_slugs"].index(g["slug"])
            if i + 1 < len(k["goal_slugs"]): nxt.append({"kit": k["slug"], "next_goal": k["goal_slugs"][i + 1]})
    links[g["slug"]] = {"goal_id": g["id"], "related_goals": related, "next_steps": nxt, "kits": kit_of[g["slug"]], "safety_tags": tags_of[g["slug"]]}
if errors:
    print("\n".join(errors[:60])); raise SystemExit(f"{len(errors)} error(s)")
def w(path, obj):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    json.dump(obj, open(path, "w", encoding="utf-8"), indent=1, ensure_ascii=False)
w(f"{TAX}/goal-kits.json", {"version": "2.7.0", "note": "Kits are ordered paths of goals for outcomes people state in their own words (D-086). Edit goal_kits.txt, never this file.", "count": len(kits), "values": kits})
w(f"{TAX}/goal-safety.json", {"version": "2.7.0", "note": "Safety notes shown on goals that match a tag (D-087). Keyword-derived; a reviewer may add or remove tags per goal later.", "rules": rules, "goal_tags": tags_of})
w(f"{TAX}/goal-links.json", {"version": "2.7.0", "note": "Derived by build_discovery.py: related goals (shared tools, same need, same kit), next steps inside kits, kit membership and safety tags.", "values": links})
# ---- identity -> kit hints (for people who do not search; R10) ----
res = json.load(open(f"{CAT}/generated/resolved-needs.json"))
kit_needs = [(k["slug"], collections.Counter(gby[x]["need"] for x in k["goal_slugs"])) for k in kits]
generic = [l.strip() for l in open(os.path.join(SRC, "kit_generic.txt"), encoding="utf-8") if l.strip() and not l.startswith("#")]
for gk in generic:
    if gk not in {k["slug"] for k in kits}: errors.append(f"kit_generic.txt: unknown kit {gk}")
import zlib
hints = {}
for ident, d in res.items():
    own = set(d.get("core", [])) | set(d.get("sector", []))
    scored = []
    for slug, cn in kit_needs:
        if slug in generic: continue
        ov = sum(c for n, c in cn.items() if n in own)   # only the identity's own needs count; universal needs do not
        if ov: scored.append((ov, slug))
    top = [k for _, k in sorted(scored, key=lambda x: (-x[0], x[1]))[:2]]
    pool = [g for g in generic if g not in top]
    start = zlib.crc32(ident.encode()) % len(pool)           # deterministic rotation
    top += [pool[(start + i) % len(pool)] for i in range(3 - len(top))]
    hints[ident] = top
w(f"{TAX}/identity-kit-hints.json", {"version": "2.7.0", "note": "Up to two kits that match the identity's own (core and sector) needs, then general kits from a rotation (kit_generic.txt) so no kit dominates. Used for the Suggested for you row.", "values": hints})
# ---- entry paths ----
intent_goals = {i: sum(1 for g in goals if i in g["intents"]) for i in ("compete", "grow", "scale")}
paths = [
  {"id": "goal_first", "label": "I want to…", "how": "Type an outcome in your own words. Matches kits first, then goals, then tools.", "targets": "kits, goals"},
  {"id": "who_you_are", "label": "Who are you?", "how": "Pick what you do (2,603 identities). We show the needs and goals people like you have.", "targets": "needs, goals"},
  {"id": "skills", "label": "Skills", "how": "Pick a skill to build. We show goals that use it and the roadmap.", "targets": "skills, goals"},
  {"id": "situations", "label": "Common situations", "how": "Tap a card such as 'Get a remote job' or 'Teach kids programming'.", "targets": "kits"},
  {"id": "intent", "label": "Compete, grow or scale", "how": "Choose why you are using technology; goals are grouped by intent.", "targets": "goals"},
  {"id": "browse_need", "label": "Browse by need", "how": "Walk the 279 needs; each lists its goals.", "targets": "needs, goals"},
  {"id": "suggested", "label": "Suggested for you", "how": "Rule-based suggestions for people who do not search: see doc 26.", "targets": "kits, goals"},
]
def reach(slug):
    g = gby[slug]; r = ["browse_need", "goal_first"]
    if g["intents"]: r.append("intent")
    if kit_of[slug]: r.append("situations")
    return r
reach_counts = collections.Counter(len(reach(s)) for s in gby)
w(f"{TAX}/entry-paths.json", {"version": "2.7.0", "paths": paths, "goals_per_intent": intent_goals})
by_tag = collections.Counter(t for ts in tags_of.values() for t in ts)
rep = {"identities_with_kit_hints": sum(1 for v in hints.values() if v), "identities": len(hints), "kits": len(kits), "goals_in_a_kit": sum(1 for s in gby if kit_of[s]), "goals": len(goals),
       "goals_with_safety_tag": sum(1 for s in gby if tags_of[s]), "goals_by_safety_tag": dict(by_tag),
       "goals_with_related": sum(1 for v in links.values() if v["related_goals"]), "min_related": min(len(v["related_goals"]) for v in links.values())}
w(f"{CAT}/generated/discovery-coverage.json", rep)
print(f"kits {rep['kits']}; goals in a kit {rep['goals_in_a_kit']}/{len(goals)}; goals with safety tag {rep['goals_with_safety_tag']}; tags {dict(by_tag)}; min related {rep['min_related']}")
