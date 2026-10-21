# 22 — Open Contribution and Beta Plan

**Version:** 2.3 · **Date:** 21 October 2026 · **Status:** Owner direction approved (D-060, D-062, D-063). Defaults recommended (D-061, D-064, D-065). Where this document conflicts with 01–21 on release order, contributions or delivery, this document wins (see 00, C-30 to C-33).

> **Owner direction:** "Use an open-source mentality where people get access to the tool and can submit improvements; it's reviewed in the backend and then adjusted… Waiting forever can be another rabbit hole. I can share with my friends and ask them to try to find themselves… There's room for rapid improvement. So the app should allow changes and upgrades to be done very easily."

## 1. The idea in one paragraph
Ship a small, real version early. Put it in front of friends, then a widening circle. Let **anyone suggest an improvement from any page**. A person reviews every suggestion in the backend. Approved changes go live within minutes and the contributor is thanked. The catalogue gets better every week because the people it serves help correct it. Nothing is waited on that can be fixed after launch. Nothing is published that a human hasn't approved.

## 2. Principles
1. **Ship small, ship often.** Weekly releases at minimum. Every change is small enough to review in minutes.
2. **Anyone can suggest; a human approves.** The public never edits the live site directly.
3. **Content is data.** Most improvements are a line in a text file plus an automatic rebuild, with no developer needed (20 §2).
4. **Every change is previewable and reversible.** A preview link before merge, and one-click rollback after.
5. **Credit generously, never sell influence.** Contributors can be named. Nobody can pay for placement or ranking (D-001).
6. **Facts need sources; guidance needs judgement.** A price or feature claim needs a link. A learning tip needs a reviewer who agrees.

## 3. The contribution model
### 3.1 Three ways to contribute
| Lane | Who | How | Account needed? |
|---|---|---|---|
| **A. Suggest an edit** (main lane) | Anyone: friends, users, practitioners | The "Suggest an edit" button on every page opens a short form (S36) | No |
| **B. Pull request** | Developers, technical editors | Edit the source `.txt` or code on GitHub and open a pull request. CI checks and builds a preview | GitHub account |
| **C. Trusted reviewer** | Owner, admin, and later sector experts | Review lanes A and B, edit, approve and merge | GitHub account with review rights |

### 3.2 What can be suggested
| Type (`issue_type`) | Example | Needs a source? |
|---|---|---|
| `suggest_identity` | "Add 'beat maker'", "I'm a 'reservoir surveillance engineer'" | No |
| `suggest_tool` | "Add Soundtrap for musicians" | The official link only |
| `suggest_need` | "Data analysts need 'present findings to managers'" | No |
| `suggest_helper` (V2.5) | "I'd like a helper for farmers" | No |
| `roadmap_feedback` | "Teach Power Query before PivotTables", "Module 3 is too advanced for beginners" | No (reviewer judgement) |
| `pricing` / `feature` / `availability` | "BandLab mastering is no longer free" | **Yes**: official page |
| `tool_discontinued` | "This app was shut down" | **Yes**: vendor notice or reputable news |
| `broken_link`, `outdated_steps`, `accessibility`, `other` | — | No |

The form adapts to the page it was opened from: record type and id are prefilled, and the most likely types are shown first.

### 3.3 Flow
```mermaid
flowchart LR
  U[Visitor taps<br/>Suggest an edit] --> F[Form S36<br/>type · what's wrong · proposed text<br/>optional source · optional credit name]
  F --> V[Function /api/v1/corrections<br/>schema check · bot check · rate limit]
  V --> Q[Private inbox repo<br/>da-corrections → issue, labelled]
  Q --> T{Reviewer triage<br/>≤ 7 days}
  T -->|Decline / duplicate / needs source| R[Close with a reason]
  T -->|Accept| E[Edit source line<br/>(AI may draft, human checks)]
  E --> P[Pull request → CI rebuild + validate<br/>+ preview link]
  P --> M[Approve & merge]
  M --> D[Auto-deploy ≈ 2–5 min]
  D --> C[Credit on page + What's new<br/>(if contributor consented)]
```
- **Inbox:** the existing private `da-corrections` repository is now the suggestions inbox. It's private because submissions can contain names and emails (12).
- **Public history:** the change itself lands in the public content repository, so anyone can see what changed and when. This is the open-source part.
- **Outcomes and labels:** each issue closes with one of:
  - `accepted`;
  - `accepted-with-edits`;
  - `needs-source`;
  - `duplicate`;
  - `declined` (with a one-line reason from a fixed list).

