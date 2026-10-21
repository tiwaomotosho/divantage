# 02 — Product Decision Register

**Version:** 2.5 · **Date:** 21 October 2026 · **Owner of all decisions:** Product owner

## How to read this register
| Status | Meaning for builders |
|---|---|
| **Approved** | Stated by the product owner. Build to it. |
| **Recommended default** | Chosen so building can start. Build to it unless the owner overrides. Overrides must be logged here with a date. |
| **Decision needed** | Does not block building; blocks **launch**. Build with the placeholder shown. |
| **Later** | Deliberately deferred to the release named. |
| **Out of scope** | Not part of the product. |

Nothing marked *Decision needed* may be silently converted into a permanent requirement (Gap Analysis §2.1).

## Product and scope

| ID | Decision | Status | Default / choice | Alternatives considered | Rationale & consequences | Approval |
|---|---|---|---|---|---|---|
| D-001 | Business model | **Approved** | Non-commercial **through MVP**. No sponsorships, affiliate links, ads or paid placement. Post-MVP model: D-050. | Sponsored, affiliate, subscription | Maximises trust; keeps costs near zero; no disclosure UI needed. Disclosure fields exist in schemas but must be empty (CI-enforced). If this changes, V1 06 §9 policy applies before any commercial content ships. | Owner, 2026-10-21 |
| D-002 | Homepage messaging | **Approved (amended by D-042)** | Headline "Make technology your advantage." The primary entry is now the question "Who are you?" (18 §9); the items below remain as "Or jump straight to a goal". Supporting copy "Discover tools, learn practical skills, and find better ways to get things done." Prompt "What would you like to achieve?" Examples: Edit videos for free · Research a topic · Automate repetitive work · Build a website · Learn a digital skill | — | Gap Analysis §10.2 marks this approved. No session schedule on the home page. | Gap Analysis |
| D-003 | Release 1 scope | Recommended default | See scope matrix in `01_Master_PRD.md` §6 | V1 R1 list; Gap Analysis §4.2 | Merges both. Adds correction reporting to R1 (C-07). | — |
| D-004 | User accounts | Later (R2) | None in R1 or R1.5 | Optional accounts in R1.5 per V1 | Accounts add auth, privacy and deletion work before core value is proven (V1 07 §12). | — |
| D-005 | Bookmarks | Later (R1.5) | Device-only bookmarks in R1.5 (browser storage, no account); cross-device sync only with accounts in R2 | Account-backed bookmarks | Lets learners save without collecting personal data. | — |
| D-006 | AI-assisted discovery | Later (R2) | Not in R1 | R1 inclusion | V1 FR-006/007: search must not need AI. Revisit after search baseline exists. | — |
| D-028 | Comparison pages | Recommended default | R1, basic: 2–3 tools per comparison, fixed dimension set (see 07 §8) | Defer | V1 MVP lists them; helps the free-tool-seeker journey. | — |
| D-029 | Curated collections | Later (R1.5) | Schema reserved | R1 | Little value until the catalogue has breadth. | — |
| D-030 | Learning paths, projects/challenges | Later (R2) | Schemas reserved; no routes, nav item hidden | — | V1 places them in R2. | — |
| D-035 | Launch content bar | Recommended default (extended by V2.1) | Identity layer: ≥ 1,000 identities, ≥ 250 needs, ≥ 30 roadmaps, ≥ 30 flagship lenses (all met by V2.1 data). Tool profiles: **public launch** needs ≥ 60 published tools, ≥ 25 tasks, ≥ 8 playbooks, ≥ 3 comparisons, ≥ 40 resources, across ≥ 8 categories. A category is visible only with ≥ 3 published records. A **soft launch** to a pilot group (V1 07 §11 step 8) may happen with the pilot catalogue. | Larger/smaller bar | Avoids an empty-feeling launch without forcing a huge research effort first. Adjust to editorial capacity. | — |
| D-036 | Language and spelling | Recommended default | English only in R1; British English (en-GB) for all public copy | US English | Matches V1 voice. Localisation is "Later" per V1. | — |

## Taxonomy and content rules

