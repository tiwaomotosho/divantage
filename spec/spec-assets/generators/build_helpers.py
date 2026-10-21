#!/usr/bin/env python3
"""Build helpers.json and pilot-profiles.json from taxonomy/source/helpers.txt and pilot_profiles.txt.
Usage: python3 -I build_helpers.py <source-dir> <pack-root>.  Fails on any unknown tool, need or identity slug."""
import json, os, sys

src, root = sys.argv[1], sys.argv[2]
T = os.path.join(root, "spec-assets/taxonomy")
def lines(name): return [l.rstrip("\n") for l in open(os.path.join(src, name), encoding="utf-8")]
def bar(s): return [x.strip() for x in s.split("|")]
def semi(s): return [x.strip() for x in s.split(";") if x.strip()]

reg = {l.split("|")[0].strip() for l in lines("registry.txt") if "|" in l and not l.startswith("#")}
needs = {l.split("|")[0].strip() for l in lines("needs.txt") if "|" in l and not l.startswith("#")}
ids = {i["slug"] for i in json.load(open(os.path.join(T, "identities/identities.json")))["values"]}
errors = []

helpers, cur, stage = [], None, None
for l in lines("helpers.txt"):
    if not l.strip() or l.startswith("#"): continue
    if l.startswith("=helper "):
        p = bar(l[len("=helper "):])
        cur = {"slug": p[0], "title": p[1], "identities": [x.strip() for x in p[2].split(",")], "promise": p[3], "intro": "", "stages": []}
        for s in cur["identities"]:
            if s not in ids: errors.append(f"helper {p[0]}: unknown identity {s}")
        helpers.append(cur); stage = None
    elif l.startswith("intro:"): cur["intro"] = l[6:].strip()
    elif l.startswith("@stage "):
        p = bar(l[len("@stage "):])
        stage = {"n": len(cur["stages"]) + 1, "title": p[0], "goal": p[1], "time": p[2], "steps": [], "done": []}
        cur["stages"].append(stage)
    elif l.startswith("- "):
        p = bar(l[2:])
        if p[0] not in reg: errors.append(f"{cur['slug']}: unknown tool {p[0]}")
        if p[1] != "-" and p[1] not in needs: errors.append(f"{cur['slug']}: unknown need {p[1]}")
        stage["steps"].append({"tool": p[0], "need": None if p[1] == "-" else p[1], "what": p[2], "first_win": p[3] if len(p) > 3 else ""})
    elif l.startswith("done:"): stage["done"] = [x.strip() for x in l[5:].split("|")]
    else: errors.append(f"unrecognised line: {l[:60]}")

profiles, cur = [], None
for l in lines("pilot_profiles.txt"):
    if not l.strip() or l.startswith("#"): continue
    if l.startswith("="):
        p = bar(l[1:]); cur = {"tool": p[0], "summary": p[1], "review_status": "pending"}; profiles.append(cur)
        if p[0] not in reg: errors.append(f"profile: unknown tool {p[0]}")
    else:
        k, v = l.split(":", 1)
        cur[{"cost": "cost", "on": "platforms", "best": "best_for", "start": "first_hour", "watch": "watch_out", "next": "learn_next"}[k]] = (
            v.strip() if k == "cost" else ([x.strip() for x in v.split(",")] if k == "on" else semi(v)))

# every helper tool should be able to show something; report which have a full profile
have = {p["tool"] for p in profiles}
for j in helpers:
    j["stage_count"] = len(j["stages"]); j["tool_count"] = len({s["tool"] for st in j["stages"] for s in st["steps"]})
    j["profiled_tools"] = sorted({s["tool"] for st in j["stages"] for s in st["steps"]} & have)

from jsonschema import Draft202012Validator
schema = json.load(open(os.path.join(root, "spec-assets/schemas/helper.schema.json")))
V = Draft202012Validator(schema)
for h in helpers:
    for e in V.iter_errors(h): errors.append(f"helper {h['slug']}: {'/'.join(map(str, e.path))}: {e.message}")
    titles = [s["title"] for s in h["stages"]]
    if len(titles) != len(set(titles)): errors.append(f"helper {h['slug']}: duplicate stage title")
if errors:
    print("\n".join(errors)); sys.exit(1)
json.dump({"version": "2.4", "values": helpers}, open(os.path.join(T, "helpers.json"), "w"), indent=1, ensure_ascii=False, sort_keys=True)
json.dump({"version": "2.4", "values": profiles}, open(os.path.join(T, "pilot-profiles.json"), "w"), indent=1, ensure_ascii=False, sort_keys=True)
print(f"helpers: {len(helpers)} | stages: {sum(len(j['stages']) for j in helpers)} | pilot profiles: {len(profiles)}")
for j in helpers: print(f"  {j['slug']}: {j['stage_count']} stages, {j['tool_count']} tools, {len(j['profiled_tools'])} with full profile")
