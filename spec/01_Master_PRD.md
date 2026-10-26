# 01 — Master Product Requirements Document

**Version:** 2.5 · **Date:** 21 October 2026 · **Supersedes:** V1 `01_Product_Requirements_Document.md` where stated · **Decisions:** `02_Product_Decision_Register.md`

## 1. Vision, mission and north star (unchanged from V1)
- **Product:** Digital Advantage, a global, mobile-first, responsive web platform for discovering, learning and applying digital tools and workflows.
- **North star:** help a person move from *"I need to do something"* to *"I know which tools and methods to use, how to use them, and what to do next."*
- **Mission:** make useful digital capability easier to discover and apply, whatever a person's role, experience, location or budget.
- **Thesis:** people start with a goal, not a tool name. Organise knowledge around outcomes, and still support tool-first and category-first discovery.
- **Business model:** non-commercial (D-001). No ads, sponsorships, affiliate links or paid placement.

## 2. Goals
V1's ten goals stand. V2 makes each one measurable through the KPI dictionary in §7.

## 3. Non-goals (V1 §4, plus V2 additions)
All V1 non-goals stand. V2 adds:
- Ratings, reviews or comments from visitors (Out of scope until a moderation model exists).
- Gamification, badges or streaks (Out of scope for R1–R2).
- Embedding third-party videos (R1 is link-only, D-037).
- Any commercial placement (D-001).

## 4. Users and jobs to be done
### 4.1 Audience model
Audiences are discovery lenses, never permissions (vocabulary in `spec-assets/taxonomy/audiences.json`). The home page shows six cards: Student, Professional, Business owner, Creator, Job seeker and Just exploring. The other seven audiences appear on `/discover`.

### 4.2 Task families and the audience/task matrix
The table below fulfils Gap Analysis §6.2. "Formats" means the content types that serve the family best.

| Family | Main intent | Typical level | Budget reality | Device / connectivity | Accessibility notes | Best formats | Common misconception | Success outcome | Example queries | Categories | Playbook ideas |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Create | Make a graphic, video, document, site or audio | Beginner | Often zero budget | Many start on phones; video editing usually needs a laptop | Captions, alt text, contrast | Task, Tool, Comparison | "Free" tools are always fully free | A finished, shareable file | edit videos for free; make a poster | design, video, audio, writing | Make a 60-second explainer video |
| Learn | Understand a concept or gain a skill | Beginner | Zero/low | Phone-first; data cost matters | Transcripts, readable pace | Resource, Task, Learning path (R2) | Watching = learning | Can do the skill unaided | learn to code free; learn Excel | education, development | Learn the basics of spreadsheets in a week |
| Research | Find, organise and check information | Beginner–intermediate | Zero; paywalls common | Laptop for writing | Screen-reader-friendly tools | Task, Playbook, Tool | Search ranking = credibility | Credible, cited sources | research a topic; cite sources | research, writing | Research a topic and write a cited summary ✔ |
| Write & communicate | Draft, edit, translate, share | Beginner | Zero/low | Any | Plain language | Task, Tool | AI output needs no checking | Clear text ready to send | improve my writing; translate a document | writing, collaboration | Draft, edit and proofread a report |
| Analyse | Work with data, charts, dashboards | Intermediate | Low | Laptop | Chart alternatives (tables) | Task, Playbook, Resource | Charts prove causation | Correct chart or summary | analyse a spreadsheet; make a chart | data, productivity | Clean a spreadsheet and chart it |
| Automate | Remove repetitive work | Beginner–advanced | Free tiers with limits | Online service or own server | Accessible builders vary | Task, Tool, Comparison | Automation is set-and-forget | A tested, monitored automation | automate repetitive work | automation | Save form responses to a sheet automatically |
| Organise | Projects, notes, files, tasks | Beginner | Zero | Cross-device sync | Keyboard shortcuts | Tool, Task | More tools = more organised | One trusted system | organise notes; track tasks | productivity, collaboration | Set up a simple personal task system |
| Build | Websites, prototypes, software | Intermediate–advanced | Hosting/domain costs | Laptop | Build accessible sites | Task, Playbook, Resource | Website software is the only cost | A live, maintained site/app | build a website | websites, development | Launch a one-page website |
| Grow a business | Market, sell, support, operate | Beginner–intermediate | Tight; ROI-driven | Phone-heavy | Accessible customer comms | Playbook, Tool, Comparison | Paid tools = growth | Measurable customer outcome | market my small business; send invoices | marketing, business-operations | Set up a basic customer enquiry flow |
| Career & work | Jobs, CVs, interviews, portfolio | Beginner | Zero | Phone + laptop | Accessible CV formats | Task, Playbook | Templates guarantee interviews | A submitted, tailored application | write a CV; build a portfolio | career | Build a simple online portfolio |
| Teach & support | Make learning materials, help others | Intermediate | Zero/low; institution licences | Classroom devices vary | Accessible materials are mandatory | Task, Resource | Accessibility is optional | Usable, accessible materials | make a lesson; create a quiz | education, security-privacy-accessibility | Turn a lesson into an accessible handout |
| Compare options | Choose between tools | Any | Usually "what's free?" | Platform constraints | Accessibility info where verified | Comparison, Tool | Biggest name = best | A confident choice with known limits | free alternative to X | (cross-cutting) | — |

