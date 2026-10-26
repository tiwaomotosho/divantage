# DIGITAL ADVANTAGE — Product & Design Specification Pack **V2.8**
**Version:** 2.8 · **Date:** 26 October 2026 · **Status:** Implementation baseline: build the three starter helpers on Bun + Vite + React, then a private beta · **Working name:** *Whoolkit* (recommended, D-059; final brand is D-019) · **Business model:** Non-commercial through MVP (approved); monetisation options for after MVP in doc 19

## What's new in V2.8: pilot learnings, the UI/UX concept and a design fidelity contract
- **Pilot round 1 (doc 27):** 17 responses turned into changes. iPhone layout bugs, unclear next steps, weak trust signals and "paths not written for my job" drive the rest.
- **One promise (D-104):** "Find the tools people in your job use. Learn them step by step." Every tool page ends with a next step and "Learn {tool}" (D-092); price and claims carry a TrustLine (D-093); every learning path says whether it is **For {job}**, **In depth** or a **General guide** (D-094).
- **Calm design (docs 28 to 30, D-095 to D-103):** colour and button budget, closed photo and icon sets, monogram tool logos, helper explainer with first-run coach mark, phone shell safety, need feedback, Suggest my role.
- **Design fidelity contract (doc 29, D-099):** tokens generate CSS, TypeScript and Tailwind; a static lint and a runtime audit fail the build when a screen drifts from the reference. Builders read `CLAUDE.md`.
- **Fixes to V2.7:** safety false positives, kit hint spread, superlative descriptions, SQL consents, rate-limit table, Vercel configuration, email retention. Status of every checklist item: doc 32.
- **Read:** docs 27 to 32. 20 new tests (188), 8 feature rows (56), 60 events, 38 flags.
- **Needs you:** D-091 fonts, D-105 precedence order, D-019 brand, D-027 legal and markets, D-061 licences. **Supplied separately by you at the build point (on purpose):** the patch's asset files, PNG references and concept board PDF. See `ASSETS_AT_BUILD.md`.
- **Not done:** no app, SQL not run on Neon, no counsel review, role-specific paths not written.

## What's new in V2.7: tool profiles, goal kits, safety and discovery
- **Every tool has a profile (D-084):** a short paragraph, pricing model, free-tier flag and price note, for all 1,781 tools. Unchecked ones carry a **Preview** label that says what is unchecked. Honest status: 5 are partly web-checked (for what the tool is, not its price); 1,776 are AI-drafted.
- **Same-kind alternatives 59% → 97.0% (D-085),** with a build gate at 95%.
- **Goal kits (D-086):** 29 paths such as *Get a remote job*, *Edit a short video*, *Teach kids programming*, *Become a freelancer*, *CV, portfolio and proofreading pack*. 1,050 goals (was 633) and 1,781 tools (was 1,479).
- **Safety notes (D-087):** nine rule sets on 498 goals, with red flags and where to get help.
- **Easy to find and connected (D-088):** seven entry paths, natural-language search ("I want to get a remote job"), 3+ related goals each. 131 search tests pass.
- **Suggestions for people who do not search (D-089)** and a **Technology Education pillar (D-090).**
- **Read:** doc 26. 18 new tests (168), 8 feature rows (48), 53 events, 33 flags. New validators: `validate_profiles.py`, `validate_discovery.py`.
- **Not done:** no app, no executed SQL, no legal review, no human or domain-expert review of the new data. Prices in profiles may be wrong, which is why the label exists.

