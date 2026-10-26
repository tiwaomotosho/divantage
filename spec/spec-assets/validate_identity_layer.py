#!/usr/bin/env python3
"""Validates the V2.2 identity layer: identities, needs, skills, tool registry, roadmaps (coverage gate) and lenses.
Usage: python3 -I validate_identity_layer.py <spec-assets dir> <08_Starter_Catalogue dir>"""
import json, os, sys, collections
from jsonschema import Draft202012Validator, FormatChecker
def load(p): return json.load(open(p, encoding="utf-8"))
A, C = sys.argv[1], sys.argv[2]
S = lambda n: Draft202012Validator(load(os.path.join(A,"schemas",n)), format_checker=FormatChecker())
E, W = [], []
ids = load(os.path.join(A,"taxonomy/identities/identities.json"))["values"]
secs = {s["slug"]:s for s in load(os.path.join(A,"taxonomy/identities/sectors.json"))["values"]}
fams = {f["slug"]:f for f in load(os.path.join(A,"taxonomy/identities/families.json"))["values"]}
isco = {v["code"] for v in load(os.path.join(A,"taxonomy/identities/isco08-submajor.json"))["values"]}
units = {u["code"] for u in load(os.path.join(A,"taxonomy/identities/isco08-unit-groups.json"))["values"]}
needs = {n["slug"]:n for n in load(os.path.join(A,"taxonomy/needs.json"))["values"]}
tfam = {v["slug"] for v in load(os.path.join(A,"taxonomy/task-families.json"))["values"]}
cats = {v["slug"] for v in load(os.path.join(A,"taxonomy/categories.json"))["values"]}
reg = {r["id"]:r for r in load(os.path.join(C,"registry/tools-registry.json"))["values"]}
v = S("identity.schema.json"); seen=set(); idslugs={i["slug"] for i in ids}
for i in ids:
    for e in v.iter_errors(i): E.append(f"identity {i.get('slug')}: {e.message[:120]}")
    if i["slug"] in seen: E.append(f"duplicate identity slug {i['slug']}")
    seen.add(i["slug"])
    if i["sector"] not in secs: E.append(f"identity {i['slug']}: unknown sector")
    if i["family"] not in fams or fams[i["family"]]["sector"]!=i["sector"]: E.append(f"identity {i['slug']}: family/sector mismatch")
    if i["parent"] and i["parent"] not in idslugs: E.append(f"identity {i['slug']}: unknown parent")
    if i["isco08_submajor"] and i["isco08_submajor"] not in isco: E.append(f"identity {i['slug']}: bad ISCO code")
    for n in i["needs"]:
        if n not in needs: E.append(f"identity {i['slug']}: unknown need {n}")
    for u in i.get("isco08_units",[]):
        if u not in units: E.append(f"identity {i['slug']}: unknown ISCO unit {u}")
for s in secs.values():
    for n in s["needs"]:
        if n not in needs: E.append(f"sector {s['slug']}: unknown need {n}")
for f in fams.values():
    for n in f["needs"]:
        if n not in needs: E.append(f"family {f['slug']}: unknown need {n}")
v = S("need.schema.json")
for n in needs.values():
    for e in v.iter_errors(n): E.append(f"need {n['slug']}: {e.message[:120]}")
    if n["task_family"] not in tfam: E.append(f"need {n['slug']}: unknown task family")
    for t in n["tool_ids"]:
        if t not in reg: E.append(f"need {n['slug']}: unknown tool {t}")
v = S("registry-entry.schema.json"); BLOCK=("youtube.com","youtu.be","vimeo.com","tiktok.com","dailymotion.com")
for r in reg.values():
    for e in v.iter_errors(r): E.append(f"registry {r['slug']}: {e.message[:120]}")
    if r["category_id"] not in cats: E.append(f"registry {r['slug']}: unknown category")
    if r["official_url"] is None: W.append(f"registry {r['slug']}: official URL to confirm")
used_tools = {t for n in needs.values() for t in n["tool_ids"]}
_gp = os.path.join(A,"taxonomy/goals.json")   # V2.6: goals also reference tools
if os.path.exists(_gp): used_tools |= {t for g in load(_gp)["values"] for t in g["tool_ids"]}
for r in reg.values():
    if r["id"] not in used_tools: W.append(f"registry {r['slug']}: not referenced by any need")