| ID | Decision | Status | Default / choice | Rationale |
|---|---|---|---|---|
| D-007 | Pricing vocabulary | Recommended default | V1's 10 values for tools (see `spec-assets/taxonomy/vocabularies.json` → `pricing_model`); V1 resource values plus `institution_access` | Precise and already defined; resolves C-01, C-14. |
| D-008 | Lifecycle model | Recommended default | `editorial_status` (5 values) + `availability_status` (6 values) + computed `is_overdue` | Resolves C-02 without a 10-state machine a small team can't run. |
| D-009 | Taxonomy dimensions | Recommended default | Category, Task family, Task, Audience, Content type, Skill level, Pricing model, Platform, Deployment, AI involvement, Availability. Each is a separate controlled vocabulary in `spec-assets/taxonomy/`. | Resolves C-03, C-05; satisfies Gap Analysis §7.2. |
| D-023 | Review intervals | Recommended default | Pricing/plan limits **90 days**; availability & capabilities **180 days**; resources: automated link check **weekly**, human relevance **180 days**; tasks/playbooks/comparisons **365 days**; privacy/security claims **90 days**. Any record may set a shorter interval. | Bottom of V1's suggested ranges to suit a small non-commercial team. Tighten once capacity is known. |
| D-024 | Editorial roles & approval | Recommended default | Author ≠ approver wherever two people exist. Solo-maintainer mode is allowed but every self-approval is labelled `solo-approval` in the PR and listed in the monthly freshness report. Only the product owner can change taxonomy, policies or the decision register. | Gap Analysis §28 allows role overlap if approval rules stay clear. |
| D-025 | Content licence | Recommended default | Original text: **CC BY 4.0**. Code: **MIT**. Third-party material is linked, never republished. | Encourages sharing and reuse, consistent with non-commercial mission. |
| D-031 | External links | Recommended default | Same tab; visible external icon; accessible suffix. `rel="noopener"` always; `rel="nofollow"` not used (no commercial links exist). | Predictable for screen-reader users; resolves C-09. |
| D-037 | Logos & screenshots | Recommended default | No third-party logos or screenshots in R1. Tool cards use a generated monogram tile (first letter) in the category colour. | Avoids rights questions (V1 04 §5). |
| D-038 | Correction response targets | Recommended default | Acknowledge (issue triaged) within **7 days**; resolve pricing/availability reports within **30 days**; others within **60 days**. Shown internally only; the public page says "We review every report" without promising times. | V2 §28.2: promises must reflect capacity. |

## Search and UX

| ID | Decision | Status | Default / choice |
|---|---|---|---|
| D-013 | Search engine | Recommended default | **MiniSearch** (client-side), with a prebuilt JSON index generated at build time. Field boosts, fuzzy matching, prefix matching and a synonym map are configured in `spec-assets/search/search-config.json`. Revisit if the index exceeds the performance budget (≈ 5,000 records). Migration path: Pagefind, or hosted Meilisearch/Typesense. |
| D-032 | Sort options | Recommended default | Relevance (default), Recently reviewed. |
| D-033 | Filter logic | Recommended default | OR within a facet, AND across facets. Facet values with 0 results are hidden (except selected ones, which show "0"). |
| D-034 | Platform/region filters | Recommended default | Only verified values match. A toggle "Include tools with unconfirmed platform details" (off by default) adds `unknown` records, each labelled "Platform not confirmed". |
| D-021 | Dark mode | Recommended default | R1. Follows `prefers-color-scheme`; manual Light/Dark/System toggle; persisted in `localStorage` (try/catch); inline head script prevents flash. |
| D-022 | Breakpoints | Recommended default | `sm` 480 · `md` 768 · `lg` 1024 · `xl` 1280 px (min-width, mobile-first). See `06_Visual_Design_System.md`. |
| D-020 | Typefaces | Recommended default | Display: **Bricolage Grotesque** (variable). Text/UI: **Atkinson Hyperlegible Next** (variable). Mono: **JetBrains Mono**. All self-hosted via Fontsource npm packages; licences (SIL OFL) to be confirmed by the builder at install and recorded in `NOTICE`. Fallback stack: `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`. |