## What's new in V2.6: goals, alternatives, accounts and recommendations
- **Positioning (D-075):** use technology to **compete, grow and scale**. Every need has intents; three chips on home.
- **Goals (D-071):** 633 outcome-phrased goals under 279 needs (1,050 in V2.7); jump straight to a goal (search includes tool names).
- **Alternatives and more tools (D-072, D-073):** registry 723 → **1,479** (1,781 in V2.7); each tool lists up to 7 alternatives derived from goals. Honest figure: 94.8% have 7 *listed*; about 59% have 7 of the same category or archetype. The 756 new tools are unverified stubs.
- **Nigeria and Africa (D-074):** local tools and goals (inDrive, Bolt, Paystack and more), Nigeria-first ranking, availability notes (Uber left Nigeria in Sep 2026; Showmax closed Apr 2026).
- **Optional sign-in after value, stars, My workbench (D-076 to D-079):** no gating; works on-device first.
- **Recommendations without machine learning (D-080) and trending (D-081):** rules R1 to R8; trending hidden until there is enough use, with a privacy floor of 10.
- **Retention loop (D-082), Vercel (D-083):** continue card, saved outputs, outcome prompt, suggestion status.
- **Read:** doc 24 (what and why) and doc 25 (how to build it in your existing repo). 18 new tests (150 in total), 11 feature rows (40), 47 events, 28 flags.
- **Not done:** no app, no executed SQL, no legal review, no human review of the new goal and tool data.

## What's new in V2.5: helpers, one checklist for every feature, and your stack
- **Helpers (D-066):** the journeys are now **helpers**. A helper is a guided path that **follows you across the app**: a small panel shows your stage and next step on every page, remembers your place on your own device, and never sends your progress anywhere. New screens S39 (Helpers), S40 (Helper page) and S41 (Helper panel).
- **A third helper, Entrepreneur (D-067):** test the idea → plan → look credible → sell → keep the books → grow → pitch. 7 stages, 23 tools (Paystack, Flutterwave, Selar and WhatsApp Business included). 19 of those tools still need full guides (22 §5.4).
- **"Level with every feature you've shared" (D-068, doc 23):** one table lists each of your requests in plain words, with the decision, requirement, screen and test that cover it and when it ships. A script (`spec-assets/validate_feature_matrix.py`) fails if anything is missing, and each feature flag now has a **launch value** so nothing stays switched off by accident. The admin report moves into the MVP.
- **Your stack (D-069, ADR-008):** **Bun, Vite and React** with React Router, prerendered to static files on Cloudflare Pages. It replaces the Astro default. Because React sends more JavaScript than Astro, the performance budgets are reset, and a **day-1 spike** measures build time, bundle size and security settings before anything else is built. If the spike fails, Astro with React islands is the fallback.
- **Very visual and sleek (D-070, 06 §12):** mobile-first principles, a bottom tab bar on phones, the route rail, helper cards, the identity ribbon, dark theme. Colours and typefaces stay as they were (already contrast-checked); a designer or you sign off the look.
- **Also new:** 14 tests (TC-119 to TC-132, 132 in total), 4 aggregate events for helpers (29), flags `helpers`, `helper_panel`, `helper_for_someone`, a `suggest_helper` suggestion type with an issue form, `helper.schema.json`, `config/home-featured.json`, and 21 AI-drafted tool guides (`pilot_profiles.txt`) waiting for a human check.
- **Not included:** no application code. This pack is the specification only.

## What's new in V2.3: open, early, easy to change
- **Open contribution (doc 22):**
  - every page gets **Suggest an edit** (no account needed);
  - suggestions land in a private review queue, and a person approves each one;
  - approved changes go live in minutes, with optional credit to the contributor;
  - developers can also open pull requests;
  - licences: code MIT, content CC BY 4.0 (recommended; your call);
  - ready-to-use repository files in `spec-assets/repo-templates/`: licences, CONTRIBUTING, code of conduct, issue forms, PR template, reference CI.
- **Beta first:** a private, invite-only beta in about 5 weeks:
  - preview domain, no email collection, aggregate analytics only;
  - the final name, domain and legal review gate the **public** launch, not the beta;
  - then a weekly improvement loop;
  - a ready-to-send WhatsApp invite is in 22 §7.
- **Two starter journeys:**
  - **Musician** (now with a music-release layer: BandLab, DistroKid, TuneCore, Spotify for Artists, Audiomack);
  - **Data Analyst** (toolkit corrected: SQL, dashboards, Excel, cleaning and charts come first, and data pipelines moved to Data Engineers);
  - the **Pilot 20** tools on these journeys get full, verified depth first.
