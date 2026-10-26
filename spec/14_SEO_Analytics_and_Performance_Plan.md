# 14 — SEO, Analytics and Performance Plan

**Version:** 2.6

## 1. SEO and sharing
**Canonical URLs and slugs:** see 03 §3.2 and §4. Every indexable page emits `<link rel="canonical" href="{SITE_URL}{path}">` with no query strings and no trailing slash, except `/`.

**Title and description templates:**
| Page | `<title>` (≤ 60 characters where possible) | Meta description (≤ 155 characters) |
|---|---|---|
| Home | Digital Advantage — Make technology your advantage | Discover tools, learn practical skills, and find better ways to get things done. |
| Category | {Category} tools and how-tos — Digital Advantage | Category description |
| Task | {short_title}: step-by-step — Digital Advantage | problem_statement (truncated at a word boundary) |
| Tool | {Name}: what it's for, cost and alternatives — Digital Advantage | summary + " Checked {Mon YYYY}." |
| Resource | {Title} ({publisher}) — Digital Advantage | summary |
| Playbook | {Title} — step-by-step playbook — Digital Advantage | outcome |
| Comparison | {Title} — Digital Advantage | decision_question + " Facts checked {Mon YYYY}." |
| Audience | Digital tools and how-tos for {audience}s — Digital Advantage | Curated intro line |
| Static pages | {Page} — Digital Advantage | Frontmatter description |

**Social metadata:**
- `og:title`, `og:description`, `og:url`, `og:type` (website/article), `og:image` (1200×630), `twitter:card=summary_large_image`.
- OG images are generated at build time (Satori or an equivalent SVG→PNG step). The template shows the title in the display face, the type label, the category hue band and the wordmark. There are no third-party logos.

**Structured data (only when accurate):**
- `WebSite` + `SearchAction` (home);
- `BreadcrumbList` (deep pages);
- `HowTo` (tasks, playbooks);
- `SoftwareApplication` (tools: name, url, applicationCategory, operatingSystem **only if verified**; never `offers`, `aggregateRating` or `review`);
- `LearningResource` (resources; `isAccessibleForFree` only when cost_status = free);
- `ItemList` (comparisons, category lists);
- `Organization` (about).

Validate in CI with a JSON-LD schema check, and manually with the Rich Results Test before launch.

**Indexing rules:**
| Page | robots |
|---|---|
| Published content, hubs, static pages | `index, follow` |
| `/search`, `/report`, `/report/thanks` | `noindex, follow` |
| Hidden ("coming soon") categories | `noindex, follow` |
| Archived records | `index, follow` (they explain the status and point to alternatives) but excluded from the sitemap |
| Preview deployments (`*.pages.dev`) | `X-Robots-Tag: noindex, nofollow` header |
| 404 | 404 status |

**Sitemap and feeds:**
- `sitemap.xml` is generated each build. It includes published, non-archived records and hubs, with `lastmod` = `editorial.updated_at`.
- `robots.txt` lists the sitemap and disallows `/api/` except `/api/v1/records/`.
- RSS `/rss/recently-reviewed.xml` lists the 20 most recent `last_verified_at` records.

**Redirects:** 301 via `_redirects`, generated from `redirect_from` and `redirects.json` (03 §4).

**Duplicate content:** no auto-generated keyword pages. Tag/audience pages need curated intro copy and ≥ 3 items, otherwise they are `noindex`.

**Internal linking:**
- every record links to ≥ 1 hub (category or task family);
- tools link to ≥ 1 task;
- tasks link to their tools;
- the related-content rules apply (03 §5.2).

**External links:** labelled (D-031). No `nofollow` needed (non-commercial); `rel="noopener"` always.

## 2. Analytics
The event taxonomy is in `spec-assets/analytics/events.json`, and the KPI formulas are in 01 §7.

Implementation rules:
- A single `track(name, props)` helper that validates against the allow-list in development (it throws) and drops invalid props in production.
- `navigator.sendBeacon`, with a `fetch` keepalive fallback. Never block the UI.
- No analytics script runs on preview deployments.

**Weekly report** (a scheduled Action writes it to a private issue):
- searches;
- zero-result rate and the top 20 zero-result queries;
- search success rate;
- top viewed records;
- outbound CTR;
- corrections received and closed;
- freshness compliance;
- broken-link rate;
- errors by code.