## Technical

| ID | Decision | Status | Default / choice | Replacement strategy |
|---|---|---|---|---|
| D-010 | Front-end & rendering | **Approved (amended by D-069)** | **Vite + React** (current stable, pinned) with **React Router in framework mode**, **TypeScript** (strict), prerendered to static files (ADR-008 in 11). Replaces the V2.0 default of Astro with vanilla TS islands. | Content is framework-independent JSON and the identity engine is plain TypeScript, so the rendering layer can still move (Astro with React islands is the fallback if Spike S-1 fails). |
| D-011 | Content storage | Recommended default | JSON files in the Git repository (`content/<type>/<slug>.json`). **JSON Schema (draft 2020-12) in `spec-assets/schemas/` is canonical**; CI validates with Ajv; the app's content loader mirrors the schemas with Zod and a test asserts both accept/reject the same fixtures. | Import into any headless CMS or SQL database; schemas map 1:1 to tables (see 09). |
| D-012 | Editorial tooling | Recommended default (R1); Decision needed (R1.5). *V2.3: not needed for the beta; the in-app form + GitHub are enough (22 §6)* | R1: GitHub web editor / local edits → pull request → CI checks → CODEOWNERS approval → merge = publish. R1.5: decide whether to add a Git-based CMS UI (Decap CMS or Sveltia CMS) for non-technical editors. | Git history is the audit log; any Git-backed CMS can sit on top. |
| D-014 | Hosting | Recommended default | **Cloudflare Pages** (static assets + Pages Functions for 2 endpoints). Builder must confirm current free-plan limits at setup and record them in the runbook. | Netlify or Vercel (static + functions); GitHub Pages for static only. |
| D-015 | Correction-report storage | Recommended default | Pages Function validates + Cloudflare **Turnstile** check → creates an issue in a **private** GitHub repo (`da-corrections`) via a fine-grained token scoped to that repo's Issues only. | Any ticketing system with an API; or a D1 table. |
| D-016 | Analytics | Recommended default | **Cloudflare Web Analytics** (cookieless page views) + a first-party `POST /api/v1/events` endpoint that increments **aggregate daily counters** in Cloudflare **D1**. No cookies, no IP storage, no user IDs. No consent banner is required for this design, subject to the legal review in D-027. | Plausible, Umami or GoatCounter. |
| D-017 | Error monitoring | Recommended default | Client `error_shown` / `js_error` events (aggregate) + Cloudflare Functions logs. A dedicated error tracker (e.g. Sentry) is Later. | — |
| D-018 | Uptime monitoring | **Decision needed** | Any free external HTTPS uptime monitor hitting `/api/v1/health` and `/` every 5 minutes, alerting the maintainer by email. Owner picks the service and alert address. | — |
| D-019 | Brand assets & domain | **Decision needed before public launch** (V2.3: the private beta uses a preview domain and a working name, D-062) | Placeholder wordmark (text "Digital Advantage" in the display face) and domain `digitaladvantage.example` in all configs (`SITE_URL` env var). V2.2 recommends the working name *Whoolkit* (D-059, doc 21); adopt after the checks in 21. | — |
| D-026 | Analytics retention | Recommended default | Aggregate counters: 25 months. Zero-result query strings: normalised, truncated to 80 chars, stored only when count ≥ 1 that day, deleted after 90 days. | — |
| D-027 | Launch markets & legal review | **Decision needed** | Global audience, English. If the initial audience is Nigeria-based, review privacy notice and analytics against the Nigeria Data Protection Act 2023 and any other launch-market law **before public launch**. The spec claims no legal compliance. | — |
| D-039 | Toolchain | **Approved (amended by D-069)** | **Bun** (stable; version pinned through `BUN_VERSION` and the committed `bun.lock`) for install, scripts and local runtime; Node.js current LTS kept for tools that need it; ESLint, Prettier, TypeScript strict. CI uses `bun install --frozen-lockfile`. Exact versions pinned at project start. | The owner prefers Bun, Vite and React as the base of their stack. |
| D-040 | Test tooling | Recommended default (amended V2.5) | Vitest (unit) with React Testing Library (components), Playwright (e2e, responsive, visual snapshots), @axe-core/playwright (a11y), Lighthouse CI (perf budgets), lychee (link checking), Ajv (schema validation). | — |
| D-041 | Repository layout | Recommended default | One public repo `digital-advantage` (site + content, MIT/CC BY); one private repo `da-corrections` (reports only). | — |