- **Built for easy change:**
  - feature flags (`spec-assets/config/feature-flags.json`);
  - a preview link for every change;
  - merge = deploy;
  - one-click rollback;
  - a What's new page generated from merged changes.
- **New screens:** S36 Suggest an edit, S37 What's new, S38 Contributors, beta banner. **New tests:** TC-107 to TC-118 (a new "Beta" gate).
- **Fixes:**
  - automatic lens titles now read "Using Power BI to build dashboards and reports";
  - archetype count corrected to 49.

## What V2.2 introduced
- **Exhaustive occupations:**
  - **2,603 identities** (2,239 professions, 326 specialisms, 38 life roles) with 4,047 searchable names;
  - **all 436 ISCO-08 unit groups** covered, so the international standard is the definition of "exhaustive", and the validator enforces it;
  - the full list is in `08_Starter_Catalogue/occupations/` (CSV + Markdown).
- **Musicians are covered:** 61 music identities, from Musician, Singer, Songwriter, Composer, Music Producer, Conductor, DJ and Rapper to Talking Drummer, Kora Player, Afrobeats/Highlife/Fuji/Juju/Jazz/Gospel musicians, Mixing and Mastering Engineers, Music Teacher, Piano Tuner, Musical Instrument Maker and Worship Leader. They sit within 100 Music & performing-arts identities.
- **A course outline for every tool:**
  - 723 of 723 registry tools (100%; the minimum standard of 90% is a build gate), with 6,519 modules;
  - 31 in-depth handwritten roadmaps (87 tools);
  - 636 "standard" roadmaps, each built from one of 49 tool-type templates **plus that tool's own signature and advanced skills** (Revit → Dynamo and worksharing; TradingView → Pine Script; Epic → SmartSets);
  - 1,032 renderable lenses.
- **More than one way in:**
  - "Who are you?" stays the front door;
  - an **Explore by** switcher adds *What to do · Skills · Tools · Sectors*;
  - a new **Skills** entry point: 63 skills in 9 groups, two new screens, and cross-suggestions in every search box.
- **Admin manual (doc 20):** how to keep the catalogue current, including:
  - intake;
  - daily to yearly routine;
  - how to add a tool or profession;
  - the tool lifecycle;
  - KPIs;
  - the admin console plan;
  - a job description for the admin you plan to hire.
- **Name options (doc 21):** *Whoolkit* ("who" + "toolkit"), in the spirit of your office's *Woogle*, without the "-oogle" trademark risk.
- **One-command rebuild:** every generated file is rebuilt from plain-text sources with `bash spec-assets/generators/rebuild_all.sh`. The output is deterministic and validated.

## What V2.1 introduced
**"Who are you?"** as the front door:
- 279 needs link identities to 723 tools;
- 35 flagship lenses make the same tool different for different work (*Excel for financial modelling* ≠ *Excel for engineering calculations* ≠ *Excel for farm records*);
- every tool shows **who uses it** (Canva: 1,354 identities across 19 sectors);
- a **"helping someone else"** mode turns visitors into advisers for family and friends.

Start with **`18_Identity_First_Discovery_Specification.md`**, then **`20_Admin_and_Catalogue_Operations_Manual.md`**.

V2 turns the V1 foundation into an implementation-ready blueprint, following the V1 Gap Analysis. Both source documents are preserved unchanged in `00_Reference/`. V2 does not rewrite them silently: every conflict and how it was resolved is logged in `00_V1_Reconciliation_and_Conflict_Log.md`.

## Start here
| If you are… | Read |
|---|---|
| The product owner | **`23`** (every feature you asked for) → **`22`** (beta plan) → `02_Product_Decision_Register.md` (approve or override defaults; 4 "Decision needed" items block launch, not build) → `01` |
| A developer or AI builder | `17_AI_Implementation_Master_Prompt.md`, then follow its reading order (18 governs the identity layer, **23** is the checklist, **ADR-008 in 11** is the stack) |
| A designer | `06` + `spec-assets/tokens/` → `04` → `05` |
| The catalogue admin | **`20`** → `spec-assets/taxonomy/source/*.txt` → `spec-assets/generators/rebuild_all.sh` |
| An editor or researcher | `07` (§13 for the identity layer) → `20` → `08_Starter_Catalogue/` |
| A domain expert reviewing your field | `18` §13 → your sector in `08_Starter_Catalogue/occupations/occupations-directory.csv` → matching roadmaps and lenses in `08_Starter_Catalogue/records/` |
| QA | `15` + `spec-assets/qa/acceptance-matrix.csv` |

