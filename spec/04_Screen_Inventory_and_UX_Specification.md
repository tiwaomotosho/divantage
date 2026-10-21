# 04 — Screen Inventory and UX Specification

**Version:** 2.5 · Components are named as in `06_Visual_Design_System.md` §6. Events are from `spec-assets/analytics/events.json`. Tests (TC-xxx) are in `15_QA_and_Acceptance_Matrix.md`.

## 1. Route inventory (Gap Analysis §9.4)
Auth = authentication requirement. Every R1 route is public; there are no accounts in R1.

| ID | Route | Purpose / main user goal | Entry points | Indexable | Data | Breadcrumb | Error behaviour |
|---|---|---|---|---|---|---|---|
| S01 | `/` | Understand the platform; start from a goal | QR, direct, search engine, shared link | Yes | curation/home.json, recent records, categories | — | Static; if curation is missing, its sections hide |
| S02 | `/search` | Find something for a goal | Header/hero search, example chips, zero-result links | **No** (`noindex, follow`) | search-index.json (lazy) | — | Index fails → S02 error state (retry, keep query) |
| S03 | `/discover` | Browse everything by category, family or audience | Nav, footer | Yes | taxonomy, counts | Home › Discover | Static |
| S04 | `/categories/{slug}` | Explore one capability area | Home tiles, S03, breadcrumbs | Yes if visible; hidden category → noindex "coming soon" | Category + linked records | Home › Discover › Category | Unknown slug → S24 |
| S05 | `/tasks` | Pick a how-to by goal | Nav (Discover), footer | Yes | tasks grouped by family | Home › Tasks | Static |
| S06 | `/tasks/{slug}` | Complete a task step by step | Search, home, categories, shared link | Yes | task + tools + resources | Home › Tasks › Family › Task | Unknown → S24 |
| S07 | `/for/{audience}` | Find starting points for my situation | Home audience cards, S03 | Yes | curation/audiences | Home › Discover › For {audience} | Unknown → S24 |
| S08 | `/tools` | Browse tools A–Z with filters | Nav, footer | Yes | tools list (static) | Home › Tools | Static |
| S09 | `/tools/{slug}` | Decide if a tool fits and get started | Search, task pages, shared link | Yes (archived: yes, with notice) | tool + relations | Home › Tools › Category › Tool | Unknown → S24 |
| S10 | `/resources` | Browse learning resources | Learn hub | Yes | resources | Home › Learn › Resources | Static |
| S11 | `/resources/{slug}` | Judge a resource before leaving the site | Tool/task pages, search | Yes | resource + related | Home › Learn › Resources › Title | Link broken → notice + replacement |
| S12 | `/playbooks` | Choose a playbook | Nav | Yes | playbooks | Home › Playbooks | Static |
| S13 | `/playbooks/{slug}` | Follow a multi-step workflow | Home, tasks, search | Yes | playbook + tools | Home › Playbooks › Title | Unknown → S24 |
| S14 | `/compare/{slug}` | Choose between 2–3 tools | Tool pages, tasks, search | Yes | comparison + tools | Home › Tools › Compare › Title | Unknown → S24 |
| S15 | `/about` | Understand who runs this and why | Footer, nav | Yes | static MD | Home › About | — |
| S16 | `/about/editorial-standards` | Know how content is chosen; non-commercial statement | Footer, trust strip | Yes | static MD | Home › About › Editorial standards | — |
| S17 | `/about/how-we-review` | Understand pricing labels, sources, review dates | Trust strip, badge info links | Yes | static MD + vocab | Home › About › How we review | — |
| S18 | `/report` | Tell us something is wrong | "Report an issue" on every content page; footer | **No** | query params | Home › Report an issue | API failure → inline error + retry, data kept |
| S19 | `/report/thanks` | Confirmation | After S18 success | **No** | reference (from response, sessionStorage fallback) | — | Direct visit without reference → generic thanks |
| S20 | `/contact` | Reach the team | Footer | Yes | static | Home › Contact | — |
| S21–S23 | `/privacy`, `/terms`, `/accessibility` | Policies | Footer | Yes | static MD | Home › {Page} | — |
| S24 | 404 | Recover from a bad link | Any | No (404 status) | — | — | — |
| S25 | Error/offline | Recover from failure | Any | No | — | — | — |
| S26 | `/learn` | Hub for resources and playbooks | Nav | Yes | resources, playbooks | Home › Learn | — |

**Editorial screens (Gap Analysis §9.3):** no custom UI in R1. GitHub provides these functions, configured as described in `07` §10:
- sign-in, content list, edit, preview (Cloudflare preview deployment per PR), review queue (open PRs with label `content`), approval (PR review), publication (merge);
- source management (the `sources[]` in each record), correction queue (private repo issues), freshness dashboard (auto-updated GitHub issue), taxonomy management (PRs to `spec-assets/taxonomy`), roles (repo permissions + CODEOWNERS), audit history (Git log).

**Account screens:** none until R2 (D-004).

## 2. Global rules for all screens
- **Layout regions:** Skip link → Header → `<main>` (breadcrumb, page content) → Footer. One `<h1>` per page.
- **Content pages** (S06, S09, S11, S13, S14) always end with the **Trust footer block**:
  - "Sources" (list of `sources[]` with title, publisher, checked date);
  - "Last reviewed {date}";
  - "Report an issue with this page" → `/report?page=…&record=…`;
  - an overdue notice if FR-041 applies.
- **Share:** content pages have a Share button. It uses `navigator.share` when available; otherwise it copies the link with a toast "Link copied". Event: `share_clicked`.
- **Preview builds:** in_review records show a top banner "Preview — not yet published" (`role="status"`).
- **Long titles:** wrap, never truncate on detail pages. Cards clamp titles at 2 lines and summaries at 3 lines with an ellipsis; the full text stays in the accessible name.
- **External links:** same tab, external icon, accessible suffix (D-031).
- **Loading:** pages are static, so there is no page-level loading state. Only search (index fetch) and form submit have loading states.

---

## 3. Core screen contracts
Each contract follows Gap Analysis §10.1. "n/a" means the state does not apply, and says why.

### S01 — Home
> **V2.1:** this contract is **superseded by S01-R in §6**. It is kept only for its responsive, accessibility and SEO details, which still apply where S01-R doesn't override them.

1. **ID/route:** S01 `/`.
2. **Purpose:** explain the platform in one screen and start goal-led discovery.
3. **Primary goal:** type or pick a goal.
4. **Entry:** QR code, direct visit, search engine, wordmark.
5. **Exits:**
   - S02 (search);
   - S07 (audience cards);
   - S04 (category tiles);
   - S06 and S13 (practical items);
   - S17 (trust strip);
   - footer routes.
6. **Hierarchy** (top to bottom):
   1. **Hero:** H1 "Make technology your advantage." · supporting copy · SearchField (large) with label "What would you like to achieve?" · five ExampleChips.
   2. **Choose a path:** six AudienceCards.
   3. **Explore capabilities:** CategoryTiles, visible categories only, max 12, then "See all categories" → S03.
   4. **Try something practical:** up to 6 Task/Playbook cards from curation.
   5. **How it works:** a 4-step strip, Discover → Learn → Apply → Grow, each with one sentence.
   6. **Editor's picks**, then **Recently reviewed:** up to 6 cards each.
   7. **Trust strip:** "Independent and non-commercial. Every price and platform claim links to its source and shows when we last checked it." → link "How we review".
   8. Footer.
