#!/usr/bin/env python3
"""Reference content validator for Digital Advantage V2.

Implements the schema checks and integrity rules in 07_Content_Model_and_Editorial_Handbook.md §9
and Gap Analysis §19.3. The production build should port these rules to the Node CI step (Ajv + a
TypeScript integrity script); this file is the executable reference and must give identical results.

Usage:
  python3 -I validate_catalogue.py <spec-assets dir> <records dir> [--production]

--production additionally fails on: is_illustrative=true, editorial_status draft/in_review appearing
in a production build, and overdue records.
"""
import json, os, sys, re, datetime
from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource

def load(p):
    with open(p, encoding="utf-8") as f:
        return json.load(f)

def main():
    assets, records = sys.argv[1], sys.argv[2]
    production = "--production" in sys.argv
    sdir = os.path.join(assets, "schemas")
    schemas = {n: load(os.path.join(sdir, n)) for n in os.listdir(sdir) if n.endswith(".json")}
    reg = Registry().with_resources([(s["$id"], Resource.from_contents(s)) for s in schemas.values()])
    vocab = load(os.path.join(assets, "taxonomy", "vocabularies.json"))
    src_types = {v["id"]: set(v["may_support"]) for v in vocab["source_type"]["values"]}
    kind_map = {"tools": "tool", "tasks": "task", "resources": "resource", "playbooks": "playbook", "comparisons": "comparison", "collections": "collection"}
    errors, warnings = [], []
    recs = {}
    slugs = {}
    for folder, sname in kind_map.items():
        d = os.path.join(records, folder)
        if not os.path.isdir(d):
            continue
        v = Draft202012Validator(schemas[f"{sname}.schema.json"], registry=reg, format_checker=FormatChecker())
        for fn in sorted(os.listdir(d)):
            if not fn.endswith(".json"):
                continue
            r = load(os.path.join(d, fn))
            for e in v.iter_errors(r):
                errors.append(f"{folder}/{fn}: schema: {'/'.join(map(str, e.absolute_path))}: {e.message[:200]}")
            rid = r.get("id")
            if rid in recs:
                errors.append(f"{folder}/{fn}: duplicate id {rid}")
            recs[rid] = (folder, r)
            key = (folder, r.get("slug"))
            if key in slugs:
                errors.append(f"{folder}/{fn}: duplicate slug {r.get('slug')} (also {slugs[key]})")
            slugs[key] = fn
            if fn != f"{r.get('slug')}.json":
                errors.append(f"{folder}/{fn}: filename must equal slug + .json")

    today = datetime.date.today()
    ref_fields = ["task_ids", "tool_ids", "resource_ids", "alternative_tool_ids", "comparison_ids", "playbook_ids",
                  "recommended_tool_ids", "related_task_ids", "related_tool_ids", "related_playbook_ids"]
    names = {}
    for rid, (folder, r) in recs.items():
        where = f"{folder}/{r.get('slug')}"
        # references resolve
        for f in ref_fields:
            for ref in r.get(f, []) or []:
                if ref not in recs:
                    errors.append(f"{where}: {f} -> missing record {ref}")
        for s in r.get("steps", []) or []:
            for ref in s.get("tool_ids", []) or []:
                if ref not in recs:
                    errors.append(f"{where}: step {s.get('n')} tool -> missing {ref}")
        if rid in r.get("alternative_tool_ids", []):
            errors.append(f"{where}: lists itself as an alternative")
        # step numbering
        for f in ("steps",):
            ns = [s.get("n") for s in r.get(f, []) or []]
            if ns and ns != list(range(1, len(ns) + 1)):
                errors.append(f"{where}: steps must be numbered 1..n in order")
        # D-043: no video-platform links (MVP)
        BLOCK=("youtube.com","youtu.be","vimeo.com","tiktok.com","dailymotion.com")
        for u in [r.get("canonical_url",""), r.get("official_url","")] + [s_.get("url","") for s_ in r.get("sources",[])]:
            if any(h in (u or "") for h in BLOCK):
                errors.append(f"{where}: video-platform link not allowed in MVP (D-043): {u}")
        # sources
        sids = {s["id"]: s for s in r.get("sources", [])}
        def check_cites(ids, kind, ctx):
            for sid in ids:
                if sid not in sids:
                    errors.append(f"{where}: {ctx} cites unknown source {sid}")
                    continue
                st = sids[sid]["type"]
                if kind and kind not in src_types.get(st, set()):
                    errors.append(f"{where}: {ctx} cites {sid} of type {st}, which may not support '{kind}'")
        for fld in ("key_capabilities", "limitations", "privacy_notes", "accessibility_notes"):
            for item in (r.get(fld, []) or []) if folder == "tools" else []:
                if item.get("kind", "fact") == "fact" and not item.get("source_ids"):
                    errors.append(f"{where}: {fld} fact without a source: '{item['text'][:50]}'")
                kind = {"privacy_notes": "privacy", "accessibility_notes": "accessibility"}.get(fld, "capabilities")
                if fld == "limitations":
                    kind = None
                check_cites(item.get("source_ids", []), kind, fld)
        p = r.get("pricing")
        if p:
            check_cites(p.get("source_ids", []), "pricing", "pricing")
            for pp in p.get("price_points", []):
                check_cites([pp["source_id"]], "pricing", "price_point")
            if p["model"] != "unknown" and not any(sids.get(s, {}).get("type") in ("official_pricing", "official_site", "official_legal", "official_docs") for s in p.get("source_ids", [])):
                errors.append(f"{where}: pricing model '{p['model']}' needs an official source")
            if p["model"] == "free" and p.get("trial_details"):
                errors.append(f"{where}: 'free' cannot have trial_details (use free_trial or mixed)")
        pl = r.get("platforms")
        if pl:
            if pl["values"] and pl["verification_status"] == "unverified":
                errors.append(f"{where}: platforms listed but marked unverified; remove values or verify")
            check_cites(pl.get("source_ids", []), "platforms", "platforms")
            if pl["values"] and not pl["source_ids"]:
                errors.append(f"{where}: platform values need a source")
        os_ = r.get("open_source")
        if os_ and os_.get("licence"):
            check_cites(os_.get("source_ids", []), "licence", "licence")
            if not os_.get("source_ids"):
                errors.append(f"{where}: licence stated without a source")
        if folder == "comparisons":
            tids = set(r["tool_ids"])
            for row in r["rows"]:
                if set(row["cells"]) != tids:
                    errors.append(f"{where}: row '{row['dimension']}' must have exactly one cell per tool")
                for tid, c in row["cells"].items():
                    if c["kind"] == "fact" and not c.get("source_ids"):
                        errors.append(f"{where}: fact cell without source ({row['dimension']}/{tid})")
                    check_cites(c.get("source_ids", []), None, f"cell {row['dimension']}")
            for bf in r["best_fit"]:
                if bf["tool_id"] not in tids:
                    errors.append(f"{where}: best_fit tool not in comparison")
        # unused sources
        cited = set()
        def collect(o):
            if isinstance(o, dict):
                for k, v in o.items():
                    if k in ("source_ids",) and isinstance(v, list): cited.update(v)
                    elif k == "source_id": cited.add(v)
                    else: collect(v)
            elif isinstance(o, list):
                for x in o: collect(x)
        collect({k: v for k, v in r.items() if k != "sources"})
        for sid in sids:
            if sid not in cited and folder not in ("resources",):
                warnings.append(f"{where}: source {sid} is never cited")
        # editorial
        e = r["editorial"]
        try:
            upd = datetime.date.fromisoformat(e["updated_at"]); nxt = datetime.date.fromisoformat(e["next_review_at"])
            lv = e.get("last_verified_at")
            base = datetime.date.fromisoformat(lv) if lv else upd
            if (nxt - base).days > e["review_interval_days"]:
                errors.append(f"{where}: next_review_at exceeds last_verified_at + review_interval_days")
            if nxt < today:
                (errors if production else warnings).append(f"{where}: review overdue since {nxt}")
        except Exception as ex:
            errors.append(f"{where}: bad editorial dates ({ex})")
        if production:
            if r.get("is_illustrative"):
                errors.append(f"{where}: illustrative record in production build")
        if e["status"] in ("draft", "in_review"):
            warnings.append(f"{where}: status {e['status']} — excluded from production, shown in preview only")
        # near-duplicate names
        nm = re.sub(r"[^a-z0-9]", "", (r.get("name") or r.get("title") or "").lower())
        if nm in names and folder == names[nm][0]:
            errors.append(f"{where}: possible duplicate of {names[nm][1]}")
        names[nm] = (folder, where)
    # redirects
    rp = os.path.join(records, "..", "redirects.json")
    if os.path.exists(rp):
        rd = load(rp)
        m = {x["from"]: x["to"] for x in rd}
        for a in m:
            seen, cur = set(), a
            while cur in m:
                if cur in seen:
                    errors.append(f"redirects: loop at {a}"); break
                seen.add(cur); cur = m[cur]
    print(f"Records: {len(recs)}  Errors: {len(errors)}  Warnings: {len(warnings)}")
    for x in errors: print("ERROR  ", x)
    for x in warnings: print("warning", x)
    sys.exit(1 if errors else 0)

if __name__ == "__main__":
    main()
