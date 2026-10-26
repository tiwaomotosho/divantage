# 20 — Admin and Catalogue Operations Manual

**Version:** 2.5 · **Date:** 21 October 2026 · **Status:** Recommended default (D-057). **Audience:** the person who runs the app day to day (the "catalogue admin"), the product owner, and anyone hiring for that role.

> **Why this document exists.** The catalogue is large and alive: 2,603 identities, 279 needs, 63 skills, 723 tools, 667 roadmaps with 6,519 modules, and 1,032 lenses. New tools launch every week, others are renamed, acquired or shut down, and new job titles appear. Without a routine the catalogue goes stale within months. This manual is that routine. It is written so a non-developer can follow it, with the technical steps marked **(tech)**.

---

## 1. The admin's job in one paragraph
Keep the catalogue **true, complete and current**. True: links work, nothing claims what a tool can't do, discontinued tools are retired. Complete: when people search for a profession, tool or skill we don't have, it gets added. Current: new tools that matter get a registry entry, a roadmap and a place in the right needs and skills. The admin never invents facts about tools: pricing, platforms and features need an official source (V2 evidence policy, 07).

## 2. How the catalogue is built (what you edit vs what is generated)
Everything public is generated from a small set of **plain-text source files**. You edit only these. Never hand-edit the generated JSON: the next rebuild overwrites it.

| You edit (source, in `spec-assets/taxonomy/source/`) | It controls | Format (one line per item) |
|---|---|---|
| `registry.txt` | Every tool: name, publisher, official link, category | `slug \| Name \| Publisher \| https://official.url \| category` |
| `needs.txt` | Jobs-to-be-done and which tools solve them (best fit first) | `slug \| Label \| task_family \| tool, tool, tool \| one-line description` |
| `identities.txt` | Sectors, families, professions, specialisms, aliases, and the needs attached to each | `## sector`, `# family`, `Profession ; alias, alias ; +need, +need`, `> Specialism` |
| `isco_units.txt`, `isco_map.txt` | The ISCO-08 completeness check (all 436 unit groups) and extra job titles per unit group | `code \| family \| Title [alias, alias]; Title …` |
| `skills.txt`, `skill_keywords.txt` | The Skills entry point: which needs make up each skill, level descriptors, search words | `slug \| Label \| needs \| description \| beginner \| intermediate \| expert` |
| `archetypes.txt` | 49 tool-type course templates (e.g. "CAD/BIM", "Payments") and which tools use each | `=archetype …`, module lines, `tools: …` |
| `signatures.txt` | The tool-specific skills that make each generated roadmap non-generic | `slug \| core skill ; core skill … \|\| advanced ; advanced …` |
| `roadmaps.txt`, `lenses.txt` | The 31 handwritten roadmaps and 35 flagship lenses (deepest content) | See the file headers |

Full tool profiles (pricing, platforms, limits, sources) remain individual records in `08_Starter_Catalogue/records/tools/` (07 handbook).

**(tech) Rebuild and validate** after any change: `bash spec-assets/generators/rebuild_all.sh` then the two search harnesses. CI runs the same on every pull request, so a broken change can't be published. The rebuild is deterministic (same sources → byte-identical output).

**Order of operations when adding a tool** matters: registry → needs → archetype + signature (or a handwritten roadmap) → skill (automatic via needs) → optional flagship lens.

