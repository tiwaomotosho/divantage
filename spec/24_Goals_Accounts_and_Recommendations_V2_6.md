# 24 — Goals, Alternatives, Accounts and Recommendations (V2.6)

**Version:** 2.6 · **Date:** 23 October 2026 · **Status:** Governing document for everything added in V2.6. Decisions D-071 to D-083; requirements FR-076 to FR-094; screens S42 to S48; tests TC-133 onward; features F-30 to F-40.

> **Updated by V2.7 (doc 26).** Goals are now 1,050 and the registry 1,781; the same-kind figure is 97.0% with a 95% gate (D-085), not 59%; recommendation rules are R1 to R12 (D-089). Figures below are the V2.6 state.

## 1. Summary
V2.6 does five things the owner asked for.
1. **Positions the product** as using technology to **compete, grow and scale** (§2).
2. **Fills the goals layer.** 633 outcome-phrased goals under 279 needs, so "jump straight to a goal" works and one tool (WordPress) is never the only answer (§3).
3. **Gives every tool alternatives** and widens the tool universe from 723 to 1,479, including Nigerian and African tools (§4, §5).
4. **Adds optional accounts**, starred skills and a "My workbench" screen, offered only after the person has found value (§6 to §8).
5. **Adds a recommendation engine that improves from the profile and a weekly trending list**, both rule-based. No machine learning is needed (§9, §10).

A retention loop ties these together (§11): the product gives a reason to come back that does not depend on a notification.

## 2. Positioning: compete, grow, scale (D-075)
| Intent | Meaning in the product | Example need |
|---|---|---|
| **Compete** | Keep up with the standard in your field | Be findable online, take card payments |
| **Grow** | Win more customers, income, audience or skill | Run ads, build an email list |
| **Scale** | Do more without more effort: automate and systematise | Automate invoices, schedule posts |

Every need carries one or two intents (`needs_intents.txt`); goals inherit them. Counts: compete 261 goals, grow 232, scale 202 (114, 97 and 90 needs). The home screen shows three intent chips below "Who are you?". A chip filters goals and recommendations; it never hides content. The line "Use technology to compete, grow and scale" is a strapline, not a promise of outcomes (see §14).

## 3. Goals (D-071)
A **goal** is a finer, outcome-phrased job under exactly one parent need, so identity → need → goal → tools still reads in one line.
- Source: `spec-assets/taxonomy/source/goals.txt`. Fields: slug, label, parent need, markets, search words, 3–8 tool slugs best first. Generated to `taxonomy/goals.json` (schema `goal.schema.json`).
- Tools in one goal are **substitutes for the same job** (WordPress, Wix, Squarespace and Webflow all build a business website). This is the rule that stops "just WordPress builds a website".
- Every need has at least 2 goals (average 2.27). Build fails below that.
- Labels are plain outcomes ("Get a ride in a Nigerian city", "Become a POS agent"), 8–90 characters.
- **Jump straight to a goal**: a search box on `/goals` and the home screen searches goal labels, search words **and tool names** (typing "indrive" finds ride-hailing goals). The goal index is a separate MiniSearch index, about 54 KB gzip; the 48-query harness passes 48/48.
- Goal page (S43) shows: the outcome, the parent need, the tools ranked, a "compare" strip, the intent tags and a market note.

## 4. Alternatives and the tool universe (D-072, D-073)
**Rule.** Two tools are alternatives when a goal lists both. The list is derived by `build_goals.py` and never typed by hand. Ranking: Σ over shared goals (10 + 0–4 for closeness of list position) + 3 if the same category + 2 if the same roadmap archetype; ties by slug; top 7 kept.

**Owner's target:** 7 alternatives per tool so that "it is unlikely to miss any tool". Result:
| Measure | Tools | Share |
|---|---|---|
| Registry | 1,479 (was 723) | |
| Tools with 7 listed alternatives | 1,402 | 94.8% |
| Tools with 1–6 | 77 | 5.2% |
| Tools with no goal | 0 | 0% |

**What this number does and does not mean.** It measures *listing coverage*: a tool shares goals with at least seven others. We also measured how many of those seven share the tool's category or roadmap archetype, which is closer to "genuinely interchangeable":
| Stricter test | Tools with 7 |
|---|---|
| Same category | 801 (54%) |
| Same roadmap archetype | 600 (41%) |
| Same category **or** archetype | 872 (59%) |
| Both | 510 (34%) |

So 7 alternatives per tool is met for listing, and for a stricter test only for about 59%. The product shows alternatives in rank order and labels the top ones; lower-ranked ones are "also used for this job", not "equivalent". Fixing this is editorial work on the goal lists (§16), never padding.

**New tools (D-073).** 756 tools were added as **stubs**: name, publisher, category, URL "to_confirm", no price or platform claims, `expert_validation: pending`. Each has an archetype, so roadmaps exist for all 1,479 tools (14,079 modules). Stub tools show a "Details being confirmed" badge and a link to suggest a fix. They are never described with features the catalogue has not verified.

