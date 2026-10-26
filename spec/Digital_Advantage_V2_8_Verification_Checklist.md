# Digital Advantage V2.8: Verification Checklist (updated after pilot round 1 and the design patch)

**Replaces:** `Digital_Advantage_V2_7_Verification_Checklist.md`
**Covers:** Product Pack V2.7 + V2.8 Design Patch + pilot round 1 (17 responses)
**Date:** 26 October 2026
**Purpose:** a list of things to check. It still does not fix the spec; where the V2.8 patch proposes a fix, the item says so and asks you to verify it.

**Result key:** ✅ Confirmed · ❌ Not an issue · ⚖️ Accepted as-is (say why) · ❓ Needs owner decision
**Status tags on V2.7 items:** ✅ addressed by V2.8 (verify) · 🟡 partly addressed or proposed · 🔺 priority raised by pilot evidence · *(no tag)* still open, unchanged

---

## What changed since the V2.7 checklist
- **New section P:** pilot round 1 learnings that need verifying or acting on.
- **New section Q:** verify the V2.8 design patch itself.
- **New section R:** verify that the app build matches the concept (fidelity gates).
- **Sections 0–14 are kept** with status tags. Three items are now addressed by the patch (5.7, 11.1, and the iPhone bugs under P), seven are partly addressed, and three have higher priority because of pilot evidence (2.5, 5.2, 9.1).

## Priority order now
1. **P-1, P-2, P-3** (iPhone bugs, learning paths not "for me", no clear next step): pilot detractors came from these.
2. **Q-1 to Q-5** (patch integrity) before handing the patch to Claude Code.
3. **Sections 2, 5, 6** from V2.7 (precedence, roadmap quality, privacy/SQL).
4. **R** at every screen the build delivers.

---

## P. Pilot round 1 learnings (evidence: doc 27)
| # | Check | Where / how | Evidence from round 1 | Result |
|---|---|---|---|---|
| P-1 | [ ] **iPhone layout bugs reproduced and fixed.** Reproduce "text cut off or covered" and "a button did nothing" on iPhone Safari (375 and 390 px) with the helper bar open. | Pilot build; ask the Accountant and EA testers for the page and screenshot | 1 "text cut off" (Accountant, iPhone), 1 "button did nothing" (EA, iPhone) | |
| P-2 | [ ] **Learning paths for pilot roles.** For each pilot role (accountant, analyst, consultant, entrepreneur, content creator, designer, trader, portfolio manager, EA, BA, fashion designer), check whether their top 3 tools have a job-specific path or lens, or only a general guide. | `generated/lens-index.json`, roadmap `authoring`, doc 31 §4 rule | 8/17 neutral on "written for me" | |
| P-3 | [ ] **Every pilot page ends with a next step.** Walk identity → goal → tool → path → helper in the pilot build and note pages with no clear next action. | Pilot build | 7/17 neutral on "I know my next step" | |
| P-4 | [ ] **Where people got stuck on Task 2 and Task 3.** Contact the 4 people who reported getting stuck and ask for the exact screen. | Follow-up through the person who sent the form (14 agreed) | Task 2: 2 stuck · Task 3: 2 stuck, 1 with difficulty | |
| P-5 | [ ] **Helper bar comprehension.** Ask the 4 who didn't benefit what they thought it was. Check the V2.8 coach mark wording answers it. | Doc 28 §4, screen 15 | 2 didn't understand, 1 didn't see, 1 in the way | |
| P-6 | [ ] **Promise test.** Show 5 new people the V2.8 home for 10 seconds, ask what the site is for, and count how many say "find and learn the tools for my job". | Screen 01 / app home | 10/17 described it that way; others said LMS, outsourcing, professional support | |
| P-7 | [ ] **Colour and density.** Review the pilot build's busiest pages against the D-095 budget (≤ 3 hues, 1 primary button in view, ≤ 6 cards before See all). | Pilot build vs screens 01, 04, 07 | "Loud colours, too much information" | |
| P-8 | [ ] **Trust signals.** List which pilot pages showed price without a verification label or source. | Pilot build | 6/17 neutral on trust | |
| P-9 | [ ] **Need mismatch.** For the 8 who said needs only "partly" matched, find their role and check the identity→need map in `identities.json`. | `spec-assets/taxonomy/identities/identities.json` | 8/17 "partly" | |
| P-10 | [ ] **Missing occupations.** Ask the entrepreneur who requested more occupations which ones; check whether they exist as aliases. | Follow-up; `aliases` in identities | 1 request | |
| P-11 | [ ] **Sample bias.** Confirm round 2 recruits match `qa/pilot-round-2-form.md` (≥ 10 Android, ≥ 6 not confident, ≥ 8 outside office jobs). | Recruitment list | Round 1: 12/17 iPhone, 0 not confident, 13/17 employed | |
| P-12 | [ ] **Form fixes.** Confirm round 2 uses the new "why" follow-ups and the before-you-start promise question. | `qa/pilot-round-2-form.md` | 2 blanks on "clear what to do first"; few open answers | |
| P-13 | [ ] **Photo tier B replacement plan.** Decide when to commission photos to replace the 7 tier-B images. | `assets/photos/manifest.json` | — | |