### 3.4 Review rules
| Change | Who approves (beta) | Who approves (public, with admin) |
|---|---|---|
| Alias, typo, broken link, new identity | Owner | Admin |
| New tool or need; roadmap wording | Owner | Admin |
| Pricing / feature / availability claims | Owner, with a source opened | Admin, with a source opened |
| Removing a tool, changing an identity's needs, any lens | Owner | Admin + second reviewer (owner or expert) |
| Code changes | Owner (or trusted developer) | Two reviewers, CI green |

**Service levels:**
- Triage within 7 days.
- Fix urgent issues (harmful, broken or wrong-price) within 1 day.
- Show the queue size in the weekly loop (§6.4).

### 3.5 Guardrails
- **Sources:** factual claims about tools need an official source, or the claim isn't changed (07 evidence policy).
- **Conflict of interest:**
  - the form asks "Do you work for or with this tool's company?";
  - vendor suggestions are welcome, but they are labelled and never change fit order or ranking by themselves.
- **No paid influence:** no placement, ranking or "featured" status for money or favours (D-001; 19 principles).
- **People's privacy:** no personal data about other people in suggestions. Reviewers delete it from issues.
- **Abuse:**
  - bot check (Turnstile);
  - honeypot field;
  - rate limit of 5 per 10 minutes per hashed IP (10 §2);
  - 2,000-character limit;
  - links must be `https`;
  - no file uploads in R1.
- **Safety:** suggestions that could cause harm (dangerous health advice, scams) are declined and, if needed, reported. Health, legal and financial guidance stays general and points to professionals.
- **Tone:** plain, respectful language. Reviewers may reword any suggestion before publishing.

### 3.6 Credit (D-065)
- The form offers an optional credit name ("How should we thank you? e.g. *Ada, Lagos*") with a consent tick.
- Accepted suggestions with consent:
  - add the name to the record's "Improved with help from" line;
  - appear on the public **Contributors** page (S38);
  - appear in the weekly **What's new** notes (S37).
- Contributors can ask for removal at any time through the same form.
- **Email is off during the private beta** (flag `suggest_email`) until the privacy notice is approved (D-027). Credit works with a name alone.

### 3.7 Licences (D-061, recommended default; owner may override)
| What | Licence | Why |
|---|---|---|
| **Code** (site, Functions, generators, validators) | **MIT** | Simplest open-source licence, the most contributor-friendly, and compatible with almost everything. *Alternative:* **AGPL-3.0** if you want anyone who runs a modified copy as a public service to share their changes. |
| **Content** (identities, needs, skills, registry, roadmaps, lenses, profiles) | **CC BY 4.0** | Anyone may reuse it with attribution. Already used for the exports (10). |
| **Contributions** | Accepted under the same licences. The form says: "By sending this you agree it can be published under CC BY 4.0." Code PRs use a **DCO sign-off** (`Signed-off-by:`), not a contributor licence agreement. | Low friction, clear rights |
| **Third-party names and logos** | Not licensed by us. Use names as plain text; no logos (D-043 rule on third-party media) | Trademark respect |

Ready-to-use files are in `spec-assets/repo-templates/`:
- `LICENSE` (MIT) and `LICENSE-CONTENT.md`;
- `CONTRIBUTING.md` and `CODE_OF_CONDUCT.md`;
- GitHub issue forms and a PR template.

## 4. Built for easy change (D-064)
| Kind of change | How | Time to live |
|---|---|---|
| Content (alias, tool, need, roadmap wording, link) | Edit one source line → PR → CI rebuild + validate + preview → merge | Minutes |
| Switch a feature on or off | Edit `spec-assets/config/feature-flags.json` → merge (or set an environment override in Cloudflare without a deploy) | Minutes |
| Copy and labels on screens | Strings live in `src/content/ui-strings.json` (one file), not scattered in components | Minutes |
| New screen or behaviour | Build behind a flag (off), ship, test on preview, then switch on | Days |
| Undo anything | Cloudflare Pages "Rollback to this deployment", or revert the merge | 1 minute |

