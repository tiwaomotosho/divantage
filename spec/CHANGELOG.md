# Changelog

## 2.5 — 2026-10-21 (helpers, full-feature scope, Bun + Vite + React)
- **Owner direction:** the journeys are more like helpers; add a third journey on entrepreneurship; make the app level with every feature shared; build on Bun, Vite and React; very visual, sleek and responsive. (A first Astro build of an app was made along the way and is **not** part of the pack; the owner asked for the specification only.)
- **New doc 23** (Feature Completeness and App Scope) with `qa/feature-matrix.csv` (29 features) and `validate_feature_matrix.py`.
- **Decisions:** D-066 to D-070 added; D-010, D-039 and D-040 amended. **Conflicts:** C-34 to C-37.
- **Helpers:** journeys renamed and reshaped into helpers; Entrepreneur added (7 stages, 23 tools); S39 Helpers, S40 Helper page, S41 Helper panel; bottom tab bar; `helpers.txt`, `build_helpers.py`, `helper.schema.json`; 21 AI-drafted tool guides in `pilot_profiles.txt`; FR-067 to FR-075.
- **Stack:** ADR-008 (Bun, Vite, React, React Router prerender) supersedes ADR-001, which stays as the fallback; Spike S-1; docs 09, 11, 12, 14, 15, 16, 17 and the reference CI updated. JavaScript budgets reset (14 §3).
- **Look:** 06 §12 (principles, helper tints with measured contrast, new components).
- **Flags:** every flag has a `launch` value; new flags `helpers`, `helper_panel`, `helper_for_someone`; the admin report moves into R1.
- **Tests and events:** TC-119 to TC-132 (132 in total); 4 helper events (29); suggestion type `suggest_helper` and an issue form.
- **Content:** `config/home-featured.json` (popular chips and identity ribbon).

## 2.3 — 2026-10-21 (open, early, easy to change)
- **Owner direction:**
  - open-source mentality: people submit improvements, they're reviewed in the backend, then applied;
  - start with music and data analytics;
  - don't wait forever; share with friends;
  - rapid improvement; changes must be easy.
- **New doc 22** (Open Contribution and Beta Plan).
- **Decisions:** D-060 to D-065 added; D-012 and D-019 timing amended. **Conflicts:** C-30 to C-33.
- **Contribution:**
  - the corrections endpoint is now also the Suggest-an-edit endpoint: `proposed_text`, `conflict_of_interest`, `credit_name` and `credit_consent` added; sources required for factual types;
  - screens S36 Suggest an edit, S37 What's new, S38 Contributors and the beta banner;
  - repository templates (MIT, CC BY 4.0, CONTRIBUTING, code of conduct, issue forms, PR template, labels, reference CI).
- **Delivery:**
  - `feature-flags.json` with beta defaults;
  - trunk-based releases, preview per PR, rollback and the What's new pipeline (16 §12);
  - build order now slice-first (17);
  - FR-061 to FR-066;
  - tests TC-107 to TC-118, with a new "Beta" gate;
  - 2 new analytics events (`suggest_edit_opened`, `whats_new_viewed`).
- **Catalogue:**
  - music-release layer (2 needs, 5 tools, a new archetype; added to sources after the V2.2 package and kept; links verified, Audiomack link corrected to its homepage);
  - Data Analyst / BI Analyst toolkit corrected (pipelines moved to Data Engineer);
  - auto-lens titles now read "Using {Tool} to {need}";
  - archetype count corrected (49; V2.2 docs said 44).
- **Counts:** 279 needs · 723 tools · 667 roadmaps (723/723 tools) · 6,519 modules · 1,032 lenses · 118 test cases.

## 2.2 — 2026-10-21 (exhaustive, fully covered, operable)
- Owner direction:
  - "I want an exhaustive list of occupations. Confirm that musicians are covered."
  - "At least 90% course outline is the minimum standard."
  - "The entry point is identity, but make it easy to explore another entry point, e.g. Skills."
  - Add admin recommendations for keeping the catalogue updated (an admin may be hired).
  - Find a Woogle-style creative name.
- **Occupations:**
  - 2,603 identities (from 1,199), 1,444 aliases, 94 families;
  - every ISCO-08 unit group (436/436) mapped and validator-enforced (`isco08-unit-groups.json`, `isco08_units` on identities);
  - occupations directory exported as CSV and Markdown;
  - 61 music identities confirmed, with 12 music search tests.