## V2.1 decisions (owner direction, 21 October 2026)

| ID | Decision | Status | Default / choice | Rationale & consequences |
|---|---|---|---|---|
| D-042 | Identity-first entry | **Approved** | The landing page asks "Who are you?" (identity picker with type-ahead, up to 3 identities), then "What would you like to do?" (need chips + free search). Spec: 18 §9. | Human-friendly entry for everyone. Replaces audience cards as the primary path. |
| D-043 | No video-platform links in MVP | **Approved** | No YouTube, Vimeo, TikTok or Dailymotion links in any record. The validator rejects them. Official docs and text resources only; learners find videos themselves. | Videos get taken down or go stale; keeps maintenance low. |
| D-044 | Blanket MVP publication approval | **Approved** | Owner: "Assume it's all perfect for now; domain experts will validate later." All V2.1 taxonomy, needs, roadmaps and lenses, and the 26 pilot records, are published for MVP. The reviewer of record is "Product owner — blanket MVP approval (D-044)". | Speed to MVP. Transparency is preserved by D-045. |
| D-045 | Expert-validation labelling | Recommended default | Every identity, need, roadmap and lens has `expert_validation.status`. The trust footer shows "Expert review: pending" (no banner). Changeable tool facts still need sources (V2 evidence policy). | Honest without alarming visitors. |
| D-046 | Identity taxonomy | Recommended default (amended V2.2) | 24 sectors → 94 families (ISCO-08 sub-major crosswalk) → 2,603 identities (professions, specialisms, life roles) with 1,444 aliases and ISCO-08 unit-group codes. Visitors may pick up to 3 identities. | Broad, human and standards-anchored. |
| D-047 | Needs graph and resolution | Recommended default | 279 needs (32 universal). Resolution: core (own + parent + family) → sector → universal (18 §4). | The mechanism that makes every identity page specific. |
| D-048 | Tool registry vs tool profiles | Recommended default | 723 registry entries (name, publisher, link, category; no pricing claims) + full V2 profiles as research progresses. Registry-only tool pages are noindex unless a roadmap exists. | Breadth now, depth over time, no fabricated facts. |
| D-049 | Coverage expansion | Recommended default (post-launch) | Import ESCO occupations and ISCO-08 unit groups as aliases and identities, sector by sector, with expert review. | ISCO-08 unit groups completed in V2.2 (D-055); ESCO titles remain as an alias source. |
| D-050 | Post-MVP monetisation | **Decision needed after MVP** | Options and principles in `19_Post_MVP_Monetisation_Options.md`. Discovery stays free forever. | Owner wants to explore after MVP. |
| D-051 | Roadmaps, lenses and progress | Recommended default (amended by D-056) | 31 handwritten roadmaps (159 modules) plus archetype+signature roadmaps for every other tool in Beginner/Intermediate/Expert; 35 flagship lenses; auto lenses composed from need tags. R1 progress = on-device ticks only; synced progress is R2 (accounts). | Course-outline feature without accounts. |
| D-052 | Indexing for generated pages | Recommended default | Rules in 18 §12 (thin identity, identity×tool, auto-lens and registry pages are noindex with canonicals). | Avoids thousands of thin pages in search engines. |
| D-053 | Identity privacy | Recommended default | Chosen identities live only in the visitor's browser. Analytics record sector only (and only "life_role" for sensitive life roles). | Respect; no profiling. |
| D-054 | "Helping someone else" and toolkit cards | **Approved** (owner: people should advise family and friends) | Helping-mode toggle, printable/shareable toolkit cards, "Explain this to someone" on lenses (18 §11). | Turns users into trusted advisers. |

## V2.2 decisions (owner direction, 21 October 2026)

