# 03 — Information Architecture and Taxonomy

**Version:** 2.6 · Controlled vocabularies are machine-readable in `spec-assets/taxonomy/`. Those files are authoritative; this document explains them.

## 1. Route tree (R1)
```
/                                   S01 Home
/search                             S02 Search results (query + filters in URL)
/discover                           S03 Discover hub (all categories, task families, audiences)
/categories/{category-slug}         S04 Category landing
/tasks                              S05 Task index (grouped by task family)
/tasks/{task-slug}                  S06 Task guide
/for/{audience-slug}                S07 Audience landing ("For students")
/tools                              S08 Tool directory (A–Z + filters)
/tools/{tool-slug}                  S09 Tool detail
/resources                          S10 Resource index
/resources/{resource-slug}          S11 Resource detail
/playbooks                          S12 Playbook index
/playbooks/{playbook-slug}          S13 Playbook detail
/compare/{comparison-slug}          S14 Comparison
/about                              S15 About
/about/editorial-standards          S16 Editorial standards (selection, independence, non-commercial statement)
/about/how-we-review                S17 Verification & freshness (pricing labels explained, review intervals)
/report                             S18 Report an issue (?page=/tools/x&record=tool_x&type=pricing)
/report/thanks                      S19 Report confirmation
/contact                            S20 Contact & help
/privacy                            S21 Privacy notice
/terms                              S22 Terms of use
/accessibility                      S23 Accessibility statement
/404 (any unknown path)             S24 Not found
(error boundary)                    S25 General error / offline
/learn                              S26 Learn hub (resources + playbooks; learning paths "coming later" note removed until R2)
/export/catalogue-v2.json           machine export
/api/v1/*                           see 10_API_Specification.md
/sitemap.xml, /robots.txt, /rss/recently-reviewed.xml (R1: RSS of recently reviewed records)
```
Reserved routes (no pages in R1; return S24 404): `/collections/*` (R1.5), `/learn/paths/*` (R2), `/projects/*` (R2), `/account/*` (R2).

## 2. Navigation
### 2.1 Desktop (≥ 1024 px)
The header has, left to right:
- the wordmark (link to `/`);
- primary navigation: **Discover · Learn · Playbooks · About**;
- a search input (min 280 px, expands to 360 px on focus);
- a theme toggle (icon button).

"Projects" is hidden in R1 (C-08). "Discover" opens a mega-panel with three columns: Categories (visible ones), Task families, and Who it's for. The mega-panel opens on click or on Enter/Space; hover never opens anything.

### 2.2 Tablet (768–1023 px)
- Wordmark, a search icon button that expands to a full-width bar under the header, the theme toggle, and a Menu button.
- Primary nav items move into a drawer.

### 2.3 Mobile (< 768 px)
- Header (56 px): wordmark, search icon button, Menu button.
- The Home page shows the hero search field in the first viewport, so search is never only behind the menu (V1 02 §1).
- Every other page has a sticky search icon in the header.
- The menu drawer slides in from the right at full height, with items in this order:
  1. Discover
  2. Learn
  3. Playbooks
  4. Tools A–Z
  5. About
  6. Report an issue
  7. Theme (radio group)

### 2.4 Footer (all sizes)
- **Column 1:** wordmark and one-line mission.
- **Column 2, Explore:** Discover, Tasks, Tools A–Z, Playbooks.
- **Column 3, Trust:** Editorial standards, How we review, Report an issue.
- **Column 4, About:** About, Contact, Privacy, Terms, Accessibility.
- **Bottom line:** "Non-commercial. No ads, sponsors or affiliate links." · licence line "Text CC BY 4.0" · build date.

On mobile the columns stack and become accordions; the bottom line stays visible.

### 2.5 Breadcrumbs
Shown on S04, S06, S09, S11, S13 and S14. The pattern is `Home › {Section} › {Primary category} › {Record}`. For tools the section is "Tools"; for tasks it is "Tasks › {Task family}". Breadcrumbs truncate the middle items on mobile ("Home › … › Record"). Also emit `BreadcrumbList` structured data.