✔ = present in the pilot catalogue.

## 5. Use cases (journeys)
These are V1 journeys A–F, now fully specified in `05_User_Journeys_and_Interaction_Flows.md`:
- A: classroom visitor arriving by QR code
- B: search-engine visitor
- C: free-tool seeker
- D: goal-led beginner
- E: returning learner (R1.5+)
- F: content editor

## 6. Scope matrix (Gap Analysis §4.1)
| Capability | Release | Notes |
|---|---|---|
| Public homepage | **R1** | Copy approved (D-002) |
| Global search (no AI) | **R1** | MiniSearch, URL state, filters (D-013) |
| Category browsing | **R1** | Categories visible at ≥ 3 records (D-035) |
| Task-based discovery | **R1** | `/tasks`, grouped by family |
| Audience-based discovery | **R1** | `/for/{audience}` curated landing pages; never restrictive |
| Tool detail pages | **R1** | |
| Tutorial/resource pages | **R1** | Link-only, with a detail page for shareability |
| Workflow/playbook pages | **R1** | With in-page checklist (no saved progress) |
| Alternatives & related content | **R1** | Editorial `alternative_tool_ids` + rule-based related lists (03 §6) |
| Comparison pages | **R1** | Basic, 2–3 tools (D-028) |
| Pricing/cost information with sources | **R1** | 10-value vocabulary (D-007) |
| Freshness indicators | **R1** | Last reviewed date; overdue notice |
| Correction-report form | **R1** | C-07 |
| Editorial CMS | **R1** | Git + PR workflow (D-012) |
| Analytics (privacy-first) | **R1** | Aggregate only (D-016) |
| Dark mode | **R1** | D-021 |
| "Was this helpful?" feedback | R1.5 | Aggregate yes/no event |
| Curated collections | R1.5 | D-029 |
| Device-only bookmarks, recently viewed | R1.5 | D-005; no account |
| Git-CMS UI for non-technical editors | R1.5 | D-012 decision |
| User accounts, sync | R2 | D-004 |
| Learning paths with progress | R2 | D-030 |
| Projects/challenges | R2 | D-030 |
| AI-assisted discovery (grounded) | R2 | D-006 |
| Personalised recommendations | R2 | Only from declared preferences |
| Contributor submissions | **R1 beta** (V2.3, D-060) | "Suggest an edit" on every page; reviewed before publishing; optional credit (doc 22) |
| Ratings & comments | Out of scope | |
| Gamification | Out of scope | |
| Notifications | Later (post-R2) | |
| Sponsorship/affiliate | Out of scope while D-001 stands | |

## 7. KPI dictionary (Gap Analysis §5)
Owner of all KPIs: the product owner. Report monthly in the freshness/metrics issue (see 16 §7). Targets will be set only after 8 weeks of baseline data (V1 §8).

