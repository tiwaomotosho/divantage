import json, os, sys, collections
SRC, PACK = sys.argv[1], sys.argv[2]
TAX = os.path.join(PACK,"spec-assets/taxonomy"); CAT = os.path.join(PACK,"08_Starter_Catalogue")
needs = {n["slug"]:n for n in json.load(open(os.path.join(TAX,"needs.json")))["values"]}
idents = {i["slug"]:i for i in json.load(open(os.path.join(TAX,"identities/identities.json")))["values"]}
reg = {r["slug"]:r for r in json.load(open(os.path.join(CAT,"registry/tools-registry.json")))["values"]}
resolved = json.load(open(os.path.join(PACK,"08_Starter_Catalogue/generated/resolved-needs.json")))
EV = {"status":"pending","note":"AI-drafted outline; to be validated by a practitioner and an educator in this field."}
# roadmaps
roadmaps = {}; cur=None; level=None; errs=[]; mods_all={}
for ln,l in enumerate(open(os.path.join(SRC,"roadmaps.txt"),encoding="utf-8"),1):
    l=l.rstrip("\n")
    if l.startswith("=roadmap "):
        slug,title,applies = [x.strip() for x in l[9:].split("|")]
        cur = {"schema_version":"2.1","id":"rm_"+slug.replace("-","_"),"slug":slug,"title":title,
               "tool_ids":["tool_"+t.strip().replace("-","_") for t in applies.split(",")],
               "levels":{"beginner":[],"intermediate":[],"expert":[]},"expert_validation":EV,"is_illustrative":False}
        for t in applies.split(","):
            if t.strip() not in reg: errs.append((ln,"unknown tool",t))
        roadmaps[slug]=cur; continue
    if l.startswith("[") and l.endswith("]"): level=l[1:-1]; continue
    if l.startswith("* "):
        p=[x.strip() for x in l[2:].split("|")]
        if len(p)!=7: errs.append((ln,"bad module",l)); continue
        mslug,title,outcome,topics,practice,tags,hours=p
        tags=[t.strip() for t in tags.split(",") if t.strip()]
        for t in tags:
            if t not in needs: errs.append((ln,"unknown need tag",t))
        if mslug in mods_all: errs.append((ln,"dup module",mslug))
        m={"id":"mod_"+mslug.replace("-","_"),"slug":mslug,"title":title,"outcome":"You can: "+outcome[0].lower()+outcome[1:],
           "topics":[t.strip() for t in topics.split(";")],"practice":practice,"need_tags":tags,
           "estimated_hours":{"value":float(hours),"is_estimate":True},"level":level}
        mods_all[mslug]=(cur["slug"],m); cur["levels"][level].append(m)
# lenses
lenses=[]; cur=None
def flush():
    if cur: lenses.append(cur)
for ln,l in enumerate(open(os.path.join(SRC,"lenses.txt"),encoding="utf-8"),1):
    l=l.rstrip("\n")
    if l.startswith("#") or not l.strip(): continue
    if l.startswith("=lens "):
        flush()
        head,title=[x.strip() for x in l[6:].split("|")]
        rm,need=[x.strip() for x in head.split(" x ")]
        if rm not in roadmaps: errs.append((ln,"unknown roadmap",rm))
        if need not in needs: errs.append((ln,"unknown need",need))
        cur={"schema_version":"2.1","id":f"lens_{rm.replace('-','_')}__{need.replace('-','_')}","roadmap_id":"rm_"+rm.replace("-","_"),"roadmap":rm,
             "need_id":"need_"+need.replace("-","_"),"need":need,"title":title,"kind":"flagship","for_identities":[],"why":"","what_is_different":"",
             "priority_modules":[],"extra_modules":[],"starter_project":"","pitfalls":[],"pairs_with":[],"expert_validation":EV,"is_illustrative":False}
        continue
    k,_,v=l.partition(":")
    k=k.strip(); v=v.strip()
    if l.startswith("+"):
        lvl,title,outcome,topics,practice=[x.strip() for x in l[1:].split("|")]
        cur["extra_modules"].append({"level":lvl,"title":title,"outcome":"You can: "+outcome[0].lower()+outcome[1:],"topics":[t.strip() for t in topics.split(";")],"practice":practice})
    elif k=="for":
        cur["for_identities"]=[x.strip() for x in v.split(",")]
        for x in cur["for_identities"]:
            if x not in idents: errs.append((ln,"unknown identity",x))
    elif k=="why": cur["why"]=v
    elif k=="different": cur["what_is_different"]=v
    elif k=="priority":
        cur["priority_modules"]=[x.strip() for x in v.split(",")]
        for x in cur["priority_modules"]:
            if x not in mods_all or mods_all[x][0]!=cur["roadmap"]: errs.append((ln,"module not in roadmap",x,cur["roadmap"]))
    elif k=="project": cur["starter_project"]=v
    elif k=="pitfalls": cur["pitfalls"]=[x.strip() for x in v.split(";")]
    elif k=="pairs":
        cur["pairs_with"]=["tool_"+x.strip().replace("-","_") for x in v.split(",")]
        for x in v.split(","):
            if x.strip() not in reg: errs.append((ln,"unknown pair tool",x))
    else: errs.append((ln,"unknown key",k))