7. **Layout regions:**
   - Hero: full-bleed canvas band with a decorative SVG "path and nodes" motif (aria-hidden), content max-width 1200.
   - Sections: section-gap spacing between them.
8. **Data:** curation/home.json, taxonomy, the 6 most recently reviewed records.
9. **Content limits:** hero copy is fixed (D-002). Card summaries are clamped at 3 lines.
10. **Components:** Header, SearchField[hero], ExampleChip, AudienceCard, CategoryTile, ContentCard (task, playbook, tool), StepStrip, TrustStrip, Footer.
11. **Primary action:** submit search.
12. **Secondary actions:** example chip (fills the query and submits), audience card, category tile.
13. **Validation:** an empty submit focuses the field and shows a hint under it ("Type what you'd like to do, or pick an example"). The query is trimmed and capped at 120 characters.
14. **Loading:** n/a (static). Search suggestions follow S02 rules.
15. **Empty:** if a curated section resolves to 0 items, hide the section and its heading. If fewer than 3 categories are visible, show the tasks grid instead of the category tiles.
16. **Success:** n/a.
17. **Error:** n/a for the static page. A suggestion failure silently degrades to a plain form submit.
18. **Disabled:** n/a.
19. **Permission:** n/a.
20. **Keyboard:**
    - Tab order: skip link → header → hero search → chips → cards in DOM order.
    - Enter in the field submits.
    - ↓ moves into suggestions.
21. **Screen reader:**
    - The search is a `<form role="search">` with a visible label.
    - The chips are a `<ul>` labelled "Example searches".
    - Each section is a `<section aria-labelledby>`.
22. **Touch:** chips and cards are ≥ 44 px high; the whole card is the target (one link per card, using the stretched-link pattern).
23. **Responsive:**
    - < 480 px: hero H1 at the display size minimum; chips wrap onto 2–3 lines; audience cards in a 2-column grid; category tiles in 2 columns; content cards in 1 column.
    - 480–767 px: audience 2 columns, categories 3, cards 1.
    - 768–1023 px: audience 3, categories 4, cards 2.
    - ≥ 1024 px: audience 6 (one row), categories 4–6, cards 3.
    - The hero never exceeds 70vh. The search field is visible without scrolling at 360×640.
24. **Animation:**
    - The hero motif draws its path once on load (`stroke-dashoffset`, duration-layout ×2 = 640 ms).
    - Cards lift on hover (`translateY(var(--da-motion-distance-lift))`, duration-fast).
    - Chips fill-flash on press (scale-press).
25. **Reduced motion:** no path drawing (the final state renders immediately), no lift, colour change only.
26. **Analytics:**
    - `search_submitted` with source `home_hero` or `example_chip`;
    - `content_viewed` is not fired on the home page.
27. **SEO:**
    - title "Digital Advantage — Make technology your advantage";
    - meta description = supporting copy;
    - OG image `/og/home.png`;
    - `WebSite` JSON-LD with `SearchAction` → `/search?q={search_term_string}`.
28. **Acceptance:**
    - At 360×640 the H1, the search field and at least 2 chips are visible.
    - No popularity claims appear.
    - Hidden categories are never shown.
    - The page scores ≥ 90 for Lighthouse mobile performance.
29. **Tests:** TC-001, TC-002, TC-030, TC-040, TC-041, TC-060.

### S02 — Search results
1. **ID/route:** S02 `/search?q=…` (URL state per search-config `url_state`).
2. **Purpose:** return relevant tools, tasks, playbooks, resources and comparisons for a goal.
3. **Primary goal:** open a relevant result.
4. **Entry:** any search field, example chips, browser history, shared URLs.
5. **Exits:** result detail pages, S04 (zero-result categories), S18 (suggest coverage).
6. **Hierarchy:**
   1. H1 "Results for '{q}'", or "Search" when q is empty.
   2. SearchField (prefilled).
   3. Type tabs: All · How-tos · Tools · Playbooks · Learning · Comparisons, with counts once loaded.
   4. Filter bar: Cost, Platform, Level, Category, Who it's for, AI features, and "Clear all".
   5. Intent suggestion chips (cost/platform intent).
   6. A results summary line (`aria-live`).
   7. The result list.
   8. A "Show more results" button.
7. **Layout:**
   - ≥ 1024 px: filters in a left column (280 px), results on the right (max 760 px).
   - < 1024 px: a "Filters (n)" button opens a FilterDrawer (bottom sheet on < 768 px, side drawer on 768–1023 px).
8. **Data:** search-index.json, fetched on the first focus of any search field, or immediately on S02 load.
9. **Result card fields** (ContentCard[result]):
   - type label;
   - title (2 lines);
   - summary (3 lines);
   - up to 3 match reasons, chosen in priority order: "Can start without paying", platform match, "Beginner", category;
   - pricing badge (tools only);
   - "Reviewed {Mon YYYY}".
10. **Limits:** query ≤ 120 characters; 20 results per page.
11. **Components:** SearchField, Tabs, FilterGroup (checkbox list), FilterChip (applied), FilterDrawer, IntentChip, ContentCard[result], Button[secondary] "Show more", EmptyState, ErrorPanel, Skeleton (result rows).
12. **Primary action:** open a result.
13. **Secondary actions:** apply or remove filters, switch tabs, clear the query, show more.
14. **Validation:**
    - A query over 120 characters is truncated with the inline notice "We shortened your search to 120 characters."
    - A query that is whitespace only is treated as an empty search.
15. **Loading:**
    - While the index loads, show 4 skeleton result rows (only if loading takes longer than 300 ms, to avoid a flash).
    - Announce "Loading results" via `aria-busy`.
    - Input stays usable.
16. **Empty states:**
    - **No query:** show "What would you like to achieve?", the example chips and the category tiles.
    - **No results:** follow search-config `zero_results` (message, Remove all filters, spelling suggestion "Did you mean …?", category tiles, "Suggest something we should cover").
    - **No results because of filters:** "No matches with these filters" + a Remove-all button, and list each applied filter with its × button.
17. **Success:**
    - The live region says "{n} results for {q}".
    - When the OR fallback was used, also say "Showing results that match some of your words."
18. **Error:**
    - If the index fetch fails or parsing throws, show an ErrorPanel: "Search isn't working right now." Offer "Try again" (refetch) and "Browse categories" → S03.
    - The query stays in the field.
    - Fire `error_shown` with code `search_index_failed`.
19. **Disabled:** "Show more" is hidden (not disabled) when no more results exist.
20. **Permission:** n/a.
21. **Keyboard:**
    - Suggestions follow the ARIA combobox pattern (↑↓ to move, Enter to choose, Esc to close).
    - Tabs follow the ARIA tabs pattern, with manual activation.
    - The filter drawer traps focus and closes with Esc; focus returns to the trigger.
    - After "Show more", focus moves to the first new result.
22. **Screen reader:**
    - The results count is in a polite live region, updated 500 ms after the last change.
    - Each applied FilterChip is a button named "Remove filter: {value}".
23. **Touch:**
    - The filter drawer has a sticky footer: "Show {n} results" (primary) and "Clear all".
    - Swipe-to-close is not required.
24. **Responsive:** described in item 7. Tabs scroll horizontally inside their own container (no page overflow), with fade edges.
25. **Animation:**
    - Suggestions panel: fade + 4 px slide, duration-fast.
    - Results update: no animation (instant).
    - Drawer: slide, duration-base.