## 3. Taxonomy dimensions
| Dimension | File | Applies to | Facet in search? | Notes |
|---|---|---|---|---|
| Category | `categories.json` | tool, task, playbook, comparison | Yes | 20 values (V1 domains); public only at ≥ 3 published records |
| Task family | `task-families.json` | task | No (grouping only) | 12 values |
| Task | content records | tool↔task many-to-many | No (tasks are results themselves) | |
| Audience | `audiences.json` | tool, task, playbook | Yes (never implicit) | 13 values; 6 home cards |
| Content type | `vocabularies.json#content_type` | all | Yes ("Type") | |
| Skill level | `vocabularies.json#skill_level` | tool, task, playbook, resource | Yes ("Level") | Explicit criteria |
| Pricing model | `vocabularies.json#pricing_model` | tool | Yes ("Cost", grouped) | 10 values |
| Resource cost | `vocabularies.json#resource_cost_status` | resource | Via "Cost" group mapping | |
| Platform | `vocabularies.json#platform` | tool | Yes | Verified-only matching |
| Deployment | `vocabularies.json#deployment` | tool | No (shown on page) | |
| AI involvement | `vocabularies.json#ai_involvement` | tool | Yes ("AI features") | |
| Availability | `vocabularies.json#availability_status` | tool | No (affects ranking/notices) | |

### 3.1 Taxonomy governance (Gap Analysis §7.2)
Every value has these fields:
- a stable `id`;
- `slug`, `label` and `description`;
- `aliases`, which feed search synonyms;
- `editor_selectable` and `visitor_visible`;
- a retire rule.

Rules:
- Only the product owner may add, rename or retire values (D-024). Changes go through a PR labelled `taxonomy`.
- **Renaming:** change the `label`; keep the `id`. If the `slug` changes, add a redirect.
- **Retiring:** set `retired: true` and `replaced_by`. The validator then flags records still using the old value, and the URL redirects to the replacement.
- Never mix dimensions. Categories describe *what kind of tool or activity*, audiences describe *who*, content types describe *format*. There is no free-text tag field.

### 3.2 Naming rules
- **Slugs:** lowercase ASCII, hyphen-separated, 2–80 characters, pattern `^[a-z0-9]+(?:-[a-z0-9]+)*$`.
  - Tools use the product name (`davinci-resolve`).
  - Tasks use the verb phrase (`edit-a-video-for-free`).
  - Comparisons use `a-vs-b[-vs-c]`.
- **IDs:** `{prefix}_{snake_case}` with prefixes `tool_`, `task_`, `res_`, `pb_`, `cmp_` and `col_`. IDs never change, even if the slug does.
- **Titles:**
  - Tasks are phrased as the visitor's question ("How do I…?"), with a `short_title` for cards.
  - Tools use the product's own capitalisation.
  - Disambiguate when needed: "WordPress (software)".
- **Spelling:** British English in UI copy and content (D-036).

## 4. Canonical paths and redirects
- Each record has exactly one canonical URL, built from its content-type route and slug.
- When a slug changes:
  1. The old slug is added to the record's `redirect_from[]`.
  2. The build generates a 301 in `_redirects`.
  3. `content/redirects.json` holds non-record redirects such as retired categories.
- The validator fails on redirect loops, on redirects to non-existent targets, and on a `redirect_from` value that collides with a live slug.
- Query parameters are never part of a canonical URL. The `/search` canonical is `/search` and it is `noindex` (see 14).

## 5. Discovery specification (G09)
### 5.1 Curated surfaces
| Surface | Rule |
|---|---|
| Home → "Try something practical" | Up to 6 items: the owner-chosen tasks and playbooks in `content/curation/home.json` (ordered list of IDs). Unpublished IDs are skipped silently. |
| Home → "Editor's picks" | Up to 6 records from `content/curation/home.json#editors_picks`. The label is always "Editor's picks", never "Popular". |
| Home → "Recently reviewed" | The 6 most recent `last_verified_at` among published tools and tasks. |
| Audience landing `/for/{aud}` | A curated list in `content/curation/audiences/{aud}.json` (tasks, then tools, then playbooks). Fallback: records tagged with the audience, sorted by recently reviewed. |
| Category landing | Sections: Beginner starting point (the first beginner task), Popular tasks (curated, otherwise all tasks in the category), Tools, Playbooks, Comparisons. |

