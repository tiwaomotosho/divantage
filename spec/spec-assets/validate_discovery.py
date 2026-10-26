"""Validate the discovery layer (V2.7): kits, links, safety, entry paths. Usage: python3 -I spec-assets/validate_discovery.py <pack-root>"""
import json, sys, re
root = sys.argv[1] if len(sys.argv) > 1 else "."
T = f"{root}/spec-assets/taxonomy"
goals = {g["slug"]: g for g in json.load(open(f"{T}/goals.json"))["values"]}
kits = json.load(open(f"{T}/goal-kits.json"))["values"]
links = json.load(open(f"{T}/goal-links.json"))["values"]
saf = json.load(open(f"{T}/goal-safety.json"))
paths = json.load(open(f"{T}/entry-paths.json"))["paths"]
errs = []
# owner scenarios must exist as kits
need = {"get-a-remote-job", "edit-a-short-video", "teach-kids-programming", "make-my-cv-and-portfolio", "become-a-freelancer", "stay-safe-online"}
have = {k["slug"] for k in kits}
if need - have: errs.append(f"missing owner kits: {sorted(need - have)}")
for k in kits:
    if not k["search_phrases"]: errs.append(f"{k['slug']}: no search phrases")
    tags = {t for s in k["goal_slugs"] for t in saf["goal_tags"].get(s, [])}
    if k["slug"] in ("get-a-remote-job", "become-a-freelancer") and "jobs" not in tags: errs.append(f"{k['slug']}: needs a jobs safety tag")
    if k["slug"] == "teach-kids-programming" and "kids" not in tags: errs.append(f"{k['slug']}: needs a kids safety tag")
    if k["slug"] in ("get-paid-from-abroad",) and "money" not in tags: errs.append(f"{k['slug']}: needs a money safety tag")
# technology-enablement coverage floor (D-090): each outcome must have at least one goal
floor = {"remote jobs": "remote-job", "CV": "cv", "portfolio": "portfolio", "proofreading": "proofread", "freelancing": "freelanc",
         "learn to code": "learn-to-code", "kids coding": "teach-kids", "paid from abroad": "paid-from-abroad"}
for label, key in floor.items():
    if not any(key in s for s in goals): errs.append(f"technology-enablement floor: no goal for {label}")
# links
for s, v in links.items():
    if s not in goals: errs.append(f"link for unknown goal {s}")
    if len(v["related_goals"]) < 3: errs.append(f"{s}: fewer than 3 related goals")
    for o in v["related_goals"]:
        if o not in goals or o == s: errs.append(f"{s}: bad related {o}")
if set(links) != set(goals): errs.append("goal-links must cover every goal")
# safety: high-risk goal families must carry their tag
chk = {"jobs": ["find-remote-jobs", "get-a-remote-job-paid-in-dollars", "check-a-remote-job-offer-is-genuine"], "kids": ["teach-kids-to-code-with-blocks", "keep-kids-safe-on-coding-platforms"],
       "money": ["save-and-invest-safely-in-nigeria", "compare-ways-to-get-paid-from-abroad"], "official-fees": []}
for tag, ss in chk.items():
    for s in ss:
        if s in goals and tag not in saf["goal_tags"].get(s, []): errs.append(f"{s}: missing safety tag {tag}")
for r in saf["rules"]:
    if not r["red_flags"] or not r["what_to_know"]: errs.append(f"safety rule {r['tag']} incomplete")
if {p["id"] for p in paths} < {"goal_first", "who_you_are", "skills", "situations", "intent", "browse_need", "suggested"}: errs.append("entry paths incomplete")
print(f"kits {len(kits)}; goal links {len(links)}; safety rules {len(saf['rules'])}; entry paths {len(paths)}; Errors {len(errs)}")
for e in errs[:30]: print(" -", e)
sys.exit(1 if errs else 0)