26. **Reduced motion:** suggestions and drawer appear instantly.
27. **Analytics:** `search_submitted`, `search_zero_results`, `filter_applied`, `search_result_opened`, `error_shown`.
28. **SEO:** `noindex, follow`; canonical `/search`; title "Search — Digital Advantage".
29. **Acceptance:**
    - URL state round-trips on reload and Back/Forward.
    - The platform filter excludes unverified platforms unless the toggle is on.
    - Cost intent never hides paid results.
    - The search test-set threshold passes.
    - The page works with keyboard only.
30. **Tests:** TC-003–TC-012, TC-031, TC-042, TC-050.

### S04 — Category landing
1. **ID/route:** S04 `/categories/{slug}`.
2. **Purpose:** an overview of one capability area.
3. **Primary goal:** pick a starting task or tool.
4. **Entry:** home tiles, S03, breadcrumbs, search suggestions.
5. **Exits:** S06, S09, S13, S14, S02 (filtered by this category).
6. **Hierarchy:**
   1. H1 = category label, with the description below it.
   2. "Start here" (the first beginner task, if one exists).
   3. "How-tos" (task cards).
   4. "Tools" (tool cards with the sort note, 03 §5.3).
   5. "Playbooks".
   6. "Comparisons".
   7. "Search within {category}" → a SearchField that submits to `/search?cat={slug}`.
7. **Layout:** cards in a grid (1/2/3 columns at < 768 / 768–1023 / ≥ 1024 px).
8. **Data:** category, published records with this category.
9. **Limits:** max 12 cards per section, then "See all {n}", which goes to S02 pre-filtered.
10. **Components:** CategoryHero (icon tile + text), ContentCard, SearchField[compact].
11. **Primary action:** open a card.
12. **Secondary actions:** search within the category.
13. **Validation:** n/a.
14. **Loading:** n/a.
15. **Empty:** sections with 0 items hide. A hidden category (< 3 records) shows the "coming soon" variant: "We're still building this section." Below that come the available records (if any) and links to the other categories; the page is noindex.
16. **Success / errors:** n/a.
17. **Keyboard / screen reader:** standard. Each section is a landmark with a heading.
18. **Animation:** card hover lift only.
19. **Analytics:** none specific (Cloudflare page views).
20. **SEO:** title "{Category} tools and how-tos — Digital Advantage"; meta description = category description; `CollectionPage` JSON-LD.
21. **Tests:** TC-013, TC-014.

### S06 — Task guide
1. **ID/route:** S06 `/tasks/{slug}`.
2. **Purpose:** get a visitor from problem to verified result.
3. **Primary goal:** complete the steps.
4. **Entry:** search, home, category, shared link, QR.
5. **Exits:** the official sites of recommended tools, S09, S11, S13, related tasks.
6. **Hierarchy:**
   1. Breadcrumb.
   2. H1 = `title` (the question).
   3. Summary row: difficulty badge · time estimate ("About 1–2 hours", always shown with the word "About") · budget note.
   4. "What you'll end up with" (`expected_outcome`).
   5. "What you need" (`prerequisites`).
   6. "Recommended tools": compact ToolCards with pricing badge and platforms, plus an "Or compare them" link if a comparison exists.
   7. "Steps": a Stepper of numbered steps. Each step shows its title, instructions, tool links, "You should now have: {expected_result}" and a warning callout when one exists.
   8. "Check your result" (`quality_checks` as a checklist; ticks are in-memory only).
   9. "Common mistakes".
   10. "Other ways to do this" (`alternative_methods`).
   11. "Cost and devices" (budget, device and low-bandwidth notes).
   12. "Privacy and safety".
   13. "Learn more" (resources).
   14. Related how-tos and playbooks.
   15. Trust footer block.
7. **Layout:**
   - ≥ 1024 px: a two-column layout. The main column is at reading width; a right rail (sticky, 300 px) holds "On this page" anchors and the recommended tools.
   - < 1024 px: one column; "On this page" collapses to a disclosure at the top.
8. **Data:** the task, its recommended tools (with pricing and platforms), resources, related items.
9. **Limits:** per schema.
10. **Components:** Breadcrumb, Badge (level), MetaRow, ToolCard[compact], Stepper, Callout (warning, info), Checklist, ResourceCard, TrustFooter, ShareButton.
11. **Primary action:** follow the steps / open a tool's official site.
12. **Secondary actions:** share, report an issue, open related items.
13. **Validation:** n/a.
14. **Loading:** n/a.
15. **Empty:** optional sections are omitted entirely (no headings without content).
16. **Success:** when all quality-check boxes are ticked, an inline success message appears: "Nice work — your result passes the checks." (`role="status"`).
17. **Error:** n/a.
18. **Disabled:** n/a.
19. **Keyboard:** the "On this page" links move focus to the section headings (tabindex -1). Checklist items are native checkboxes.
20. **Screen reader:** Stepper is an `<ol>`; each step is an `<li>` with an `<h3>`. Warnings are `<aside>` labelled "Warning".
21. **Touch:** checkboxes have targets of ≥ 44 px.
22. **Responsive:** described in item 7.
23. **Animation:** the checklist success message fades in (duration-base).
24. **Reduced motion:** the message appears instantly.
25. **Analytics:** `content_viewed`, `official_link_clicked`, `resource_opened`, `share_clicked`, `source_link_clicked`.
26. **SEO:**
    - title "{short_title}: step-by-step — Digital Advantage";
    - description = `problem_statement`, truncated to 155 characters;
    - `HowTo` JSON-LD (steps, totalTime only when minutes are present). Never `Review` or `AggregateRating`.
27. **Acceptance:**
    - The time is always labelled as an estimate.
    - Every tool shown has a pricing badge consistent with its record.
    - The page is readable with JavaScript disabled (all content is static HTML).
28. **Tests:** TC-015–TC-018.

### S09 — Tool detail
1. **ID/route:** S09 `/tools/{slug}`.
2. **Purpose:** help a visitor decide if a tool fits, understand its limits and get started.
3. **Primary goal:** reach the official site with the right expectations.
4. **Entry:** search, tasks, categories, comparisons, shared links.
5. **Exits:** the official site, resources, alternatives, comparisons, tasks.
6. **Hierarchy** (V1 03 §5 order):
   1. **ToolHeader:**
      - monogram tile;
      - H1 name;
      - `summary`;
      - developer or publisher;
      - primary button "Visit official site" (external);
      - PricingBadge with "checked {date}" and an info link to S17;
      - PlatformList, where unverified shows "Platform not confirmed";
      - AvailabilityNotice, if not active.
   2. "What it helps you do" (`description`).
   3. "Best for" / "May not be ideal if" (two lists, side by side at ≥ 768 px).
   4. "Key capabilities": each item, with a superscript source link.
   5. "Limitations": fact items cite their source; editorial items carry the label "Our view".
   6. "Cost details": free tier, trial, paid summary and price points. Price points appear as "US$144 / year (Pro, shown 21 Oct 2026 — may vary)". Costs beyond the price are listed too.
   7. "Getting started": a numbered list.
   8. "Learn {name}": resources.
   9. "Alternatives and comparisons".
   10. "How-tos and playbooks that use {name}".
   11. "Privacy and accessibility notes", only if sourced.
   12. "Licence", only if open_source is present. It shows "Open source — {licence}" or, for n8n-type cases, "Source-available — {licence}".
   13. Trust footer block.
