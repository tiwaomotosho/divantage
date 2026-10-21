import json, os, sys, glob, re, collections
SRC, PACK = sys.argv[1], sys.argv[2]
TAX=os.path.join(PACK,"spec-assets/taxonomy"); CAT=os.path.join(PACK,"08_Starter_Catalogue"); RD=os.path.join(CAT,"records/roadmaps")
needs={n["slug"]:n for n in json.load(open(os.path.join(TAX,"needs.json")))["values"]}
reg={r["slug"]:r for r in json.load(open(os.path.join(CAT,"registry/tools-registry.json")))["values"]}
tool_needs=collections.defaultdict(list)
for n in needs.values():
    for t in n["tool_ids"]: tool_needs[t[5:].replace("_","-")].append(n["slug"])
# handwritten coverage
for p in glob.glob(os.path.join(RD,"*.json")):
    r=json.load(open(p))
    if r.get("authoring","handwritten")!="handwritten": os.remove(p)
hand={t[5:].replace("_","-") for p in glob.glob(os.path.join(RD,"*.json")) for t in json.load(open(p))["tool_ids"]}
hand_rms={json.load(open(p))["slug"] for p in glob.glob(os.path.join(RD,"*.json"))}
# archetypes
arch={}; cur=None; assign={}
for ln,l in enumerate(open(os.path.join(SRC,"archetypes.txt"),encoding="utf-8"),1):
    l=l.rstrip("\n")
    if not l.strip() or l.startswith("#"): continue
    if l.startswith("=archetype "):
        slug,label,core,adv=[x.strip() for x in l[11:].split("|")]
        cur={"slug":slug,"label":label,"core":[x.strip() for x in core.split(";")],"adv":[x.strip() for x in adv.split(";")],"mods":[]}; arch[slug]=cur; continue
    if l.startswith("tools:"):
        for t in [x.strip() for x in l[6:].split(",") if x.strip()]:
            assert t in reg, (ln,t); assert t not in assign, (ln,t,assign.get(t)); assign[t]=cur["slug"]
        continue
    lv,title,outcome,topics,practice,tags,hours=[x.strip() for x in l.split("|")]
    cur["mods"].append({"lv":{"B":"beginner","I":"intermediate","E":"expert"}[lv],"title":title,"outcome":outcome,"topics":[x.strip() for x in topics.split(";")],"practice":practice,"tags":[x.strip() for x in tags.split(",")],"hours":float(hours)})
# signatures
sig={}
sp=os.path.join(SRC,"signatures.txt")
if os.path.exists(sp):
    for ln,l in enumerate(open(sp,encoding="utf-8"),1):
        l=l.rstrip("\n")
        if not l.strip() or l.startswith("#"): continue
        slug,rest=[x.strip() for x in l.split("|",1)]
        core,_,adv=rest.partition("||")
        assert slug in reg, (ln,slug)
        sig[slug]=([x.strip() for x in core.split(";") if x.strip()],[x.strip() for x in adv.split(";") if x.strip()])
