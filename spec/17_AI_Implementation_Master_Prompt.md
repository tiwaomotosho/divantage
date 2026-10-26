# 17 — AI Implementation Master Prompt

> **V2.8 override (D-105, proposed):** for Launch-stage features behind the `accounts` flag, the bans on accounts and recommendations, "Milestone F: skip accounts", "Cloudflare Pages" and the 723-tool figure no longer apply (hosting is Vercel, D-083). Beta stays static with no account. For UI work, read `CLAUDE.md` and docs 28 and 29 first.

Copy everything below the line into your AI coding tool, or give it to the development team, together with this whole folder.

---

You are implementing **Digital Advantage R1 (spec V2.5)** (working name *Whoolkit*, pending D-019; keep the brand configurable). It is a non-commercial, global, mobile-first web platform that helps people move from "I need to do something" to "I know which tools and methods to use, how to use them, and what to do next." **The entry point is identity-first:** the home page asks "Who are you?", and every one of 2,603 professions and life roles (all 436 ISCO-08 unit groups) gets a toolkit of needs, tools, skill roadmaps and profession-specific lenses (`18_Identity_First_Discovery_Specification.md`). Identity is the default door, and the "Explore by" switcher also offers What to do · Skills · Tools · Sectors (18 §18). Every one of the 723 registry tools has a Beginner/Intermediate/Expert roadmap. **Helpers** (guided paths: Musician, Data Analyst, Entrepreneur) follow the person across the app through a Helper panel (D-066, S39–S41). **The app must be level with every row of `23_Feature_Completeness_and_App_Scope.md`** (D-068). The look is very visual, sleek and mobile-first (D-070, 06 §12).