**Rules for the build team:**
- **Every PR gets a preview URL** (Cloudflare Pages). Reviewers click through before approving.
- **The main branch is always deployable.** Merge = deploy. There are no long-lived branches.
- **Feature flags** are read at build time (static pages) and at runtime (client islands). Unknown flags default to *off*. Each flag's entry records its owner and a removal date, so they don't pile up.
- **Additive API changes only** in `/api/v1` (10 §6).
- **The rebuild is deterministic** (TC-105), so a content PR's diff shows exactly what visitors will see change.
- **What's new (S37)** is generated from merged PRs labelled `user-visible`, with the PR title as the line and the contributor credit when consented.
- **The beta banner** (flag `beta_banner`) shows on every page: "Early version — help us improve it: Suggest an edit".

## 5. The three starter helpers (D-063, D-066, D-067)
> **V2.5:** the journeys are now **helpers** (D-066): the same stages and steps, but a Helper panel follows the person across the app (04 §9, S39–S41). The data is in `taxonomy/source/helpers.txt` (formerly `journeys.txt`). A third helper, **Entrepreneur**, is added (§5.4). Wherever this document says "journey", read "helper".
### 5.1 Musician
`/` → "Who are you?" → **Musician** → toolkit:
- record and mix (BandLab, Audacity, REAPER);
- sheet music (MuseScore);
- release music (DistroKid, TuneCore, BandLab);
- grow on streaming (Spotify for Artists, Audiomack, Instagram);
- plus the creative sector's shared needs and the universal needs.

From there: a tool page (e.g. BandLab) → its course outline → "Using BandLab to record and mix audio and music" → tick the first module → suggest an improvement.

### 5.2 Data analyst
`/` → **Data Analyst** (also BI Analyst, Power BI developer) → toolkit:
- SQL (DBeaver, BigQuery, PostgreSQL);
- dashboards (Power BI, Tableau, Looker Studio);
- spreadsheets (Excel, Google Sheets);
- cleaning (Power Query, OpenRefine, Python);
- charts (Datawrapper, Flourish);
- KPIs;
- statistics;
- notebooks.

From there: Power BI → its course outline → "Using Power BI to build dashboards and reports".

*Fixed in V2.3 while mapping the journey:* data pipelines (Airflow, dbt) had been showing as a core need for *every* data role. They now belong to Data Engineers. Data Analysts' core needs are SQL, dashboards, spreadsheets, cleaning, charts, KPIs and statistics.

### 5.3 Pilot 20: tools on the Musician and Data Analyst helpers to bring to full depth first
| # | Tool | Journey | Course outline now | Work before the beta |
|---|---|---|---|---|
| 1 | BandLab | Music | standard | Full profile (pricing, platforms, limits); upgrade outline to in depth |
| 2 | Audacity | Music | standard | Full profile; upgrade outline |
| 3 | REAPER | Music | standard | Full profile |
| 4 | MuseScore Studio | Music | standard | Full profile |
| 5 | DistroKid | Music | standard | Full profile (fees change often: source and date) |
| 6 | Audiomack | Music | standard | Full profile |
| 7 | Spotify for Artists | Music | standard | Full profile |
| 8 | CapCut | Music (promo video) | in depth | Full profile |
| 9 | Canva | Music (artwork) | in depth | Already profiled; re-verify |
| 10 | Instagram | Music | standard | Full profile |
| 11 | Microsoft Excel | Data | in depth (Spreadsheets) | Full profile; write flagship lens *Excel for data analysts* |
| 12 | Power Query | Data | standard | Full profile; upgrade outline |
| 13 | Power BI | Data | in depth | Full profile; write flagship lens *Power BI for data analysts* |
| 14 | Looker Studio | Data | standard | Full profile |
| 15 | DBeaver | Data | in depth (SQL) | Full profile |
| 16 | BigQuery | Data | in depth (SQL) | Full profile (free tier limits: source and date) |
| 17 | Python | Data | in depth | Full profile |
| 18 | Jupyter / Google Colab | Data | in depth (Python) | Full profiles |
| 19 | Datawrapper | Data | standard | Full profile |
| 20 | ChatGPT / Claude | Both (universal) | in depth (AI assistants) | Full profiles (plans change often) |