7. **Layout:**
   - ≥ 1024 px: the header spans the full width; the body is one column at reading width, plus a right rail (sticky) with an "At a glance" box (pricing, platforms, deployment, AI features, account required, level).
   - < 1024 px: "At a glance" sits inline after the header.
8. **Data:** the tool record, related records, sources.
9. **Limits:** per schema.
10. **Components:** ToolHeader, PricingBadge, PlatformList, AtAGlance, SourcedList, EditorialLabel, PricePointRow, ResourceCard, ToolCard[compact], ComparisonLink, TrustFooter, ShareButton, ArchiveNotice.
11. **Primary action:** "Visit official site".
12. **Secondary actions:** compare, share, report an issue, open resources.
13. **Validation:** n/a.
14. **Loading:** n/a.
15. **Empty:**
    - Unknown pricing shows the badge "Price not confirmed" with the text "We haven't verified this tool's pricing yet. Check the official site." **Never a guessed price** (V1 test 6).
    - Missing optional sections are omitted.
16. **Archived or discontinued:**
    - A top ArchiveNotice (`role="note"`): "{Name} has been discontinued. Here are alternatives." with the alternatives listed first.
    - The official-site button becomes a secondary button reading "Former official site", or is hidden if the link is dead.
17. **Needs review:** if a material claim is affected, a Callout[info] reads "We're rechecking some details on this page." The flagged claim is listed when `public_corrections` notes exist.
18. **Keyboard / screen reader:**
    - Source superscripts are links named "Source: {title}".
    - The pricing badge has the accessible name "Pricing: {label}. Checked {date}."
19. **Responsive:** described in item 7. Price points stack on mobile.
20. **Animation:** none beyond hover.
21. **Analytics:** `content_viewed`, `official_link_clicked`, `source_link_clicked`, `resource_opened`, `share_clicked`.
22. **SEO:**
    - title "{Name}: what it's for, cost and alternatives — Digital Advantage";
    - description = summary;
    - `SoftwareApplication` JSON-LD with name, applicationCategory, operatingSystem (verified only) and url. **No `offers`/price, `aggregateRating` or `review`** (Gap Analysis §25).
23. **Acceptance:**
    - Pricing never says "Free" for freemium, trial or unknown.
    - Every fact item links to a source.
    - Editorial items are labelled.
    - Archived tools show alternatives.
24. **Tests:** TC-019–TC-025.

### S13 — Playbook detail
1. **ID/route:** S13 `/playbooks/{slug}`.
2. **Purpose:** a multi-step workflow to a defined outcome.
3. **Primary goal:** complete it and verify the outcome.
4. **Entry:** home, tasks, tools, search.
5. **Exits:** tools, resources, related playbooks.
6. **Hierarchy:**
   1. H1 = title, followed by an outcome statement.
   2. MetaRow: who it's for · level · "About {estimate}".
   3. "Before you start": prerequisites and required inputs.
   4. "Tools you'll use": compact ToolCards, plus low-cost alternatives.
   5. Stepper (timeline variant). Each step shows its purpose, instructions, tools, "You should now have…", a "Check" callout, a "If this doesn't work" fallback and a warning where one exists.
   6. "Final check" (`verification`).
   7. Completion checklist (`success_criteria`, in-memory).
   8. "Troubleshooting" (accordion).
   9. "Cost", "Privacy", "Accessibility" and "Low-bandwidth tips".
   10. Example (input → output).
   11. Related items.
   12. Trust footer block.
   13. A print button.
7. **Layout:**
   - ≥ 1024 px: the Stepper timeline has a progress rail on the left (decorative). A sticky right-rail mini-map lists the step titles and highlights the current step with IntersectionObserver.
   - < 1024 px: the mini-map collapses to "Step {n} of {total}" in a sticky sub-header, which can be expanded to a list.
8. **Print stylesheet:** hides the header, footer, rail and share buttons; prints URLs after links; no backgrounds.
9. **States:**
   - Checklist complete → success message and `playbook_checklist_completed`.
   - Empty optional sections are omitted.
10. **Keyboard:** the mini-map links focus the step headings. The accordion uses the disclosure pattern (button with `aria-expanded`).
11. **Animation:** the current-step highlight transitions its colour (duration-base). The progress rail fills on scroll; this is decorative and removed under reduced motion.
12. **Analytics:** `content_viewed`, `playbook_step_viewed`, `playbook_checklist_completed`, outbound events.
13. **SEO:** `HowTo` JSON-LD; title "{title} — step-by-step playbook — Digital Advantage".
14. **Tests:** TC-026, TC-027.

### S14 — Comparison
1. **ID/route:** S14 `/compare/{slug}`.
2. **Purpose:** choose between 2–3 tools for a stated decision.
3. **Hierarchy:**
   1. H1 = title.
   2. The decision question.
   3. A "How we compared" note (`method_note`).
   4. ComparisonTable: dimensions as rows, tools as columns. Each cell shows its text, its kind and its source superscripts:
      - fact = plain text;
      - editorial = "Our view" label;
      - unknown = "Not yet verified" in muted text with a dashed outline.
   5. "Best fit" (one card per tool: "Choose {tool} if… {for_whom}").
   6. Links to each tool page.
   7. Trust footer block.
4. **Responsive:**
   - ≥ 768 px: a real `<table>` with a sticky first column and `<th scope>`.
   - < 768 px: the table becomes stacked cards (one card per tool, each listing every dimension as dt/dd). A tool switcher (segmented control) can show "All" or one tool at a time. There is never a horizontal page scroll.
5. **Rules:** no "winner" badge; consistent dimensions across tools; unknowns shown, never blank.
6. **SEO:** title "{title} — Digital Advantage"; JSON-LD `ItemList` of the tools only.
7. **Tests:** TC-028, TC-029.

### S18 — Report an issue
1. **ID/route:** S18 `/report`. Query params prefill: `page`, `record`, `type`.
2. **Purpose:** report wrong, outdated or broken information without an account.
3. **Fields** (all with visible labels):
   - **Page:** prefilled and read-only if it came from a page link, with a "change" button; otherwise an input.
   - **What's wrong?:** a radio group of the 7 issue types.
   - **Tell us more:** a textarea, optional, max 2000 characters, with a live character count announced politely every 100 characters.
   - **Link to evidence:** optional, must be https.
   - **Your email:** optional. When filled, a required checkbox appears: "You may contact me about this report".
   - **Honeypot:** a `website` field, visually hidden and `aria-hidden`.
   - **Turnstile widget:** managed/invisible mode.
4. **Privacy notice inline:**
   - "We only use your email to follow up on this report and delete it when the report is closed (at most 90 days)."
   - A link to the privacy page.
5. **Primary action:** "Send report".
6. **Validation:**
   - Client and server both validate against correction-request.schema.json.
   - Errors appear inline under each field (`aria-describedby`), plus an error summary at the top with links to the fields. Focus moves to the summary on a failed submit.
7. **Loading:** the button shows a spinner with the text "Sending…" and is disabled (`aria-disabled`) to prevent double submission.
8. **Success:** redirect to S19 with the reference number.
9. **Errors:**
   - 400: field errors.
   - 403 (bot check failed): "We couldn't confirm you're not a bot. Please try again."
   - 429: "You've sent several reports in a short time. Please try again in {n} minutes."
   - 502/network: "We couldn't send your report. Your text is still here — try again, or email {contact}."
   - The form data is always kept.
10. **No-JS / bot-check-blocked fallback:** the form shows the contact email (FR-042).
11. **Analytics:** `correction_submitted`, `error_shown`.
12. **SEO:** `noindex`.
13. **Tests:** TC-032–TC-036.