## Source of truth (read in this order before writing code)
1. `README.md` (this pack's map), **`23_Feature_Completeness_and_App_Scope.md`** (the checklist for being level with every owner request), `00_V1_Reconciliation_and_Conflict_Log.md` (including C-18 to C-29) and **`18_Identity_First_Discovery_Specification.md`** (governing doc for identities, needs, roadmaps and lenses).
2. `02_Product_Decision_Register.md`. **Decisions marked Approved or Recommended default are binding.** Do not substitute other frameworks, hosts or libraries.
3. `01_Master_PRD.md` §6 (scope matrix). Build **only** R1 rows.
4. `03`–`06` (IA, screens, journeys, design system), then `07`, `09`–`16`.
5. `spec-assets/`. These files are contracts and must be used as they are:
   - `tokens/tokens.json` → generate `tokens.css` (or copy the provided one);
   - `schemas/*.json` → content validation;
   - `taxonomy/*.json`;
   - `search/search-config.json` + `search-test-set.json`;
   - `analytics/events.json`;
   - `api/openapi.yaml`;
   - `db/0001_analytics_counters.sql`;
   - `config/_headers`, `config/env.example`;
   - `qa/acceptance-matrix.csv`;
   - `validate_catalogue.py` (the reference implementation to port to TypeScript; outputs must match).
6. `08_Starter_Catalogue/` → copy into `content/`:
   - `records/` (tools, tasks, resources, playbooks, comparisons, roadmaps, lenses);
   - `registry/tools-registry.json`;
   - `generated/` and `occupations/` (rebuild these with `spec-assets/generators/rebuild_all.sh`; don't hand-edit them).

   Pilot records are **published under the owner's blanket MVP approval (D-044)**. Show the expert-review status in the trust footer (D-045).
7. `spec-assets/taxonomy/identities/*`, `taxonomy/needs.json` and `taxonomy/source/*.txt` (editor sources). Also load `taxonomy/skills.json` (skills entry point, S34/S35). Port `spec-assets/reference_engine.py` (resolve, compose, pick_lens, who_uses) to `src/lib/identity.ts` and make its outputs match the Python reference for the examples in TC-079 and TC-081.

If two sources conflict, follow the precedence in `00` §"Precedence rule". If something is still unclear, **stop and list the question** in `docs/open-questions.md`. Pick nothing silently.

## Stack (V2.5, D-069, binding)
**Bun, Vite and React** with **React Router in framework mode** (`ssr: false`, `prerender` from the content loader), TypeScript strict, prerendered to static files on Cloudflare Pages, Cloudflare Functions unchanged. Read ADR-008 in `11` first and run **Spike S-1** before Milestone B; report its four measurements. Keep framework-free logic in `src/lib`. Do not add a UI component library, CSS-in-JS runtime or state-management library without a recorded decision.

## Prohibited
- Inventing tool data, prices, features, platforms, licences, URLs, testimonials, ratings, user counts or metrics.
- Marking any record `published` or changing `editorial` fields of catalogue records.
- Adding sponsorship, affiliate, ads, cookies for tracking, user accounts, AI chat or recommendations, gamification, comments or ratings.
- Showing "Free" for anything other than `pricing.model == "free"` (other labels come only from `vocabularies.json`).
- Hard-coded colours, spacing or font sizes outside `tokens.css`.
- Decorative controls that don't work (every button, filter and link must do what it says).
- `dangerouslySetInnerHTML` or `innerHTML` with record content; `unsafe-inline` in the CSP.
- Sending helper progress, a helper label or an identity to any server; streaks, points, badges or confetti in helpers.
- Third-party scripts beyond Turnstile (S18 only) and the Cloudflare Web Analytics beacon.
- Embedding third-party media or logos, or linking to YouTube, Vimeo, TikTok or Dailymotion (D-043).
- Sending a visitor's chosen identity to any server or analytics (D-053).
- Displaying pricing, platform or feature claims for registry-only tools (D-048).
- Replacing a specified screen, flow or component with a "simplified" version without recording a deviation.

## Build order (V2.5, docs 22 and 23)
**Build the three starter helpers first, then widen.** Milestones A–C below are trimmed to what the Musician, Data Analyst and Entrepreneur helpers need, plus:
- S39 Helpers, S40 Helper page, S41 Helper panel and the bottom tab bar;
- S36 Suggest an edit;
- S37 What's new;
- the beta banner;
- feature flags;
- preview and rollback.

Ship the private beta (D-062) when the 22 §6 Stage 1 "done when" list passes, then continue milestones D–G behind flags in weekly releases. Turn on the **Launch** rows of the feature matrix one flag at a time. Run `python3 -I spec-assets/validate_feature_matrix.py .` in CI from the first commit. Everything not ready ships with its flag **off**. Contributor submissions are **in scope** (D-060). Comments and ratings remain prohibited.

## Milestones (stop at each gate and report)
- **A — Planning:**
  - confirm the stack from D-010–D-017 and D-069 (Bun, Vite, React) and run Spike S-1 (11, ADR-008);
  - list open questions;
  - produce the route list (03 §1) as a checklist;
  - schema port plan (JSON Schema → Zod parity test);
  - risk list;
  - sequence.
- **B — Design foundation:**
  - tokens.css, base styles, fonts (self-hosted), Header/Footer/MenuDrawer;
  - every component in 06 §6 on a `/dev/components` page (excluded from production);
  - both themes, reduced motion;
  - axe clean.
- **C — Content & data** (now includes the identity layer: taxonomy regeneration, `validate_identity_layer` port, identities index, lens composition):
  - content collections;
  - `scripts/validate-content.ts` matching the Python reference on the pilot records and `spec-assets/fixtures` (all invalid fixtures must fail with the expected messages);
  - build-time indexes (09 §3);
  - related-content rules (03 §5.2);
  - export, sitemap, redirects.
- **D — Core public experience:**
  - S39–S41 (helpers and the panel) and the bottom tab bar;
  - S01-R and S01-R2 (question-led home with the Explore-by switcher), S27–S35 (identity toolkit, identity×tool, lens, roadmap with depth label, need, sector, browse-everyone, skills index, skill page), S09-R tool additions, S18-R suggestion types, plus S02–S14 and S24–S26;
  - search per `search-config.json` (including `identity_search` and the skills index), passing `search-test-set.json`: content queries **and** identity, route and skill queries (`identity-harness.mjs`, 48/48);
  - URL state;
  - filters;
  - all states in 04.
- **E — Trust & operations:**
  - source display, review dates, overdue notices, archive behaviour;
  - S15–S23 (policy pages contain placeholders marked `TODO(owner)` where legal text is needed; never invent legal text);
  - corrections Function + S18/S19;
  - events Function + D1;
  - health;
  - scheduled jobs (16 §6);
  - CI pipeline (16 §3).
- **F — Accounts:** **skip** (not in R1).
- **G — Quality gate:**
  - run every automated TC in the matrix (TC-001 to TC-150) and `validate_feature_matrix.py`;
  - get the owner's or a designer's sign-off on the look (06 §12);
  - fill in the status column;
  - Lighthouse and axe results;
  - search score;
  - rollback demonstrated on preview;
  - known limitations.

Do not present a polished demo while a gate item is failing. Report it.

## Required quality behaviours
- Mobile-first CSS. Test at 320, 360, 390, 768, 1024 and 1280 px, plus 400% zoom. No horizontal overflow.
- Every interactive state in 04 §5. Keyboard and screen-reader patterns per 13 §2.
- All content works without JavaScript except search, share, theme, the filter drawer and the bot check (each has a fallback).
- Performance budgets in 14 §3 are CI failures, not suggestions.
- Secrets only server-side. Correction GitHub token scoped to Issues on the private repo.

## Reporting format (each milestone)
```
## Milestone X report
Implemented: [requirement/TC ids]
Partial: [id — what's missing]
Blocked: [id — why, what decision is needed]
Untested: [id]
Deviations from spec: [doc §, what, why] (none is the expected answer)
Open questions: [link to docs/open-questions.md items]
Commands: install / dev / test / build / deploy
Files changed: [list]
```

## Definition of success
Anyone, from a radiologist or a wells engineer to an okada rider, a pastor or a grandmother, types who they are and within two taps sees tools and a learning path that clearly fit *their* work. They can then advise a friend or family member with a shareable toolkit card.

A first-time visitor on a mid-range phone arrives from a QR code or search engine with a practical goal. They find relevant guidance, understand the options, costs and limits (with sources and dates), and take a useful next step, without needing to understand how the platform is organised.

## V2.7 additions
Read doc 26 first. Build in this order and stop to report after each: (1) tool profile block with the Preview label; (2) kits (S49, S50) and natural-language goal search; (3) safety panels, related goals and next steps; (4) rules R9 to R12. Do not remove or soften the Preview label, do not write copy that calls a tool safe, and do not hand-edit generated JSON; edit `spec-assets/taxonomy/source/*.txt` and run `rebuild_all.sh`. All V2.7 data is AI-drafted and must be shown as such.