## 3. Performance budgets (lab, CI-enforced with Lighthouse CI on S01, S02, S06, S09 and S13; mobile emulation, simulated slow 4G, 4× CPU slowdown)
| Metric | Budget |
|---|---|
| Lighthouse Performance (mobile) | ≥ 90 |
| LCP (lab) | ≤ 2.5 s |
| TBT (lab, proxy for INP) | ≤ 150 ms |
| CLS | ≤ 0.05 |
| Initial JS (gzip) on content pages | ≤ 110 KB (V2.5, React base; was ≤ 30 KB with Astro) |
| Initial JS (gzip) on the home page, excluding lazy indexes | ≤ 130 KB |
| JS on S02 incl. MiniSearch + search runtime (gzip, excluding index) | ≤ 130 KB |
| Helper panel code (gzip, lazy-loaded only when a helper is active or on S39/S40) | ≤ 15 KB |
| Search index (gzip) | ≤ 400 KB (re-evaluation trigger, ADR-003) |
| CSS (gzip, all) | ≤ 35 KB |
| Fonts | ≤ 3 WOFF2 files; ≤ 150 KB total; only the text face preloaded |
| Images | SVG only in R1; OG PNGs are not loaded by pages |
| Third-party scripts | Turnstile (S18 only) + the CF Web Analytics beacon (deferred). Nothing else. |
| Requests before first render | ≤ 6 |
| HTML document | ≤ 60 KB gzip |

**Field targets** (p75 mobile, from CF Web Analytics when available): LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1.

**Search latency:** after the index loads, a query → render takes ≤ 50 ms at p95 on a mid-range phone (measured with performance marks in an e2e test using CPU throttling). Index load takes ≤ 1.5 s on simulated slow 4G.

**Caching:**
- Hashed assets: 1 year, immutable.
- HTML: CDN default, revalidated on deploy.
- JSON endpoints: 5 min + stale-while-revalidate 1 day.

Freshness of facts is governed by deploys, not caches.

**Graceful degradation:** see 11 §5. All content is in static HTML; JS only enhances it.

## 4. Browser support
- Chrome, Edge, Firefox and Samsung Internet: last 2 major versions.
- Safari and iOS Safari: 16.4+.
- Chrome on Android 10+.

Unsupported browsers still get readable static content. Representative device lab: a low/mid Android phone (2–3 GB RAM class), an iPhone SE-size screen, a large phone, a 10" tablet, a 1366×768 laptop and a 1920×1080 desktop.

## 5. Monitoring
| Signal | Source | Threshold / alert |
|---|---|---|
| Site/Functions availability | Uptime monitor on `/` and `/api/v1/health` every 5 min | 2 consecutive failures → email the maintainer (D-018) |
| Deploy failure | Cloudflare Pages + GitHub notifications | Any failure → email |
| Function errors | `error_shown` counts + CF logs | > 20 `correction_failed` per day, or any 5xx spike in CF analytics → weekly-report flag; manual check |
| Search outage | `error_shown{code=search_index_failed}` | > 10 per day → investigate |
| Broken content links | Weekly link job | Any confirmed broken link → needs_review PR |
| Freshness | Daily job | Any > 30 days overdue → needs_review PR |
| Backup job | Weekly Action | Failure → email |
| Abuse | Rate-limit 429 counts | > 100 per day → review |

No uptime percentage is promised publicly.

## 6. V2.1 additions
**Titles:**
- Identity: "Digital tools and skills for {plural} — Digital Advantage".
- Identity × tool: "How {plural} use {tool} — Digital Advantage".
- Lens: "{lens title} — skill roadmap — Digital Advantage".
- Roadmap: "{roadmap title}: beginner to expert roadmap — Digital Advantage".
- Need: "{need label}: tools and how to start — Digital Advantage".

**Indexing:** per 18 §12. The sitemap includes only indexable generated pages and is split into `sitemap-identities.xml`, `sitemap-tools.xml`, `sitemap-learning.xml` and `sitemap-content.xml`.