These are the first rows of the review's "depth before breadth" pilot. The owner is the expert reviewer for the data helper. Recruit one musician to review the music helper. AI-drafted guides for these tools already exist in `taxonomy/source/pilot_profiles.txt` (`review_status: pending`); they need a human check against each official page before they are trusted.

### 5.4 The Entrepreneur helper (D-067)
`/` → **Startup Founder** (or Small Business Owner, Social Entrepreneur) → toolkit offers the helper. Seven stages:
1. **Test the idea:** Google Trends, Typeform, Google Forms, Claude.
2. **Make a plan you can use:** Notion, Miro, Microsoft Excel.
3. **Look credible:** Canva, Google Business Profile, WordPress.
4. **Sell:** WhatsApp Business, Instagram, Selar, Shopify, Paystack, Flutterwave.
5. **Keep the money straight:** Wave, QuickBooks, Google Sheets.
6. **Grow:** MailerLite, LinkedIn, HubSpot.
7. **Pitch and raise:** Google Slides, Canva, Claude.

Four of its 23 tools already have full guides (Claude, Microsoft Excel, Canva, Instagram). The other 19 need one:
| Tool | Stage | Course outline now |
|---|---|---|
| Google Trends, Typeform, Google Forms | Test the idea | standard |
| Notion | Plan | in depth |
| Miro | Plan | standard |
| Google Business Profile | Look credible | standard |
| WordPress | Look credible | in depth |
| WhatsApp Business | Sell | in depth |
| Selar, Shopify, Paystack, Flutterwave | Sell | standard |
| Wave, QuickBooks | Keep the money straight | in depth (Bookkeeping) |
| Google Sheets | Keep the money straight | in depth (Spreadsheets) |
| MailerLite, HubSpot | Grow | standard |
| LinkedIn | Grow | in depth |
| Google Slides | Pitch and raise | in depth (Presentations) |
Until a guide exists, the tool shows the "Guide in progress" label and no claims (TC-127). **Payment, tax and company-registration rules differ by country**, so the helper states what to do (for example "create a payment link") and never gives legal or tax advice; D-027 reviews the launch markets. The owner has consulting experience in this field and is the natural expert reviewer, with one working founder recruited as a second.

## 6. Release plan (replaces the long version of the phases)
### Stage 0 (week 1): only the decisions a beta needs
| Decide now | Defer to public launch |
|---|---|
| D-061 licences (or accept MIT + CC BY 4.0) | D-019 final name, domain, trademark (beta uses `*.pages.dev`) |
| D-060 review rules (§3.4) and who reviews (owner) | D-027 launch markets and legal text (beta: no email collection, aggregate analytics only) |
| D-063 starter journeys (done) | D-018 uptime monitor (nice to have for the beta) |
| Beta feature flags (§6.5) | D-012 CMS UI (GitHub UI + the in-app form are enough for the beta) |

### Stage 1 (weeks 2–4): build the three helpers
Following doc 17's milestones trimmed to the slice:
- **Foundation:** tokens and components; the content pipeline (load the generated JSON, port the validator); feature flags.
- **Search:** the identities and skills index.
- **Screens:**
  - S39 helpers, S40 helper page and S41 helper panel, with the bottom tab bar (V2.5);
  - S01-R home (Who are you? and Skills tabs);
  - S27 toolkit;
  - S09-R tool page;
  - S30 roadmap with the depth label and ticks;
  - S29 lens;
  - S31 need page;
  - S36 Suggest an edit;
  - S37 What's new;
  - the beta banner.