## Q. Verify the V2.8 design patch
| # | Check | How | Expected | Result |
|---|---|---|---|---|
| Q-1 | [ ] Tokens are in sync | `node tools/build-tokens.mjs && git diff --exit-code design/tokens` | No diff | |
| Q-2 | [ ] Reference stylesheet passes its own lint | `node tools/check-design.mjs design/components` | 0 errors, 0 warnings | |
| Q-3 | [ ] Reference self-test | `npx playwright install chromium && node tools/design-audit.mjs --reference` | 108 checks, 0 failing | |
| Q-4 | [ ] Lint catches violations | Put a file with a hex colour, an Arial font, a `lucide-react` import and an Unsplash URL in `src/`, run check-design | 4+ errors, exit 1 | |
| Q-5 | [ ] Reference screens open and reflow | Open `design/reference/screens/index.html`; resize from 360 to 1440; add `?theme=dark` | No overflow, no broken images, dark works | |
| Q-6 | [ ] Every kit has an icon and hue | `assets/maps/taxonomy-visuals.json` → `kits` | 29/29 | |
| Q-7 | [ ] DepthLabel rule matches data | For 10 tools, compute the label from doc 31 §4 and compare with what the build shows | All match | |
| Q-8 | [ ] Tool monograms cover the registry | Count `assets/tool-logos/monogram/*.svg` | 1,781 | |
| Q-9 | [ ] Fonts licence | `design/fonts/OFL.txt` present; fonts not modified | Present | |
| Q-10 | [ ] Font decision | Owner confirms D-091 (concept fonts) or asks to revert | Decision recorded | |
| Q-11 | [ ] Precedence decision | Owner confirms D-105 | Decision recorded | |
| Q-12 | [ ] New tests merged | TC-169 to TC-188 appended to `spec-assets/qa/acceptance-matrix.csv`; events and flags added (doc 31 §6) | Present | |
| Q-13 | [ ] Feature matrix updated | Add rows for D-092 to D-104, then run `validate_feature_matrix.py` | 0 errors | |
| Q-14 | [ ] Photo alt text read by a person | Read all 11 alt texts in the manifest | Accurate, no stereotypes | |
| Q-15 | [ ] Generated-image disclosure | Decide whether the site credits AI-generated imagery (e.g. on the About page) | Decision recorded | |

## R. Build fidelity (run for every screen Claude Code delivers)
| # | Check | How | Expected | Result |
|---|---|---|---|---|
| R-1 | [ ] `CLAUDE.md` is in the repo root and Claude Code was told to read it | Repo | Present | |
| R-2 | [ ] Global CSS imports fonts, tokens and `da.css` | `src/styles` | Doc 29 §4 order | |
| R-3 | [ ] CI design job is active | `.github/workflows/design.yml` | Runs on every PR | |
| R-4 | [ ] Pre-commit hook installed | `.husky/pre-commit` or `.git/hooks/pre-commit` | Blocks a hex colour | |
| R-5 | [ ] Route mapped | `design/fidelity.config.json` | Route not null | |
| R-6 | [ ] Static lint | `npm run design:check` | 0 errors | |
| R-7 | [ ] Runtime audit | `npm run design:audit -- --only <screen>` | 0 failures (phone + desktop, light + dark) | |
| R-8 | [ ] Side-by-side review | `design-audit-report/index.html` | Layout, hierarchy, spacing, colour use and imagery match the reference | |
| R-9 | [ ] Sign-off recorded | `design/SIGNOFF.md` | One row per viewport/theme | |
| R-10 | [ ] Baselines committed | `tests/visual` snapshots | Present after sign-off | |
| R-11 | [ ] Real-device check | iPhone (Safari) and a mid-range Android (Chrome) | Nothing cut off; tab bar and helper bar never cover content | |
| R-12 | [ ] Lighthouse mobile | Home, goal, tool | Performance ≥ 90, Accessibility ≥ 95, CLS < 0.1 | |

