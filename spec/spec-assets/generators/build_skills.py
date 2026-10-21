"""Build the Skills taxonomy (alternative entry point) from src/skills.txt.
Usage: python3 -I gen/build_skills.py src <pack_dir>"""
import json, os, sys, glob, collections, shutil

src, B = sys.argv[1], sys.argv[2]
T = os.path.join(B, "spec-assets/taxonomy")
needs = {n["slug"]: n for n in json.load(open(os.path.join(T, "needs.json")))["values"]}
ids = json.load(open(os.path.join(T, "identities/identities.json")))["values"]
fams = {f["slug"]: f for f in json.load(open(os.path.join(T, "identities/families.json")))["values"]}
secs = {s["slug"]: s for s in json.load(open(os.path.join(T, "identities/sectors.json")))["values"]}
rms = [json.load(open(p)) for p in glob.glob(os.path.join(B, "08_Starter_Catalogue/records/roadmaps/*.json"))]
tool2rm = {}
for r in rms:
    for t in r["tool_ids"]:
        tool2rm.setdefault(t, r["slug"])

# which needs are core to how many identities (own + family + sector needs)
need_people = collections.Counter()
for i in ids:
    s = set(i.get("needs", [])) | set(fams.get(i.get("family"), {}).get("needs", [])) | set(secs.get(i.get("sector"), {}).get("needs", []))
    for n in s:
        need_people[n] += 1

kw = {}
for l in open(os.path.join(src, "skill_keywords.txt"), encoding="utf-8"):
    if l.strip() and not l.startswith("#"):
        a, b = [x.strip() for x in l.split("|", 1)]
        kw[a] = [x.strip() for x in b.split(",") if x.strip()]
groups, skills, group = [], [], None
for line in open(os.path.join(src, "skills.txt"), encoding="utf-8"):
    line = line.strip()
    if not line or line.startswith("#"):
        continue
    if line.startswith("=group"):
        slug, label = [x.strip() for x in line[6:].split("|")]
        group = slug
        groups.append({"slug": slug, "label": label, "order": len(groups) + 1})
        continue
    p = [x.strip() for x in line.split("|")]
    assert len(p) == 7, line
    slug, label, nl, desc, b, i_, e = p
    nl = [x.strip() for x in nl.split(",") if x.strip()]
    bad = [x for x in nl if x not in needs]
    assert not bad, (slug, bad)
    tc = collections.Counter()
    for n in nl:
        for k, t in enumerate(needs[n]["tool_ids"]):
            tc[t] += 10 - min(k, 9)
    tools = [t for t, _ in tc.most_common()]
    skills.append({
        "id": "skill_" + slug.replace("-", "_"), "slug": slug, "label": label, "group": group, "description": desc,
        "keywords": kw.get(slug, []), "levels": {"beginner": b, "intermediate": i_, "expert": e},
        "need_ids": [needs[n]["id"] for n in nl],
        "tool_ids": tools,
        "roadmaps": list(dict.fromkeys(tool2rm[t] for t in tools if t in tool2rm)),
        "identity_count": len(ids) if any(needs[n].get("universal") for n in nl) else len({x["slug"] for x in ids if (set(x.get("needs", [])) | set(fams.get(x.get("family"), {}).get("needs", [])) | set(secs.get(x.get("sector"), {}).get("needs", []))) & set(nl)}),
        "expert_validation": {"status": "pending", "note": "AI-drafted grouping; validate level descriptors with practitioners."},
    })

assert len({s["slug"] for s in skills}) == len(skills)
mapped = {n for s in skills for n in (x.replace("need_", "").replace("_", "-") for x in s["need_ids"])}
unmapped = sorted(set(needs) - mapped)
out = {"version": "2.2", "groups": groups, "count": len(skills), "values": skills}
json.dump(out, open(os.path.join(T, "skills.json"), "w"), indent=1, ensure_ascii=False)
for f in ("skills.txt", "skill_keywords.txt"):
    dst = os.path.join(T, "source", f)
    if not (os.path.exists(dst) and os.path.samefile(os.path.join(src, f), dst)):
        shutil.copy(os.path.join(src, f), dst)
assert not set(kw) - {s["slug"] for s in skills}, set(kw) - {s["slug"] for s in skills}
print(f"skills {len(skills)} in {len(groups)} groups; needs mapped {len(needs)-len(unmapped)}/{len(needs)}; unmapped: {unmapped}")
print("tools reachable via skills:", len({t for s in skills for t in s["tool_ids"]}))
