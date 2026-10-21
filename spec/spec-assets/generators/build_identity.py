import json, os, re, sys, collections
SRC, PACK = sys.argv[1], sys.argv[2]
TAX = os.path.join(PACK, "spec-assets/taxonomy")
os.makedirs(os.path.join(TAX, "identities"), exist_ok=True)
os.makedirs(os.path.join(TAX, "source"), exist_ok=True)
REG_OUT = os.path.join(PACK, "08_Starter_Catalogue/registry"); os.makedirs(REG_OUT, exist_ok=True)
def slugify(s):
    s = s.lower().replace("&", "").replace("'", "")
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return re.sub(r"-+", "-", s)
def rows(path):
    for l in open(path, encoding="utf-8"):
        if l.startswith("#") or not l.strip(): continue
        yield [x.strip() for x in l.rstrip("\n").split("|")]
ISCO = {"01":"Commissioned armed forces officers","02":"Non-commissioned armed forces officers","03":"Armed forces occupations, other ranks",
"11":"Chief executives, senior officials and legislators","12":"Administrative and commercial managers","13":"Production and specialized services managers","14":"Hospitality, retail and other services managers",
"21":"Science and engineering professionals","22":"Health professionals","23":"Teaching professionals","24":"Business and administration professionals","25":"Information and communications technology professionals","26":"Legal, social and cultural professionals",
"31":"Science and engineering associate professionals","32":"Health associate professionals","33":"Business and administration associate professionals","34":"Legal, social, cultural and related associate professionals","35":"Information and communications technicians",
"41":"General and keyboard clerks","42":"Customer services clerks","43":"Numerical and material recording clerks","44":"Other clerical support workers",
"51":"Personal service workers","52":"Sales workers","53":"Personal care workers","54":"Protective services workers",
"61":"Market-oriented skilled agricultural workers","62":"Market-oriented skilled forestry, fishery and hunting workers","63":"Subsistence farmers, fishers, hunters and gatherers",
"71":"Building and related trades workers, excluding electricians","72":"Metal, machinery and related trades workers","73":"Handicraft and printing workers","74":"Electrical and electronic trades workers","75":"Food processing, wood working, garment and other craft and related trades workers",
"81":"Stationary plant and machine operators","82":"Assemblers","83":"Drivers and mobile plant operators",
"91":"Cleaners and helpers","92":"Agricultural, forestry and fishery labourers","93":"Labourers in mining, construction, manufacturing and transport","94":"Food preparation assistants","95":"Street and related sales and service workers","96":"Refuse workers and other elementary workers"}
json.dump({"standard":"ISCO-08 (International Labour Organization)","level":"sub-major groups (2-digit)","count":len(ISCO),"note":"Digital Advantage identities carry an ISCO-08 sub-major crosswalk assigned editorially. Unit-group (4-digit) mapping is a planned expert-validation task.","values":[{"code":k,"title":v} for k,v in sorted(ISCO.items())]}, open(os.path.join(TAX,"identities/isco08-submajor.json"),"w"), indent=2)

# needs
needs, need_order, section = {}, [], None
for l in open(os.path.join(SRC,"needs.txt"), encoding="utf-8"):
    if l.startswith("## "): section = l[3:].strip(); continue
    if l.startswith("#") or not l.strip(): continue
    slug,label,fam,tools,desc = [x.strip() for x in l.split("|")]
    assert slug not in needs, slug
    needs[slug] = {"id":"need_"+slug.replace("-","_"),"slug":slug,"label":label,"task_family":fam,"section":section,"universal":section.startswith("UNIVERSAL"),
                   "description":desc,"tool_ids":["tool_"+t.strip().replace("-","_") for t in tools.split(",")],
                   "expert_validation":{"status":"pending","note":"AI-drafted; validate with a practitioner in this field."}}
    need_order.append(slug)
fams = json.load(open(os.path.join(TAX,"task-families.json")))
famslugs = {v["slug"] for v in fams["values"]}
bad = [n for n in needs.values() if n["task_family"] not in famslugs]; assert not bad, bad
# registry
PROFILED = {"davinci-resolve","shotcut","kdenlive","canva","zotero","google-scholar","zapier","n8n","wordpress","freecodecamp"}
registry = {}
cats = {c["slug"] for c in json.load(open(os.path.join(TAX,"categories.json")))["values"]}
for slug,name,pub,url,cat in rows(os.path.join(SRC,"registry.txt")):
    assert cat in cats, (slug,cat)
    registry[slug] = {"id":"tool_"+slug.replace("-","_"),"slug":slug,"name":name,"publisher":pub,"official_url": None if url=="-" else url,
                      "url_status":"to_confirm","category_id":cat,"profile_status":"profiled" if slug in PROFILED else "stub",
                      "pricing_model":"unknown","note":"Registry entry: name and link only. No pricing, platform or feature claims until profiled."}