- **Backend:** the corrections Function; events; health.
- **Deployment:** preview deploys and rollback.
- **Content in parallel:** the Pilot 20 (§5.3), then the Entrepreneur tools (§5.4).
- **Before this stage:** Spike S-1 (11, ADR-008).
- **Done when:**
  - all three helpers work on a mid-range Android phone on 3G, at 320 px, with a screen reader;
  - the suggestion → review → merge → live loop has been run end to end at least 3 times;
  - the slice's TC rows pass.

### Stage 2 (week 5): private beta with friends
- Share the link with 10–30 people. A ready-to-send message is in §7.
- **Ask them to:**
  1. find themselves;
  2. find one tool they'd actually use;
  3. tell us one thing that's wrong or missing (via Suggest an edit).
- **Watch** the aggregate signals:
  - identity misses;
  - zero-result searches;
  - suggestions by type;
  - which helpers are started, and where people stop.

  Optionally, sit with 3–5 people while they try it (05/15 user validation tasks).
- The site stays `noindex` and uses no tracking beyond the aggregate events (12, 14).

### Stage 3 (week 6 onward): the weekly loop
| Day | Do |
|---|---|
| Monday | Triage the suggestion inbox and the week's identity misses and zero-result queries. Pick this week's fixes. |
| Tue–Thu | Make the fixes (mostly source-line edits), add the professions and tools people asked for, upgrade the most-opened outlines, finish the flagged feature in progress. |
| Friday | Merge, deploy, publish "What's new", thank contributors. Note the beta metrics (§6.6). |

### Stage 4: open beta, then public launch
- **Open beta:** turn on more of the Explore-by tabs and more journeys (start with the 5–6 groups in the review: health, engineering, small business, teaching, a trade). Remove `noindex` from the journeys that pass.
- **Public launch gate:**
  - D-019, D-027 and D-018 decided;
  - privacy notice and terms reviewed;
  - doc 15 P1 tests green;
  - beta metrics at target;
  - email in the suggestion form switched on only after the privacy notice is live.

### 6.5 Beta feature flags (initial values)
Set in `spec-assets/config/feature-flags.json`:
- **On:** `explore_identity`, `explore_skills`, `suggest_edit`, `whats_new`, `beta_banner`, `roadmap_ticks`.
- **Off:**
  - `explore_goal`, `explore_tools`, `explore_sectors`;
  - `helping_mode`, `toolkit_cards`;
  - `contributors_page`;
  - `suggest_email`;
  - `admin_report`.

### 6.6 Beta metrics (aggregate only)
| Metric | Target to move to open beta |
|---|---|
| Identity searches that find a match on the first or second try | ≥ 85% |
| Suggestions received per week | Rising for 3 weeks (people care enough to help) |
| Median time from suggestion to live | ≤ 7 days |
| Zero-result search rate | < 15%, then falling |
| Journey completion (toolkit → tool → roadmap opened) | ≥ 40% of identity selections |
| Helper start rate and first-stage completion (V2.5) | Record the baseline in week 1; no target until then |
| Reported broken or wrong facts on Pilot 20 tools | 0 open older than 7 days |

## 7. Ready-to-send beta invite (WhatsApp / text)
> Hi! I'm building **{working name}**, a free site that shows you the digital tools and skills that matter for *your* work, and how to learn them step by step. It's an early version and I'd love your help 🙏
> 1. Open {link} and type what you do (e.g. "musician", "data analyst", "nurse", "tailor").
> 2. Does it find you? Do the tools make sense for your work?
> 3. Anything wrong or missing? Tap **Suggest an edit** on that page. It takes 30 seconds and I read every one.
> No sign-up, and it doesn't track you personally. Thank you!

## 8. Where this changed other documents
- **00:** conflicts C-30 to C-33.
- **01:** scope moves for contributions, beta and flags.
- **02:** decisions D-060 to D-065; D-012, D-019 and D-027 timing amended.
- **03:** routes.
- **04:** screens S36–S38 and the auto-lens title rule.
- **10:** corrections endpoint fields.
- **12:** contributor data.
- **15:** TC-107 to TC-118.
- **16:** delivery rules.
- **17:** build order (slice first).
- **20:** the review queue is the admin's main inbox.
- **V2.5:** doc 23 (feature matrix), helpers (04 §9), Bun + Vite + React (ADR-008), D-066 to D-070.
