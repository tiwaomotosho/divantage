# 26 — Goal Kits, Tool Profiles, Safety and Discovery (V2.7)

**Version:** 2.7 · **Date:** 23 October 2026 · **Status:** Governing document for everything added in V2.7. Decisions D-084 to D-090; requirements FR-095 to FR-108; screens S49 to S52; tests TC-151 to TC-168; features F-41 to F-48. Where this document and doc 24 differ, this one wins (it amends D-072's quality measure and D-080's rule list).

> **Spec only.** Nothing here is built. The data files and generators are in the pack and pass their validators; the app code is for the build team (doc 25).

## 1. What the owner asked for, and where it lands

| The owner said | What the pack now does | Decision |
|---|---|---|
| "Take the 59 to at least 95%" | Same-kind alternatives are now **97.0%** (1,728 of 1,781 tools). A build gate holds it at 95% or more. | D-085 |
| Tech enablement, "not just information": portfolios, CV generators, proofreading, remote job platforms | 1,050 goals. 148 are grouped into 29 kits, including *Get a remote job*, *CV, portfolio and proofreading pack*, *Become a freelancer*. Each kit step names real tools with a price chip. | D-086, D-090 |
| "Easy to find goals… Who are you, skills etc." | Seven entry paths, all ending at goals. Natural-language search ("I want to get a remote job"). | D-088 |
| "Do not hold back any content… add the preview clause" | Every tool has a profile. Unverified ones carry a **Preview** label that says what is unchecked. | D-084 |
| "A brief one paragraph description… subscription… price… even if wrong, put it with a label" | `tool-profiles.json`: 1,781 profiles, each with a short paragraph, pricing model, free-tier flag and price note. | D-084 |
| "Make people really happy and safe" | Nine safety rule sets. 498 goals carry at least one safety note with red flags and where to get help. | D-087 |
| "Suggest goals to people who don't go there directly" | Rules R9 to R12, and a kit hint for each of the 2,603 identities. | D-089 |
| "What if someone wants to teach kids programming? We own Technology Education" | A *Teach kids programming* kit of nine goals with a child-data note, plus *Learn to code* and *Break into tech*. | D-090 |
| "Everything… comprehensive and connected" | Every goal has at least three related goals; kit steps have a next step; tool pages list the goals that use them. | D-088 |

## 2. Tool profiles and the Preview clause (D-084)

**What a profile holds** (`08_Starter_Catalogue/registry/tool-profiles.json`, schema `schemas/tool-profile.schema.json`):

| Field | Meaning |
|---|---|
| `description` | One short paragraph (30 to 600 characters, about 120 on average): what the tool does, who it suits, and one honest caution where there is one. |
| `pricing_model` | One of the ten ids in `vocabularies.json`: free, freemium, free_trial, paid_subscription, paid_once, open_source, usage_based, enterprise_quote, mixed, unknown. |
| `free_tier` | yes, limited, no or unknown. |
| `price_note` | A short phrase such as "Free plan; paid from a monthly fee". No figures unless a source was seen. |
| `verification` | `ai_draft` (default) or `web_seen`, with what was checked, the source and the date. |
| `preview` | Whether the label shows, the list of things not yet checked, and the label text. |

**Current state.** 1,781 of 1,781 tools have a profile. Spread: freemium 573, free 365, paid subscription 335, open source 182, usage based 140, enterprise quote 134, paid once 34, mixed 18. Free tier: yes 1,096, limited 344, no 340. **5 profiles are partly web-checked** (3MTT, N-ATLAS, Remote4Africa, Raenest, Grammarly, each checked 22 October 2026 for existence and purpose, not price). **The other 1,776 are AI-drafted from general knowledge and have not been checked against the vendor's site.**

**The Preview clause (FR-096).** Every profile that is not fully checked shows a label directly beside the price:

> **Preview.** Drafted from general knowledge, not yet checked against the official site. Prices, free-tier limits and availability in your country may differ. Confirm on the official page before you pay.