| KPI | Definition | Formula | Source | Frequency | Retention | Limitations |
|---|---|---|---|---|---|---|
| Search success rate | Share of searches followed by opening a result | `search_result_opened` ÷ `search_submitted` (same day, aggregate) | Event counters | Weekly | 25 months | Aggregate ratio, not per-session; multiple opens per search inflate it. Cap the reported value at 100%. |
| Zero-result rate | Share of searches with zero results after the OR fallback | `search_zero_results` ÷ `search_submitted` | Event counters | Weekly | 25 months (query text 90 days) | Typos inflate it. Review the top zero-result queries weekly. |
| Content engagement | Detail views that lead to an outbound or resource action | (`official_link_clicked` + `resource_opened`) ÷ `content_viewed` (tool and task types) | Event counters | Monthly | 25 months | Leaving to the official site is the desired outcome, so it counts as success. |
| Outbound CTR | Official-link clicks per tool view | `official_link_clicked` ÷ `content_viewed`[type=tool] | Event counters | Monthly | 25 months | — |
| Playbook completion signal | Checklist completions per playbook view | `playbook_checklist_completed` ÷ `content_viewed`[type=playbook] | Event counters | Monthly | 25 months | Self-reported ticks, not verified outcomes. |
| Shared deep-link visits | Detail views arriving direct or from another site | `content_viewed`[entry ∈ direct_or_shared, other_site] | Event counters | Monthly | 25 months | Direct traffic also includes bookmarks. |
| Return rate | Proxy: share of visits flagged as returning by Cloudflare Web Analytics, if available; otherwise not measured | Provider metric | CF Web Analytics | Monthly | Provider's retention | No identifiers are used, so this is approximate or unavailable. Accepted (privacy over precision). |
| Freshness compliance | Published records within their review interval | count(published, not overdue) ÷ count(published) | CI freshness report | Weekly | Git history | — |
| Evidence completeness | Published tools whose pricing and platforms are verified or partially verified | count ÷ published tools | CI report | Weekly | Git history | — |
| Correction resolution time | Median days from issue creation to close | GitHub issue timestamps | Corrections repo | Monthly | Issue lifetime | Small samples: report counts as well as the median. |
| Broken-link rate | Confirmed broken links ÷ links checked | lychee output; "confirmed" = failed on 2 consecutive weekly runs | Link-check job | Weekly | 12 months of job artifacts | Temporary errors are excluded. |
| Duplicate rate | Records flagged as possible duplicates by the validator | count | CI | Per PR | Git | — |
| Performance (field) | p75 LCP, INP and CLS on mobile | CF Web Analytics Core Web Vitals | Provider | Monthly | Provider's retention | Depends on provider support. Lab budgets in 14 §3 are the gate. |

Measurement rules:
- Bot filtering follows `events.json`.
- Values based on fewer than 5 counts are hidden.
- There are no session identifiers, so "sessions" are never claimed.

## 8. Functional requirements
V1 FR-001 to FR-034 remain in force. They are traced individually in `15_QA_and_Acceptance_Matrix.md`. V2 adds:

| ID | Requirement |
|---|---|
| FR-035 | Records with `editorial_status` draft or in_review never appear in production builds; preview builds show them with a "Preview — not yet published" banner. |
| FR-036 | Every changeable claim shown publicly (pricing, platforms, licence, availability) shows its source link and checked date within one interaction (inline or a "Sources" disclosure). |
| FR-037 | The platform filter matches only verified platforms unless the visitor turns on "Include tools with unconfirmed platform details" (D-034). |
| FR-038 | Pricing badges use only the labels in `vocabularies.json`; `unknown` displays "Price not confirmed" and never "Free". |
| FR-039 | Cost-intent queries ("free…") boost records that can be started without paying but never hide others (search-config `cost_intent`). |
| FR-040 | Archived and discontinued records stay reachable at their URLs with a notice and alternatives, are excluded from recommendation lists, and rank last in search. |
| FR-041 | When `next_review_at` has passed by more than 30 days, public pages show "Review due — details may have changed". |
| FR-042 | The correction form works without an account and without JavaScript-only dependencies beyond the bot check. If the bot check cannot load, the form shows the contact email fallback. |
| FR-043 | Theme preference (light/dark/system) persists per device without any server call. |
| FR-044 | A full public content export (`/export/catalogue-v2.json`) is generated on every build. |
| FR-045 | The validator rejects any non-empty commercial disclosure while D-001 stands. |

