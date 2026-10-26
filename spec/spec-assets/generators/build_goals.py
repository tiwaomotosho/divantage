#!/usr/bin/env python3
"""Build goals.json, alternatives.json and tool-markets.json (V2.6).

Usage (from the pack root):  python3 -I spec-assets/generators/build_goals.py spec-assets/taxonomy/source .
Run AFTER build_identity.py (needs, registry) and BEFORE build_learning.py / build_roadmaps.py.

Sources (the only files an admin edits by hand):
  goals.txt         slug | label | parent need | markets | search words ; ... | tool slugs, best first
  tool_markets.txt  slug | ng | africa | ng,africa      (everything else is global)
  needs_intents.txt need | compete, grow, scale (1-2 per need; goals inherit)
  tool_availability.txt slug | markets | since | note   (where a tool is NOT available)

Rules enforced here (any failure stops the build):
  * goal slug unique; parent need exists; every tool slug is in the registry; 3-8 tools, no repeats
  * every need has at least 2 goals (D-071)
  * markets values are known

Alternatives are DERIVED, never hand-typed (D-072): two tools are alternatives when a goal lists both, because a goal's
tools are interchangeable ways to do the same job. Ranking is deterministic:
  score(a -> b) = sum over goals containing both of (10 + closeness bonus 0..4 for list position)
                  + 12 if the two tools are the SAME KIND (same registry category OR same roadmap archetype)
                  + 3 if same registry category + 2 if same roadmap archetype
Ties break on slug. The top 7 are kept, so same-kind tools are shown first; `total_candidates` records how many were available
and `same_kind_candidates` how many of them are the same kind (V2.7, D-085). The product target is that at least 95% of tools have
7 same-kind alternatives (validate_goals.py fails below that).
A tool with fewer than 7 is reported in alternatives-coverage.json and in the research queue (never padded).
"""
import json, os, sys, collections, re

SRC, PACK = sys.argv[1], sys.argv[2]
TAX = os.path.join(PACK, "spec-assets/taxonomy")
CAT = os.path.join(PACK, "08_Starter_Catalogue")
MAX_ALT = 7
MARKETS = {"all", "ng", "africa", "ng,africa"}
SLUG = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")

def rows(name, n):
    out = []
    for ln, l in enumerate(open(os.path.join(SRC, name), encoding="utf-8"), 1):
        l = l.rstrip("\n")
        if not l.strip() or l.startswith("#"):
            continue
        p = [x.strip() for x in l.split("|")]
        if len(p) != n:
            raise SystemExit(f"{name}:{ln}: expected {n} fields, got {len(p)}")
        out.append((ln, p))
    return out

reg = {r["slug"]: r for r in json.load(open(os.path.join(CAT, "registry/tools-registry.json")))["values"]}
needs = {n["slug"]: n for n in json.load(open(os.path.join(TAX, "needs.json")))["values"]}

# archetype of each tool (for the tie-break bonus)
arch_of, cur = {}, None
for l in open(os.path.join(SRC, "archetypes.txt"), encoding="utf-8"):
    if l.startswith("=archetype "):
        cur = l[11:].split("|")[0].strip()
    elif l.startswith("tools:"):
        for t in l[6:].split(","):
            if t.strip():
                arch_of[t.strip()] = cur

errors, goals, seen = [], [], set()
EV = {"status": "pending", "note": "AI-drafted tool list; confirm each tool is a genuine alternative for this job and still available."}
for ln, p in rows("goals.txt", 6):
    slug, label, need, markets, terms, tools = p
    if not SLUG.match(slug) or len(slug) > 80: errors.append(f"goals.txt:{ln}: bad slug {slug}")
    if slug in seen: errors.append(f"goals.txt:{ln}: duplicate goal {slug}")
    seen.add(slug)
    if need not in needs: errors.append(f"goals.txt:{ln}: unknown need {need}")
    if markets not in MARKETS: errors.append(f"goals.txt:{ln}: markets must be one of {sorted(MARKETS)}")
    ts = [t.strip() for t in tools.split(",") if t.strip()]
    if len(ts) != len(set(ts)): errors.append(f"goals.txt:{ln}: repeated tool in {slug}")
    if not 3 <= len(ts) <= 8: errors.append(f"goals.txt:{ln}: {slug} has {len(ts)} tools (need 3-8)")
    for t in ts:
        if t not in reg: errors.append(f"goals.txt:{ln}: unknown tool {t}")
    if not 8 <= len(label) <= 90: errors.append(f"goals.txt:{ln}: label length for {slug}")
    goals.append({"id": "goal_" + slug.replace("-", "_"), "slug": slug, "label": label, "need": need, "markets": markets.split(","),
                  "search_terms": [x.strip() for x in terms.split(";") if x.strip()],
                  "tool_ids": ["tool_" + t.replace("-", "_") for t in ts], "expert_validation": EV})
