"""Build tool preview profiles (D-084). Usage: build_profiles.py SRC PACK
Reads source/tool_profiles.txt + profile_verified.txt; writes 08_Starter_Catalogue/registry/tool-profiles.json.
Every registry tool must have a profile. Nothing here is a verified price: see the Preview clause."""
import sys, os, json
SRC, PACK = sys.argv[1], sys.argv[2]
REG = json.load(open(os.path.join(PACK, "08_Starter_Catalogue/registry/tools-registry.json")))["values"]
reg = {r["slug"]: r for r in REG}
MAP = {"contact_sales": "enterprise_quote", "one_time": "paid_once", "varies": "mixed"}
PRICING = {"free","freemium","free_trial","paid_subscription","paid_once","open_source","usage_based","enterprise_quote","mixed","unknown"}
FREE = {"yes","limited","no","unknown"}
def rows(f):
    for n, l in enumerate(open(os.path.join(SRC, f), encoding="utf-8"), 1):
        l = l.rstrip("\n")
        if l.strip() and not l.startswith("#"):
            yield n, [x.strip() for x in l.split(" | ")]
verified = {}
for n, p in rows("profile_verified.txt"):
    assert len(p) == 4, (n, p)
    verified[p[0]] = {"level": "web_seen", "checked": p[1], "source": p[2], "checked_on": p[3]}
profiles, errs = {}, []
for n, p in rows("tool_profiles.txt"):
    if len(p) != 5: errs.append(f"tool_profiles.txt:{n}: expected 5 fields, got {len(p)}"); continue
    slug, pm, ft, note, desc = p
    pm = MAP.get(pm, pm)
    if slug not in reg: errs.append(f"tool_profiles.txt:{n}: unknown tool {slug}"); continue
    if slug in profiles: errs.append(f"tool_profiles.txt:{n}: duplicate {slug}"); continue
    if pm not in PRICING: errs.append(f"{slug}: bad pricing_model {pm}")
    if ft not in FREE: errs.append(f"{slug}: bad free_tier {ft}")
    if not (30 <= len(desc) <= 600): errs.append(f"{slug}: description length {len(desc)}")
    unchecked = ["price and plan limits", "whether a free tier still exists", "availability and payment options in your country", "supported devices"]
    v = verified.get(slug)
    prof = {"slug": slug, "description": desc, "pricing_model": pm, "free_tier": ft, "price_note": note,
            "verification": v or {"level": "ai_draft", "checked": None, "source": None, "checked_on": None},
            "preview": {"shown": True, "unchecked": unchecked,
                        "label": "Preview. Drafted from general knowledge, not yet checked against the official site. Prices, free-tier limits and availability in your country may differ. Confirm on the official page before you pay."}}
    if v: prof["preview"]["label"] = "Partly checked: " + v["checked"] + " (" + v["checked_on"] + "). Pricing and plan details are still a preview; confirm on the official page before you pay."
    profiles[slug] = prof
for s in verified:
    if s not in reg: errs.append(f"profile_verified.txt: unknown tool {s}")
missing = sorted(set(reg) - set(profiles))
if missing: errs.append(f"{len(missing)} registry tools have no profile: {' '.join(missing[:20])}")
if errs:
    print("\n".join(errs[:40])); sys.exit(1)
out = os.path.join(PACK, "08_Starter_Catalogue/registry/tool-profiles.json")
json.dump({"version": "2.7.0", "count": len(profiles), "verified_count": len(verified),
           "rule": "D-084: every profile is a Preview unless verification.level is web_seen or checked; the Preview label must say what is unchecked.",
           "values": [profiles[s] for s in sorted(profiles)]}, open(out, "w"), indent=1, ensure_ascii=False)
print(f"profiles {len(profiles)}/{len(reg)}; partly web-checked {len(verified)}; the rest are AI-drafted previews")