## 9. Non-functional requirements
V1 NFR-001 to NFR-030 remain in force. Numeric budgets are in `14_SEO_Analytics_and_Performance_Plan.md` §3, the accessibility test plan in `13`, and security controls in `12`.

## 10. Release gates
- **Soft launch (pilot group):** all R1 screens done; the 15 V1 critical scenarios pass; the pilot catalogue is published after human review; D-018 and D-019 resolved; D-027 legal review started.
- **Public launch:** everything above, plus the D-035 content bar met, D-027 review complete, and the launch gate in `15` §4 passed.

## 11. V2.1 — Identity-first additions (owner direction, 21 Oct 2026)
**New product principle 11. Identity first, never identity-locked.** Every visitor can say who they are (any profession or life role) and get a toolkit made for their work. Every page stays public and every tool shows all the professions that use it. Full spec: `18_Identity_First_Discovery_Specification.md`.

**Goal 11:** a visitor feels like a capable adviser to family, friends and colleagues after using the site ("everyone suddenly feels like an expert").

### 11.1 Scope matrix additions
| Capability | Release | Notes |
|---|---|---|
| "Who are you?" identity picker (type-ahead, up to 3) | **R1** | D-042, D-046 |
| Identity toolkits `/for/{identity}` (core / sector / universal needs) | **R1** | 2,603 identities; all 436 ISCO-08 unit groups (D-055) |
| Needs pages | **R1** | 279 needs |
| Tool registry pages (breadth) + full profiles (depth) | **R1** | D-048 |
| "Who uses {tool}" and "Surprising uses" on tool pages | **R1** | Derived from the needs graph |
| Tool skill roadmaps (Beginner / Intermediate / Expert) | **R1** | Every registry tool: 723/723 (31 handwritten + 636 archetype+signature), 6,519 modules; ≥ 90% gate (D-056) |
| "Explore by" switcher: Who are you? (default) · What to do · Skills · Tools · Sectors | **R1** | D-058, 18 §18 |
| Skills index and skill pages `/skills`, `/skills/{skill}` | **R1** | 63 skills in 9 groups |
| Occupations directory (CSV/Markdown) for expert review | **R1** | 18 §19 |
| Admin operations routine, intake and KPIs | **R1** (process) / R1.5 (CMS forms) | D-057, doc 20 |
| Lenses (tool × need), flagship + auto | **R1** | 35 flagship |
| On-device "I can do this" ticks | **R1** | No account |
| "Helping someone else" mode, toolkit cards, explain-this cards | **R1** | D-054 |
| Expert-validation programme and badges | Post-MVP | D-045 |
| ESCO title aliases (ISCO-08 unit groups done in V2.2) | Post-launch | D-049, D-055 |
| Synced progress, guided plans, practice packs, certificates, AI coach, organisation workspaces | R2 / post-MVP (possibly paid) | D-050, doc 19 |
| Localised identities and needs | Later | 18 §17 |