need_tools = {t[5:].replace("_","-") for n in needs.values() for t in n["tool_ids"]}
missing = need_tools - set(registry); assert not missing, missing
# identities
sectors, families, idents = [], [], []
cur_sector = cur_family = last_top = None
seen = {}
for ln, l in enumerate(open(os.path.join(SRC,"identities.txt"), encoding="utf-8"), 1):
    l = l.rstrip("\n")
    if l.startswith("## "):
        slug,label,sn = [x.strip() for x in l[3:].split("|")]
        cur_sector = {"id":"sec_"+slug.replace("-","_"),"slug":slug,"label":label,"needs":[x.strip() for x in sn.split(",") if x.strip()],"order":len(sectors)}
        sectors.append(cur_sector); continue
    if l.startswith("# ") and cur_sector is not None and "|" in l:
        slug,label,isco,fn = [x.strip() for x in l[2:].split("|")]
        assert isco=="-" or isco in ISCO, (ln,isco)
        cur_family = {"id":"fam_"+slug.replace("-","_"),"slug":slug,"label":label,"sector":cur_sector["slug"],"isco08_submajor":None if isco=="-" else isco,
                      "needs":[x.strip() for x in fn.split(",") if x.strip()]}
        families.append(cur_family); continue
    if l.startswith("#") or not l.strip(): continue
    child = l.startswith(">")
    parts = [x.strip() for x in l.lstrip("> ").split(";")]
    label = parts[0]; aliases=[]; own=[]
    for p in parts[1:]:
        if p.startswith("+"): own += [x.strip() for x in p[1:].split(",") if x.strip()]
        elif p: aliases += [x.strip() for x in p.split(",") if x.strip()]
    slug = slugify(label)
    assert slug not in seen, (ln, slug, seen.get(slug))
    seen[slug] = ln
    rec = {"id":"id_"+slug.replace("-","_"),"slug":slug,"label":label,"aliases":aliases,
           "kind":"life_role" if cur_sector["slug"]=="life" else ("specialism" if child else "profession"),
           "sector":cur_sector["slug"],"family":cur_family["slug"],"parent":last_top["slug"] if child else None,
           "isco08_submajor":cur_family["isco08_submajor"],"needs":own,
           "expert_validation":{"status":"pending"}}
    if not child: last_top = rec
    idents.append(rec)

# ---- ISCO-08 unit-group map (exhaustive backbone) ----
units = {}
for l in open(os.path.join(SRC,"isco_units.txt"),encoding="utf-8"):
    if l.strip(): c,t=l.strip().split("|",1); units[c]=t
famby_slug = {f["slug"]:f for f in families}
secby_slug = {s["slug"]:s for s in sectors}
def nrm(x): return re.sub(r"[^a-z0-9]","",x.lower())
bylabel = {nrm(i["label"]):i for i in idents}
byalias = {}
for i in idents:
    for a in i["aliases"]: byalias.setdefault(nrm(a), i)
created = 0; matched = 0
for i in idents: i["isco08_units"] = []
for ln,l in enumerate(open(os.path.join(SRC,"isco_map.txt"),encoding="utf-8"),1):
    l=l.rstrip("\n")
    if not l.strip() or l.startswith("#"): continue
    if l.startswith("@family "):
        slug,label,sec,isco,fn=[x.strip() for x in l[8:].split("|")]
        assert sec in secby_slug, (ln,sec); assert slug not in famby_slug, slug
        f={"id":"fam_"+slug.replace("-","_"),"slug":slug,"label":label,"sector":sec,"isco08_submajor":isco,"needs":[x.strip() for x in fn.split(",") if x.strip()]}
        families.append(f); famby_slug[slug]=f; continue
    code,fam,titles=[x.strip() for x in l.split("|",2)]
    assert code in units, (ln,code); assert fam in famby_slug, (ln,fam)
    for t in [x.strip() for x in titles.split(";") if x.strip()]:
        m=re.match(r"^(.*?)\s*(?:\[(.*)\])?$",t); label=m.group(1).strip(); al=[a.strip() for a in (m.group(2) or "").split(",") if a.strip()]
        hit = bylabel.get(nrm(label)) or byalias.get(nrm(label)) or next((bylabel.get(nrm(a)) or byalias.get(nrm(a)) for a in al if (bylabel.get(nrm(a)) or byalias.get(nrm(a)))), None)
        if hit:
            matched+=1
            if code not in hit["isco08_units"]: hit["isco08_units"].append(code)
            for a in al:
                if nrm(a) not in bylabel and nrm(a) not in byalias and nrm(a)!=nrm(hit["label"]):
                    hit["aliases"].append(a); byalias[nrm(a)]=hit
            continue
        slug=slugify(label)
        if slug in seen:
            slug=slugify(label+" "+famby_slug[fam]["label"].split()[0])
        assert slug not in seen, (ln,slug)
        seen[slug]=ln
        rec={"id":"id_"+slug.replace("-","_"),"slug":slug,"label":label,"aliases":al,"kind":"profession","sector":famby_slug[fam]["sector"],"family":fam,"parent":None,
             "isco08_submajor":code[:2],"isco08_units":[code],"needs":[],"expert_validation":{"status":"pending"}}
        idents.append(rec); bylabel[nrm(label)]=rec; created+=1
        for a in al: byalias.setdefault(nrm(a),rec)