per_need = collections.Counter(g["need"] for g in goals)
for n in needs:
    if per_need[n] < 2: errors.append(f"need {n} has {per_need[n]} goals (minimum 2)")

# availability (D-074): tools that are not available in a market must not appear in goals for that market
avail = {}
for ln, p in rows("tool_availability.txt", 4):
    if p[0] not in reg: errors.append(f"tool_availability.txt:{ln}: unknown tool {p[0]}")
    ms = [m.strip() for m in p[1].split(",") if m.strip()]
    if not ms or any(m not in ("ng", "africa", "all") for m in ms): errors.append(f"tool_availability.txt:{ln}: markets must be ng, africa or all")
    if not re.fullmatch(r"\d{4}-\d{2}", p[2]): errors.append(f"tool_availability.txt:{ln}: since must be YYYY-MM")
    avail[p[0]] = {"not_available_in": ms, "since": p[2], "note": p[3]}
    if "all" in ms: errors.append(f"tool_availability.txt:{ln}: {p[0]} is unavailable everywhere; remove it from the registry instead")
for g in goals:
    for t in g["tool_ids"]:
        sl = t[5:].replace("_", "-")
        if sl in avail and any(m in avail[sl]["not_available_in"] for m in g["markets"]):
            errors.append(f"goal {g['slug']} (markets {g['markets']}) lists {sl}, which is not available in {avail[sl]['not_available_in']}")
# intents (D-075): every need is tagged compete / grow / scale; goals inherit from the parent need
INTENTS = ("compete", "grow", "scale")
intent_of = {}
for ln, p in rows("needs_intents.txt", 2):
    iv = [x.strip() for x in p[1].split(",") if x.strip()]
    if p[0] not in needs: errors.append(f"needs_intents.txt:{ln}: unknown need {p[0]}")
    if not 1 <= len(iv) <= 2 or any(x not in INTENTS for x in iv) or len(iv) != len(set(iv)): errors.append(f"needs_intents.txt:{ln}: intents must be 1-2 of {INTENTS}")
    if p[0] in intent_of: errors.append(f"needs_intents.txt:{ln}: duplicate need {p[0]}")
    intent_of[p[0]] = iv
for n in needs:
    if n not in intent_of: errors.append(f"need {n} has no intent in needs_intents.txt")
for g in goals: g["intents"] = intent_of.get(g["need"], [])
# tool markets
tm = {}
for ln, p in rows("tool_markets.txt", 2):
    if p[0] not in reg: errors.append(f"tool_markets.txt:{ln}: unknown tool {p[0]}")
    if p[1] not in ("ng", "africa", "ng,africa"): errors.append(f"tool_markets.txt:{ln}: bad market {p[1]}")
    tm[p[0]] = p[1].split(",")
if errors:
    print("\n".join(errors[:80])); raise SystemExit(f"{len(errors)} error(s)")

# ---- derived alternatives ----
score = collections.defaultdict(lambda: collections.defaultdict(float))
for g in goals:
    ts = [t[5:].replace("_", "-") for t in g["tool_ids"]]
    for i, a in enumerate(ts):
        for j, b in enumerate(ts):
            if a != b:
                score[a][b] += 10 + max(0, 4 - abs(i - j))
alts = {}
for slug in reg:
    cand, kind = {}, {}
    for b, s in score[slug].items():
        same_cat = reg[b]["category_id"] == reg[slug]["category_id"]
        same_arch = bool(arch_of.get(b)) and arch_of.get(b) == arch_of.get(slug)
        kind[b] = same_cat or same_arch
        s += 12 if kind[b] else 0
        s += 3 if same_cat else 0
        s += 2 if same_arch else 0
        cand[b] = s
    ranked = sorted(cand, key=lambda b: (-cand[b], b))
    sk = sum(1 for b in ranked if kind[b])
    alts[slug] = {"tool_id": reg[slug]["id"], "alternative_ids": [reg[b]["id"] for b in ranked[:MAX_ALT]],
                  "total_candidates": len(ranked), "same_kind_candidates": sk,
                  "same_kind_shown": sum(1 for b in ranked[:MAX_ALT] if kind[b]),
                  "status": "complete" if len(ranked) >= MAX_ALT else ("partial" if ranked else "none"),
                  "status_same_kind": "complete" if sk >= MAX_ALT else ("partial" if sk else "none")}