### 11.2 Functional requirements (V2.1)
| ID | Requirement |
|---|---|
| FR-046 | The home page presents "Who are you?" with type-ahead over all identity labels and aliases, supporting up to 3 selections as removable chips. |
| FR-047 | After selection, "What would you like to do?" shows the identity's top core needs (interleaved across selections) plus 2 universal needs. |
| FR-048 | Identity pages show needs in three groups (Core to your work, Shared across {sector}, Everyone benefits), each need with its tools in fit order and a lens link where one exists. |
| FR-049 | Specialisms show their parent profession's needs as part of core; parent pages list specialisms. |
| FR-050 | Tool pages show "Who uses {tool}" grouped by sector, and "Surprising uses" (sectors furthest from the tool's home category). |
| FR-051 | Tool pages with a roadmap show the three-level outline and a lens switcher ("See this for: …"). |
| FR-052 | `/for/{identity}/{tool}` selects the lens by the algorithm in 18 §7 and lists the identity's other needs that use the tool. |
| FR-053 | Combined queries "{tool} for {identity}" route directly to `/for/{identity}/{tool}`. |
| FR-054 | Identity choices persist only on the device; no request contains an identity slug; analytics record sector only (18 §10). |
| FR-055 | Registry-only tools never display pricing, platform or feature claims. |
| FR-056 | No content record contains a video-platform link (validator-enforced). |
| FR-057 | Every identity, need, roadmap and lens displays its expert-validation status in the trust footer. |
| FR-058 | Toolkit cards print on one A4/Letter page and have a WhatsApp-ready text version of 1,000 characters or fewer. |
| FR-059 | Generated pages follow the indexing rules in 18 §12. |
| FR-060 | The identity picker works without JavaScript via `/who-are-you` (A–Z and by-sector lists). |

### 11.3 KPI additions
| KPI | Formula | Note |
|---|---|---|
| Identity start rate | `identity_selected` ÷ home page views | Is the question working? |
| Identity → action rate | (`need_chip_selected` + `lens_viewed`) ÷ `identity_selected` | Did they find something relevant? |
| Advice rate | `toolkit_shared` ÷ `lens_viewed` + identity page views | Are people becoming advisers? |
| Learning engagement | `module_marked_done` per week | On-device ticks, aggregate |
| Sector reach | Distinct sectors with ≥ 5 `identity_selected` per week | Breadth of relevance |

## 12. V2.3 — Open contribution and beta-first delivery (doc 22)
**Goal 12:** the catalogue improves every week because the people it serves help correct it.

| Capability | Release | Notes |
|---|---|---|
| "Suggest an edit" on every page (S36), review queue, ~minutes to live after approval | **R1 beta** | D-060, 22 §3 |
| What's new page (S37), generated from merged changes | **R1 beta** | D-064 |
| Contributors page (S38) and on-record credit | R1 (flag off in the private beta) | D-065 |
| Feature flags, preview per change, one-click rollback, weekly releases | **R1** | D-064 |
| Starter helpers: Musician, Data Analyst, Entrepreneur (Pilot tools at full depth) | **R1 beta** | D-063, D-066, D-067, 22 §5 |
| Open-source repository (MIT code, CC BY 4.0 content) | **R1 beta** | D-061 |

**Functional requirements (V2.3):**
| ID | Requirement |
|---|---|
| FR-061 | Every content page shows "Suggest an edit" (flag `suggest_edit`), opening S36 with the page and record prefilled. |
| FR-062 | Suggestions for pricing, feature, availability or discontinuation require an https source link (schema-enforced). |
| FR-063 | Credit names are published only with explicit consent, and can be removed on request. |
| FR-064 | No suggestion changes the live site without a reviewer's approval (merge). |
| FR-065 | Every feature not yet ready ships behind a flag defaulting to off. Unknown flags are treated as off. |
| FR-066 | While `noindex_site` is on, every page sends `noindex` and robots.txt disallows all. |

## 12. V2.5 — Helpers, full-feature scope and the new technology base (owner direction, 21 October 2026)
**Product principle 12. Helpers, not just pages.** A person who wants to get somewhere (release a song, build a dashboard, start a business) can start a **helper**. It follows them around the site, shows where they are and what to do next, and remembers their place on their own device.

**Goal 12:** the app is **level with every feature the owner has asked for**, and that is provable from one list (doc 23).

### 12.1 Scope matrix additions
| Capability | Release | Notes |
|---|---|---|
| Helpers index and helper pages (`/helpers`, `/helpers/{slug}`) | **R1** | D-066; S39, S40 |
| Helper panel on every page while a helper is active | **R1** | S41; flag `helper_panel` |
| Starter helpers: Musician, Data Analyst, Entrepreneur | **R1** | D-063, D-067 |
| Start a helper for someone else; share link; WhatsApp and print card | **R1** (flag on at launch) | D-054; FR-072 |
| Feature matrix and launch gate | **R1** | D-068; doc 23 |
| Admin report A01 | **R1** (was R1.5) | D-068 |
| Bun + Vite + React with React Router prerender | **R1** | D-069; ADR-008 |
| Sleek, very visual, mobile-first look | **R1** | D-070; 06 §12 |
| Synced progress across devices, certificates, accounts | R2 / post-MVP | D-004, D-050 |

### 12.2 Functional requirements (V2.5)
| ID | Requirement |
|---|---|
| FR-067 | `/helpers` lists exactly the helpers named in the `helpers` flag's `listed` array. Each card shows the title, promise, number of stages and tools, and Start and Preview actions. When the flag is off, helper routes and navigation items do not exist. |
| FR-068 | A helper is built from `taxonomy/source/helpers.txt` into `helpers.json`: 3 to 8 ordered stages, each with a goal, a time estimate, 1 to 6 steps (tool, what to do, first win) and 1 to 5 "you're done when" lines. The build fails on an unknown tool, need or identity slug, or any schema error (`helper.schema.json`). |
| FR-069 | Helper progress (the active helper, ticks, tools opened, an optional "for someone" label) is stored only on the device, in one versioned key, and is never sent in any request. "Clear my progress" removes it in one tap. |
| FR-070 | While a helper is active, a Helper panel (a collapsed pill that expands into a sheet) is available on every page. It shows the current stage and the next step, and never covers content or primary controls at 320 px. |
| FR-071 | A tool page for a tool inside a helper shows "Where this fits" (stage, step and first win). Tool pages outside the active helper do not. |
| FR-072 | A helper can be started for someone else, with an optional label kept on the device. Sharing links to the helper page only; the WhatsApp text is at most 1,000 characters; the print view fits one A4 or Letter page. |
| FR-073 | Every feature in `spec-assets/qa/feature-matrix.csv` cites existing decisions, requirements, screens, tests and flags. The public launch requires `validate_feature_matrix.py` to pass and every shipping feature's flags to launch ON. |
| FR-074 | `bun run build` produces static files. At the public-launch gate every route in 03 is prerendered; the beta may prerender the core routes and serve the rest through a single-page fallback. The build is reproducible from a clean checkout. |
| FR-075 | Record content is never injected as raw HTML (`dangerouslySetInnerHTML` is banned for record content by lint). Inline scripts emitted by prerendering are covered by hashes. |

## 13. V2.6 — Goals, alternatives, accounts and recommendations (owner direction, 22–23 October 2026)
Full detail in doc 24; build order in doc 25.

| ID | Requirement |
|---|---|
| FR-076 | The product states its positioning as using technology to compete, grow and scale. Each need has 1–2 intents; the home screen offers three intent chips that filter and never hide content (D-075). |
| FR-077 | Goals are outcome-phrased jobs under one parent need; every need has at least 2 goals; each goal lists 3–8 tools, best first (D-071). |
| FR-078 | A person can jump straight to a goal: search covers goal labels, search words and tool names; `/goals` and `/goals/{slug}` are prerendered (D-071). |
| FR-079 | Each tool shows up to 7 alternatives derived from goals (never hand-typed), in rank order, with a note that lower-ranked ones are "also used for this job" (D-072). |
| FR-080 | Stub tools are labelled "Details being confirmed" and carry no price, platform or feature claims (D-073). |
| FR-081 | Goals and tools can be tagged for Nigeria or Africa; a visitor in Nigeria gets market-tagged goals boosted, and global items are never hidden (D-074). |
| FR-082 | A tool recorded as unavailable in a market shows "Not available in {market} since {date}" and is not recommended there; the build fails if a market-tagged goal lists it (D-074). |
| FR-083 | Skills, tools, goals and helpers can be starred without an account; skills have the states starred, learning and can do; My workbench lists them (D-079). |
| FR-084 | Sign-in is optional and is offered only after the 3rd star, first completed helper stage, 5th ticked module or a return visit, at most once per session and not again for 14 days after "Not now". It never blocks public content (D-076). |
| FR-085 | Sign-in uses an email one-time code and Google; the auth stack is chosen by Spike S-2 (D-077). |
| FR-086 | The consent screen has three separate switches, all off until chosen: save progress, use my profile to recommend, count me in trending (D-078). |
| FR-087 | A signed-in person can export their data as JSON and delete their account; delete removes rows and activity (D-078). |
| FR-088 | On sign-in, device stars and progress merge into the account; conflicts keep the newer (D-079). |
| FR-089 | Recommendations follow rules R1–R8; at most 5 cards, at most 2 per kind; every card shows why; "Not for me" and "I already know this" are on every card and a dismissed item does not return for 30 days (D-080). |
| FR-090 | Trending shows top skills, professions, goals and tools from opted-in signed-in users over 7 days with k ≥ 10 per row; it stays hidden below the activity gate or with fewer than 3 qualifying rows (D-081). |
| FR-091 | A stage can save an output of at most 280 characters or an https link; outputs are private to the person (D-082). |
| FR-092 | A week after a stage the person may be asked "What changed for you?" with the six fixed answers; it is optional and never shown publicly as a claim (D-082). |
| FR-093 | A person who suggested a fix can see its status at `/suggestions/{ref}` (D-082). |
| FR-094 | Anonymous visitors keep the same experience as before: no cookie for tracking, aggregate counters only. User-linked activity is a separate store and requires sign-in and consent (D-078). |
| FR-095 | Every tool page and card shows the tool's short description, price chip (pricing model), free-tier chip and price note from `tool-profiles.json` (D-084). |
| FR-096 | A profile that is not fully checked shows the Preview label beside the price. The label lists what is unchecked on tap, is never hidden, and is removed only when `verification.level` is `web_seen` with a source and date (D-084). |
| FR-097 | Lists (goals, kits, alternatives, search results, comparisons) show the price chip and a Preview mark on every tool card (D-084). |
| FR-098 | The build fails if same-kind alternatives fall below 95% of tools (D-085). |
| FR-099 | `/kits` lists the kits and `/kits/{slug}` shows ordered steps; kits are generated from `goal_kits.txt` (D-086). |
| FR-100 | Each kit step shows its goal, top three tools with price chips, the goal's safety note and a link to the next step (D-086). |
| FR-101 | A goal or kit step that carries a safety tag shows the safety panel before its tool list: what to know, three visible red flags, where to get help (D-087). |
| FR-102 | Safety panels never state that a tool or offer is safe, verified or guaranteed, and give no financial, legal or medical advice (D-087). |
| FR-103 | Goal search removes lead-ins such as "I want to" before matching, indexes kits with their phrases, and ranks a matching kit above goals (D-088). |
| FR-104 | The home page offers "I want to…", Who are you?, Skills, common situations (kits), intent chips and browse-by-need, and every path reaches goals (D-088). |
| FR-105 | Every goal has at least three related goals and, inside a kit, a next step; a tool page lists the goals that use it (D-088). |
| FR-106 | "Suggested for you" shows rules R9 to R12 to anonymous visitors from on-page or on-device data only, with no new storage and no tracking (D-089). |
| FR-107 | The build fails if there is no goal for remote jobs, CV, portfolio, proofreading, freelancing, learning to code, teaching kids to code or being paid from abroad (D-090). |
| FR-108 | Accounts are for adults. Kids' resources are written for teachers and parents, and the kids safety panel links to a note on children's data (D-090; counsel to confirm). |
| FR-109 | Identity, goal, tool, learning path, kit and helper pages render exactly one `NextStepCard` as the last content block, with a working target (D-092; Beta). |
| FR-110 | Every tool row and tool page shows "Learn {tool}" linking to the best path for the visitor's role, else the general guide (D-092; Beta). |
| FR-111 | Every tool mention renders a TrustLine; a price chip never appears without a verification chip (D-093; Beta). |
| FR-112 | Every learning path card and page shows a DepthLabel computed from `authoring` and lens/role data (§4) (D-094; Beta). |
| FR-113 | General guides render the depth explainer with up to 3 job chips and "Ask for my job" (creates a suggestion of type `role_path_request`) (D-094; Beta). |
| FR-114 | Need cards collect 👍/👎 feedback anonymously (`need_feedback` event); 👎 hides the card for the session with Undo (D-102; Beta). |
| FR-115 | Helper bar: first-run coach mark, hide/restore, never overlaps content; helper pages show the explainer banner (D-100; Beta). |
| FR-116 | No horizontal overflow at 360, 375, 390, 414 and 430px on any route; fixed elements reserve space (D-101; Beta). |
| FR-117 | Browse and identity no-match show "Suggest my role" (D-103; Beta). |
| FR-118 | Home H1, meta description and default OG use the D-104 promise (D-104; Beta). |
| FR-119 | The app passes `check-design` (0 errors) and `design-audit` (0 failures) on all mapped routes before any release (D-099; Beta). |

**Scope rows added:** goals and jump-to-goal (Beta); alternatives, markets and availability (Beta); stars and My workbench on device (Beta); accounts, recommendations, trending, outcomes and suggestion status (Launch). Out of scope: machine learning, push notifications, marketing email, public profiles.