| ID | Decision | Status | Default / choice | Rationale & consequences |
|---|---|---|---|---|
| D-055 | Exhaustive occupation coverage | **Approved** (owner: "I want an exhaustive list of occupations") | Completeness is measured against ISCO-08: all 436 unit groups have ≥ 1 identity (validator gate). 2,603 identities, each with `isco08_units`. Everyday and regional names on top. The occupations directory is exported for experts. | A verifiable definition of "exhaustive" instead of an ever-growing guess. Musicians and performing artists are fully covered (100+ identities). |
| D-056 | Roadmap coverage minimum | **Approved** (owner: "At least 90% course outline is the minimum standard") | ≥ 90% of registry tools must have a roadmap (validator gate); V2.2 has 100%. Tiers: handwritten → archetype+signature (minimum) → expert-validated. Plain archetype-only roadmaps aren't allowed. On-screen labels: "in depth" vs "standard". | Ready to use for every tool on day one, with an honest depth label and a clear upgrade path (20 §5.4). |
| D-057 | Catalogue operations and admin role | Recommended default | Doc 20: source-file editing model; intake (zero-results, identity misses ≥ 3, suggestions, link checks, launch watch); daily/weekly/monthly/quarterly routine; lifecycle rules; KPIs; AI drafts with human approval; Git-CMS forms at R1.5; admin job profile. New suggestion issue types and the `identity_no_match` event. | The owner plans to hire an admin; the catalogue must stay current as tools change. |
| D-058 | More than one entry point | **Approved** (owner: "entry point is identity, but make it easy to explore another entry point, e.g. Skills") | "Explore by" switcher on S01. "Who are you?" stays the default; other tabs are What to do · Skills · Tools · Sectors. Cross-suggestions in every box. New S34/S35 skill screens and 63 skills. | People think in different ways; all paths lead into the same graph. |
| D-059 | Working name | Recommended (final choice stays D-019) | **Whoolkit** ("who" + "toolkit"), in the spirit of "Woogle". Avoid "-oogle" names because of Google trademark enforcement and the existing Whoogle and Hoogle. Keep "Digital Advantage" as the descriptor. Checks in 21. | Memorable, tells you it's for whoever you are, low conflict risk on first search. |

## V2.3 decisions (owner direction, 21 October 2026)

| ID | Decision | Status | Default / choice | Rationale & consequences |
|---|---|---|---|---|
| D-060 | Open contribution model | **Approved** (owner: "open-source mentality… submit improvements, reviewed in the backend") | Three lanes: in-app **Suggest an edit** (no account), GitHub pull requests, trusted reviewers. The private `da-corrections` repo is the inbox. A person approves every change. Facts need sources; vendors disclose interest; no paid influence. Review rules and service levels in 22 §3. | Rapid improvement from the people the catalogue serves, without losing trust. Moves contributor submissions from R2 to the R1 beta (C-30, C-31). |
| D-061 | Licences | Recommended default (owner may override) | Code **MIT** (alternative: AGPL-3.0); content **CC BY 4.0**; contributions accepted under the same; DCO sign-off for code. Templates in `spec-assets/repo-templates/`. | Contributor-friendly and clear. CC BY already used for exports. |
| D-062 | Beta-first release | **Approved** (owner: "Waiting forever can be another rabbit hole") | Private, invite-only beta on a preview domain about 5 weeks in: noindex, no email collection, aggregate analytics only. D-019, D-027 and D-018 gate the **public** launch, not the beta. Weekly release loop. | Real feedback early. The legal and brand work isn't wasted on a product still changing. |
| D-063 | Starter journeys | **Approved** (owner: "music and data analytics") | Musician and Data Analyst are the first two end-to-end journeys. Pilot 20 tools brought to full depth first (22 §5.3). The owner reviews the data journey; recruit one musician reviewer. | Two very different users prove the model. One is the owner's own field, for fast quality judgement. |
| D-064 | Built for easy change | Recommended default | Content as data; preview per PR; main is always deployable (merge = deploy); one-click rollback; feature flags (`spec-assets/config/feature-flags.json`) with owners and review dates; UI strings in one file; What's new generated from merged PRs labelled `user-visible`. | Changes take minutes and are safe to undo. |
| D-065 | Contributor credit | Recommended default | Optional credit name with consent, on the record ("Improved with help from…"), the Contributors page (S38) and What's new. Removable on request. Email off in the private beta (flag `suggest_email`). | Thanks people without collecting more personal data than needed. |