flush()
assert not errs, errs[:30]
# lens composition (same algorithm the site uses; see 03 §7)
def compose(rm, need, priority=None, extra=None):
    order=[]
    for x in (priority or []):
        if x not in order: order.append(x)
    levels={"beginner":[],"intermediate":[],"expert":[]}
    allm=[m for lv in ("beginner","intermediate","expert") for m in roadmaps[rm]["levels"][lv]]
    tagged=[m["slug"] for m in allm if need in m["need_tags"]]
    for s in tagged:
        if s not in order: order.append(s)
    core=set(order)
    for m in allm:
        levels[m["level"]].append({"module":m["slug"],"relevance":"core" if m["slug"] in core else "also_useful","rank":order.index(m["slug"]) if m["slug"] in core else 99})
    for lv in levels: levels[lv].sort(key=lambda x:(x["rank"],))
    for e in (extra or []):
        levels[e["level"]].insert(0,{"extra":e["title"],"relevance":"core","rank":-1})
    return levels, len(core)
os.makedirs(os.path.join(CAT,"records/roadmaps"),exist_ok=True); os.makedirs(os.path.join(CAT,"records/lenses"),exist_ok=True)
for r in roadmaps.values():
    json.dump(r,open(os.path.join(CAT,"records/roadmaps",r["slug"]+".json"),"w"),indent=1,ensure_ascii=False)
flag={(l["roadmap"],l["need"]):l for l in lenses}
for l in lenses:
    l["composed_path"],_=compose(l["roadmap"],l["need"],l["priority_modules"],l["extra_modules"])
    json.dump(l,open(os.path.join(CAT,"records/lenses",f"{l['roadmap']}--{l['need']}.json"),"w"),indent=1,ensure_ascii=False)
# auto lens index
tool_to_rm={}
for r in roadmaps.values():
    for t in r["tool_ids"]: tool_to_rm.setdefault(t,r["slug"])
index=[]
for n in needs.values():
    seen=set()
    for t in n["tool_ids"]:
        rm=tool_to_rm.get(t)
        if not rm or (rm,n["slug"]) in seen: continue
        seen.add((rm,n["slug"]))
        _,ncore=compose(rm,n["slug"],flag.get((rm,n["slug"]),{}).get("priority_modules"))
        index.append({"roadmap":rm,"need":n["slug"],"kind":"flagship" if (rm,n["slug"]) in flag else "auto","core_modules":ncore})
os.makedirs(os.path.join(CAT,"generated"),exist_ok=True)
json.dump({"note":"Every tool-roadmap × need combination the site can render. Flagship = hand-written lens; auto = composed from module need-tags (03 §7). Auto lenses with core_modules = 0 fall back to the plain roadmap with the need's description.","count":len(index),"values":index},open(os.path.join(CAT,"generated/lens-index.json"),"w"),indent=1)
# who uses each tool (derived)
need_ids=collections.defaultdict(set)
for slug,res in resolved.items():
    for n in res["core"]+res["sector"]: need_ids[n].add(slug)
who={}
for t in reg.values():
    ns=[n["slug"] for n in needs.values() if t["id"] in n["tool_ids"]]
    ids=set()
    universal=any(needs[n]["universal"] for n in ns)
    for n in ns: ids|=need_ids[n]
    secs=collections.Counter(idents[i]["sector"] for i in ids)
    who[t["slug"]]={"needs":ns,"identity_count":len(ids),"universal":universal,"sectors":dict(secs.most_common())}
json.dump(who,open(os.path.join(CAT,"generated/who-uses-each-tool.json"),"w"),indent=1,sort_keys=True)
nm=sum(len(v) for r in roadmaps.values() for v in r["levels"].values())
print(f"roadmaps {len(roadmaps)} modules {nm} flagship lenses {len(lenses)} renderable lenses {len(index)} (auto with core>0: {sum(1 for x in index if x['kind']=='auto' and x['core_modules']>0)})")
for t in ("canva","microsoft-excel","claude","google-translate","power-bi","python","landmark-decisionspace"):
    w=who[t]; print(t, "needs",len(w["needs"]),"identities",w["identity_count"],"sectors",len(w["sectors"]),"universal" if w["universal"] else "")