## Contents
| # | Document | Authoritative for |
|---|---|---|
| 00 | V1 Reconciliation and Conflict Log | Precedence rules; conflicts C-01 to C-37 |
| 01 | Master PRD | Vision, scope matrix (R1/R1.5/R2), JTBD matrix, KPI dictionary, FR-035 to FR-075, release gates |
| 02 | Product Decision Register | Every product and technical decision (D-001 to D-106) |
| 03 | Information Architecture and Taxonomy | Route tree, navigation, taxonomy governance, slugs, redirects, discovery and related-content rules |
| 04 | Screen Inventory and UX Specification | Screens S01–S41 + A01, route inventory, full screen contracts, interaction-state matrix |
| 05 | User Journeys and Interaction Flows | Search, browse, decision, resource, playbook, correction, editorial and theme flows (Mermaid) |
| 06 | Visual Design System | Art direction, tokens explained, responsive matrix, component catalogue, motion spec, dark theme |
| 07 | Content Model and Editorial Handbook | Content types, evidence and pricing policy, lifecycle, roles, review checklist, corrections, rights |
| 08 | Starter Catalogue (folder) | **Separate dataset:** 26 researched pilot records, coverage matrix, research queue |
| 09 | Data Schema and ERD | Entities, ERD, delete/archive behaviour, migrations, retention |
| 10 | API Specification | Static read API, corrections/events/health Functions, external services |
| 11 | Technical Architecture and ADRs | Architecture diagram, repo layout, data flows, failure modes, ADR-001 to ADR-008 (stack: Bun, Vite, React) |
| 12 | Security and Privacy Plan | Threat model, controls, privacy data inventory, legal review items |
| 13 | Accessibility Plan | WCAG 2.2 AA mapping, AT matrix, automated and manual tests |
| 14 | SEO, Analytics and Performance Plan | Metadata templates, indexing, structured data, analytics rules, numeric budgets, monitoring |
| 15 | QA and Acceptance Matrix | Test layers, traceability, launch gate, user validation |
| 16 | Deployment and Operations Runbook | Environments, setup, CI, release, rollback, backups, jobs, incidents |
| 17 | AI Implementation Master Prompt | Rules, prohibitions, milestone gates A–G, reporting format |
| **18** | **Identity-First Discovery Specification** | **Identities (ISCO-08 complete), needs, skills, tool registry, roadmaps (coverage standard), lenses, question-led home, Explore-by entry points, screens S27–S35, privacy of identity, indexing rules, occupations directory, scale-out plan** |
| 19 | Post-MVP Monetisation Options | Principles, candidate paid features, business models, what free includes (exploratory; D-050) |
| **20** | **Admin and Catalogue Operations Manual** | **Source files, intake, routine, how-to recipes, tool lifecycle, QA checklists, AI-assisted drafting, admin console, KPIs, hiring the admin, tooling backlog** |
| 21 | Name and Brand Options | Woogle-inspired naming, shortlist, recommendation (*Whoolkit*), adoption checklist |
| **23** | **Feature Completeness and App Scope** | **Every owner request in their own words → decision, requirement, screen, test, stage, flag; the launch gate; what is deliberately not in the MVP** |
| **22** | **Open Contribution and Beta Plan** | **Suggest-an-edit model, review rules, guardrails, credit, licences, easy-change delivery, starter journeys, Pilot 20, beta release plan and weekly loop, beta invite text** |
| 24 | Goals, Accounts and Recommendations | Goals, alternatives, optional sign-in, stars, recommendations rules, trending (V2.6) |
| 25 | Build Brief for Existing App | How to build V2.6 and later into the existing repo |
| 26 | Goal Kits, Tool Profiles and Safety | Profiles and Preview label, 29 kits, safety rule sets, discovery (V2.7) |
| **27** | **Pilot Round 1 Findings** | **17 responses → changes; round 2 targets** |
| **28** | **UI/UX Brief V2.8** | **Supersedes doc 06 and the visual parts of doc 04** |
| **29** | **Design Fidelity Contract** | **Seven locks that keep the build matching the reference screens** |
| **30** | **Asset Library Guide** | **Photos, icons, monograms, illustrations, brand kit** |
| **31** | **Decisions and Spec Corrections V2.8** | **D-091 to D-106, FR-109 to FR-119, DepthLabel rule, precedence (proposed)** |
| **32** | **V2.8 Pack Corrections** | **Status of every checklist item; Cloudflare to Vercel mapping** |