## V2.5 decisions (owner direction, 21 October 2026)

| ID | Decision | Status | Default / choice | Rationale & consequences |
|---|---|---|---|---|
| D-066 | Journeys become **helpers** | **Approved** (owner: "the journeys are more like helpers") | A helper is a guided path (stages, steps, a "done" checklist) that **follows the person across the app**: a Helper panel shows the stage and next step on every page. Routes `/helpers` and `/helpers/{slug}`; `/journeys` redirects. State lives only on the device. The word "Helpers" is the recommended label (change it in one strings file). Data files: `helpers.txt` → `helpers.json`, schema `helper.schema.json`. | Matches how people actually use the app: they look things up and come back. Reuses all journey content unchanged (C-34). |
| D-067 | Third starter helper: **Entrepreneur** | **Approved** (owner: "you can add a third one related to entrepreneurship") | Entrepreneur joins Musician and Data Analyst: test the idea, plan, look credible, sell, keep the books, grow, pitch. Headline identities: Startup Founder, Small Business Owner, Social Entrepreneur. 19 of its 23 tools still need full guides (22 §5.4). | Amends D-063. A broad audience, and the owner's own field of advice (consulting). |
| D-068 | Full-feature app scope | **Approved** (owner: "make the App level to all the features I have shared") | Release 1 is every row of the feature matrix (doc 23). Features not ready ship behind a flag with a `launch` value; the public launch requires all `launch: true` flags ON and `validate_feature_matrix.py` clean. The admin report (A01) moves from R1.5 into R1. | One list, checked by a script, instead of features spread over eight documents (C-35). |
| D-069 | Technology base | **Approved** (owner: "would have preferred bun, vite, react at the base of my tech stack") | **Bun, Vite and React** with React Router framework mode (`ssr: false`, `prerender` for the routes in 03), deployed as static files to Cloudflare Pages with unchanged Functions. Amends D-010 and D-039. ADR-008 in 11 supersedes ADR-001. A day-1 **Spike S-1** confirms build time, bundle size, CSP approach and Bun on Pages before Milestone B. | The owner's stack; one language end to end. Costs: more JavaScript per page than Astro, so the budgets in 14 §3 are reset (C-36); a CSP plan for prerendered inline scripts. |
| D-070 | Visual direction: very visual, sleek, responsive | **Approved** (owner: "very visual appealing and sleek responsive web app") | Mobile-first and confident: one memorable thing per screen, a large display face, pill controls, a bottom tab bar on phones, a route rail for helpers, a dark theme. Keeps the V2 tokens and typefaces (D-020, contrast-checked) until a designer signs off a change. Details in 06 §12. | "Sleek" is a direction, not a test, so sign-off is by a designer or the owner at the end of Milestone D. |

## Change log
| Date | ID | Change | By |
|---|---|---|---|
| 2026-10-21 | D-001 | Non-commercial confirmed | Product owner |
| 2026-10-21 | All others | Initial V2 baseline | V2 authoring |
| 2026-10-21 | D-001, D-002, D-035 amended; D-042–D-054 added | Identity-first direction | Product owner / V2.1 authoring |
| 2026-10-21 | D-012, D-019 timing amended; D-060–D-065 added | Open contribution, beta-first, starter journeys, easy change | Product owner / V2.3 authoring |
| 2026-10-21 | D-046, D-049, D-051 amended; D-055–D-059 added | Exhaustive occupations, ≥ 90% roadmaps, admin manual, Explore-by, name | Product owner / V2.2 authoring |
| 2026-10-21 | D-010, D-039, D-040 amended; D-066–D-070 added | Helpers, entrepreneur helper, full-feature scope, Bun + Vite + React, sleek visual direction | Product owner / V2.5 authoring |