- The label is not a footnote. It sits in the same row as the price chip, in the same size of type, and a tap opens the list of what is unchecked (price and plan limits, whether a free tier still exists, availability and payment options in your country, supported devices).
- A partly checked profile says what was checked and when: "Partly checked: existence and purpose (22 Oct 2026). Pricing is still a preview."
- **Content is never hidden because it is unverified.** The owner's rule is to show it with the label and the information, not to hold it back or to show a label with nothing under it.
- The label comes off only when `verification.level` is `web_seen` **and** a source and date are recorded for the price. `validate_profiles.py` fails the build if a profile that is not `web_seen` lacks the label, or if `web_seen` lacks a source or date.
- Registry rows keep `pricing_model: unknown` (the existing rule: a price needs official sources). Profiles are a separate layer so the registry rule is not broken.

**Where profiles appear (FR-095, FR-097).** Tool page (paragraph, price chip, free-tier chip, Preview label); every card in a goal, kit step, alternatives list and search result (price chip plus a small Preview mark); comparison tables.

**Making the claims real over time.** An editor opens the official pricing page, records `checked`, `source` and `checked_on` in `profile_verified.txt`, and the next rebuild flips that tool to `web_seen`. Priority order: tools in kits, then tools in the top three of any goal, then the rest. The weekly link check (doc 16) also flags profiles whose `checked_on` is older than 180 days.

## 3. Alternatives: the same-kind measure (D-085)

D-072 derived alternatives from goals, and counted a tool as having "7 alternatives" if seven candidates were listed. That was met for 94.8% of tools, but only about 59% had seven alternatives of the same kind (same registry category or same roadmap archetype), which is the honest test of "could replace this".

- V2.7 adds same-kind scoring (+12 for the same kind) and 25 more tools with 10 Nigeria-focused goals.
- Result: **7 listed alternatives for 1,780 of 1,781 tools (99.9%); 7 same-kind for 1,728 (97.0%).**
- `validate_goals.py` fails the build if same-kind falls under 95%. It also writes the 53 tools still short to `generated/alternatives-coverage.json`. These are niche tools such as CommCare, Epicollect5, Common Voice and Masakhane where the registry has few peers.
- "Same kind" means same category or archetype. It does not prove substitutability. Domain experts will review the lists later (D-071).

## 4. Goal kits (D-086)

A **kit** is an ordered path of goals for an outcome people state in their own words. It is the answer to "I want to get a remote job", which is never one tool.

- 29 kits in `source/goal_kits.txt`, 148 goals included, each kit with three to twelve goals, a one-sentence promise, a market tag and the phrases people type.
- Kits: get a remote job; become a freelancer; edit a short video; teach kids programming; learn to code; break into tech; CV, portfolio and proofreading pack; sell on WhatsApp; start a business in Nigeria; stay safe online; keep my child safe online; write better in English; get paid from abroad; start a YouTube channel; study for free; farm smarter; run a small shop; open an online shop; build a brand; teach online; pass my exams; write and publish a book; release my music; run a clinic; organise an event; earn with a vehicle; file my taxes; learn and use AI; manage money at home.
- **Example, *Get a remote job* (nine goals in order):** write a CV that passes applicant tracking; build a CV for free; optimise LinkedIn; build a portfolio; pick a remote job board; find remote jobs open to Africa; check a remote job offer is genuine; prepare for a remote interview; compare ways to get paid from abroad.
- A kit page (S50) shows the steps in order. Each step shows the goal, the top three tools with price chips, a Preview mark where it applies, the goal's safety note, and "Next: …".
- Build rules: every goal must exist; no repeats; three to twelve goals; a kit tagged `ng` may not contain a goal that is only for another market; a kit needs search phrases. `validate_discovery.py` also requires the remote-job and freelance kits to carry the jobs safety tag and the kids kit to carry the kids tag.

## 5. Safety notes (D-087)

The aim is that a person leaves safer than they arrived. Rules live in `source/goal_safety.txt`; tags are derived from keywords in each goal's slug, label and search words.