covered = {c for i in idents for c in i["isco08_units"]}
missing_units = sorted(set(units)-covered)
assert not missing_units, missing_units
print(f"ISCO map: matched {matched} existing, created {created} new identities; unit groups covered {len(covered)}/{len(units)}")
ucount=collections.Counter(c for i in idents for c in i["isco08_units"])
json.dump({"standard":"ISCO-08 unit groups (4-digit), International Labour Organization","source_note":"Codes and titles transcribed from the ISCO-08-based CITP codelist published by CCSS Luxembourg (ccss.public.lu/en/codes-citp.html), national-only codes removed and typos corrected; total 436 unit groups matches ISCO-08.","count":len(units),
  "values":[{"code":c,"title":t,"sub_major":c[:2],"minor":c[:3],"identity_count":ucount[c]} for c,t in sorted(units.items())]},
  open(os.path.join(TAX,"identities/isco08-unit-groups.json"),"w"),indent=1)

# validate need refs
allneed = set(needs)
errs=[]
for s in sectors:
    for n in s["needs"]:
        if n not in allneed: errs.append(("sector",s["slug"],n))
for f in families:
    for n in f["needs"]:
        if n not in allneed: errs.append(("family",f["slug"],n))
for i in idents:
    for n in i["needs"]:
        if n not in allneed: errs.append(("identity",i["slug"],n))
assert not errs, errs
# alias collisions (an alias equal to another identity label is allowed but reported)
labels = {i["label"].lower():i["slug"] for i in idents}
coll = collections.defaultdict(list)
for i in idents:
    for a in i["aliases"]:
        coll[a.lower()].append(i["slug"])
dups = {a:v for a,v in coll.items() if len(v)>1}
# resolve needs
famby = {f["slug"]:f for f in families}; secby={s["slug"]:s for s in sectors}; idby={i["slug"]:i for i in idents}
universal = [n for n in need_order if needs[n]["universal"]]
def resolve(i):
    core = list(dict.fromkeys(i["needs"] + (idby[i["parent"]]["needs"] if i["parent"] else []) + famby[i["family"]]["needs"]))
    sector = [n for n in secby[i["sector"]]["needs"] if n not in core]
    uni = [n for n in universal if n not in core and n not in sector]
    return {"core":core,"sector":sector,"universal":uni}
used = collections.Counter()
for i in idents:
    r = resolve(i)
    for n in r["core"]+r["sector"]: used[n]+=1
orphan_needs = [n for n in need_order if not needs[n]["universal"] and used[n]==0]
# write
w = lambda name,obj: json.dump(obj, open(os.path.join(TAX,"identities",name),"w"), indent=1, ensure_ascii=False)
w("sectors.json", {"version":"2.1.0","values":sectors})
w("families.json", {"version":"2.1.0","values":families})
w("identities.json", {"version":"2.1.0","note":"Professions, specialisms and life roles for the 'Who are you?' entry. Needs listed here are the identity's OWN needs; resolved needs = own + parent + family (core) + sector + universal (see 03 §6).","count":len(idents),"values":idents})
json.dump({"version":"2.1.0","universal":universal,"count":len(needs),"values":[needs[n] for n in need_order]}, open(os.path.join(TAX,"needs.json"),"w"), indent=1, ensure_ascii=False)
json.dump({"version":"2.1.0","count":len(registry),"values":sorted(registry.values(), key=lambda r:r["slug"])}, open(os.path.join(REG_OUT,"tools-registry.json"),"w"), indent=1, ensure_ascii=False)
for f in ("needs.txt","registry.txt","identities.txt","isco_map.txt","isco_units.txt"):
    dst=os.path.join(TAX,"source",f)
    if not (os.path.exists(dst) and os.path.samefile(os.path.join(SRC,f),dst)):  # never truncate a source onto itself
        txt=open(os.path.join(SRC,f),encoding="utf-8").read(); open(dst,"w",encoding="utf-8").write(txt)
kinds = collections.Counter(i["kind"] for i in idents)
nal = sum(len(i["aliases"]) for i in idents)
print(f"sectors {len(sectors)} families {len(families)} identities {len(idents)} {dict(kinds)} aliases {nal} searchable_names {len(idents)+nal}")
print(f"needs {len(needs)} (universal {len(universal)}) registry tools {len(registry)} orphan_needs {orphan_needs}")
print("alias collisions:", len(dups), list(dups.items())[:8])
core_sizes = [len(resolve(i)["core"]) for i in idents]
print("core needs per identity: min", min(core_sizes), "avg", round(sum(core_sizes)/len(core_sizes),1), "max", max(core_sizes))
json.dump({i["slug"]:resolve(i) for i in idents}, open(os.path.join(PACK,"08_Starter_Catalogue/generated/resolved-needs.json"),"w"))
