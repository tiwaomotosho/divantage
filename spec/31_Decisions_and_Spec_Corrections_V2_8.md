# 31 — V2.8 decisions, requirements, tests and spec corrections

Append the tables in §2–§5 to doc 02 (decisions), doc 01 (requirements), `spec-assets/qa/acceptance-matrix.csv` (tests), `spec-assets/analytics/events.json` and `spec-assets/config/feature-flags.json`. Machine-readable copies are in `qa/`.

## 1. Precedence (D-105, proposed; owner to confirm)
Where documents conflict, this order applies, highest first:
1. Doc 31 (this document) and decisions D-091 to D-106
2. Docs 28 and 29 (design) and the `design/` folder (see doc 29 §2 for its internal order)
3. Doc 26 and decisions D-084 to D-090 (V2.7)
4. Doc 24 and decisions D-071 to D-083 (V2.6)
5. Docs 18–25
6. Docs 01–17
7. Doc 00 and the V1 reference

This resolves checklist items 2.1–2.4: in doc 17, the bans on accounts and recommendations, "skip Milestone F" and "Cloudflare Pages" are **overridden** for Launch-stage features behind the `accounts` flag. **Beta stays static and needs no account.**

## 2. Decisions
| ID | Decision | Why (evidence) | Status |
|---|---|---|---|
| D-091 | Fonts: **Schibsted Grotesk** (display), **Inter** (text), **IBM Plex Mono** (mono), self-hosted variable WOFF2, Latin and Latin Extended. Replaces D-020's Bricolage Grotesque, Atkinson Hyperlegible Next and JetBrains Mono. | The approved concept uses these fonts; they ship inside the patch, so the build can't silently fall back. Inter's legibility at 14–16px is comparable for UI use. To revert, change `tokens.json` → `font` and replace `design/fonts`; the reference screens will re-render. | Accepted (owner can revert) |
| D-092 | **No dead ends:** every identity, goal, tool, learning path, kit and helper page ends with one `NextStepCard`. Every tool row and tool page has a "Learn {tool}" button. | 7/17 neutral on "I know my next step"; 2/17 stuck opening a path | Accepted |
| D-093 | **Visible trust:** every tool mention shows a TrustLine (price + "Checked {date}" or "Preview"). Home has a trust strip; How we review explains the labels. | 6/17 neutral on trust | Accepted |
| D-094 | **Honest depth:** every learning path shows a DepthLabel: "For {job}" (role lens or handwritten role path), "In depth" (handwritten tool path) or "General guide" (archetype or archetype+signature). Job-specific paths are listed first. General guides show the depth explainer with job chips and "Ask for my job". | 8/17 neutral on "written for me"; 1,058 archetype-only paths (checklist 5) | Accepted |
| D-095 | **Calm visual system:** ≤ 3 category hues per viewport; ≤ 1 filled primary button in the first view; ≤ 6 cards before "See all"; category hues only in tiles and tags; accent only for beta and achievements; **the infinite IdentityRibbon animation is removed** (replaced by the static mosaic). | "Loud colours, too much information"; checklist 11.1 | Accepted |
| D-096 | `assets/maps/taxonomy-visuals.json` is the only source of icon and hue for sectors, skill groups, kits, intents, tool categories and safety tags. | Consistency; no ad-hoc colour | Accepted |
| D-097 | Closed photo set: only `assets/photos/manifest.json`, rendered with `<Picture>`. Tier B photos (cropped from one collage) are allowed in beta and must be replaced before public launch. | Fidelity; performance | Accepted |
| D-098 | Tool logos are monograms by default. Real brand marks only with written permission or a published brand licence, recorded in `assets/tool-logos/overrides/LICENCES.md`. | Legal; consistency | Accepted |
| D-099 | **Design fidelity contract** (doc 29): token generation, shared stylesheet, closed assets, static lint, runtime audit, owner sign-off and visual regression are release gates. | Concept must survive the build | Accepted |
| D-100 | **Helper explained:** helper pages open with a one-line "What is a helper?" banner; the helper bar shows a first-run coach mark ("Got it" / "Hide helper"), stored per device; the bar can be hidden and restored from the helper page. | 4/17 didn't get the helper bar; 3/17 struggled on Task 3 | Accepted |
| D-101 | **Phone shell safety:** no horizontal overflow at 360–430px; `main` reserves tab bar + helper bar + safe-area space; fixed bars never cover content; every visible control has a handler (no dead buttons). | iPhone "text cut off" and "button did nothing" | Accepted |
| D-102 | **Need feedback:** "Right for your work?" 👍/👎 on need cards. Anonymous, no account; 👎 hides the need for the session; counts feed curation of identity→need maps. | 8/17 said needs only partly match | Accepted |
| D-103 | **Suggest my role** card on Browse and on identity no-match, using the existing suggestion pipeline (S36). | "More occupations should be listed" | Accepted |
| D-104 | **One promise:** "Find the tools people in your job use. Learn them step by step." Used as the home H1, meta description lead and OG default. Replaces "Make technology your advantage." as the H1 (it stays as the brand line in the footer and OG). | Inconsistent descriptions of what the site is | Accepted |
| D-105 | Precedence order in §1 | Checklist 2.1–2.4 | **Proposed** |
| D-106 | UI copy says "learning path" (not "roadmap") and "Tools for {job}" (not "Your toolkit as a {job}"). Code and URLs keep `roadmap`. | Clarity | Accepted |