| Tag | Goals | Shown on goals about |
|---|---|---|
| jobs | 93 | jobs, freelancing, internships, scholarships |
| money | 74 | investing, loans, transfers, payments, crypto |
| kids | 52 | children, teaching, parents, schools |
| health | 54 | symptoms, doctors, medicines, nutrition |
| legal | 40 | contracts, registration, tax, copyright |
| privacy | 118 | passwords, accounts, uploading documents |
| ai | 54 | AI tools and assistants |
| content | 118 | video, music, photos, downloads |
| official-fees | 28 | passports, exams, government services |

Each rule has: what to know (one or two plain sentences), red flags (a short list), and where to get help (an official body, not a product).

**Rules for the panel (FR-101, FR-102).**
- It appears at the top of the goal page and under the kit step, before the tool list, as a calm panel and never as a popup. Three red flags are visible; the rest expand.
- It never says a tool or offer is "safe", "verified" or "guaranteed". It says what to check.
- It never gives financial, legal or medical advice. Money notes say that nothing is financial advice and point to the licensing body.
- Examples: *Jobs:* real employers and scholarships do not charge you to apply; red flags include paying for a form or equipment first and interviews only on WhatsApp. *Kids:* use child-safe platforms, avoid sharing a child's name, photo or location, and follow your school's rules. *Money:* check the provider is licensed; promises of fixed or doubled returns are a red flag.
- Reviewers can add or remove a tag for a single goal later; the keyword rule is a first pass and over-tags some goals (for example "licensed" matches the legal and fees rules).

## 6. Entry paths and natural-language search (D-088)

**Seven ways in, one place they end:**

| Path | What the person does | Ends at |
|---|---|---|
| I want to… | Types an outcome | Kit, then goals, then tools |
| Who are you? | Picks a role (2,603 identities) | Needs, goals; "Suggested for you" shows three kits |
| Skills | Picks a skill (63) | Goals that use it, and its roadmap |
| Common situations | Taps a card (the 29 kits) | Kit page |
| Compete, grow or scale | Picks an intent | Goals grouped by intent |
| Browse by need | Walks the 279 needs | Goals |
| Suggested for you | Does nothing | Rule-based suggestions (§7) |

**Natural-language search (FR-103).** The goal search strips lead-ins before matching ("I want to", "I need a", "how do I", "help me", "where can I", "looking for"), so "I want to get a remote job" and "remote job" behave the same. Kits are indexed beside goals, with their search phrases, and get a 1.3 boost, so the kit shows first. The market boost (1.25) still applies. The reference harness `goal-harness.mjs` runs **131 queries and all pass**. It includes "I want to get a remote job", "I want to edit a short video", "I want to teach kids programming", "I was scammed online", "3mtt" and "release my song".

**Connected pages (FR-105).** `goal-links.json` holds, for every goal, at least three related goals (shared tools, same need, same kit), the next step in each kit it belongs to, and its safety tags. The tool page lists the goals that use the tool. A goal page shows: the goal, tools with price chips, safety panel, related goals, "Next in this kit", and the helper that covers it when there is one.

## 7. Suggestions for people who do not search (D-089)

Rule-based, as D-080 requires. No machine learning. Four new rules, added to R1 to R8:

| Rule | Name | Fires when | Needs sign-in? |
|---|---|---|---|
| R9 | Next in your kit | A goal in a kit was opened (this session, or saved if signed in) | No; session only |
| R10 | Kits for people like you | The person picked an identity; shows the top three kits from `identity-kit-hints.json` | No; the identity is on-device |
| R11 | While you are here | On a tool page: the two goals that use it and any safety note | No; static |
| R12 | Check first | A goal or kit with a jobs, money or kids tag is opened | No; static |