## 3. Where new work comes from (intake)
Check these sources on the schedule in §4. Each produces a ticket in the **Catalogue board** (a GitHub Project on the content repo; columns: Inbox → Researching → Ready to add → In review → Published → Won't do).

| Source | What it tells you | Where to see it |
|---|---|---|
| **Zero-result searches** (`search_zero_results`) | Tools, tasks or words we're missing | Admin report → "Top zero-result queries" (90-day retention, aggregate) |
| **Identity picker misses** (`identity_no_match`, new in V2.2) | Professions or regional job names we don't have | Admin report; only queries seen ≥ 3 times are shown (privacy) |
| **Suggestions and corrections form** | "My profession isn't listed", "Suggest a tool", "This tool shut down", "This course outline is wrong" (new issue types in V2.2) | Private `da-corrections` GitHub repo (each submission is an issue) |
| **Broken-link report** (weekly lychee run) | Moved or dead official links, often the first sign of a rename or shutdown | CI artefact + auto-opened issue |
| **Launch watch** | Significant new tools | Monthly scan: Product Hunt top launches, official blogs of the big suites (Microsoft, Google, Adobe, Autodesk, Apple), app-store "new and notable", sector bodies' newsletters, and the AI-assisted scan in §8 |
| **Sector experts** (post-MVP programme, 18 §13) | What practitioners actually use now | Review forms |
| **Usage data** (`who-uses-each-tool.json`, `lens_viewed`, `skill_selected`) | Which tools deserve a full profile or a handwritten roadmap next | Admin report → "Most-needed, least-deep" list |

**Triage rule (5 minutes per ticket):** Is it legal, real and used by at least one identity we serve? Is there an official website? Is it a duplicate or alias of something we have? → Add, alias, or close with a reason.

## 4. Routine
| When | Task | Time |
|---|---|---|
| **Daily** (10 min) | Skim new `da-corrections` issues; label and answer anything urgent (wrong price, harmful or broken link). Fix a broken official link the same day. | 10 min |
| **Weekly** (2–3 h) | Triage the inbox. Review zero-result and identity-miss reports. Act on the weekly link-check report. Add 5–15 aliases or identities and 2–5 tools. Merge reviewed changes. | 2–3 h |
| **Monthly** (1 day) | Launch watch and AI-assisted scan (§8). Lifecycle review of tools flagged as renamed, acquired or discontinued (§6). Upgrade 3–5 roadmaps (§5.4). Refresh full profiles whose `last_verified` is older than 6 months. Publish the monthly KPI summary (§10). | 1 day |
| **Quarterly** (2–3 days) | Coverage audit: every need still has ≥ 2 live tools; every skill reaches ≥ 3 tools; every sector has ≥ 1 flagship lens. Add 20 handwritten roadmaps or flagship lenses, prioritised by identity reach. Review 1 sector end to end with an expert. Retire stale content. Check that analytics retention and privacy rules are still being followed. | 2–3 days |
| **Yearly** | Check for ISCO/ESCO or national classification updates. Review the archetypes list (new tool types?). Accessibility and content-design audit of the 50 most-viewed pages. | 1 week |

## 5. How-to recipes

### 5.1 Add a new tool
1. **Check it isn't already there** under another name: search `registry.txt` and the site.
2. **Registry line** in `registry.txt`: `slug | Official Name | Publisher | https://official-site | category`. The slug is lowercase with hyphens and never changes once published. Use the official homepage, not a review site. Leave the URL as `-` only while confirming it (the validator warns).
3. **Attach it to needs** in `needs.txt`: add the slug to every need it genuinely solves. Position = fit order (most broadly suitable first); don't put a brand-new tool first unless it clearly is.
4. **Give it a roadmap** (pick one):
   - **Standard (minimum):** add the slug to the right archetype's `tools:` line in `archetypes.txt` **and** write a `signatures.txt` line: 4–8 core skills that make this tool distinctive and 3–8 advanced ones, in the tool's own vocabulary ("Dynamo", "Pine Script", "PowerPlans"). Source them from the official docs' table of contents.
   - **Deep:** a handwritten roadmap in `roadmaps.txt` for high-reach tools (see 5.4).
5. **Rebuild and validate.** The validator fails the build if roadmap coverage drops below 90% (V2.2 minimum standard; currently 100%) or if any need can't be reached from a skill.
6. **Optional: full profile.** If the tool is in the top 50 by reach, create its full record (07 handbook) with sources.
7. Open a pull request titled `Add tool: {Name}`, with the official link and the needs chosen, for the reviewer.

### 5.2 Add a profession, specialism or regional name
1. Search the site and `identities.txt`. If it's another word for something we have, **add an alias** (most cases: "wells engineer" → Drilling Engineer). Aliases are free and the cheapest win.
2. If it's genuinely new, add it under the right `# family` in `identities.txt`. Add `+needs` only for what's specific to it; family and sector needs are inherited automatically.
3. Specialisms go on a `>` line under their parent.
4. If you know its ISCO-08 unit group, add it to the right line in `isco_map.txt` so the occupations directory and the coverage check stay exact.
5. Rebuild. Run the identity search harness. If the new name should be found by a particular query, add a test to `search-test-set.json`.
6. Life roles that could be sensitive (health, disability, migration, care) must be added to the privacy list in 18 §10, so analytics never record them by name.

### 5.3 Add or change a need
A need must be an action in plain words ("Plan and track crops and animals"), in one task family, with 1–12 tools in fit order. Add it to `needs.txt`, attach it to identities or families in `identities.txt`, **and add it to a skill in `skills.txt`** (the validator enforces this). If it changes what a roadmap module teaches, add the need slug to that module's tags.

### 5.4 Upgrade a roadmap (generated → handwritten)
**Roadmap tiers:**
1. **Archetype:** the tool-type template only. Not allowed in V2.2; the validator expects a signature.
2. **Archetype + signature:** the template plus the tool's own core and advanced skills. **This is the minimum standard** (all 636 generated roadmaps).
3. **Handwritten:** every module written for the tool, with need tags and specific practice tasks (31 roadmaps covering 87 tools).
4. **Expert-validated:** any tier reviewed by a practitioner (`expert_validation.status = validated`).

**Upgrade priority:** sort `who-uses-each-tool.json` by `identity_count`, then by `lens_viewed` events, and upgrade from the top. Move the tool from `archetypes.txt` to a new block in `roadmaps.txt`; the generator stops producing its archetype roadmap automatically.

### 5.5 Write a flagship lens
Use one when the same tool is used very differently by a group of identities (the "Excel for financial modelling ≠ Excel for engineering" test). Follow the format in `lenses.txt`:
- priority modules;
- 1–3 extra modules specific to the work;
- why;
- what's different;
- starter project;
- pitfalls;
- pairs-with.

Keep each to one screen.

### 5.6 Add or adjust a skill
Skills group needs into things people want to get good at ("Video creation and editing"). Every need must belong to at least one skill. Add everyday search words to `skill_keywords.txt` when people search for a skill in words we don't match ("mixing", "passwords"). Then run the skill tests.

## 6. Tool lifecycle (renamed, acquired, discontinued, changed)
| Event | What to do | Users see |
|---|---|---|
| **Renamed** (e.g. product rebrand) | Keep the slug (URLs must not break). Change the display name, and add the old name as a search alias in the registry line note and in `skill_keywords` if relevant. Add a redirect if the slug must change (03 §4 redirects file). | "Formerly {old name}" for 12 months |
| **Acquired / merged** | If the product continues, update the publisher. If it's folded into another product, treat it as discontinued with `replaced_by`. | Banner: "Now part of {X}" |
| **Discontinued** | Mark it retired with `replaced_by` (or none; registry lifecycle fields are backlog item B-1, §13). Remove it from needs (so it's never recommended) but keep its page for 12 months with a "No longer available, try instead…" banner, then redirect. Its roadmap stays readable but `noindex`. | Banner + alternatives |
| **Free plan removed / price change** | Registry entries make no pricing claims, so nothing changes there. Update full profiles with a source and today's `last_verified`. | Updated profile |
| **Major new version** (e.g. new UI) | Review its signature line and roadmap topics. Bump `last_reviewed`. | — |
| **Safety or legal concern** (data breach, scam reports, banned in a market) | Escalate to the product owner the same day. Options: add a caution note with a source, remove it from recommendations, or retire it. Never make accusations without an official or reputable source. | Caution note |

**Worked examples from the V2.2 link check (21 Oct 2026):** Lexicomp became *UpToDate Lexidrug* (renamed: display name changed, slug kept, old name in brackets so searches still match). Interactive Petrophysics moved from Lloyd's Register to *Geoactive* (publisher changed, link updated). Microsoft Lens was *retired* in Dec 2025 (removed from needs, registry and roadmaps; the V2.2 shortcut until B-1 exists is to delete the lines from `registry.txt`, `needs.txt`, `archetypes.txt` and `signatures.txt`).

## 7. Quality checklists

**Before merging any change (reviewer):**
- [ ] Rebuild ran; both validators show 0 errors; search harnesses all pass.
- [ ] Official link opens and is the vendor's own site (not an affiliate, reseller or video platform).
- [ ] No pricing, platform or feature claims without a source (registry entries make none).
- [ ] Plain language at about a 12-year-old's reading level; no hype ("best", "revolutionary").
- [ ] New identities: aliases cover the common and regional names; sensitive life roles are added to the privacy list.
- [ ] New tools: they appear in ≥ 1 need and therefore ≥ 1 skill, and have a signature line.
- [ ] Nothing hides content from anyone (identities are lenses, never permissions).

**Monthly health check:**
- [ ] Broken official links: 0 older than 7 days.
- [ ] Registry entries with `url_status: to_confirm`: falling.
- [ ] Full profiles not verified in 6 months: < 10%.
- [ ] Zero-result rate (searches): below 10% and falling.
- [ ] Identity-miss queries seen ≥ 3 times: all triaged.
- [ ] Roadmap coverage ≥ 90% (gate) and handwritten or validated roadmaps rising each quarter.

## 8. Using AI to draft, with a human approving
AI is good at drafting catalogue lines quickly. It must never publish on its own.
- **What AI may draft:**
  - signature lines from a tool's official documentation;
  - aliases for a profession in several countries;
  - candidate needs for a new identity;
  - roadmap module drafts;
  - the monthly launch scan ("List notable new tools launched last month for {sector}, with official URLs").
- **What a human must do:**
  - open every URL;
  - check every factual claim against the official site;
  - delete anything vague or promotional;
  - make sure the result matches the formats in §2.
- **Prompt templates** live in `spec-assets/admin/prompts/` (to be created by the admin). The tone and format rules come from 07.
- **Disclosure:** guidance remains labelled with its `expert_validation` status. "AI-drafted" content is never presented as expert-reviewed.

## 9. The admin console (recommendation)
The editing model is: source files in Git → pull request → CI rebuild and checks → reviewer approves → merge publishes (D-012). The question is how a **non-technical admin** edits those source files comfortably.

| Phase | Tooling | Fits |
|---|---|---|
| **Now (MVP)** | GitHub web editor on the source `.txt` files. CI runs `rebuild_all.sh` and posts the validator output and a preview URL (Cloudflare Pages preview) on the pull request. A one-page cheat-sheet with the line formats (§2). | A careful admin; zero extra infrastructure |
| **R1.5 (recommended once the admin is hired)** | A **Git-based CMS** (Decap CMS or Sveltia CMS, per D-012) with form screens: "Add tool", "Add profession", "Add need", "Edit skill". Each screen writes to the source files and opens a pull request. Forms give dropdowns for categories, task families, sectors and archetypes, so typos can't happen. To make this easy, split the big `.txt` files into one small YAML file per tool, need and identity, and update the generators to read them (backlog item B-2, §13). | A non-developer admin |
| **R2 (if volume grows)** | A small custom admin app behind Cloudflare Access, using the same forms plus the intake dashboard (zero-results, identity misses, broken links, the corrections inbox) and one-click "Create ticket". Still writes to Git, so history and review are kept. | A team of editors |

**The admin report** (build it with the R1.5 CMS, or as a static page generated nightly) shows:
- top zero-result queries;
- identity misses (≥ 3);
- broken links;
- open corrections;
- the "most-needed, least-deep" list: tools ranked by identity reach, with their roadmap tier;
- coverage KPIs (§10).

**Access and safety:**
- Two-person rule: every change is approved by a second person (CODEOWNERS). During the solo-admin phase, the owner reviews weekly in batches.
- Use GitHub accounts with two-factor authentication.
- The corrections repo is private, because submitted emails are personal data (12).

## 10. KPIs for the catalogue (monthly)
| KPI | Target |
|---|---|
| Roadmap coverage of registry tools | ≥ 90% (gate); currently 100% |
| Tool-specific roadmap content (signature or handwritten) | ≥ 90%; currently 100% |
| Handwritten or expert-validated roadmaps | +20 per quarter |
| ISCO-08 unit groups with at least one identity | 436 / 436 |
| Identity search test set | 100% |
| Zero-result search rate | < 10%, falling |
| Identity-miss queries (≥ 3 occurrences) triaged within 14 days | 100% |
| Broken official links older than 7 days | 0 |
| Corrections answered within 7 days | ≥ 90% |
| Full profiles verified in the last 6 months | ≥ 90% |

## 11. Hiring the admin
**Role title:** Catalogue Admin (Digital Tools & Careers). Part-time (2–3 days a week) during MVP; full-time if traffic and the expert programme grow.

**Purpose:** keep Digital Advantage's directory of professions, skills, tools and course outlines accurate, complete and current, so anyone can find what matters for their work.

**Responsibilities:**
- Run the routine in §4 and the recipes in §5.
- Triage suggestions, corrections and search gaps.
- Research new tools from official sources.
- Write clear, plain-language catalogue entries and course outlines.
- Coordinate sector experts and record their reviews.
- Report the KPIs in §10 monthly.

**Must have:**
- Excellent written English in plain language.
- Meticulous with facts and sources.
- Broad curiosity about many kinds of work (not only tech).
- Comfortable learning simple structured text formats and the GitHub web editor (training provided).
- Sound judgement about privacy.

**Nice to have:**
- Experience in librarianship, knowledge management, technical writing, careers advice, instructional design or content operations.
- Familiarity with ISCO/ESCO or other job classifications.
- A second language.
- Experience using AI assistants responsibly.

**Not required:** programming.

**Trial task (2 hours):**
1. Add three tools, with signature lines and needs.
2. Add five aliases from a list of regional job titles.
3. Triage ten sample corrections.
4. Write one paragraph explaining a lifecycle decision.

**First 30 / 60 / 90 days:**
- **30:** run the weekly routine solo, with confirmed URLs for all registry entries.
- **60:** first quarterly coverage audit, with 10 roadmaps upgraded.
- **90:** expert programme pilot in two sectors, and the admin report in use.

## 12. Escalate to the product owner when…
- A change would hide or rank content by identity (against D-047, "lenses, never permissions").
- A tool raises a legal, safety or ethics concern.
- Someone asks to be paid for placement or ranking (non-commercial MVP, D-001; monetisation principles in 19: discovery is never pay-to-rank).
- A request involves storing personal data about visitors.
- A sector expert disputes guidance and the admin can't resolve it with sources.

## 13. Admin tooling backlog (small build tasks to schedule before or soon after hiring)
| ID | Item | Why |
|---|---|---|
| B-1 | Registry lifecycle fields: `status` (active, renamed, retired), `replaced_by`, `former_names`, read by `build_identity.py` and the tool page banner | §6 lifecycle without hand edits |
| B-2 | One-file-per-record YAML sources plus Decap/Sveltia CMS forms | Non-technical editing (§9) |
| B-3 | Nightly admin report page (zero-results, identity misses ≥ 3, broken links, corrections, most-needed-least-deep, KPIs) | §3 intake in one place |
| B-4 | Implement the `identity_no_match`, `explore_mode_changed` and `skill_selected` events (spec in `spec-assets/analytics/events.json`) | Intake and entry-point data |
| B-5 | Suggestion types in the corrections form (suggest tool, identity or need; roadmap feedback; tool discontinued). Schema and vocabulary are already updated | Public intake |
| B-6 | `spec-assets/admin/prompts/` with AI drafting templates (signature line, aliases, launch scan) | §8 |
| B-7 | CI job: run `rebuild_all.sh`, fail if any generated file differs from the committed one (catches hand edits) | Keeps sources authoritative |

## 14. V2.3 — the suggestion queue is the main inbox
With open contribution (doc 22), most new work arrives as **Suggest an edit** issues in `da-corrections`, labelled by type.

**Routine changes:**
- **Daily** (10–20 min): triage new suggestions with an outcome label: `accepted`, `accepted-with-edits`, `needs-source`, `duplicate` or `declined` (with a reason).
- **Weekly:** turn accepted suggestions into source-line edits and pull requests. Label visitor-visible ones `user-visible` and carry `credit-consented` through, so What's new and credits update automatically.

**Targets (add to §10 KPIs):**
- median time from suggestion to live ≤ 7 days;
- 0 suggestions untriaged after 7 days;
- share of accepted suggestions published with credit (shows contributors feel thanked).

**Rules:** follow 22 §3.4 (who approves what) and §3.5 (guardrails).

## 15. V2.5 — Helpers and the feature matrix
**Edit a helper:** open `spec-assets/taxonomy/source/helpers.txt`.
- A helper is `=helper slug | Title | identity slugs | promise`, then `intro:`, then `@stage` blocks with `- tool | need | what you do | first win` lines and a `done:` line.
- Limits: 3 to 8 stages; 1 to 6 steps per stage; 1 to 5 "done" lines. Every tool, need and identity slug must already exist.
- Run `bash spec-assets/generators/rebuild_all.sh`. The build fails with the helper and path when something is wrong.

**Add a helper:** add the block, rebuild, write the full guides for its tools in `pilot_profiles.txt` (mark `review_status: pending` until checked), then add the slug to the `listed` array of the `helpers` flag. The helper appears at `/helpers` after the next release.

**Write a tool guide:** add a block to `pilot_profiles.txt` with the official page open beside it. Say what the tool is, who it suits, how it is priced *in words* (no figures that will go stale), the first-hour steps, the traps and what to learn next. Date and source anything about price or limits.

**Edit the home page's popular chips and ribbon:** `spec-assets/config/home-featured.json`. Choose recognisable roles across many sectors. Slugs are validated.

**When the owner asks for a new feature:** add a row to `spec-assets/qa/feature-matrix.csv` and the matching decision, requirement, screen and test (23 §2). `validate_feature_matrix.py` tells you what is missing.

**New KPIs (add to §10):** helpers started per week; first-stage completion rate per helper; stage with the most drop-off (from aggregate events); tools in listed helpers still on "Guide in progress" (target 0 within 4 weeks of listing).

## V2.7 additions — profiles, kits and safety
- **Verify a profile.** Open the official pricing page. Add a line to `source/profile_verified.txt`: `slug | what you checked | source | date`. Then update that tool's `pricing_model`, `free_tier` and `price_note` in `tool_profiles.txt` to match what you saw. Run `rebuild_all.sh`. The Preview label shrinks to what is still unchecked. Do this first for tools in kits.
- **Add a kit.** One line in `goal_kits.txt` (goals must exist; three to twelve; add the phrases people type). The build tells you what is wrong.
- **Add a safety rule or keyword.** Edit `goal_safety.txt`. Keywords match the start of a word in a goal's slug, label and search words.
- **Never** remove the Preview label by hand, or write a price into the registry without a source.