### 5.2 Related content (rule-based, deterministic)
For a record R, compute related items in this order and stop at 6:
1. Explicit editorial links: `alternative_tool_ids`, `related_task_ids`, `playbook_ids`, `resource_ids` and `comparison_ids`.
2. Records sharing a task with R, in the same content type (tools of the same task, for instance).
3. Records sharing the primary category (the first `category_ids` item), ranked by number of shared categories and then by most recently reviewed.

Always exclude R itself, archived records, discontinued tools, and non-published records in production. Show nothing rather than random filler (V1 FR-013). Section titles:
- "Alternatives to {name}" (step 1 tools only);
- "Related how-tos";
- "Playbooks that use {name}";
- "Learn {name}".

### 5.3 Ordering lists
- Directory and index pages sort A–Z by default.
- Category tool lists sort by: tools that can be started without paying first, then A–Z.

This is a documented editorial default, not a quality ranking, and the page states it: "Sorted: options you can start without paying first, then A–Z".

## 6. V2.1 — Identity-first routes and taxonomy (see 18 for full rules)
### 6.1 Added routes
```
/                                   S01 Home (question-led, revised)
/who-are-you                        S33 Browse every identity (A–Z, by sector) — no-JS picker fallback
/for/{identity}                     S27 Identity toolkit (replaces V2 audience pages; old audience slugs 301 → identities/life roles)
/for/{a}+{b}[+{c}]                  S27 combined toolkit for up to 3 identities (noindex; canonical to the first identity)
/for/{identity}/{tool}              S28 How {identity}s use {tool}
/tools/{tool}                       S09 Tool page (full profile OR registry page) + Who uses + Roadmap summary
/tools/{tool}/roadmap               S30 Full course outline (3 levels) + lens switcher
/tools/{tool}/for/{need}            S29 Canonical lens page
/needs/{need}                       S31 Need page
/sectors/{sector}                   S32 Sector page
/api/v1/identities-index.json       Identity type-ahead index
```
**Audience redirects:** /for/student → /for/student (life role) · /for/professional → /who-are-you · /for/business-owner → /for/small-business-owner · /for/creator → /for/content-creator · /for/job-seeker → /for/job-seeker · /for/exploring → /who-are-you · /for/educator → /for/teacher · /for/researcher → /for/researcher · /for/nonprofit → /sectors/public-sector · /for/developer → /for/software-engineer · /for/agriculture → /for/farmer · /for/retail-services → /for/small-business-owner · /for/freelancer → /for/freelancer.

### 6.2 Added taxonomy dimensions
| Dimension | File | Applies to | Facet in search? |
|---|---|---|---|
| Sector | `taxonomy/identities/sectors.json` | identities, needs (via section) | Identity browse filter |
| Family (+ ISCO-08 sub-major) | `taxonomy/identities/families.json`, `isco08-submajor.json` | identities | No |
| Identity | `taxonomy/identities/identities.json` | lenses (for_identities) | Separate identity index (search-config `identity_search`) |
| Need | `taxonomy/needs.json` | identities, sectors, families, roadmap modules, lenses | "What you want to do" chips; need pages |
Audience (V2) is retired as a dimension. Its slugs survive only as redirects.

### 6.3 Navigation changes
- Primary nav becomes **Who are you? · Discover · Learn · Playbooks · About**. "Who are you?" opens the identity picker in a dialog on desktop and a full-screen sheet on mobile.
- The header search shows identity suggestions first (max 3), labelled "You are a…".
- Breadcrumbs:
  - identity pages: `Home › {Sector} › {Family} › {Identity}`;
  - specialisms: `… › {Parent} › {Specialism}`;
  - lens pages: `Home › Tools › {Tool} › For {Need}`.

### 6.4 Discovery rules (amends §5)
- **Related identities** (on S27): same family, then same parent, then identities sharing ≥ 3 core needs. Max 8.
- **Need card tool order** follows the need's fit order. A tool with a full profile shows its pricing badge; a registry-only tool shows "Profile coming soon".
- **"Surprising uses"** on a tool page: the 3 sectors whose identities use the tool and which are furthest from the tool's home category. Use a fixed category→sector affinity table in `spec-assets/taxonomy/identities/sectors.json` order; ties go to the larger identity count.