### `spec-assets/` (machine-readable contracts)
| Path | What |
|---|---|
| `tokens/tokens.json`, `tokens.css`, `contrast-report.md` | Design tokens for light and dark themes. Every intended colour pairing was checked for WCAG contrast: **0 failures**. |
| `schemas/*.schema.json` | JSON Schema 2020-12 (V2.5 adds `helper`) for tool, task, resource, playbook, comparison, collection, correction request, redirects, common definitions, and (V2.1/2.2) identity, need, registry entry, roadmap, lens, skill |
| `taxonomy/*.json` | Categories (20), task families (12), audiences (13, retired in V2.1 → redirects), all other vocabularies (pricing, platforms, statuses, source types…) |
| `taxonomy/identities/` | Sectors (24), families (94), identities (2,603), ISCO-08 sub-major (43) and unit-group (436) lists |
| `taxonomy/skills.json` | 63 skills in 9 groups (V2.2 entry point), derived tools and roadmaps |
| `taxonomy/needs.json` | 279 needs (32 universal) with tools in fit order |
| `taxonomy/source/*.txt` | **The only files editors change:** identities, ISCO map, needs, registry, skills, archetypes, signatures, roadmaps, lenses, **helpers, pilot_profiles** |
| `taxonomy/helpers.json`, `pilot-profiles.json` | Generated: the three helpers and 21 AI-drafted tool guides (V2.5) |
| `generators/` | `rebuild_all.sh` plus the Python generators and the occupations exporter (deterministic) |
| `validate_identity_layer.py`, `reference_engine.py` | Identity-layer validator; reference implementation of toolkit resolution, lens composition, lens selection and who-uses |
| `search/identity-harness.mjs` | Identity, "tool for profession" and skill search tests (48/48 passing) |
| `validate_catalogue.py` | Reference validator (schemas + integrity rules); run with `python3 -I spec-assets/validate_catalogue.py spec-assets 08_Starter_Catalogue/records` |
| `fixtures/` | Valid and invalid example records; `invalid/EXPECTED.json` lists the required failure for each |
| `search/` | Search engine configuration (boosts, synonyms, ranking rules, facets, URL state) and a versioned test set of 25 queries |
| `analytics/events.json` | 47 privacy-first aggregate events (6 added in V2.1, 3 in V2.2, 2 in V2.3, 4 in V2.5; identity never recorded) |
| `api/openapi.yaml` | API contract |
| `db/0001_analytics_counters.sql` | D1 migration |
| `config/_headers`, `env.example` | Security headers and CSP, environment variables |
| `config/feature-flags.json` | Feature flags with beta defaults, **launch values**, owners and review dates |
| `config/home-featured.json` | The home page's popular chips and identity ribbon (V2.5) |
| `repo-templates/` | LICENSE (MIT), LICENSE-CONTENT (CC BY 4.0), CONTRIBUTING, CODE_OF_CONDUCT, GitHub issue forms, PR template, labels, reference CI (V2.3) |
| `registry/tool-profiles.json`, `taxonomy/goal-kits.json`, `goal-links.json`, `goal-safety.json`, `identity-kit-hints.json`, `entry-paths.json` | Generated (V2.7): profiles with the Preview label, 29 kits, related goals, safety notes, kit hints, entry paths |
| `generators/build_profiles.py`, `build_discovery.py`, `validate_profiles.py`, `validate_discovery.py` | Profile and discovery generators and checks (V2.7) |
| `taxonomy/goals.json`, `alternatives.json`, `intents.json`, `tool-markets.json`, `tool-availability.json` | Generated (V2.6; 1,050 goals in V2.7): derived alternatives, compete/grow/scale, local markets, availability |
| `db/0002_accounts_profiles_postgres.sql` | Accounts, profiles, stars, progress, outcomes, trending (V2.6; parsed, not executed) |
| `generators/build_goals.py`, `validate_goals.py`, `schemas/goal.schema.json` | Goals and alternatives generator and checks (V2.6) |
| `qa/acceptance-matrix.csv` | 150 test cases with requirement traceability |
| `qa/feature-matrix.csv`, `validate_feature_matrix.py` | Every owner feature traced to decisions, requirements, screens, tests and flags; the checker (V2.5) |