---

# V2.7 items (kept, with status)

## 0. Before you start

- [ ] **File type.** Confirm the SharePoint file is a zip archive. Rename it to `.zip` and extract it. Expect 1,964 files.
- [ ] **Version label.** The root folder is named `..._V2_3` but the contents are V2.7. Confirm this is the intended latest pack.
- [ ] **Python environment.** Confirm `python3` and `jsonschema` are available (the CI template pins `jsonschema==4.26.0`).
- [ ] **Node environment.** Confirm `node` plus `minisearch@7.1.2` are installed. The search harnesses could not be run during this review.

---

## 1. Baseline: reproduce what already passed

| # | Check | How to verify | Expected | Result |
|---|---|---|---|---|
| 1.1 | [ ] Full rebuild runs clean | `bash spec-assets/generators/rebuild_all.sh` | All validators report 0 errors; 8 warnings (URLs to confirm) and 54 alternatives warnings | |
| 1.2 | [ ] Rebuild is deterministic | Copy the pack, run the rebuild, then `diff -rq` against the copy | No differences | |
| 1.3 | [ ] Identity search harness | `node spec-assets/search/identity-harness.mjs .` | 48/48 | |
| 1.4 | [ ] Content search harness | `node spec-assets/search/reference-harness.mjs .` | Threshold met | |
| 1.5 | [ ] Goal and kit search harness | `node spec-assets/search/goal-harness.mjs .` | 131/131 (claimed in doc 26 §6) | |
| 1.6 | [ ] Goal harness in CI | Check whether `goal-harness.mjs` is called by `rebuild_all.sh` or `repo-templates/.github/workflows/ci.yml` | Not called in either during review; decide if that is acceptable | |
| 1.7 | [ ] Cross-references resolve | Spot-check that every D-, FR- and TC- id cited in the docs exists | No missing ids were found during review | |

---

## 2. Precedence and document conflicts (critical)

- [ ] **2.1 Precedence rule scope.** 🟡 *V2.8: proposed fix D-105 (doc 31 §1); owner to confirm.* `00_V1_Reconciliation_and_Conflict_Log.md` ranks "V2 documents (01–17)" as #2. Confirm where docs 18–26 rank against 01–17. (Doc 18 and doc 26 each claim to win on their own topics; doc 24 does not.)
- [ ] **2.2 The AI build prompt (doc 17) vs accounts.** 🟡 *V2.8: overridden by D-105 if confirmed; CLAUDE.md now governs UI work.* In `17_AI_Implementation_Master_Prompt.md`, confirm whether these still apply:
  - the "Prohibited" list bans user accounts and recommendations;
  - Milestone F says "Accounts: skip (not in R1)";
  - the stack section says Cloudflare Pages, and the intro says 723 tools.

  Compare against D-076–D-083 and the Launch rows F-35 to F-40.
- [ ] **2.3 Doc 23 internal conflict.** 🟡 *V2.8: D-105 resolves in favour of Launch rows, if confirmed.* §6 "Deliberately not in the MVP" lists user accounts as R2. Rows F-35 to F-38 in §4 ship accounts at Launch. Confirm which is intended.
- [ ] **2.4 PRD scope matrix.** 🟡 *V2.8: D-105, if confirmed.* `01_Master_PRD.md` §6 still lists accounts, sync and personalised recommendations as R2. Confirm whether this matrix is still authoritative.
- [ ] **2.5 Price claims vs Preview profiles.** 🔺 *Raised by pilot: 6/17 neutral on trust. V2.8 makes the Preview label always visible beside price (D-093) but the rule conflict still needs an owner/legal call.* These rules ban showing prices for unprofiled tools:
  - FR-055 and FR-080;
  - D-048;
  - doc 18 §5;
  - doc 04 S09-R;
  - doc 07 §4 and §5;
  - the `note` field on every row of `tools-registry.json`.

  FR-095 to FR-097 and D-084 show an AI-drafted price chip on every tool. Confirm D-084 is meant to override these rules, and that the owner accepts the conflict.
