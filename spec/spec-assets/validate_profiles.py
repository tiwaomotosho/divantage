"""Validate tool-profiles.json (D-084). Usage: python3 -I spec-assets/validate_profiles.py <pack-root>"""
import json, sys, re
root = sys.argv[1] if len(sys.argv) > 1 else "."

import glob
errs = []
d = json.load(open(f"{root}/08_Starter_Catalogue/registry/tool-profiles.json"))
vals = d["values"]
slugs = [v["slug"] for v in vals]
if len(slugs) != len(set(slugs)): errs.append("duplicate slugs")
# coverage against registry source
reg_slugs = [l.split(" | ")[0].strip() for l in open(f"{root}/spec-assets/taxonomy/source/registry.txt")
             if l.strip() and not l.startswith("#") and " | " in l]
missing = set(reg_slugs) - set(slugs)
if missing: errs.append(f"{len(missing)} tools without profile: {sorted(missing)[:5]}")
vocab = json.load(open(f"{root}/spec-assets/taxonomy/vocabularies.json"))
PM = {"free","freemium","free_trial","paid_subscription","paid_once","open_source","usage_based","enterprise_quote","mixed","unknown"}
FT = {"yes","no","limited","unknown"}
web = 0
for v in vals:
    s = v["slug"]
    if v["pricing_model"] not in PM: errs.append(f"{s}: pricing_model")
    if v["free_tier"] not in FT: errs.append(f"{s}: free_tier")
    if not (30 <= len(v["description"]) <= 600): errs.append(f"{s}: description length")
    if not v["price_note"].strip(): errs.append(f"{s}: empty price_note")
    ver, pre = v["verification"], v["preview"]
    if ver["level"] == "web_seen":
        web += 1
        # FR-096 / checklist 7.3: the Preview label may go only when the PRICE was seen, not just existence
        if "price" not in (ver["checked"] or "").lower() and not pre["shown"]: errs.append(f"{s}: web_seen without a price check must keep the Preview label")
        if not (ver["source"] and ver["checked_on"] and ver["checked"]): errs.append(f"{s}: web_seen needs source, date, what was checked")
    else:
        if not pre["shown"] or not pre["label"].startswith("Preview"): errs.append(f"{s}: unverified profile must show Preview label")
        if not pre["unchecked"]: errs.append(f"{s}: Preview must list what is unchecked")
    if "|" in v["description"]: errs.append(f"{s}: pipe in description")
if d["verified_count"] != web: errs.append("verified_count mismatch")
print(f"profiles {len(vals)}; web_seen {web}; Errors {len(errs)}")
for e in errs[:30]: print(" -", e)
sys.exit(1 if errs else 0)