def w(path, obj):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    json.dump(obj, open(path, "w", encoding="utf-8"), indent=1, ensure_ascii=False)

w(os.path.join(TAX, "goals.json"), {"version": "2.6.0", "note": "Goals: finer outcome-phrased jobs for 'jump straight to a goal' (D-071). A goal's tools are interchangeable ways to do the same job.", "count": len(goals), "values": goals})
w(os.path.join(TAX, "alternatives.json"), {"version": "2.6.0", "note": "Derived from goals by build_goals.py (D-072). Never edit by hand; fix the goal lists instead.", "max_alternatives": MAX_ALT, "values": [alts[s] for s in sorted(alts)]})
intent_counts = {i: {"needs": sum(1 for n in intent_of if i in intent_of[n]), "goals": sum(1 for g in goals if i in g["intents"])} for i in INTENTS}
w(os.path.join(TAX, "intents.json"), {"version": "2.6.0", "note": "Why a person is using technology (D-075): compete = keep up with the standard in your field; grow = win more customers, income, audience or skill; scale = do more with less. Goals inherit from their parent need.",
  "values": [{"slug": "compete", "label": "Compete", "promise": "Match what others in your field already do.", "needs": [n for n in intent_of if "compete" in intent_of[n]]},
             {"slug": "grow", "label": "Grow", "promise": "Win more customers, income, audience or skill.", "needs": [n for n in intent_of if "grow" in intent_of[n]]},
             {"slug": "scale", "label": "Scale", "promise": "Do more without more effort: automate and systematise.", "needs": [n for n in intent_of if "scale" in intent_of[n]]}]})
w(os.path.join(TAX, "tool-availability.json"), {"version": "2.6.0", "note": "Tools that are not available in a market (D-074). Show a clear label on the tool page and never recommend them to visitors in that market.", "values": [dict(tool_id=reg[s]["id"], **v) for s, v in sorted(avail.items())]})
w(os.path.join(TAX, "tool-markets.json"), {"version": "2.6.0", "values": [{"tool_id": reg[s]["id"], "markets": m} for s, m in sorted(tm.items())]})

# ---- coverage report + research queue ----
st = collections.Counter(a["status"] for a in alts.values())
sk_st = collections.Counter(a["status_same_kind"] for a in alts.values())
by_cat = collections.defaultdict(lambda: collections.Counter())
for s, a in alts.items():
    by_cat[reg[s]["category_id"]][a["status"]] += 1
gaps = sorted((s for s, a in alts.items() if a["status_same_kind"] != "complete"), key=lambda s: (alts[s]["same_kind_candidates"], s))
in_goals = {t[5:].replace("_", "-") for g in goals for t in g["tool_ids"]}
report = {"tools": len(reg), "goals": len(goals), "needs": len(needs), "goals_per_need_min": min(per_need[n] for n in needs),
          "goals_per_need_avg": round(len(goals) / len(needs), 2), "tools_referenced_by_a_goal": len(in_goals & set(reg)),
          "alternatives": dict(st), "complete_pct": round(100 * st["complete"] / len(reg), 1),
          "alternatives_same_kind": dict(sk_st), "same_kind_complete_pct": round(100 * sk_st["complete"] / len(reg), 1),
          "intents": intent_counts, "local_tools": {"ng": sum(1 for v in tm.values() if "ng" in v), "africa": sum(1 for v in tm.values() if "africa" in v)},
          "by_category": {c: dict(v) for c, v in sorted(by_cat.items())},
          "tools_needing_more_alternatives": [{"tool": s, "have_listed": len(alts[s]["alternative_ids"]), "have_same_kind": alts[s]["same_kind_candidates"]} for s in gaps]}
w(os.path.join(CAT, "generated/alternatives-coverage.json"), report)
print(f"goals {len(goals)} (min {report['goals_per_need_min']} / avg {report['goals_per_need_avg']} per need); tools {len(reg)}; "
      f"with 7 alternatives {st['complete']} ({report['complete_pct']}%), partial {st['partial']}, none {st['none']}; "
      f"with 7 SAME-KIND alternatives {sk_st['complete']} ({report['same_kind_complete_pct']}%); "
      f"local tools ng {report['local_tools']['ng']} africa {report['local_tools']['africa']}")
