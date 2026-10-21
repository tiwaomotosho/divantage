#!/usr/bin/env python3
"""Check that every feature the owner asked for is traceable (V2.5, FR-073, TC-130).
Usage: python3 -I spec-assets/validate_feature_matrix.py <pack-root>
Fails when a cited decision, requirement, screen, test or flag does not exist, or a feature has no decision."""
import csv, json, os, re, sys
root = sys.argv[1]
rd = lambda p: open(os.path.join(root, p), encoding="utf-8").read()
decisions = set(re.findall(r"^\| (D-\d+) \|", rd("02_Product_Decision_Register.md"), re.M))
frs = set(re.findall(r"^\| (FR-\d+) \|", rd("01_Master_PRD.md"), re.M))
screens = set(re.findall(r"^#{2,4} ((?:S|A)\d+(?:-R\d?)?)\b", rd("04_Screen_Inventory_and_UX_Specification.md"), re.M))
tests = {r["test_id"] for r in csv.DictReader(open(os.path.join(root, "spec-assets/qa/acceptance-matrix.csv"), encoding="utf-8"))}
flags = set(json.load(open(os.path.join(root, "spec-assets/config/feature-flags.json")))["flags"])
errs = []; rows = list(csv.DictReader(open(os.path.join(root, "spec-assets/qa/feature-matrix.csv"), encoding="utf-8")))
split = lambda s: [x.strip() for x in s.split(";") if x.strip()]
for r in rows:
    fid = r["feature_id"]
    for key, known, label in (("decisions", decisions, "decision"), ("requirements", frs, "requirement"), ("screens", screens, "screen"), ("tests", tests, "test"), ("flags", flags, "flag")):
        for v in split(r[key]):
            if v not in known: errs.append(f"{fid}: unknown {label} {v}")
    if not split(r["decisions"]): errs.append(f"{fid}: no decision")
    if r["stage"] not in ("Beta", "Launch", "Post-MVP"): errs.append(f"{fid}: bad stage {r['stage']}")
    if r["stage"] in ("Beta", "Launch") and not split(r["tests"]) and fid != "F-23": errs.append(f"{fid}: shipping feature without a test")
# launch gate: every flag marked launch:true must default to on by launch (value of 'launch' key)
cfg = json.load(open(os.path.join(root, "spec-assets/config/feature-flags.json")))["flags"]
BETA_ONLY = {"noindex_site", "beta_banner", "suggest_email"}
for k, v in cfg.items():
    if "launch" not in v: errs.append(f"flag {k}: missing 'launch' value")
for r in rows:
    if r["stage"] in ("Beta", "Launch"):
        for fl in split(r["flags"]):
            if fl not in BETA_ONLY and not cfg[fl].get("launch"): errs.append(f"{r['feature_id']}: flag {fl} does not launch ON")
ids = {i["slug"] for i in json.load(open(os.path.join(root, "spec-assets/taxonomy/identities/identities.json")))["values"]}
hf = json.load(open(os.path.join(root, "spec-assets/config/home-featured.json")))
for k in ("popular", "ribbon"):
    for sl in hf[k]:
        if sl not in ids: errs.append(f"home-featured {k}: unknown identity {sl}")
used = {x for r in rows for x in split(r["flags"])}
for k in cfg:
    if k not in used and k not in ("suggest_email", "toolkit_cards", "noindex_site", "beta_banner"): print(f"note: flag {k} is not tied to a feature row")
print(f"features: {len(rows)} | errors: {len(errs)}")
for e in errs: print("  ERROR", e)
sys.exit(1 if errs else 0)