- [ ] **2.6 Doc 23 "Not in MVP" vs AI and recommendations.** Confirm the status of rule-based recommendations (R1–R12) against the §6 line "AI chat or AI-assisted discovery: R2". They are different things, but readers may conflate them.

---

## 3. Hosting move: Cloudflare to Vercel (D-083)

For each file below, confirm whether it still describes Cloudflare.

- [ ] **3.1** `11_Technical_Architecture_and_ADRs.md`: the §1 diagram, §3 repo layout (`functions/` as Pages Functions), §5 failure modes, and ADR-008 deploy target.
- [ ] **3.2** `16_Deployment_and_Operations_Runbook.md`: §1 environments, §2 setup, §4–§6 (wrangler, D1, Pages rollback). The header says "host Vercel", but the body does not match.
- [ ] **3.3** `spec-assets/config/_headers`: this is a Cloudflare-format file. It also has the `*.pages.dev` noindex rule and Cloudflare CSP origins.
- [ ] **3.4** `spec-assets/config/env.example`: check for missing database URL, auth secret, Google OAuth and email-sender variables.
- [ ] **3.5** Spike S-1 (ADR-008, doc 17): confirm whether it should still test "Bun on Cloudflare Pages".
- [ ] **3.6** `12_Security_and_Privacy_Plan.md` §1–§4: secrets listed as "Cloudflare encrypted env vars"; D1 and Cloudflare named as processors.
- [ ] **3.7** `10_API_Specification.md` §5 external services table: only Cloudflare services are listed (no Vercel, Neon or auth provider).
- [ ] **3.8** The rate-limit store and Turnstile on Vercel: confirm where the hashed-IP rate-limit counters will live.
- [ ] **3.9** `spec-assets/db/0001_analytics_counters.sql` vs `0002` Part B: confirm 0001 is retired, and that docs 09 and 16 say so.

---

## 4. API contract

- [ ] **4.1** `spec-assets/api/openapi.yaml` has 6 paths: search-index, records, export, corrections, events and health. Confirm whether the endpoints in doc 10 §7–§11 need to be added:
  - identities, needs, roadmaps, lenses, who-uses and skills;
  - whats-new and flags;
  - all `/me/*`, auth, trending and suggestions;
  - tool-profiles, kits, goal-links, goal-safety, identity-kit-hints and goals-index.
- [ ] **4.2** The doc 10 §1 intro still says "three operations run server code (Cloudflare Pages Functions)". Confirm against §10.
- [ ] **4.3** Confirm the auth/session cookie (doc 10 §10) does not conflict with the "corrections endpoint is cookieless" CSRF reasoning (doc 12 §2) once the same origin sets a session cookie.

---

## 5. Roadmap quality (critical)

- [ ] **5.1 Count the tiers.** Run the rebuild and read the `build_roadmaps.py` line. The review saw this output:
  > `generated {'archetype': 1058, 'archetype+signature': 636} ... tool-specific content 723/1781 = 40.6%`
- [ ] **5.2 Rule check.** 🔺 *Raised by pilot: only 8/17 felt the path was written for them. V2.8 labels these "General guide" (D-094); the content gap stays open (P-2).* Confirm whether the 1,058 plain "archetype" roadmaps break D-056 ("plain archetype-only roadmaps aren't allowed") and doc 20 §5.4 tier 1 ("not allowed").
- [ ] **5.3 Claims check.** These claims may be outdated:
  - doc 20 §10 says tool-specific roadmap content is "currently 100%";
  - doc 18 §6 says 636 generated roadmaps;
  - doc 24 and the CHANGELOG say "roadmaps for all 1,781".

  Confirm none of them now overstates quality.
- [ ] **5.4 Look at the content.** Open these files and judge whether the modules make sense for the tool:
  - `08_Starter_Catalogue/records/roadmaps/scratch.json`: does a kids' coding tool really need "Production-ready / CI/CD / monitoring"?
  - `trainual.json`: "Time, leave and rotas", "payroll compliance";
  - `opay.json`, `raenest.json`, `3mtt.json`, `indrive.json`, `code-org.json`, `tynker.json`.