**Structured data:**
- Roadmap and lens pages: `Course` with `hasCourseInstance` **omitted** (no scheduled instances), `educationalLevel` per level, `isAccessibleForFree: true` (site content is free) and `provider` = Organization.
- Identity pages: `CollectionPage` + `ItemList` of needs.
- No `Occupation` markup (it implies labour-market data we don't publish).

**Performance:** the identity index ≤ 60 KB gzip is lazy-loaded on first focus of the picker or any search field. The home page's initial JS budget is set in the table above (V2.5), and the index is excluded from it. Need cards render server-side (static HTML).

**Build (V2.2):** about 2,603 identity pages + 723 tool pages + 279 need pages + 667 roadmaps + 1,032 lens routes + 64 skill pages (S34/S35) + identity×tool pages generated on demand. Identity×tool pages are generated only where a flagship lens lists the identity (about 250 pages); others render the canonical lens with an identity intro client-side, or are produced by an on-demand Pages Function if the build time budget (≤ 10 min) is exceeded.

## V2.2 additions
- **Indexing:** `/skills` and `/skills/{skill}` are indexable. Generated ("standard") roadmaps are indexable because each has tool-specific signature and advanced modules (D-056). Lens and identity rules are unchanged (18 §12).
- **Build-time budget:** about 5,400 static pages. If the 10-minute build budget is exceeded, render identity pages that are `noindex` (thin, 18 §12) and auto-lens routes on demand with a Pages Function and edge caching. Indexable pages always stay static.
- **Indexes:** identities ≈ 41–49 KB gzipped depending on whether family labels are inlined (budget 60 KB; use numeric references); skills ≈ 6 KB gzipped. Both are lazy-loaded on first focus.
- **Events:** `identity_no_match` (aggregate; shown only at count ≥ 3), `explore_mode_changed`, `skill_selected` (spec in `spec-assets/analytics/events.json`).

## V2.5 additions
- **Budgets reset for React (D-069).** The JavaScript budgets above are *defaults chosen before the first measured build*. Spike S-1 (11, ADR-008) measures the real figures. After the spike the budgets are locked in CI at the measured value plus 10%, but never above the numbers in the table. If a route misses the budget by more than 30% after code splitting, apply the fallback rule in ADR-008.
- **Techniques to hold the line:** route-level code splitting; the search runtime, MiniSearch and the indexes load on first focus; the helper panel is lazy-loaded; no UI component library; icons are inline SVG; CSS is hand-written from tokens.
- **Helper pages (S39, S40)** are indexable at public launch with a canonical URL and are listed in the sitemap. They are noindex during the private beta (FR-066). Structured data on helper pages contains no price, rating or review.
- **Analytics:** four new aggregate events (`helper_started`, `helper_stage_completed`, `helper_panel_opened`, `helper_shared`; 29 events in total). Helper funnels (start → stage completions) appear in the weekly report (A01).

## V2.6 additions
- **Analytics:** 18 new events (47 in total) for goals, alternatives, intents, stars, sign-in, recommendations, trending, outcomes, outputs and account actions. Rule: user-linked activity (signed in, consented) goes to the `activity` table; anonymous counters stay aggregate.
- **Search budget:** the goal index adds about 54 KB gzip (all tool names indexed); the budget for it is 60 KB gzip.
- **SEO:** `/goals` and `/goals/{slug}` are prerendered and indexable; `/me`, `/me/profile` and `/suggestions/{ref}` are `noindex`. `/trending` is indexable only when visible.

## V2.7 additions
- **Pages:** 29 kit pages and one `/kits` index, prerendered. Add to the sitemap. Title pattern: "How to {outcome}: tools, prices and safety checks".
- **Structured data:** `ItemList` on kit pages (steps in order); keep price out of structured data while a profile is a Preview, because it is not verified.
- **Events (6 new, 53 in total):** `kit_opened`, `kit_step_opened`, `safety_panel_expanded`, `profile_preview_opened`, `goal_search_no_kit`, `suggestion_card_clicked`. The `goal_search_no_kit` query is redacted like `search_submitted`.
- **Budget:** the profile JSON is 1.4 MB raw; do not ship it whole to the browser. Serve per tool and as a price-chip index (slug, model, free tier, verified flag), about 100 KB raw.