### S19 — Report confirmation
- H1 "Thanks — we've got it".
- The reference DA-… shown in a copyable code block.
- "We review every report. If you left your email, we may contact you."
- Two links: "Back to the page you reported" and "Home".
- Focus lands on the H1. The page is `noindex`.

---

## 4. Secondary screen contracts (condensed)
Every field not listed follows the global rules in §2.

| Screen | Hierarchy | Key states & rules | SEO | Tests |
|---|---|---|---|---|
| S03 Discover | H1 "Explore everything" · Categories (tiles, visible only, with record counts) · Task families (12 cards, each linking to S05#family) · "Who it's for" (13 audience links) | Counts come from build data. Hidden categories are not shown. | Indexed; `CollectionPage` | TC-013 |
| S05 Task index | H1 "How-tos" · a family jump-nav (chips) · one section per family listing tasks (title = short_title) | Families with 0 tasks are hidden from the jump-nav and body. | Indexed | TC-015 |
| S07 Audience landing | H1 "For {label}s" (copy per audience in `content/curation/audiences/*.json`) · a reassurance line: "Everything on Digital Advantage is open to everyone — this is just a starting point." · Curated tasks · tools · playbooks | Never filters search. Fallback rules per 03 §5.1. | Indexed | TC-037 |
| S08 Tools A–Z | H1 "Tools" · a static filter form (Cost, Platform, Category) that submits to `/search?type=tool&…` · a letter jump-nav · ToolCards | Works without JS (form GET). | Indexed | TC-038 |
| S10 / S26 Resources / Learn | H1 · resource type filter (links) · ResourceCards (publisher, type, cost, sign-up, level) | — | Indexed | TC-039 |
| S11 Resource detail | H1 title · publisher · type badge · cost badge · sign-up badge · summary · "You'll learn" · prerequisites · limitations · primary button "Open on {publisher}" (external) · related tools/tasks · Trust footer block | If `link_check.last_status` is not_found or blocked twice: a Callout reads "This link may no longer work." and shows the replacement resource if one is set; the record is set to needs_review automatically by the link job. | Indexed; `LearningResource` JSON-LD (name, provider, url, educationalLevel, isAccessibleForFree **only** if cost_status=free) | TC-039 |
| S12 Playbooks | H1 · PlaybookCards (outcome, level, estimate, tool monograms) | — | Indexed | TC-026 |
| S15–S17, S20–S23 | Markdown pages from `content/pages/*.md` · reading-width layout · S17 includes a generated table of pricing labels and their meanings from `vocabularies.json` | S16 must include the non-commercial statement. S23 must list known accessibility limitations and a contact route. | Indexed | TC-043 |
| S24 Not found | H1 "We can't find that page" · a SearchField · links to Discover and Home · "Report a broken link" → S18 with the page prefilled | HTTP 404. If a redirect exists, the server returns 301 instead. | noindex | TC-044 |
| S25 Error / offline | H1 "Something went wrong" · a "Try again" button (reload) · Home link | For the static site this mainly covers search JS errors and form failures; there is no service worker in R1. | — | TC-045 |

## 5. Interaction state matrix (Gap Analysis §10.3)
✓ = specified (see 06 §6 for visuals); — = does not apply, with the reason.

| Component | Default | Hover | Focus-visible | Pressed | Selected | Disabled | Loading | Success | Error | Empty | Touch | Reduced motion |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Button | ✓ | ✓ | ✓ | ✓ | — (no toggle buttons) | ✓ | ✓ | — (handled by the parent) | — | — | ✓ 48 px | ✓ |
| IconButton | ✓ | ✓ | ✓ | ✓ | ✓ (theme toggle) | ✓ | — | — | — | — | ✓ 44 px | ✓ |
| SearchField | ✓ | ✓ (border) | ✓ | — | — | — (never disabled) | ✓ (spinner in field) | — | ✓ (inline hint) | ✓ (placeholder + label) | ✓ | ✓ |
| Suggestion option | ✓ | ✓ | ✓ (`aria-activedescendant`) | ✓ | ✓ | — | — | — | — | ✓ ("No suggestions") | ✓ | ✓ |
| ExampleChip | ✓ | ✓ | ✓ | ✓ | — | — | — | — | — | — | ✓ | ✓ |
| FilterChip (applied) | ✓ | ✓ | ✓ | ✓ | ✓ | — | — | — | — | — | ✓ | ✓ |
| FilterGroup option | ✓ | ✓ | ✓ | — | ✓ (checked) | ✓ (0 results while selected) | — | — | — | — | ✓ | ✓ |
| Tabs | ✓ | ✓ | ✓ | ✓ | ✓ | — | — | — | — | — | ✓ | ✓ |
| ContentCard | ✓ | ✓ (lift) | ✓ (ring on card) | ✓ | — | — | ✓ (skeleton) | — | — | — | ✓ | ✓ |
| Checklist item | ✓ | ✓ | ✓ | — | ✓ | — | — | ✓ (all done) | — | — | ✓ | ✓ |
| Accordion | ✓ | ✓ | ✓ | ✓ | ✓ (expanded) | — | — | — | — | — | ✓ | ✓ |
| Drawer | ✓ | — | ✓ (trap) | — | — | — | — | — | — | — | ✓ | ✓ |
| Toast | ✓ | — | — | — | — | — | — | ✓ | ✓ | — | — | ✓ |
| Form field | ✓ | ✓ | ✓ | — | — | ✓ | — | ✓ (valid hint on blur for URL/email) | ✓ | ✓ | ✓ | ✓ |
| ShareButton | ✓ | ✓ | ✓ | ✓ | — | — | — | ✓ (toast) | ✓ (toast "Couldn't copy — select the address bar") | — | ✓ | ✓ |
| ThemeToggle | ✓ | ✓ | ✓ | ✓ | ✓ | — | — | — | — | — | ✓ | ✓ |

---

## 6. V2.1 screens (identity-first)
Full behaviour rules are in `18_Identity_First_Discovery_Specification.md`. These contracts cover layout, states and acceptance criteria.

### S01-R — Home (question-led)
1. **Purpose:** turn "Who are you?" into a personal toolkit in two taps.
2. **Hierarchy:**
   1. H1 "Make technology your advantage."
   2. Supporting line (18 §9).
   3. **IdentityPicker**, labelled "Who are you?", with 8 example chips and a "Browse everyone →" link.
   4. "I'm helping someone else" switch.
   5. **NeedChips**, labelled "What would you like to do?". Hidden until an identity is picked; free text works at any time.
   6. Primary button "Show my toolkit".
   7. "Or jump straight to a goal" with the V2 example chips.
   8. "Everyone gets a digital upgrade": 12 identity cards.
   9. How it works.
   10. Trust strip.
   11. Footer.
3. **States:**
   - **Index loading:** the picker input is usable; suggestions show a 3-row skeleton after 300 ms.
   - **No match:** "We don't have '{text}' yet. Try a broader word (e.g. 'engineer'), browse everyone, or tell us" → S18 with `type=suggest_identity` prefilled (V2.2). Fires `identity_no_match`.
   - **Index failed:** the picker turns into a link "Choose from the list" → S33.
   - **Returning visitor** (identities found in localStorage): a banner "Welcome back — continue as {labels}?" with [Continue] and [Not me].
   - **Helping mode on:** the label changes to "Who are you helping?" and later copy says "they" instead of "you".
4. **Validation:** max 3 identities. A 4th selection shows the inline hint "You can choose up to 3".
5. **Keyboard / screen reader:**
   - The picker uses the ARIA combobox + listbox pattern with multi-select. Chips are buttons named "Remove {label}".
   - The live region announces "{n} suggestions" and "{label} added".
6. **Responsive:**
   - < 768 px: the picker is full width; suggestions open as a bottom sheet with up to 8 rows when the keyboard is open; chips wrap.
   - ≥ 1024 px: picker max width 640 px, centred.
7. **Motion:** chips appear with scale .96→1 (duration-fast); none under reduced motion.
8. **Analytics:** `identity_selected`, `need_chip_selected`, `helping_mode_toggled`, `search_submitted`.
9. **SEO:** unchanged from S01. The identity cards section is crawlable links to /for/{identity}.
10. **Acceptance:**
    - "rad" shows Radiologist and Radiographer.
    - "okada" finds Motorcycle Taxi Rider.
    - Two taps (Nurse chip → Show my toolkit) land on /for/nurse.
    - Works at 320 px.
    - No identity is sent to the server.
11. **Tests:** TC-071–TC-075.

### S27 — Identity toolkit `/for/{identity}`
1. **Hierarchy:**
   1. Breadcrumb.
   2. H1 "Digital toolkit for {plural label}". Plurals come from a pluralisation helper with an override list.
   3. Intro line (from the family or sector description).
   4. Specialism chips (if a parent profession) or a "Part of {parent}" link (if a specialism).
   5. **Core to your work:** NeedCards.
   6. **Shared across {sector}:** NeedCards, collapsed after 6.
   7. **Everyone benefits:** compact NeedCards, collapsed after 8.
   8. **Start learning:** the first 3 flagship lenses written for this identity, otherwise the top roadmaps from core needs.
   9. **Helping a {label}?** ToolkitCard (print/share/WhatsApp text).
   10. Related identities.
   11. Trust footer: "Expert review: pending".
2. **NeedCard anatomy:**
   - need label (h3) + one-line description;
   - up to 4 tools in fit order (monogram, name; pricing badge if profiled, or "Profile coming soon");
   - a link "How {plural} use {tool} →" for the first tool that has a lens;
   - "See all tools for this need" → S31.
3. **Combined toolkit** (`/for/a+b`): sections per identity in tabs, plus a merged "Shared by both" group (needs in both cores).
4. **Empty states:** n/a. Every identity resolves at least the universal needs.
5. **SEO:** title "Digital tools and skills for {plural label} — Digital Advantage". Indexing follows 18 §12.
6. **Tests:** TC-076–TC-078.

### S28 — Identity × tool `/for/{identity}/{tool}`
- H1 "How {plural label} use {tool name}".
- **LensView** of the selected need (18 §7).
- "Other ways {plural} use {tool}": tabs, one per other matching need.
- "Not your situation? Choose a different need" (select).
- If no need of the identity references the tool: show the tool's roadmap with the note "{tool} isn't commonly part of a {label}'s toolkit, but here's the full outline", plus 3 tools that are.
- **Tests:** TC-079, TC-080.

### S29 — Lens page `/tools/{tool}/for/{need}`
**Hierarchy:**
1. H1 = lens title (flagship) or "Using {Tool} to {need label, first letter lower-cased}" (auto), e.g. "Using Power BI to build dashboards and reports" (V2.3; needs are action phrases).
2. "Written for" identity chips (flagship).
3. **Why it matters.**
4. **What's different** (flagship). Visual callout: "Not the generic {tool} course."
5. **Your path:** a three-column LevelTabs (tabs on mobile). Each column lists the Core modules (ModuleCard with outcome, topics, practice, estimate, "I can do this" checkbox). Extra modules carry a "Specific to {need}" badge. "Also useful" modules are collapsed.
6. **Starter project.**
7. **Pitfalls.**
8. **Pairs well with.**
9. "Explain this to someone" card.
10. Trust footer.

**Auto lens:** sections 3, 4, 6 and 7 are replaced by the need description and "Identities with this need" chips.

**Tests:** TC-081–TC-083.

### S30 — Roadmap `/tools/{tool}/roadmap`
- H1 "{Roadmap title}: skill roadmap".
- Applies-to tool chips.
- LevelTabs with every module.
- **Lens switcher:** an identity picker (single select) that re-orders the modules into the lens path and updates the URL to S28.
- Progress summary ("4 of 9 modules ticked on this device").
- **Tests:** TC-084.

### S31 — Need page `/needs/{need}`
H1 = need label, then:
- description;
- tools in fit order (full cards for profiled tools, compact cards for registry entries);
- "Who needs this" (identities grouped by sector, top 8 per sector);
- lenses for this need;
- related needs (same task family).

**Tests:** TC-085.

### S32 — Sector page `/sectors/{sector}`
H1 = sector label, then:
- shared needs;
- families, each with identity links;
- top tools across the sector (by count of core needs).

**Tests:** TC-086.

### S33 — Browse everyone `/who-are-you`
- H1 "Who are you?".
- A static, filterable list (works without JS) grouped by sector → family → identities (specialisms indented).
- A–Z jump navigation.
- A filter input (enhanced with JS).
- Life roles listed first under "Everyday life".
- **Tests:** TC-087.

### S09-R — Tool page additions
Insert after "Best for / May not be ideal if":
1. **Who uses {tool}:** sector accordions with identity chips (top 8 + "See all n"), from the needs graph.
2. **Surprising uses:** 3 cards ("Pastors use Canva to run worship slides…"), each linking to the lens.
3. **Skill roadmap:** a three-level summary showing the first module of each level, plus "See the full outline" → S30 and "See it for your work: [identity picker]" → S28.

**Registry-only tools** show only: header (name, publisher, official link), the registry note, Who uses, Roadmap (if any), and lenses. They have no pricing badge or platforms.

**Tests:** TC-088–TC-090.

## 7. V2.2 screens (more entry points, full roadmap coverage)
Behaviour rules: 18 §18–19 and 20.

### S01-R2 — Home "Explore by" switcher (amends S01-R)
1. **Placement:** between the supporting line and the picker. The picker block becomes the panel of the selected tab.
2. **Tabs:**
   - **Who are you?** (default)
   - What do you want to do?
   - Skills
   - Tools
   - Sectors

   On mobile they are horizontally scrollable chips with the selected chip first in view. There is no hidden overflow menu.
3. **Panels:**
   - **Who are you?** S01-R unchanged.
   - **What to do:** 8 universal and popular need chips plus free-text search.
   - **Skills:** SkillPicker (type-ahead over the skills index, keywords included) plus 9 group chips → S34 anchors.
   - **Tools:** tool type-ahead over the registry (name, aliases) → S09 / S30.
   - **Sectors:** 24 sector cards → S32.
4. **Cross-suggestions:** each type-ahead shows grouped results (People · Skills · Tools · Needs), with the tab's own group first and a maximum of 3 rows per other group.
5. **State:**
   - The tab is reflected in the URL (`/?explore=skills`) and remembered on the device. The first visit always shows "Who are you?".
   - Switching tabs keeps any typed text when it is still meaningful (it is copied into the new box).
6. **Keyboard / screen reader:**
   - The tabs use the ARIA pattern with arrow keys, Home and End.
   - Each panel has a heading matching its question.
   - Without JavaScript, the tabs are links that reload the page with `?explore=`.
7. **Analytics:** `explore_mode_changed`, `skill_selected`.
8. **Acceptance:**
   - The default tab is "Who are you?".
   - The Skills tab: typing "mixing" suggests "Audio and music production".
   - Typing "video editing" in the identity box shows a Skills group containing "Video creation and editing".
   - Every tab works at 320 px and without JavaScript.
9. **Tests:** TC-093–TC-096.

### S34 — Skills index `/skills`
- H1 "What do you want to get good at?"
- 9 group sections, each with SkillCards. A SkillCard shows:
  - label (h3);
  - a one-line description;
  - "{n} tools · used in {m} professions";
  - a "Beginner → Expert" mini-bar.
- Filter input (enhanced with JS); the static list works without JS.
- "Prefer to start with who you are?" → identity picker.
- **SEO:** indexable. Title "Digital skills to learn, from beginner to expert — {Brand}".
- **Tests:** TC-097.

### S35 — Skill page `/skills/{skill}`
1. Breadcrumb `Home › Skills › {Group} › {Skill}`.
2. H1 = skill label, plus the description.
3. **Levels:** three cards (Beginner / Intermediate / Expert) with the descriptor sentences.
4. **What it covers:** NeedCards for the skill's needs.
5. **Tools to learn it with:** the top 8 ranked tools (compact cards with the roadmap depth label), then "See all {n}".
6. **Course outlines:** links to the roadmaps of the top tools.
7. **Who relies on this skill:** identity chips grouped by sector (top 8 per sector).
8. Tailor bar: "See this for your work: [Who are you? ▾]". It re-orders tools by the chosen identity's resolved needs and links to the lens pages.
9. Trust footer: "Expert review: pending".

**Empty states:** none. Every skill has at least one need and one tool (validator).

**Tests:** TC-098–TC-099.

### S30-R — Roadmap depth label (amends S30)
A badge under the H1:
- **"Course outline (in depth)"** for handwritten roadmaps;
- **"Course outline (standard)"** for archetype+signature roadmaps, with a tooltip/disclosure: "Built from a proven template for this type of tool plus {tool}'s own key skills. An in-depth version is on our list.";
- **"Expert-reviewed"** when validated.

Generated modules render exactly like handwritten ones. The "Signature skills in {tool}" and "Advanced {tool}" modules are highlighted as tool-specific.

**Tests:** TC-100.

### S18-R — Suggestions in the report form (amends S18)
New issue types:
- "Suggest a tool we're missing";
- "My profession or role isn't listed";
- "Suggest something people like me need to do";
- "This course outline is wrong or missing something";
- "This tool has been renamed, acquired or shut down".

The `record_id` may now point at an identity, need, roadmap, lens or skill. Links from S27, S30, S35 and the picker's no-match state prefill the type.

**Tests:** TC-101.

### A01 — Admin report (internal, R1.5)
A private page (Cloudflare Access), generated nightly, that shows:
- top zero-result queries;
- identity misses with count ≥ 3;
- broken links;
- open suggestions and corrections;
- the "most-needed, least-deep" tools (identity reach × roadmap tier);
- catalogue KPIs (20 §10).

It is never public and never indexed. Spec: 20 §9.

**Tests:** TC-102.

## 8. V2.3 screens (open contribution, beta)
Behaviour rules: 22.

### S36 — Suggest an edit (bottom sheet on mobile, side panel on desktop; `/suggest` without JS)
1. **Trigger:** a "Suggest an edit" text button with a pencil icon, at the end of every content page and in the footer. On record pages it is also next to the trust footer. Flag `suggest_edit`.
2. **Fields, in order:**
   1. **What kind of change?** Radio chips ordered by page type: on identity pages "My work isn't described right" (`suggest_need`) first, "Add another name for this work" (`suggest_identity`) second. On tool pages the fact types come first. On roadmap and lens pages `roadmap_feedback` comes first.
   2. **What's wrong or missing?** (`description`, required, ≤ 2,000 characters).
   3. **What should it say?** (`proposed_text`, optional).
   4. **Link to a source:** required for price, feature, availability and shut-down; optional otherwise. The hint says "The tool's official page is best".
   5. **"I work for or with this tool's company":** checkbox, shown on tool pages only.
   6. **How should we thank you?** (`credit_name`, optional, ≤ 60 characters), plus the consent tick "Show my name on this page and in What's new".
   7. *(Flag `suggest_email`, off in the beta)* Email for a reply, plus consent.
   8. Licence line: "By sending this you agree it can be published under CC BY 4.0."
   9. Turnstile, then **Send**.
3. **Prefilled:** `page_url` and `record_id` (hidden). Type comes from the `?type=` parameter when a deep link is used (e.g. the identity picker's no-match state).
4. **States:**
   - **Sending:** the button shows a spinner and is disabled.
   - **Success:** "Thank you! Reference DA-20261021-AB12. A person reviews every suggestion, usually within a week." It offers "Suggest another".
   - **Validation error:** inline, focus moves to the first error.
   - **Rate-limited:** "You've sent a few suggestions just now. Please try again in a few minutes."
   - **Offline / upstream down:** "We couldn't send this. Your text is saved on this device; try again." The draft is kept in `sessionStorage` (try/catch).
5. **Accessibility:**
   - The sheet is a dialog with focus trap and Esc to close; focus returns to the trigger.
   - All fields are labelled; errors are linked via `aria-describedby`.
   - Targets are 44 px or larger.
6. **Analytics:** `suggest_edit_opened` (record kind), `correction_submitted` (issue type).
7. **Tests:** TC-107–TC-110.

### S37 — What's new `/whats-new`
- H1 "What's new", with the intro "This site improves every week, often thanks to people like you."
- Weekly sections (newest first). Each line is a merged `user-visible` PR title, linked to the changed page, with "Thanks to {credit}" when consented.
- Generated at build time from `content/whats-new.json`, which the release job appends.
- **Tests:** TC-111.

### S38 — Contributors `/contributors` (flag `contributors_page`)
- An alphabetical list of consented credit names, with counts ("3 improvements"), and a "How to contribute" link (CONTRIBUTING).
- No profile pages and no links to personal sites in R1.
- **Tests:** TC-112.

### Beta banner (flag `beta_banner`)
- A slim bar under the header: "Early version: help us improve it → Suggest an edit".
- Dismissible per session, but it reappears on the next visit while the flag is on.
- It must not cover content at 320 px.
- **Tests:** TC-113.

### Record credit line
On records with accepted credited contributions, the trust footer adds: "Improved with help from Ada (Lagos), Tunde and 2 others".

## 9. V2.5 screens (helpers) and amendments
Behaviour rules: 22 §5 and §9 below. Decisions: D-066, D-067, D-070. Requirements: FR-067 to FR-072. Flags: `helpers`, `helper_panel`, `helper_for_someone`.

### S39 — Helpers `/helpers`
1. **Purpose:** let a visitor choose a guided path in one tap.
2. **Hierarchy:**
   1. H1 "Helpers".
   2. Intro: "A helper walks you through the tools for one kind of work, one step at a time. It follows you around the site, so you can look things up and come back."
   3. **Resume banner** (only when a helper is active on this device): "Continue the {helper}. Stage {n} of {total}" with [Resume] and [Not now].
   4. **HelperCard** list, one per helper in the flag's `listed` array (06 §12). Each shows the title, promise, "{stages} stages · {tools} tools", [Start] and [Preview].
   5. "Is your work on this list?" with the helper's headline identities as chips linking to S27.
   6. "Want a helper for your work?" → S36 with `type=suggest_helper`.
3. **States:** flag off → the route returns 404 and navigation hides the item. No active helper → no banner. A stored helper that is no longer listed → the banner says "This helper has moved. Choose another." and clears the stored choice.
4. **Responsive:** one column below 768 px; three columns from 960 px. Cards are full-bleed blocks with a large title, not identical grey boxes: each helper takes one tint (06 §12).
5. **Keyboard / screen reader:** cards are links with the title as the accessible name; Start and Preview are separate buttons with names "Start the {helper}" and "Preview the {helper}".
6. **Analytics:** `helper_started` on Start.
7. **SEO:** indexable at public launch; title "Helpers: guided paths through the right tools"; listed in the sitemap.
8. **Acceptance:** exactly the listed helpers appear; Start opens S40 with the helper active; works at 320 px.
9. **Tests:** TC-120.

### S40 — Helper page `/helpers/{slug}`
1. **Purpose:** show the whole path and let the person work through it.
2. **Hierarchy:**
   1. Breadcrumb "Helpers › {title}".
   2. **Header band** in the helper's tint: H1 (the short title, for example "Musician"), the promise, the intro paragraph, chips for stages and tools, and the headline identities as links to S27.
   3. Buttons: [Start] or [Resume], [Share], and (flag `helper_for_someone`) [Start for someone else].
   4. **Progress bar** (sticky below the header): percentage and "{done} of {total}".
   5. **Route rail:** an ordered list. Each stage has a numbered node (the numbers are real: the stages are a sequence), the stage title, goal and "About {time}", then its **steps** and its **"You're done when"** checklist.
   6. A **step** shows the tool name (link to S09), a "Full guide" badge or "Guide in progress", what to do, and "First win: …". Steps are rows, not cards.
   7. Closing band: "Know someone on this path?" with Share.
   8. Trust footer: expert-validation status (D-045) and "Suggest an edit" (S36).
3. **Behaviour:**
   - Ticking a "done" line saves on the device immediately. A stage whose lines are all ticked fills its node with a check.
   - Opening a step's tool records it as "opened" so the panel can move to the next step (S41).
   - Finishing every stage shows a quiet closing message ("You've finished the {helper}") with other helpers and Share. There are no badges, streaks, points or confetti (17 prohibits gamification).
4. **States:**
   - **No JavaScript:** the full path renders as static HTML. Checkboxes are shown but disabled, with the note "Turn on JavaScript to save your progress on this device."
   - **Storage unavailable** (private window, blocked): ticks work for the session; a note says progress won't be remembered.
   - **Guide in progress:** the tool has no full profile (D-048), so only the registry link and learning path are shown, never claims about price or features.
5. **Accessibility:** native checkboxes with visible labels; the progress bar is `role="progressbar"` with an accessible name and `aria-valuenow`; headings in order (h1, then each stage as h2); focus is visible; the rail's dashed connector is decorative.
6. **Responsive:** the rail stays on the left at every width. From 960 px an "On this path" list of stages is sticky at the right.
7. **Motion:** the progress bar fills over `duration-base`. None under reduced motion.
8. **Analytics:** `helper_started`, `helper_stage_completed`, `helper_shared`.
9. **SEO:** indexable at public launch; no structured data claims about price or rating.
10. **Acceptance:** Musician, Data Analyst and Entrepreneur pages render all stages; a tick survives reload; no request carries progress; the page works at 320 px.
11. **Tests:** TC-117 to TC-122, TC-125, TC-127.

### S41 — Helper panel (global component, no route)
1. **Purpose:** keep the person's place and next step in sight on every other page while a helper is active.
2. **Collapsed (the pill):** a pill fixed at the bottom of the screen, above the tab bar on phones and at the bottom right from 960 px: "{helper} · Stage {n} of {total} · Next: {tool}" with a small progress ring. Tap to expand. A small × pauses the helper (progress is kept; a "Resume" link appears in the header).
3. **Expanded (the sheet):** a bottom sheet on phones, a 360 px popover on desktop. It shows:
   - the helper name;
   - the current stage title and goal;
   - the **next step** (tool, what to do, first win) with [Open {tool}];
   - [See all stages] (to S40);
   - [Switch helper], [Pause], [Clear my progress].
4. **Which stage and step:**
   - The current stage is the first stage whose "done" lines are not all ticked.
   - The next step is the first step of that stage whose tool has not been opened. If every tool has been opened, the panel says "Tick what you've finished" and links to the checklist.
5. **Where it appears:** on every page while `helper_panel` is on and a helper is active and not paused. It is hidden while S36 or any dialog is open, on print, and on S18.
6. **Storage:** one versioned key, `da.helper.v1`, holds `{active, paused, label, progress: {<helper>: {ticks, opened}}, updated}`. It contains no identity slug. An unknown version is ignored, not guessed at.
7. **Layout rules:** the page reserves bottom padding equal to the pill's height. At 320 px the pill is full width minus the 16 px gutters and at most 56 px high. The sheet is at most 70% of the viewport height and scrolls. Its stacking order is below dialogs.
8. **States:** storage unavailable → the panel does not appear and S40 explains why. Helper no longer listed → the sheet offers "Choose another helper" and clears the stored choice. Flag off → no pill.
9. **Accessibility:** the pill is a button with `aria-expanded`. On phones the sheet is a modal dialog (focus trap, Esc to close, focus returns to the pill); on desktop it is a non-modal popover. The pill's text is its accessible name. Changes are announced in a polite live region only after the person acts.
10. **Motion:** the sheet slides over `duration-base`; none under reduced motion.
11. **Analytics:** `helper_panel_opened` with the helper and the page kind.
12. **Acceptance:** the pill shows the same stage on the home, identity, tool and need pages; expanding and pausing work by keyboard; nothing is covered at 320 px.
13. **Tests:** TC-121, TC-122, TC-123.

### Amendments to earlier screens
- **S01-R (home):** between the identity cards and "How it works" add **"Or follow a guide"**: one HelperCard per listed helper (flag `helpers`). Returning visitors with an active helper see "Continue the {helper}. Stage {n} of {total}" beside the existing "Welcome back" banner. The hero uses the home's curated content (`config/home-featured.json`): the 8 popular chips and the identity ribbon (06 §12).
- **S27 (identity toolkit):** when the identity is in a helper's `identities`, the primary button is "Follow the {helper}"; otherwise a secondary link "Browse helpers" appears.
- **S09-R (tool page):** adds **"Where this fits"** (FR-071) and "On a helper" chips linking to S40. With no active helper the callout reads "Part of the {helper}" with a [Start] link. Tools without a full profile show "Guide in progress" and no claims (D-048).
- **S30 (roadmap):** module ticks (`da.ticks.v1`) and helper ticks (`da.helper.v1`) are separate keys. "Clear my progress" in S41 clears both.
- **Global navigation:** the header at 720 px and above shows Helpers, Skills, What's new, the theme switch and search. Below 720 px a **bottom tab bar** shows Home, Helpers, Skills and Suggest an edit (icons with labels, 44 px or larger targets, `nav` landmark named "Quick", `aria-current` on the active tab, hidden at 720 px and above). The page reserves space for it.
- **S36 (suggest an edit):** a new type `suggest_helper` ("I want a helper for my work") is added to the type chips.
- **A01 (admin report):** moves from R1.5 into R1 (D-068). It also reports, per helper, starts and stage completions from the aggregate events.
