# 15 — QA and Acceptance Matrix

**Version:** 2.6 · **Machine-readable matrix:** `spec-assets/qa/acceptance-matrix.csv`. It has 150 test cases (TC-001 to TC-150), each with requirement references, scenario, method, expected result, priority (P1–P3), release gate and status. Every TC referenced in documents 04–14 exists in the CSV; this was checked at authoring time.

## 1. Test layers (Gap Analysis §29.1)
| Layer | Tool | Where | Runs |
|---|---|---|---|
| Unit | Vitest | `tests/unit` (ranking, facets, pricing labels, related rules, formatting, event normalisation) | Every PR |
| Component | Vitest + React Testing Library | `tests/components` | Every PR |
| Integration | Vitest + Miniflare/wrangler for Functions; mocked GitHub & Turnstile | `tests/integration` | Every PR |
| Content integrity | `scripts/validate-content.ts` (port of `validate_catalogue.py`) + fixtures | CI | Every PR + nightly |
| Search quality | Node runner over `search-test-set.json` | CI | PRs touching content/search |
| End-to-end | Playwright (Chromium, WebKit, Firefox; mobile emulation 360×640 and 390×844) | `tests/e2e` | Every PR (Chromium); nightly (all) |
| Visual regression | Playwright screenshots, both themes | `tests/visual` | Nightly + before release |
| Accessibility | @axe-core/playwright + manual (13 §5) | CI + RC | Every PR / release |
| Performance | Lighthouse CI budgets | CI on preview URL | Every PR |
| Security | Secret scan, dependency audit, header check, Function tests | CI | Every PR |
| Cross-browser / responsive | Playwright projects + manual device lab | CI nightly + RC | — |
| Migration | Local D1 apply; content migration scripts on fixtures | CI | When migrations change |
| Backup/restore | Manual drill | Staging | Before public launch, then quarterly |

## 2. V1 critical scenarios → tests
| V1 scenario (08 §2) | Test |
|---|---|
| 1 "edit videos for free" pricing truth | TC-004, TC-010 |
| 2 No exact match | TC-005 |
| 3 Android filter | TC-006 |
| 4 Shared link logged out | TC-023 |
| 5 Discontinued product | TC-024 |
| 6 Unknown pricing | TC-020 |
| 7 Keyboard only | TC-042 |
| 8 Reduced motion | TC-048 |
| 9 Correction form | TC-032 |
| 10 Publish without sources blocked | TC-049 |
| 11 Search-service failure | TC-031 |
| 12 External link failure | TC-046 |
| 13 Slow connection | TC-062 |
| 14 Slug change redirects | TC-059 |
| 15 Export integrity | TC-061 |

## 3. V1 functional requirements → tests
| FR | Tests | FR | Tests |
|---|---|---|---|
| FR-001 | TC-003, TC-023 | FR-018 | TC-069 |
| FR-002 | TC-003 | FR-019 | TC-037 |
| FR-003 | TC-006, TC-008 | FR-020–022 | Not in R1 (R1.5/R2) |
| FR-004 | TC-007 | FR-023 | TC-063 |
| FR-005 | TC-005 | FR-024 | TC-049 |
| FR-006 | TC-003 | FR-025 | TC-063 (Git history + PR review) |
| FR-007 | Not in R1 (AI is R2) | FR-026 | TC-025, TC-046 |
| FR-008 | TC-013, TC-059 | FR-027 | TC-032 |
| FR-009 | TC-019 | FR-028 | TC-063 (no public contributions in R1; reports are triaged privately) |
| FR-010 | TC-021 | FR-029 | TC-063 + 16 §8 access review |
| FR-011 | TC-020 | FR-030 | TC-061 |
| FR-012 | TC-039 | FR-031 | TC-051 |
| FR-013 | Unit tests of `related.ts` (03 §5.2) under TC-024 | FR-032 | Unit test of query normalisation (under TC-051) |
| FR-014 | TC-024 | FR-033 | `events.json` reviewed in 16 §8 |
| FR-015 | TC-068, TC-069 | FR-034 | No consent UI exists; 12 §6 legal review |
| FR-016 | TC-023 | FR-035–045 (V2) | TC-052, TC-021, TC-006, TC-004, TC-024, TC-025, TC-035, TC-041, TC-061, TC-049 |
| FR-017 | TC-059 | | |

The non-functional requirements map through 12 (security), 13 (accessibility) and 14 (performance) to TC-040, TC-047, TC-048, TC-050–TC-060, TC-062 and TC-064–TC-067.

## 4. Launch gate (Gap Analysis §29.3)
**Soft launch** (pilot group, V1 07 §11 step 8) requires:
- every P1 test with gate "Soft launch" passing;
- the pilot catalogue published after human review;
- D-018 and D-019 resolved.

**Public launch** requires:
- every test with gate "Soft launch" or "Public launch" passing;
- no open critical or serious accessibility or security issue without a dated, owner-approved exception;
- the D-035 content bar met;
- search test set at threshold;
- backup/restore (TC-064) and rollback (TC-055) drills done;
- monitoring active;
- privacy notice, terms and editorial standards approved (D-027);
- known limitations documented in the release notes;
- **(V2.5)** `validate_feature_matrix.py` exits 0 and every shipping feature's flags launch ON (TC-130);
- **(V2.5)** full prerender of every route in 03 completes within the host's limits (FR-074, TC-128);
- **(V2.5)** the owner or a designer has signed off the look (23 §5).

## 5. Reporting format
Each release candidate produces `release-notes/{version}.md` containing:
- the CSV with a status column (Pass / Fail / Blocked / Not run / Waived + reason);
- Lighthouse and axe summaries;
- the search test-set score;
- open issues by severity;
- known limitations.