## 7. V2.2 — More entry points and skills (see 18 §18)
### 7.1 Added routes
```
/?explore={identity|goal|skill|tool|sector}   S01-R2 Explore-by switcher (default identity)
/skills                                     S34 Skills index (9 groups, 63 skills)
/skills/{skill}                             S35 Skill page
/api/v1/skills-index.json                   Skills type-ahead index (≈ 6 KB gzipped)
/admin/report                               A01 internal admin report (Cloudflare Access; noindex; R1.5)
```
### 7.2 Added taxonomy dimension
| Dimension | File | Applies to | Facet in search? |
|---|---|---|---|
| Skill (+ skill group) | `taxonomy/skills.json` (generated from `source/skills.txt`, `skill_keywords.txt`) | needs (each need belongs to ≥ 1 skill), tools and roadmaps (derived) | Skills group in every type-ahead; skill pages |
| ISCO-08 unit group | `taxonomy/identities/isco08-unit-groups.json` | identities (`isco08_units`) | No (directory and validation only) |

### 7.3 Navigation changes
- Primary nav becomes **Who are you? · Skills · Discover · Learn · Playbooks · About**. "Skills" opens S34.
- Header search groups: People (max 3) · Skills (max 2) · Tools · Guides.
- Breadcrumbs on skill pages: `Home › Skills › {Group} › {Skill}`.

### 7.4 Discovery rules
- **Skill tool ranking:** a tool's score is the sum, over the skill's needs, of (10 − its 0-based position in that need's fit list, floored at 1). Ties are broken by registry order. With a chosen identity, tools from the identity's core needs are boosted first.
- **"Skills you'll use"** on S27: the 6 skills containing the most of the identity's core needs.
- **"Part of these skills"** on S31 (need page) and on S30 (roadmap): links to the parent skills.

## 8. V2.3 — Contribution and beta routes (see 22)
```
(sheet on every page)          S36 Suggest an edit (not a route; opened by the button; no-JS fallback → /suggest?page={path})
/suggest                       S36 full-page fallback (works without JS)
/whats-new                     S37 What's new (weekly notes generated from merged user-visible changes)
/contributors                  S38 Contributors (flag contributors_page)
/robots.txt                    Disallow: / while noindex_site is on (beta)
```
- **Footer additions:** Suggest an edit · What's new · Contributors · Open source (repository link).
- **Indexing:** `/suggest` is always `noindex`. `/whats-new` and `/contributors` follow `noindex_site`.

## 8. V2.5 — Helpers
### 8.1 Added routes
```
/helpers                       S39 Helpers index                (flag helpers)
/helpers/{slug}                S40 Helper page                  (slug from helpers.json)
(no route)                     S41 Helper panel, a global component (flag helper_panel)
```
### 8.2 Redirects
`/journeys` → `/helpers` and `/journeys/{slug}` → `/helpers/{slug}` (301, kept for early beta links).
### 8.3 Navigation
- Header (720 px and above): Helpers · Skills · What's new · theme · search.
- Bottom tab bar (below 720 px): Home · Helpers · Skills · Suggest an edit.
- A helper's headline identities link to S27; S27 links back to the helper (04 §9).
### 8.4 Taxonomy and data
| Entity | Source | Notes |
|---|---|---|
| Helper | `taxonomy/source/helpers.txt` → `taxonomy/helpers.json` (schema `helper.schema.json`) | Slug, title, headline identities, promise, intro, 3 to 8 stages. Every tool, need and identity slug must exist. |
| Home featured content | `config/home-featured.json` | The popular chips and identity ribbon for S01-R. Every slug must exist. |
### 8.5 Indexing
Helper pages (S39, S40) are curated and indexable at public launch with a canonical URL. While `noindex_site` is on, everything is noindex (FR-066).

## V2.6 additions
New taxonomy files: `goals.json` (633), `alternatives.json`, `intents.json` (compete, grow, scale), `tool-markets.json`, `tool-availability.json`. New routes: `/goals`, `/goals/{slug}`, `/me`, `/me/profile`, `/trending`, `/suggestions/{ref}`. Hierarchy: identity → need → goal → tools. Detail in doc 24.

## V2.7 additions
New files: `taxonomy/goal-kits.json` (29), `goal-links.json` (1,050), `goal-safety.json` (9 rules and tags for 498 goals), `identity-kit-hints.json` (2,603), `entry-paths.json` (7 paths), and `registry/tool-profiles.json` (1,781). New routes: `/kits` and `/kits/{slug}`. The goals count is now 1,050 under the same 279 needs. See doc 26.
