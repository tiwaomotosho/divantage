# 00 — V1 Reconciliation and Conflict Log

**Version:** 2.5 · **Date:** 21 October 2026 · **Status:** Baseline for implementation

This log records every place where the V1 pack and the V1 Gap Analysis (both preserved unchanged in `00_Reference/`) disagree with each other or with themselves, and how V2 resolves each conflict. Each resolution points to a decision in `02_Product_Decision_Register.md`. Where the V2 documents and V1 differ, the V2 documents govern, and this log explains why.

## Precedence rule
1. The `02_Product_Decision_Register.md` entries with status **Approved** or **Recommended default**.
2. The V2 numbered documents (01–17) and `spec-assets/`.
3. The V1 Gap Analysis.
4. The V1 pack.

A lower item is superseded only where a higher item explicitly addresses the same point. Everything else in V1 continues to apply.

## Conflicts and resolutions

| ID | Topic | V1 says | Gap analysis says | V2 resolution | Decision |
|---|---|---|---|---|---|
| C-01 | Pricing vocabulary | 10 controlled values: `free`, `freemium`, `free_trial`, `paid_subscription`, `paid_once`, `open_source`, `usage_based`, `enterprise_quote`, `mixed`, `unknown` (06 §3) | 8 looser values incl. "Paid" and "Paid with a free tier" (§7.1) | Keep V1's 10 values. "Paid with a free tier" = `freemium`. "Paid" splits into `paid_subscription` / `paid_once` / `enterprise_quote`. | D-007 |
| C-02 | Lifecycle states | 5 states: draft, in_review, published, needs_review, archived (02 §11) | 10 states mixing editorial and availability (§18.3) | Two separate fields: `editorial_status` (V1's 5) and `availability_status` (active, beta, limited, temporarily_unavailable, discontinued, unknown). "Stale" is a computed flag (`is_overdue`) when `next_review_at` has passed. "In research" = `draft`. "Approved" = PR approved and merged to `published`. | D-008 |
| C-03 | Categories vs. tasks | 20 functional domains (02 §3) | 17 example categories plus 12 task families (§6.1, §7.1) | Three distinct dimensions: **Category** (V1's 20 domains, shown only when coverage threshold met), **Task family** (V2's 12 families, groups Tasks), **Task** (concrete goals). | D-009 |
| C-04 | Spelling convention | British/international ("organise", "colour") | American ("organize", "color") | All public UI copy and content in **British English (en-GB)**. Code identifiers use American spelling (`color`) per web-platform convention. | D-036 |
| C-05 | Audience list | Home cards: student, professional, business owner, creator, job seeker, exploring | Employee, entrepreneur, educator, researcher, developer, nonprofit worker added | One controlled audience vocabulary with aliases (`entrepreneur` → alias of `business-owner`; `employee` → alias of `professional`). Home shows V1's 6 cards; full list on `/discover`. | D-009 |
| C-06 | Comparisons in MVP | MVP includes "basic comparison pages" | Recommended MVP omits comparisons | Keep basic comparisons in R1 (max 3 tools, fixed dimension set). | D-028 |
| C-07 | Corrections timing | PRD puts "Feedback and correction submissions" in R1.5, but the 08 readiness checklist and 06 §8 require a correction route at launch | Correction reporting is MVP | Correction reporting is **R1**. General feedback ("was this helpful?") stays R1.5. | D-003 |
| C-08 | Projects nav item | Shown "if live" | Not addressed | Hidden in R1; route reserved. | D-030 |
| C-09 | External links | New tab acceptable if consistent | Silent | Same tab by default, with a visible external-link icon and an accessible "(official site)" or "(external)" suffix. | D-031 |
| C-10 | Dark mode | Optional | Define fully if supported | Included in R1: follows system preference, manual toggle, no flash of the wrong theme. | D-021 |
| C-11 | Editorial screens | "Admin content management" | Custom screens or a documented CMS | Git-based editorial: GitHub pull requests, CODEOWNERS approval, CI validation, and automated freshness and link reports as GitHub issues. No custom admin UI in R1. | D-012 |
| C-12 | Database | Structured database or headless CMS | Expects an implementation-ready database | Content is versioned JSON files validated by JSON Schema; the "database" for content is the Git repository. One small Cloudflare D1 database holds aggregate analytics counters only. | D-011, D-016 |
| C-13 | Popularity | "Popular and recently reviewed", but do not fabricate popularity | Same | Home section is titled **"Editor's picks"** and **"Recently reviewed"**. No popularity claims until real data exists and the owner approves. | D-003 |
| C-14 | Resource cost vocabulary | free, freemium, paid, subscription, unknown, plus `registration_required` | "Free/paid/access-restricted status" | Keep V1's resource values. Add `institution_access` (e.g. paywalled papers via a library). `registration_required` stays separate. | D-007 |
| C-15 | Business model | Sponsorship/affiliate rules "if ever introduced" | Owner must decide | **Non-commercial** (owner-approved, 21 Oct 2026). No sponsorship or affiliate UI is built. The disclosure fields in schemas exist, are always empty, and the validator rejects non-empty values while D-001 stands. | D-001 |
| C-16 | Learning paths | R2, browse without sign-up | Content type example | R2. The schema is reserved, with no route in R1. | D-030 |
| C-17 | Sort "beginner-friendly" | Only if data supports it | Silent | Not offered in R1. Sorts are Relevance (default) and Recently reviewed. | D-032 |

## V2.1 conflicts (owner direction of 21 Oct 2026 vs V2)
| ID | Topic | V2 said | Owner direction | V2.1 resolution | Decision |
|---|---|---|---|---|---|
| C-18 | Primary entry | Search box + audience cards | Landing page is a question: "Who are you?", "What would you like to learn?" | Question-led home with identity picker; V2 example queries kept as secondary | D-042 |
| C-19 | Audiences | 13 audience lenses | Every legal profession and life role | Audiences replaced by 1,199 identities; old audience URLs redirect | D-046 |
| C-20 | Career scope | Career = one category | "It's not broad at all with career… there's software engineer, product manager, QA tester…" | Granular identities per field, incl. 60+ tech roles | D-046 |
| C-21 | Publication | Records stay in_review until human review | "Assume it's all perfect for now; experts later" | Published under blanket approval with an expert-review-pending label | D-044, D-045 |
| C-22 | Video resources | `video` resource type allowed | Exclude YouTube links | Video-platform links banned in MVP | D-043 |
| C-23 | Business model | Non-commercial | Non-commercial MVP; monetisation thinking after | D-001 scoped to MVP; options documented | D-001, D-050 |
| C-24 | Learning paths | R2 | Per-tool "digital roadmap / course outline" with beginner/intermediate/expert buckets now | Tool roadmaps + lenses in R1 (outlines, no accounts); full learning paths with progress stay R2 | D-051 |
| C-25 | Personalisation | Profiles never change content | Same tool, different needs per profession | Lenses tailor the order and focus of learning, while all content stays public and searchable | D-047, D-051 |
| C-26 | Entry points | Identity is the entry point (V2.1, D-042) | Also explore by skills and other routes (V2.2 owner) | "Who are you?" stays the default, selected tab; Skills, Tools, What-to-do and Sectors are peer tabs that cross-link back to identity | D-042, D-058 |
| C-27 | Roadmap coverage | Add 20 handwritten roadmaps per quarter (V2.1 §17) | ≥ 90% of tools need a course outline now (V2.2 owner) | Generated archetype+signature roadmaps meet the minimum for all 723 tools at once; handwritten upgrades continue at 20 per quarter | D-051, D-056 |
| C-28 | Coverage definition | 1,199 curated identities with a later ESCO/ISCO import (D-049) | "Exhaustive list of occupations" (V2.2 owner) | ISCO-08 unit-group completeness is the validator-enforced definition of exhaustive; ESCO becomes an alias source | D-049, D-055 |
| C-29 | Naming | "Woogle"-style "-oogle" portmanteau (owner inspiration) | Trademark and existing products (Whoogle, Hoogle) | Keep the portmanteau spirit without "-oogle": Whoolkit recommended | D-019, D-059 |
| C-30 | Contributions | Contributor submissions are R2 (01 §6) | Open-source mentality now: anyone suggests, the backend reviews (V2.3 owner) | "Suggest an edit" ships in the beta (R1). No accounts; every change is reviewed by a person before it goes live | D-060 |
| C-31 | User content | No comments, ratings or user-generated content (17 prohibitions) | Public suggestions (V2.3 owner) | Suggestions are private until reviewed. What's published is editorial content a reviewer approved, optionally credited. Comments and ratings stay out | D-060, D-065 |
| C-32 | Launch gating | D-019 (brand) and D-027 (markets, legal) block launch | "Waiting forever can be another rabbit hole" (V2.3 owner) | An invite-only private beta runs on a preview domain with noindex, no email collection and aggregate-only analytics. The decisions gate the **public** launch only | D-062 |
| C-33 | Delivery plan | Six sequential phases, 2–3 months to a tested MVP (V2.2 review) | Rapid improvement with friends (V2.3 owner) | Beta in about 5 weeks with two journeys, then a weekly improvement loop; expand on evidence | D-062, D-063 |
| C-34 | Naming and shape | "Journeys" are pages you visit (V2.3 doc 22 §5, `journeys.txt`) | "The journeys are more like helpers" (V2.5 owner) | Journeys become **helpers** that follow the person across the app (Helper panel, S41). Same content, new presentation and routes (`/helpers`); `/journeys` redirects. Source file renamed `helpers.txt` | D-066 |
| C-35 | Scope | Some owner features sit in R1.5 (admin report A01) or behind flags that never turn on (helping mode, Explore-by tabs, Contributors) | "Make the App level to all the features I have shared" (V2.5 owner) | Release 1 is every row of the feature matrix (doc 23). Each flag has a `launch` value, checked by a script; A01 moves into R1 | D-068 |
| C-36 | Technology | D-010 Astro with vanilla TypeScript islands and "no UI framework" (ADR-007); JS budget 30 KB on content pages (14 §3) | "Would have preferred bun, vite, react at the base of my tech stack" (V2.5 owner) | D-010 and D-039 amended: Bun, Vite, React with React Router prerender (ADR-008). ADR-001 becomes the fallback. JS budgets reset (14 §3), measured in Spike S-1. A CSP plan covers prerendered inline scripts | D-069 |
| C-37 | Visual direction | V2 art direction (06 §1) is calm and editorial | "Very visual appealing and sleek responsive web app" (V2.5 owner) | Tokens and typefaces stay. 06 §12 adds principles and components (identity ribbon, route rail, helper pill, bottom tab bar). Sign-off by a designer or the owner | D-070 |

## Items in V1 that V2 deliberately keeps unchanged
- North star, mission, product thesis and all 10 product principles (V1 01 §1, §6).
- Non-goals (V1 01 §4).
- All "do not fabricate" rules (V1 README, 06, 09).
- Editorial quality checklist (V1 06 §11), now enforced partly by CI (see 07 and `spec-assets/schemas`).
- Critical test scenarios 1–15 (V1 08 §2), now traced in `15_QA_and_Acceptance_Matrix.md`.