- [ ] **5.5 Validator gap.** Confirm `validate_identity_layer.py` measures roadmap *coverage* only, not tier. It passed at 100% despite 5.1.
- [ ] **5.6 Kids kit.** For `teach-kids-programming`, list the roadmap tier of each goal's top tools. The review found every top tool except Python on plain archetype.
- [ ] **5.7 On-screen label.** ✅ *V2.8: DepthLabel rule in doc 31 §4; verify with Q-7.* Confirm how a plain-archetype roadmap is labelled. Doc 04 S30-R defines only "in depth", "standard" (archetype+signature) and "Expert-reviewed".

---

## 6. Privacy, consent and the SQL (critical before Launch)

- [ ] **6.1 "Never sent to a server" rules.** These rules say identity and helper progress never leave the device:
  - FR-054 and FR-069;
  - D-053;
  - doc 12 V2.5 table;
  - doc 18 §10.

  Confirm how they apply to signed-in users, given that `PUT /api/v1/me` and `user_identities` / `helper_progress` store them.
- [ ] **6.2 Sensitive life roles.** Confirm whether "Person with a Disability", "Newcomer to a Country", "Family carer" and similar roles can be stored in `user_identities`. Confirm whether counsel has seen this.
- [ ] **6.3 Three consents vs schema.** FR-086 and doc 24 §7 require three switches: save progress, use profile to recommend, and count in trending. In `db/0002_accounts_profiles_postgres.sql`, confirm whether a "recommend" consent column exists. The review found only `consent_profile_at` and `consent_trending`.
- [ ] **6.4 Default-off rule.** `consent_profile_at` is `NOT NULL`. Confirm whether this forces the "save progress" consent at sign-up, contrary to "all off until chosen" (FR-086).
- [ ] **6.5 Star types.** The `stars.kind` CHECK allows skill, tool, goal and helper. Confirm whether kits (starrable per S50) are excluded.
- [ ] **6.6 Trending window.** Doc 24 §10 and FR-090 say "rolling 7 days". `refresh_trending(p_week_start)` counts `week_start` to +7 (a fixed week). Confirm the intended behaviour.
- [ ] **6.7 Activity retention.** The 90-day delete is a commented-out statement only. Confirm where the job is scheduled.
- [ ] **6.8 SQL execution.** Run the migration on an empty Postgres 15+ (Neon test project). Record any errors. The pack itself says it has never been executed.
- [ ] **6.9 Email retention.** Doc 12 V2.3 says suggestion emails are kept "12 months after closing". Doc 07 §8, doc 09 §7 and doc 04 S18 say "until close or 90 days". Confirm which applies.
- [ ] **6.10 Age rule and children.** Confirm counsel has the open items on the 18+ rule, the kids panel wording, cross-border transfer and NDPC registration (doc 12 V2.6/V2.7).

---

## 7. Tool profiles and the Preview label

- [ ] **7.1 Counts.** Confirm 1,781 profiles, with 5 `web_seen` and 1,776 `ai_draft` (`tool-profiles.json` → `verified_count`).
- [ ] **7.2 What "web_seen" means.** Open `taxonomy/source/profile_verified.txt`. Confirm the 5 sources are blog or news articles, not official pages, and have no URLs. Decide whether this meets the "source" requirement in FR-096.
- [ ] **7.3 Validator logic.** In `validate_profiles.py`, confirm that a `web_seen` profile is *not* checked for a Preview label. FR-096 says the label comes off only when the *price* has a source and date. Check whether a profile verified for existence only could lose its label.
- [ ] **7.4 "Free" chips.** Count profiles with `pricing_model: free` (365 in review). Confirm how a guessed "free" chip will render beside a Preview label, given FR-038 ("never Free" unless confirmed) and doc 07 §5.
- [ ] **7.5 Banned superlatives.** Search descriptions for words such as best, top choice, leading, the standard, world's, millions and most popular. The review found 29 profiles. Confirm against doc 07 §4.7 and doc 20 §7.
- [ ] **7.6 Spot-check accuracy** of 10 high-use profiles against official sites: Canva, ChatGPT, CapCut, DaVinci Resolve, Grammarly, Paystack, OPay, inDrive, Jobscan and Scratch.
- [ ] **7.7 Placeholders.** Confirm the 11 unconfirmed placeholder tools named in doc 26 §10 still show as placeholders. `stagebiz` is `free` with `free_tier: unknown`.
- [ ] **7.8 Browser payload.** Confirm the 1.4 MB profile file is never shipped whole to the browser (doc 14 V2.7).