**Supplementary research.** The owner noted that expanding tools means more research: outline, professionals who use it, learning steps. The generators already derive "who uses this tool" from needs and goals and a roadmap per archetype. The remaining human work is listed in `08_Starter_Catalogue/generated/alternatives-coverage.json` (tools needing more alternatives) and in §16.

## 5. Markets and availability (D-074)
- Goals and tools carry `ng`, `africa`, or `all`. 62 tools are tagged `ng` and 35 `africa` (a tool may be both). Examples: inDrive, Bolt, Paystack, Flutterwave, Moniepoint-style POS agent tools.
- **Nigeria-first ranking**: for a visitor in Nigeria, market-tagged goals get a boost of ×1.25 in lists. Global goals are never hidden; a visitor who selects "Other country" sees global ranking.
- **Availability**: `tool_availability.txt` records where a tool is **not** available (slug, markets, since YYYY-MM, note). Case: *Uber ended operations in Nigeria in September 2026*, so Uber stays in the registry and in the global goal "Get around a city you do not know", with the tool page showing "Not available in Nigeria since 2026-09". `build_goals.py` fails if a goal tagged for a market lists a tool unavailable there.
- *Showmax* closed on 30 April 2026 and was removed from the registry.
- Availability is checked at least quarterly by the editors (the date is shown as "checked on").

## 6. Stars and My workbench (D-079)
- Items that can be starred: **skill (module), tool, goal, helper**.
- A starred skill has a state: **starred** → **learning** → **can do**. Moving to "can do" is the person's own claim; no test is implied.
- **My workbench** (S45, `/me`) lists: Continue, Learning, Starred, Can do, Goals I follow, and "What changed for you?" history.
- Without an account, stars are kept on the device (as helper progress already is, V2.5). With an account, they sync. Signing in merges device stars into the account; conflicts keep the newer.

## 7. Accounts and sign-in (D-076, D-077, D-078)
**Principle.** Nothing that is public today becomes gated. Sign-in is optional and is offered only after the person has found value.

**Prompt triggers (any one):** the 3rd star; the first completed helper stage; the 5th ticked module; a return visit on a different day. Frequency cap: at most once per session and not again for 14 days after "Not now"; never on first load; never as a full-screen block; never inside a helper stage.

**Sign-in methods (D-077):** email one-time code and Google. WhatsApp or phone OTP is to be evaluated because it fits Nigeria (cost, delivery, regulation). Stack choice is **Spike S-2**: Auth.js vs Clerk vs Supabase Auth; choose on cost at 10,000 users, Nigerian email deliverability and data location.

**Profile.** Saved server-side with consent: chosen identities, intents, markets, stars, skill states, module and helper progress, saved stage outputs, outcomes. Edit, **export** (JSON) and **delete** from S46. Activity events are kept 90 days.

**Consent screen** says what is stored and why, in plain words, with three separate switches: save my progress; use my profile to recommend; include me in trending counts (§10, off by default, not pre-ticked).

## 8. Privacy and data (D-078, amends D-004, D-005)
- Doc 12 now has two modes: *anonymous* (no accounts: counters only, as before) and *signed-in* (profile and activity, with consent). A visitor who never signs in is covered by the old statements.
- Lawful basis: consent for profile, recommendations and trending. Governing law is the **Nigeria Data Protection Act 2023** (plus GDPR where visitors are in the EU). **Counsel must review the consent text, retention and cross-border transfer wording before public launch** (D-027).
- Minimum age: sign-in is offered to people aged 18 and over; the product does not collect or ask for date of birth. The exact age rule and wording is a counsel decision.
- Delete means delete: account rows are removed, activity is removed, trending counts already published are aggregates and stay.

## 9. Recommendations (D-080)
Rule-based, explainable, **no machine learning**. The engine runs on the profile; each card says why.

| Rule | Card | Signal |
|---|---|---|
| R1 | Continue | Last unfinished module or stage |
| R2 | Next module | Next in the roadmap of a learning tool |
| R3 | Starred, not started | Star older than 3 days with no progress |
| R4 | Core goals for you | Goals under your identity's needs; intent boost ×1.2 |
| R5 | Next level | Beginner done → Intermediate for the same tool |
| R6 | Compare an alternative | A top alternative to a tool you are learning |
| R7 | Trending in your field | Trending row matching your identity (only if the list is visible) |
| R8 | Fresh | New or updated item in your areas |

Limits: at most 5 cards; at most 2 per kind; every card shows its "why" line; "Not for me" and "I already know this" are on every card and feed back (`reco_feedback`). A dismissed item does not return for 30 days.

"Keeps improving" means: more signals in the profile (stars, ticks, outcomes, feedback) give better rule inputs, and the weights are tuned by click-through per rule from `recommendation_*` events. **When to consider ML:** about 10,000 weekly active signed-in users and at least 3 months of events. Until then ML would not beat the rules and would be harder to explain.