- **Roadmaps:**
  - 718/718 tools covered (from 87);
  - 632 generated archetype+signature roadmaps (44 archetypes, a tool-specific signature line for every tool);
  - 6,469 modules; lens index 1,024;
  - a ≥ 90% coverage gate in `validate_identity_layer.py`;
  - `roadmap.schema.json` gains `authoring` and `archetype`.
- **Skills entry point:**
  - 63 skills in 9 groups (`skills.json`, `skill.schema.json`), with every need reachable;
  - Explore-by switcher (S01-R2) and screens S34/S35;
  - skills index and 12 skill search tests (harness 48/48).
- **Operations:**
  - new doc 20 (Admin and Catalogue Operations Manual);
  - `spec-assets/generators/` with `rebuild_all.sh` (deterministic) and `export_occupations.py`;
  - new suggestion issue types in the corrections schema and vocabulary;
  - 3 new analytics events (`identity_no_match`, `explore_mode_changed`, `skill_selected`);
  - internal admin report A01 (R1.5).
- **Name:** new doc 21. *Whoolkit* recommended (D-059); D-019 stays open pending domain and trademark checks.
- Decisions D-055 to D-059 added; D-046, D-049 and D-051 amended. Conflicts C-26 to C-29. Tests TC-093 to TC-106; TC-092 updated.
- Fixed: generators could truncate a source file when run with the pack as both source and output (copy now skips same-file); who-uses output is now key-sorted for byte-identical rebuilds.
- Links: all 16 previously blank official links filled and checked against vendor pages. Tool changes found while checking: Lexicomp is now **UpToDate Lexidrug** (renamed, slug kept); Interactive Petrophysics is now published by **Geoactive**; PowerScribe's Nuance page redirects to Microsoft; **Microsoft Lens was retired (Dec 2025)**, so it was removed from the registry, the scan-documents need and its roadmap (registry 718, roadmaps 662, modules 6,469, lens index 1,024).

## 2.1 — 2026-10-21 (identity-first)
- Owner direction: the landing page is a question ("Who are you?"), covering every profession and life role; the same tool gets different guidance per profession; each tool gets a beginner/intermediate/expert roadmap; no YouTube links; non-commercial MVP with monetisation after; "assume it's all perfect for now", with experts validating later.
- Added doc 18 (Identity-First Discovery Specification) and doc 19 (Post-MVP Monetisation Options).
- Added the identity layer:
  - 24 sectors, 79 families (ISCO-08 sub-major crosswalk), 1,199 identities, 1,201 aliases;
  - 277 needs (32 universal);
  - a 719-tool registry;
  - 31 roadmaps / 159 modules;
  - 35 flagship lenses / 220 renderable lenses;
  - derived who-uses data.
- New schemas (identity, need, registry entry, roadmap, lens), `validate_identity_layer.py`, `reference_engine.py`, identity search config and harness (24/24 passing).
- Decisions D-042 to D-054; D-001, D-002 and D-035 amended. Conflicts C-18 to C-25 logged.
- Pilot records published under blanket MVP approval (D-044). Video-platform links banned (D-043; validator enforced).
- Screens: S01 revised (question-led), S09 revised (who uses, surprising uses, roadmap), S27–S33 added. 22 new test cases (TC-071 to TC-092). 6 new analytics events.

## 2.0 — 2026-10-21
- V2 baseline built from the V1 pack and the V1 Gap Analysis (both preserved unchanged in `00_Reference/`).
- Non-commercial business model recorded as Approved (D-001).
- 17 conflicts between V1 and the Gap Analysis resolved (00).
- 41 decisions recorded; 4 remain "Decision needed" (they block launch, not build).
- Machine-readable contracts added: tokens (contrast-checked), JSON Schemas, taxonomy, search config + test set (100% pass on the reference harness), analytics events, OpenAPI, D1 migration, security headers, a QA matrix of 70 test cases.
- Pilot catalogue researched from official sources: 10 tools, 7 tasks, 7 resources, 1 playbook, 1 comparison (all in_review).

## 1.0 — 2026-10-21
- Foundational product and design specification (see `00_Reference/V1_Original/`).

## 2.4 (21 October 2026)
- New source files `journeys.txt` and `pilot_profiles.txt`, built by `generators/build_journeys.py` into `taxonomy/journeys.json` and `taxonomy/pilot-profiles.json`.
- Three journeys: Musician (6 stages), Data Analyst (7), Entrepreneur (7, new). 20 stages in total; every tool, need and identity slug is checked at build.
- 21 pilot tool profiles written (AI-drafted, review pending). Entrepreneur tools mostly still need full profiles.
- (V2.4 was an interim build; V2.5 folds it in. The web app that accompanied V2.4 is not part of the pack.)