---

## 8. Goals, alternatives and markets

- [ ] **8.1 Same-kind figure.** Confirm 1,728/1,781 = 97.0%, and that the 53 shortfall tools are listed in `generated/alternatives-coverage.json`.
- [ ] **8.2 What the metric means.** Confirm the owner understands "same kind" = same category or archetype, which doc 26 §3 says "does not prove substitutability".
- [ ] **8.3 Goal-list sense check.** Review tool order in high-traffic goals. For example, "Pick the right remote job board" lists `nomad_list` first, and that tool's own profile describes a city and cost-of-living membership site.
- [ ] **8.4 Tools outside needs.** Confirm that 1,057 tools appear in no need list. As a result, Skills pages reach only 724 tools. Decide whether that matters for the Skills entry path.
- [ ] **8.5 Who-uses gaps.** Confirm 7 tools have zero identities in `who-uses-each-tool.json`: africa-check, any-do, joplin, microsoft-to-do, simplenote, sunsama and ticktick.
- [ ] **8.6 Registry URLs.** Confirm all 1,781 registry rows are `url_status: to_confirm`, so the weekly link check has never run.
- [ ] **8.7 Availability.**
  - Confirm Uber (`tool_availability.txt`, not available in ng since 2026-09) is correct; the shutdown was announced 2 Sept 2026.
  - Confirm Showmax is fully removed (it closed 30 April 2026). The review found `showmax` still mentioned in the search words of the goal `watch-and-stream-entertainment` in `goals.txt`.
- [ ] **8.8 Other closures.** Doc 26 §10 notes that other closed or changed services may exist (Chimoney and Allawee are named). Confirm whether each is in the registry and handled.
- [ ] **8.9 Local-tool counts.** The CHANGELOG says 98 ng and 58 africa, but `validate_goals.py` printed "local tools 130". Confirm which count is meant.

---

## 9. Kits, safety tags and suggestions

- [ ] **9.1 Kit hint spread.** 🔺 *Raised by pilot: needs only "partly" matched for 8/17; generic hints make it worse.* In `identity-kit-hints.json`, count identities shown `get-a-remote-job`. The review counted 2,129 of 2,603 (81.8%) and 91 distinct triples. Check this is acceptable for, e.g., nurse, pastor, motorcycle-taxi-rider, bricklayer and retiree.
- [ ] **9.2 Safety tag false positives.** Doc 26 §5 admits keyword over-tagging. Confirm with examples from `goal-links.json`:
  - kids: "Organise a wedding or big family event", "Draft in CAD for free", "Send money abroad or to family";
  - jobs: "Watch my crops from satellite images", "Transcribe an interview";
  - health: "Watch my crops from satellite images";
  - money: "Navigate without mobile data", "Build a quick petrophysical calculation";
  - official-fees: "Run a whiteboard brainstorm with students", "Make a simple 3D model to print".
- [ ] **9.3 Nigeria-only help bodies.** `goal_safety.txt` points to EFCC, SEC Nigeria, CBN, NAFDAC, CAC and NDPC. Confirm how these show on goals tagged `all` for non-Nigerian visitors.
- [ ] **9.4 Human read of panels.** Complete the manual check in doc 15 V2.7: read ten safety panels (jobs, money, kids first) and confirm none implies a tool is safe or verified.
- [ ] **9.5 Anonymous suggestions.** Confirm R9–R12 store nothing new for anonymous visitors (FR-106, TC-166). R10 reads the on-device identity.

---

## 10. Flags, tests and the feature matrix

- [ ] **10.1 Flag vs stage mismatch.** In `config/feature-flags.json`, `outcome_prompt` and `suggestion_status` are ON in beta. Doc 24 §14 puts the outcome prompt and suggestion status at Launch, and both need accounts or server storage. Confirm intent.
- [ ] **10.2 Release-gate values.** `qa/acceptance-matrix.csv` uses "Launch" once (TC-125). The other gates are Beta, Soft launch and Public launch. Confirm the meaning of "Launch".
- [ ] **10.3 Test status.** All 168 tests are "Not run". Confirm this is the expected state for a spec-only pack.
- [ ] **10.4 Matrix check.** Run `python3 -I spec-assets/validate_feature_matrix.py .`. Expected: 48 features, 0 errors. Confirm it checks references only, not behaviour (doc 23 §8).