todo=[s for s in reg if s not in hand]
unassigned=[s for s in todo if s not in assign]
print("tools",len(reg),"handwritten",len(hand),"to generate",len(todo),"unassigned",len(unassigned))
if unassigned: print("UNASSIGNED:"," ".join(unassigned))
EV={"status":"pending","note":"Generated from the archetype template plus tool-specific signature skills; to be reviewed by a practitioner."}
made=collections.Counter(); sigc=0
for s in todo:
    if s not in assign: continue
    a=arch[assign[s]]; t=reg[s]; name=re.sub(r"\s*\(.*?\)","",t["name"]).strip(); tn=[n for n in tool_needs[s] if n in needs]
    def tagify(tags):
        out=[]
        for x in tags:
            if x=="@tool": out+=tn
            elif x in needs: out.append(x)
        return list(dict.fromkeys(out))
    def M(i,lv,title,outcome,topics,practice,tags,hours):
        ms=f"{s}-{a['slug']}-{i}"
        return {"id":"mod_"+re.sub(r"[^a-z0-9]","_",ms),"slug":ms,"title":title.replace("{tool}",name),"outcome":"You can: "+outcome.replace("{tool}",name),
                "topics":[x.replace("{tool}",name) for x in topics],"practice":practice.replace("{tool}",name),"need_tags":tagify(tags),
                "estimated_hours":{"value":hours,"is_estimate":True},"level":lv}
    lv={"beginner":[],"intermediate":[],"expert":[]}
    lv["beginner"].append(M(0,"beginner","Get started with {tool}","set up {tool}, find your way around and finish a first small task",["installation or account setup","interface tour","settings and accessibility options","saving, exporting and sharing","official help and documentation"],"Complete the official getting-started guide, then one small real task from your work",["@tool"],1))
    for i,m in enumerate(a["mods"],1):
        lv[m["lv"]].append(M(i,m["lv"],m["title"],m["outcome"],m["topics"],m["practice"],m["tags"],m["hours"]))
    has_sig = s in sig
    core,adv = sig[s] if has_sig else (a["core"],a["adv"])
    if has_sig: sigc+=1
    if len(core)<2: core=core+a["core"]
    if len(adv)<2: adv=adv+a["adv"]
    lv["intermediate"].append(M(8,"intermediate","Signature skills in {tool}","use the features that make {tool} distinctive",core[:8],"Use each of these features once on a real piece of work",["@tool"],3))
    lv["expert"].insert(0,M(9,"expert","Advanced {tool}","use {tool}'s advanced capabilities with confidence",adv[:8],"Complete a project that needs at least two of these advanced capabilities",["@tool"],4))
    lv["expert"].append(M(10,"expert","Integrate {tool} into your workflow","connect {tool} with the other tools you use",["imports and exports","file formats","integrations or APIs where available","automation of repeated steps"],"Connect {tool} to one other tool you use and remove one manual step",["automation-workflows","@tool"],2))
    lv["expert"].append(M(11,"expert","Lead and teach others","set standards and teach others to use {tool} well",["templates and conventions","quality checks","privacy and security settings","onboarding a colleague or friend"],"Write a one-page \"how we use "+name+"\" guide and teach it to one person",["workshop-facilitation","@tool"],2))
    rec={"schema_version":"2.1","id":"rm_"+s.replace("-","_"),"slug":s,"title":f"{name} skill roadmap","tool_ids":[t["id"]],"levels":lv,
         "authoring":"archetype+signature" if has_sig else "archetype","archetype":a["slug"],"expert_validation":EV,"is_illustrative":False}
    json.dump(rec,open(os.path.join(RD,s+".json"),"w"),indent=1,ensure_ascii=False); made[rec["authoring"]]+=1
cov=len(hand)+sum(made.values())
print(f"generated {dict(made)}; roadmap coverage {cov}/{len(reg)} = {100*cov/len(reg):.1f}%; with tool-specific content (handwritten or signature) {len(hand)+sigc}/{len(reg)} = {100*(len(hand)+sigc)/len(reg):.1f}%")
json.dump({"tools":len(reg),"handwritten_tools":len(hand),"generated":dict(made),"coverage_pct":round(100*cov/len(reg),1),"tool_specific_pct":round(100*(len(hand)+sigc)/len(reg),1),
           "archetypes":{k:{"label":v["label"],"tools":sorted([t for t,x in assign.items() if x==k and t not in hand])} for k,v in arch.items()}},
          open(os.path.join(CAT,"generated/roadmap-coverage.json"),"w"),indent=1)
# extend the lens index with every (generated roadmap × need that lists the tool)
LI=os.path.join(CAT,"generated/lens-index.json"); li=json.load(open(LI))
li["values"]=[x for x in li["values"] if x["roadmap"] in hand_rms]
have={(x["roadmap"],x["need"]) for x in li["values"]}
for f in sorted(os.listdir(RD)):
    r=json.load(open(os.path.join(RD,f)))
    if r.get("authoring","handwritten")=="handwritten": continue
    tid=r["tool_ids"][0]
    for n in needs.values():
        if tid in n["tool_ids"] and (r["slug"],n["slug"]) not in have:
            core=sum(1 for lv in r["levels"].values() for m in lv if n["slug"] in m["need_tags"])
            li["values"].append({"roadmap":r["slug"],"need":n["slug"],"kind":"auto","core_modules":core}); have.add((r["slug"],n["slug"]))
li["count"]=len(li["values"])
json.dump(li,open(LI,"w"),indent=1)
print("lens index:",li["count"],"renderable lenses")