## 6. User validation (V1 08 §3)
Before public launch, run moderated sessions with 6–8 participants:
- student;
- low-confidence beginner;
- professional;
- small-business owner;
- creator;
- a person using an older Android phone;
- a keyboard or screen-reader user where possible.

Tasks:
1. Find a suitable free tool to edit a video.
2. Learn how to cite sources.
3. Compare two video editors.
4. Find the official tutorial for a tool.
5. Share a useful guide with a friend.
6. Report outdated information.

Record completion, time, confusion points and workarounds. Fix the most consequential problems first, then re-test.

## 7. V2.1 tests (identity-first)
TC-071 to TC-092 cover the picker, multi-identity toolkits, device-only identity storage, lens selection and composition, roadmap ticks, the who-uses views, registry pages making no claims, the no-video rule, identity-layer validation and the identity search test set. Rows are in the CSV.

**Launch-gate additions:**
- Identity search test set at 100% (24/24 on 21 Oct 2026 with the reference harness).
- `validate_identity_layer.py` with 0 errors.
- Picker accessibility pass with NVDA and TalkBack.

**User validation additions** (to §6): recruit across at least 6 sectors, including at least one trade (e.g. mechanic or tailor), one faith leader, one athlete, one health worker, one engineer and one life role (retiree or parent).

Tasks:
1. "Find what's useful for your work."
2. "Find how someone like you would use Excel or Canva."
3. "Share a toolkit with a family member."

## 8. V2.2 tests (entry points, coverage, operations)
TC-093 to TC-106 cover:
- the Explore-by switcher (default identity, works without JS, cross-suggestions, accessibility);
- skill pages;
- roadmap depth labels;
- the new suggestion types;
- the admin report;
- the ISCO-08 completeness and ≥ 90% roadmap coverage gates;
- deterministic rebuilds;
- findability of musicians.

TC-092 is updated to the 48-query test set. Rows are in the CSV.

**Launch-gate additions:**
- `validate_identity_layer.py` shows ISCO unit groups 436/436, needs reachable via skills 279/279, and roadmap coverage ≥ 90% (currently 723/723), with 0 errors.
- Identity + route + skill search test set at 100% (48/48 on 21 Oct 2026).
- `rebuild_all.sh` reproduces the committed generated files exactly.

**User validation additions** (to §7):
- include at least one musician or performer;
- run a "find it without the identity question" task: "You want to get better at video editing. Find where to start."

## 9. V2.3 tests (open contribution, beta, starter journeys)
TC-107 to TC-118 cover:
- Suggest an edit (prefill, source rules, credit consent, accessibility);
- What's new and Contributors;
- the beta banner;
- feature flags;
- noindex during the beta;
- review-before-live with rollback;
- the starter journeys end to end (now helpers, TC-117 to TC-127).

A new release-gate value, **Beta**, marks tests that must pass before inviting friends (22 §6 Stage 1). Soft- and public-launch gates are unchanged.

**Beta gate:**
- every `Beta` P1 test passing;
- the suggestion → review → merge → live loop run 3 times;
- all three starter helpers working on a mid-range Android phone over 3G.

## V2.5 additions (TC-119 to TC-132)
| Area | Tests |
|---|---|
| Third starter helper | TC-119 (Entrepreneur) |
| Helpers | TC-120 index and page, TC-121 panel follows you, TC-122 progress stays on the device, TC-123 panel layout and accessibility, TC-124 "Where this fits", TC-125 helper for someone else, TC-126 content validation, TC-127 tools without full guides |
| Stack | TC-128 Bun build, TC-129 bundle budgets, no raw HTML, CSP hashes |
| Completeness and look | TC-130 feature matrix gate, TC-131 signature visuals responsive, TC-132 non-commercial guard |
The launch gate in §4 gains three rows (feature matrix, full prerender, look sign-off). TC-117 and TC-118 now describe *helpers* (formerly journeys).

## V2.6 additions (TC-133 to TC-150)
| Area | Tests |
|---|---|
| Goals and alternatives | TC-133 build rules, TC-134 derived alternatives, TC-135 goal search, TC-139 tool page |
| Intent and markets | TC-136 intent chips, TC-137 Nigeria-first, TC-138 availability |
| Stars and workbench | TC-140 stars, TC-141 workbench and continue card |
| Accounts and privacy | TC-142 sign-in triggers, TC-143 consent defaults, TC-144 export and delete, TC-145 merge |
| Recommendations and trending | TC-146 limits, TC-147 rules R1 to R8, TC-148 trending floor and gate |
| Retention loop | TC-149 outputs and outcomes, TC-150 suggestion status |

## V2.7 additions (TC-151 to TC-168)
Eighteen tests in `spec-assets/qa/acceptance-matrix.csv` (168 in total): profile coverage and the Preview label (TC-151 to TC-154), the 95% same-kind gate (TC-155), kit rules and pages (TC-156, TC-157), safety tags and panel (TC-158, TC-159), natural-language search and entry paths (TC-160 to TC-162), connected goals (TC-163), suggestions (TC-164 to TC-166), and the technology-enablement and kids-programming checks (TC-167, TC-168).
- **New CI gates:** `validate_profiles.py`, `validate_discovery.py` and the same-kind check in `validate_goals.py` are part of `rebuild_all.sh`.
- **Manual check before beta:** read ten safety panels (jobs, money and kids first) and confirm none implies a tool is safe or verified.
- **Honest limit:** the 131 goal-search queries test ranking on our own data, not real users. Add real queries from `goal_search_no_kit` after beta.