# profiled tools must have a full record
prof = {r["slug"] for r in reg.values() if r["profile_status"]=="profiled"}
recs = {os.path.splitext(f)[0] for f in os.listdir(os.path.join(C,"records/tools"))}
for p in prof - recs: E.append(f"registry {p}: profiled but no records/tools/{p}.json")
for p in recs - prof: E.append(f"tool record {p}: exists but registry says stub")
# roadmaps
v = S("roadmap.schema.json"); mods={}
for f in sorted(os.listdir(os.path.join(C,"records/roadmaps"))):
    r = load(os.path.join(C,"records/roadmaps",f))
    for e in v.iter_errors(r): E.append(f"roadmap {f}: {e.message[:120]}")
    for t in r["tool_ids"]:
        if t not in reg: E.append(f"roadmap {f}: unknown tool {t}")
    for lv in r["levels"].values():
        for m in lv:
            if m["slug"] in mods: E.append(f"roadmap {f}: duplicate module {m['slug']}")
            mods[m["slug"]] = r["slug"]
            for n in m["need_tags"]:
                if n not in needs: E.append(f"roadmap {f}: module {m['slug']} unknown need {n}")
# lenses
v = S("lens.schema.json")
for f in sorted(os.listdir(os.path.join(C,"records/lenses"))):
    l = load(os.path.join(C,"records/lenses",f))
    for e in v.iter_errors(l): E.append(f"lens {f}: {e.message[:120]}")
    if l["need"] not in needs: E.append(f"lens {f}: unknown need")
    for i in l["for_identities"]:
        if i not in idslugs: E.append(f"lens {f}: unknown identity {i}")
    for m in l["priority_modules"]:
        if mods.get(m)!=l["roadmap"]: E.append(f"lens {f}: module {m} not in roadmap {l['roadmap']}")
    for t in l["pairs_with"]:
        if t not in reg: E.append(f"lens {f}: unknown pair tool {t}")
    rmtools = set(load(os.path.join(C,"records/roadmaps",l["roadmap"]+".json"))["tool_ids"])
    if not rmtools & set(needs[l["need"]]["tool_ids"]): W.append(f"lens {f}: need does not list any of the roadmap's tools (lens reachable only from tool page)")
# skills (V2.2 alternative entry point)
sk = load(os.path.join(A,"taxonomy/skills.json")); v = S("skill.schema.json"); groups={g["slug"] for g in sk["groups"]}; skneeds=set()
for s in sk["values"]:
    for e in v.iter_errors(s): E.append(f"skill {s.get('slug')}: {e.message[:120]}")
    if s["group"] not in groups: E.append(f"skill {s['slug']}: unknown group")
    for n in s["need_ids"]:
        sl=n[5:].replace("_","-")
        if sl not in needs: E.append(f"skill {s['slug']}: unknown need {n}")
        skneeds.add(sl)
    for t in s["tool_ids"]:
        if t not in reg: E.append(f"skill {s['slug']}: unknown tool {t}")
for n in sorted(set(needs)-skneeds): E.append(f"need {n} is not reachable from any skill")
# roadmap coverage gate (V2.2 minimum standard: >=90% of registry tools have a roadmap)
rmtools = {t for f in os.listdir(os.path.join(C,"records/roadmaps")) for t in load(os.path.join(C,"records/roadmaps",f))["tool_ids"]}
cov = len(rmtools & set(reg))/len(reg)
if cov < 0.90: E.append(f"roadmap coverage {cov:.1%} is below the 90% minimum standard")
print(f"Skills {len(sk['values'])} in {len(groups)} groups; needs reachable via skills {len(skneeds & set(needs))}/{len(needs)}; roadmap coverage {len(rmtools & set(reg))}/{len(reg)} = {cov:.1%}")
covered = {u for i in ids for u in i.get("isco08_units",[])}
for u in sorted(units-covered): E.append(f"ISCO unit group {u} has no identity")
print(f"ISCO unit groups covered {len(covered & units)}/{len(units)}")
print(f"Identities {len(ids)}  Needs {len(needs)}  Registry {len(reg)}  Modules {len(mods)}  Errors {len(E)}  Warnings {len(W)}")
for x in E: print("ERROR  ", x)
for x in W[:60]: print("warning", x)
if len(W)>60: print(f"... {len(W)-60} more warnings")
sys.exit(1 if E else 0)