## 10. Trending (D-081)
Lists on `/trending` and a strip on home: **top 3 skills this week, top professions (identities), top goals, top tools.**
- Counts **distinct signed-in users who opted in** over a rolling 7 days.
- **Privacy floor** k = 10 per row (`trending_weekly` enforces users ≥ 10).
- **Activity gate**: the whole list stays hidden until about 200 weekly active opted-in users (configurable) and if fewer than 3 rows qualify.
- Accounts under 24 hours old are excluded; the helper kind is excluded; one user counts once per item.
- A daily job `refresh_trending(week_start)` builds the table. Honest empty state: "Trending appears when enough people have used the product this week."
- Trending can be gamed by a small group; the floor, the age rule and the opt-in reduce that but do not remove it. Treat it as a guide, not a ranking claim.

## 11. Retention loop (D-082)
The retention report's question was: *what recurring trigger makes users think of this product first?* The loop is:
1. **Continue where you left off** card on home and `/me`.
2. **Save what you made**: each helper stage can save an output of ≤ 280 characters or an https link.
3. **What changed for you?** A short prompt a week after a stage: got a customer, saved time, learned something, earned money, nothing yet, other. This is the product's real result measure and is never shown publicly as a claim.
4. **Suggestion status** page `/suggestions/{ref}`: someone who suggested a fix can see whether it was triaged, fixed or declined.
5. **Personal what's new**: changes to tools you starred or are learning.
No push notifications or marketing email are specified. A reminder channel (email or WhatsApp) is a Post-MVP option that needs separate consent.

## 12. Screens
S42 Goals `/goals` · S43 Goal page `/goals/{slug}` · S44 Sign-in sheet · S45 My workbench `/me` · S46 Profile and privacy `/me/profile` · S47 Trending `/trending` · S48 Suggestion status `/suggestions/{ref}`. Amended: S01-R (intent chips, jump-to-goal, continue card), tool page (alternatives, availability, star). Details in doc 04.

## 13. API and data
- New endpoints are in doc 10 (§V2.6): auth, profile, stars, progress, outputs, outcomes, recommendations, trending, suggestion status, export, delete.
- Data model in `db/0002_accounts_profiles_postgres.sql`: `users`, `auth_codes`, `sessions`, `user_identities`, `stars`, `skill_state`, `module_progress`, `helper_progress`, `stage_outputs`, `outcomes`, `reco_feedback`, `activity`, `trending_weekly`, function `refresh_trending`, and `event_counts` (the Postgres replacement for the D1 counters).
- **Host (D-083):** Vercel for the app and Neon Postgres through the Vercel Marketplace, as the owner confirmed. This amends D-069 (Cloudflare Pages). The SQL parses; it has **not** been run against a database yet.
- Analytics: 18 new events (47 total) and a rule separating user-linked activity from anonymous counters.
- Flags: `goals`, `alternatives`, `intent_chips`, `stars`, `continue_card`, `suggestion_status`, `outcome_prompt` launch ON; `accounts`, `recommendations`, `trending` ship behind default-off flags and launch ON after counsel review and Spike S-2.

## 14. Order of work
**Beta (static, no accounts):** goals, jump-to-goal search, intent chips, alternatives and availability, device stars and My workbench, continue card (device).
**Launch:** accounts, sync, recommendations R1–R8, outcome prompt, stage outputs, suggestion status, trending (when the activity gate is met).

## 15. Tests
TC-133 to TC-150 in `spec-assets/qa/acceptance-matrix.csv` (18 tests): goal build rules, derived alternatives, goal search, intent chips, market ranking, availability, alternatives on the tool page, device stars, My workbench and continue card, sign-in triggers and no gating, consent defaults, export and delete, sync merge, recommendation limits, rules R1 to R8, trending floor and gate, outputs and outcome prompt, suggestion status.

## 16. Honest limits and risks
- **Goal lists and the 756 new tools are AI-drafted.** They need practitioner review and a "checked on" date. `expert_validation` is `pending` for every goal.
- **7 alternatives** is met for listing coverage (94.8%); the stricter same-kind figure is about 59% (§4). 77 tools have fewer than 7.
- **Local tools** (62 Nigeria, 35 Africa) were written from general knowledge; only a few were checked against current sources. Tool availability changes (Showmax, Uber) so every local tool needs a date check.
- The goal-search test queries were written by the same author as the index; they show the harness works, not that real users will phrase things this way. Replace them with real queries from the beta.
- Accounts, recommendations and trending are specified, not built or user-tested. The SQL has not been executed.
- Trending is only meaningful once usage is large enough; below the gate it is hidden by design.
- "Compete, grow, scale" is a direction. The product does not claim outcomes; the "What changed for you?" data may show whether it helps.
- Counsel review of consent and NDPA wording is required before public launch.