- **Anonymous visitors store nothing new** (FR-106, amends FR-094 only by adding static, on-page suggestions). Signed-in people who opted in get R1 to R8 as before.
- Cap: five cards in total, two per kind, each with a visible "why", "Not for me" and "I already know this" (D-080 stays).
- **Honest limit:** with 29 kits, the identity hints are generic for many occupations (for example a bricklayer's labourer sees remote work, CV and video kits). They are a start, and the answer is more kits, not more clever rules.

## 8. Technology Education (D-090)

The owner's position: "We own Technology Education for real." The pack treats it as a pillar with a coverage floor.

- **Teach kids programming kit (nine goals):** pick a coding app for children; first coding for ages 5 to 8; blocks (Scratch and others); unplugged coding with no computer; game making; robotics and electronics; moving from blocks to real code such as Python; starting a club or class at a school or church; and choosing child-safe platforms and protecting children's data.
- **Tech enablement, not just information.** Coverage rule: the build fails if any of these has no goal or no kit: remote jobs, CV, portfolio, proofreading, freelancing, payments from abroad, learning to code, teaching kids to code. `validate_discovery.py` checks that each of these has at least one goal and that the six named kits exist.
- **Learn and break in:** *Learn to code from zero*, *Break into tech* (3MTT, hackathons, mentors, internships), *Learn and use AI well*.
- **Children and data (FR-108).** Digital Advantage accounts are for adults (Recommended default; counsel to confirm). Kids' resources are written for teachers and parents. The kids safety panel links to a safeguarding note on children's data under NDPA 2023 and tells readers to check each platform's own privacy terms.

## 9. Data, files and rebuild

New or changed (all generated from plain text in `spec-assets/taxonomy/source/`, run by `rebuild_all.sh`):

| File | Source | Made by |
|---|---|---|
| `registry/tool-profiles.json` | `tool_profiles.txt`, `profile_verified.txt` | `build_profiles.py` |
| `taxonomy/goal-kits.json` | `goal_kits.txt` | `build_discovery.py` |
| `taxonomy/goal-links.json` | goals, kits | `build_discovery.py` |
| `taxonomy/goal-safety.json` | `goal_safety.txt` | `build_discovery.py` |
| `taxonomy/identity-kit-hints.json` | kits, resolved needs | `build_discovery.py` |
| `taxonomy/entry-paths.json` | built in | `build_discovery.py` |
| `generated/discovery-coverage.json` | | `build_discovery.py` |

Validators: `validate_profiles.py`, `validate_discovery.py`, and `validate_goals.py` (now with the same-kind gate). Counts: 1,050 goals under 279 needs; 1,781 tools; 29 kits; 98 Nigeria and 58 Africa local tools; 17,099 roadmap modules.

## 10. Honest limits

- **Profiles are drafts.** 1,776 of 1,781 are written from general knowledge; prices, free tiers and availability may be wrong, which is why the label exists. Only five were looked at on the web, and then for what the thing is, not what it costs.
- **Goal lists, kits and safety tags are AI-drafted** and keyword-derived. They need domain experts and a reviewer's pass, in this order: jobs, money, kids.
- **Nigerian tax rules** for freelancers and small companies changed recently; the tax kit points to the official portal and carries no figures. Treat anything here on tax as unconfirmed.
- **Closed or changed services** (for example Chimoney, Allawee, Showmax and Uber in Nigeria) are recorded in `tool_availability.txt` only where they are in the registry. Others may exist.
- **Eleven tools** are still unconfirmed placeholders (stagebiz, firstmobile, gtworld, access-more, apple-measure, beatmaker-3, saferkidsonline, ngcareers, jobgurus, healthconnect247, qservers). They show as such.
- The search harness is a reference, not the production index. The goal index is about 226 KB raw and must stay within the 60 KB gzip budget; measure it in the build.
- Still open from before: D-061 licences, D-019 name and domain, D-027 launch markets and legal text, counsel review of the NDPA consent (doc 12), Spike S-2 auth choice. The database SQL has never been run.

## 11. Order of work

1. Ship profiles and the Preview label on tool pages and cards (F-41). Everything else shows prices from them.
2. Ship kits (S49, S50) and the natural-language goal search (F-43, F-45).
3. Ship safety panels, related goals and next steps (F-44, F-46).
4. Ship R9 to R12 (F-47) before the signed-in rules, because they need no accounts.
5. Verify the profiles in the order in §2, starting with the tools in kits.