## Outstanding decisions (block the public launch, not the build or the private beta)
| ID | Decision |
|---|---|
| D-061 | Licences: accept MIT + CC BY 4.0, or choose AGPL-3.0 for code (needed before the repo goes public) |
| D-018 | Uptime monitor service and alert address |
| D-019 | Brand assets and domain (placeholder `digitaladvantage.example`; *Whoolkit* recommended in 21) |
| D-027 | Launch markets and legal review of privacy notice and terms |
| D-012 (R1.5) | Whether to add a Git-based CMS editor UI (20 §9 recommends it once the admin is hired) |
| D-050 (after MVP) | Monetisation model (options in doc 19) |

## Deferred work
- **R1.5:** collections, device-only bookmarks, "was this helpful?" feedback.
- **R2:** accounts, learning paths with progress, projects, grounded AI discovery, contributor submissions.

## Known limitations of this pack
- **Breadth vs depth:** 1,781 tools exist in the registry and every one has a short profile with price information, but only 5 are partly web-checked and none has verified pricing. Ten have full source-backed records and 21 more have AI-drafted guides waiting for a human check (`pilot_profiles.txt`). The rest show name, link and who uses them until profiled (D-048). Profiling the 50 most-used tools is the first content task after build.
- **Expert review pending:** identities, needs, roadmaps and lenses are AI-drafted and published under the owner's blanket approval (D-044). Domain experts will validate them (18 §13).
- **Coverage:** every ISCO-08 unit group has at least one identity, but local job titles keep appearing. The identity-miss report and suggestions (20 §3) are how gaps get closed. ESCO titles are the next alias source.
- **Roadmap depth:** 636 roadmaps are "standard" (template + tool-specific skills), and are labelled as such on screen. Upgrading the most-used ones to handwritten is a quarterly admin task (20 §5.4).
- **Links:** all 723 registry entries carry an official link (checked 21 Oct 2026), but the weekly link checker is the real test; vendors move pages often. Several vendors rebranded or moved (Lexicomp → UpToDate Lexidrug; Interactive Petrophysics now from Geoactive; PowerScribe now under Microsoft), and Microsoft Lens was retired in Dec 2025 and removed from the registry.
- Free-tier limits of the chosen hosting services must be confirmed at setup (16 §2 step 5). Prices and limits change.
- Legal text (privacy notice, terms) is not drafted. It needs review for the launch markets.
- **Stack risks (V2.5):** the JavaScript budgets in 14 §3 are targets set before any build. Spike S-1 measures them on day 1. Full prerender of about 3,700 routes may exceed the host's build-time or file limits; the beta can use core routes plus a single-page fallback (11, ADR-008). If the spike fails, Astro with React islands is the fallback.
- **"Sleek" needs a human eye:** tests cover layout, contrast and motion, not taste. A designer or the owner signs off the look (23 §5).
- **Helpers are drafts:** Musician and Data Analyst were reviewed by the author only; Entrepreneur needs 19 full tool guides. Payment, tax and company-registration rules differ by country, so the helpers give no legal or tax advice.
- **No application code** is included in this pack.