## 3. Requirements (append to doc 01)
| ID | Requirement | Decision | Release |
|---|---|---|---|
| FR-109 | Identity, goal, tool, learning path, kit and helper pages render exactly one `NextStepCard` as the last content block, with a working target. | D-092 | Beta |
| FR-110 | Every tool row and tool page shows "Learn {tool}" linking to the best path for the visitor's role, else the general guide. | D-092 | Beta |
| FR-111 | Every tool mention renders a TrustLine; a price chip never appears without a verification chip. | D-093 | Beta |
| FR-112 | Every learning path card and page shows a DepthLabel computed from `authoring` and lens/role data (§4). | D-094 | Beta |
| FR-113 | General guides render the depth explainer with up to 3 job chips and "Ask for my job" (creates a suggestion of type `role_path_request`). | D-094 | Beta |
| FR-114 | Need cards collect 👍/👎 feedback anonymously (`need_feedback` event); 👎 hides the card for the session with Undo. | D-102 | Beta |
| FR-115 | Helper bar: first-run coach mark, hide/restore, never overlaps content; helper pages show the explainer banner. | D-100 | Beta |
| FR-116 | No horizontal overflow at 360, 375, 390, 414 and 430px on any route; fixed elements reserve space. | D-101 | Beta |
| FR-117 | Browse and identity no-match show "Suggest my role". | D-103 | Beta |
| FR-118 | Home H1, meta description and default OG use the D-104 promise. | D-104 | Beta |
| FR-119 | The app passes `check-design` (0 errors) and `design-audit` (0 failures) on all mapped routes before any release. | D-099 | Beta |

## 4. DepthLabel computation (FR-112)
| Condition (first match wins) | Label | Token class |
|---|---|---|
| A flagship or role lens exists for (tool, one of the visitor's identities or needs) | For {job} | `depth-role` |
| Roadmap `authoring` is missing or `handwritten` | In depth | `depth-deep` |
| `authoring` is `archetype+signature` or `archetype` | General guide | `depth-general` |

## 5. Tests (append to acceptance matrix; CSV in `qa/acceptance-matrix-v2_8.csv`)
TC-169 to TC-188. See the CSV for the method, expected result and gate.

## 6. Analytics events and flags
- **New events** (no personal data; same rules as doc 14): `next_step_click {page_type, target_type}`, `learn_tool_click {tool, depth}`, `need_feedback {identity, need, value}`, `helper_coach_dismiss {helper, action}`, `helper_hide {helper}`, `role_path_request {tool}`, `role_suggest_open {source}`.
- **New flags** (all ON in beta, review by 2027-01-31): `next_step_card`, `need_feedback`, `helper_coachmark`, `depth_labels`, `trust_line`.

## 7. Spec corrections bundled with V2.8 (from the verification checklist)
| Checklist item | Correction in V2.8 |
|---|---|
| 2.1–2.4 precedence and doc 17 conflicts | §1 (D-105, proposed) |
| 5.2, 5.3, 5.7 template roadmaps shown as if specific | D-094 labels them "General guide" in the UI. **Content gap remains:** writing role paths is still needed (doc 28 §1 P1) |
| 11.1 infinite IdentityRibbon motion | Removed (D-095) |
| 11.2 docs 05, 06 and 13 missing V2.6/V2.7 components | Superseded for visuals by doc 28 and `design/`; journeys still to be added to doc 05 |
| Pilot iPhone bugs | D-101, FR-116, TC-176/177 |

Everything else on the checklist remains open; see `Digital_Advantage_V2_8_Verification_Checklist.md`.