---

## 11. Design, accessibility and performance

- [ ] **11.1 Motion rule conflict.** ✅ *V2.8: infinite animation removed (D-095).* The IdentityRibbon (06 §12.3) drifts continuously, but 06 §7 bans "infinite animations". Confirm which rule wins.
- [ ] **11.2 Missing V2.6/V2.7 coverage.** 🟡 *V2.8: visuals now covered by doc 28 + design/; doc 05 journeys still missing.* Confirm whether these docs need V2.6/V2.7 sections:
  - doc 05: journeys for goals, kits, sign-in and workbench;
  - doc 06: components for price chip, Preview label, safety panel, kit step and intent chip;
  - doc 13: accessibility for sign-in sheet, safety panel and suggestion cards.
- [ ] **11.3 Prerender size.** ADR-008 estimates about 3,700 routes. The review estimated about 8,700 at V2.7 (2,603 identities, 1,781 tool pages, 1,781 roadmaps, 1,033 lenses, 1,050 goals, kits, needs and skills), which means about 17,000 files. Confirm against the Vercel build limits.
- [ ] **11.4 Search index budget.** Measure the gzip size of the goal and kit index against the 60 KB budget. Doc 26 §10 says about 226 KB raw.

---

## 12. Housekeeping and consistency

- [ ] **12.1 Old version headers.** Confirm whether docs 00, 01, 02, 04–07, 09–13, 18, 20 and 22 should carry V2.6/V2.7 version headers (they show 2.1–2.5).
- [ ] **12.2 Old counts.** Search for 723, 1,479, 633, 6,519 and 667 in current-tense statements, e.g. docs 17, 18 and 20 and `08_Starter_Catalogue/README.md`.
- [ ] **12.3 README contents table.** Confirm docs 24, 25 and 26 are listed.
- [ ] **12.4 Duplicate section numbers.** Doc 01 has two "§12"; doc 03 has two "§8".
- [ ] **12.5 Broken table rows.** In the doc 02 V2.6 table, rows D-084 to D-090 have 5 cells against a 6-column header.
- [ ] **12.6 CHANGELOG order.** The 2.4 entry sits below 1.0. Confirm the order.
- [ ] **12.7 Repo assumption.** Doc 25 names `github.com/tiwaomotosho/divantage` and assumes its folder paths. Confirm the paths against the real repo tree.
- [ ] **12.8 Doc 25 tests.** Doc 25 covers V2.6 steps only. Confirm whether V2.7 build steps (doc 26 §11, doc 17 "V2.7 additions") should be added and tested there.

---

## 13. Open decisions (owner, not reviewer)

- [ ] **D-091** fonts: keep Schibsted Grotesk + Inter (concept) or revert to Bricolage + Atkinson (spec)
- [ ] **D-105** precedence order (doc 31 §1)

- [ ] D-019: brand name and domain (Whoolkit recommended; trademark and domain checks not done)
- [ ] D-027: launch markets and legal review (NDPA 2023 consent, retention, transfer, age rule)
- [ ] D-061: licences (MIT + CC BY 4.0, or AGPL-3.0)
- [ ] D-018: uptime monitor and alert address
- [ ] D-077 / ADR-010: auth stack (Spike S-2: Auth.js vs Clerk vs Supabase Auth)
- [ ] D-012 (R1.5): Git-based CMS UI
- [ ] D-050 (post-MVP): monetisation model

---

## 14. Not covered by this review

- [ ] The 12 archived V1 reference files in `00_Reference/` (about 17.7k words) were not audited line by line.
- [ ] Search harnesses were not run (minisearch was not installed).
- [ ] The SQL was not executed.
- [ ] Individual records were sampled, not exhaustively read: 1,725 roadmaps, 1,781 profiles and 1,050 goals.
- [ ] **New:** the pilot build itself was not inspected; pilot findings come only from the 17 form responses.
- [ ] **New:** the V2.8 audit was run against the reference screens, not against an app (no app build was available).

---

**Sign-off**

| Role | Name | Date | Notes |
|---|---|---|---|
| Reviewer | | | |
| Product owner | | | |
| Counsel (section 6) | | | |
