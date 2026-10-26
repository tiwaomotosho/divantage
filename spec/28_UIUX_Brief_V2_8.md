# 28 — UI/UX Brief V2.8 (upgraded after pilot round 1)

**Supersedes for visual and interaction design:** doc 06 (Visual Design System), doc 04 §§ on layout and components, doc 13 where it conflicts, and the concept board v1. Content rules in doc 07 still apply.
**Reference implementation:** `design/reference/screens/*.html` (27 responsive screens) with golden screenshots in `design/reference/png/`. **If this text and a reference screen disagree, the reference screen wins** (doc 29 §2).
**Evidence:** doc 27.

---

## 1. The product in one sentence
> **Find the tools people in your job use. Learn them step by step.**

This exact line is the home H1 (D-104). Every page answers one of three questions, in this order:
1. **What matters for me?** (identity → needs → goals)
2. **How do I learn it?** (tool → learning path)
3. **What do I do next?** (one `NextStepCard`)

If a page doesn't answer at least one of these, it doesn't ship.

## 2. Design principles (V2.8)
| # | Principle | What it means in practice | Pilot evidence |
|---|---|---|---|
| P1 | **For my job, first** | Job-specific content is shown before general content, everywhere. General content is labelled "General guide". | 8/17 neutral on "written for me" |
| P2 | **Always a next step** | Every content page ends with exactly one `NextStepCard`. No dead ends. | 7/17 neutral on "know my next step" |
| P3 | **Calm by default** | Warm canvas, one primary action per view, max 3 category hues per view, generous space, ≤ 6 cards before "See all". | "Loud colours, too much information" |
| P4 | **Honest, visibly** | Price + verification on every tool mention. Depth label on every path. Sources one tap away. | 6/17 neutral on trust |
| P5 | **Explain once, then get out of the way** | New patterns (helper bar, intent chips, kits) get one sentence of explanation the first time, then never again. | 4/17 didn't get the helper bar |
| P6 | **Phone first, nothing cut off** | Designed at 390 px first. No horizontal overflow. Fixed bars never cover content. | iPhone text cut off |
| P7 | **Inclusive** | WCAG 2.2 AA; 44 px targets for primary controls, 24 px minimum for all; plain English. | — |

## 3. Visual system (tokens are law)
All values live in `design/tokens/tokens.json` → generated `tokens.css`, `tailwind-theme.css`, `tokens.ts`. App code may not contain raw colours, font families or off-scale sizes (`tools/check-design.mjs` fails the build).

### 3.1 Colour
- **Canvas** `#FBF8F3` light / `#110F1F` dark. **Ink** `#16142B` / `#F4F1EA`.
- **Primary (violet)** `#4B2BD6` / `#A797FF`: the only colour for primary actions, links, focus and selection.
- **Secondary (teal)**: progress and "done" only.
- **Accent (coral)**: the beta badge and achievement moments only. Never decoration.
- **Category hues** (violet, teal, coral, amber, blue, green, pink, slate) appear **only** inside small tiles and tags, chosen from `assets/maps/taxonomy-visuals.json`. Never as large backgrounds, except the identity page header wash (sector hue at its soft value, fading to canvas).
- **Colour budget (D-095):** ≤ 3 distinct category hues visible in any viewport; ≤ 1 filled primary button in the first view (design-audit warns).
- Dark mode is a first-class theme: follows the system setting, toggle in the header, and stored per device.

### 3.2 Type
- **Display/headings:** Schibsted Grotesk 700 (self-hosted variable font, D-091).
- **Text/UI:** Inter (variable, self-hosted). **Mono:** IBM Plex Mono for references, counts and ranks.
- Scale from tokens: display, h1, h2 (fluid `clamp()`), h3 21px, h4 17px, body 16px, small 14px, xs 12.5px, label 11px caps +12% tracking.
- Body lines ≤ 68 characters. Minimum text 12.5px; labels 11px caps only.

### 3.3 Shape, space, elevation
- Radius: card 20 · input 16 · control/tile 12–14 · tag 7 · sheet 28 · pill 999.
- Spacing scale 4/8/12/16/20/24/32/40/48/64/80/96. Section gap 40 phone / 64 desktop.
- Elevation: light theme uses `shadow-1` on featured cards only; dark theme uses borders, no shadows.

### 3.4 Layout and breakpoints
| Range | Layout | Navigation |
|---|---|---|
| < 768 (phone) | 1 column (2 for compact tiles), 16px gutters | Top bar (logo, search, sign-in) + **bottom tab bar** (Home, Explore, Goals, Kits, Me) |
| 768–1023 (tablet) | 2–3 columns, 24px gutters | Top bar, no tab bar |
| ≥ 1024 (desktop) | 12-col, max 1240, content + 360px right rail | Top bar with nav + "I want to…" search (⌘K) |

### 3.5 Imagery and icons
- Photos only from `assets/photos/manifest.json` via `<Picture>` (AVIF/WebP/JPG, srcset, LQIP, focal point). Real people at work, warm light.
- Icons only from `assets/icons` (107 icons, 24px grid, 2px stroke). No icon libraries.
- Tool logos: monograms from `assets/tool-logos` unless a licensed override exists.
- Empty, error and success states use `assets/illustrations` (light and dark variants).

## 4. New and changed components (V2.8)
| Component | `data-da` | Rule | Decision |
|---|---|---|---|
| **NextStepCard** | `next-step` | Ink card, kicker "Your next step · …", one title, one sub-line, one button. Last block on identity, goal, tool, path, kit and helper pages. Exactly one per page. | D-092 |
| **Learn button** | `learn-tool` | "Learn {Tool}" with route icon on every tool row and tool page. Primary on the top pick, secondary elsewhere. Opens the job-specific path if one exists, else the general guide. | D-092 |
| **TrustLine** | `trust-line` (+`price`, `verified` / `preview-label`) | Price chip + either "✓ Checked {date}" (green) or "👁 Preview" (amber). On every tool row, tool card and tool page. Never one without the other. | D-093 |
| **DepthLabel** | `depth-label` | "For {your job}" (teal) · "In depth" (violet) · "General guide" (slate). On every path card, need card and tool row. | D-094 |
| **Depth explainer** | `depth-explainer` | On a general guide: one info banner + chips for job-specific paths + "Ask for my job". | D-094 |
| **Need feedback** | `need-feedback` | "Right for your work?" 👍/👎 on each need card; 👎 hides the need for this visit and logs `need_feedback`. | D-102 |
| **Helper bar** | `helper-bar` | Ink pill above the tab bar (phone) or floating bottom centre (≥768). Shows stage, progress, Next, Hide. `main` reserves its height. | D-100 |
| **Helper coach mark** | `helper-coachmark` | First time only: one sentence + "Got it" + "Hide helper". Stored per device. | D-100 |
| **Suggest my role** | — | Card on browse and no-match: "Can't find your job? Suggest my role." | D-103 |
| **Trust strip** | `trust-strip` | Home page, below "How it works": independence statement + "How we review →". | D-093 |

Existing components (header, tab bar, chips, tags, tiles, cards, inputs, switches, sheets, toasts, stepper, safety note, availability banner, kit ribbon) keep their V2.7 behaviour, restyled exactly as in `design/components/da.css`.

## 5. Screen-by-screen brief
Each line names the reference file. Build each screen to match its reference at 390, 834 and 1440 px, in light and dark.

| Ref | Screen | Must have (above the fold on phone in **bold**) | Pilot change |
|---|---|---|---|
| 01 | Home S01-R | **Promise H1**, **identity picker**, 6 example chips, **Show my tools**; desktop photo mosaic; 6 kits; How it works (3 steps); trust strip | New promise, fewer chips, trust strip, calmer |
| 02 | Home, roles picked | Role chips in picker (max 3, "2 of 3"), Step 2 need chips revealed | — |
| 03 | Search S51 | **Natural-language field**, type filters, market chip; kit best match first; "We understood"; safety note for job/money queries | — |
| 04 | Identity S27 | **Role header with photo, ISCO and review status**, tabs, feedback explainer, need cards with DepthLabel and 👍/👎, NextStepCard | Need feedback, depth labels, next step |
| 05 | Browse S33 | Filter, sector/A–Z/life roles, sector cards, **Suggest my role** | Suggest my role |
| 06 | Goals S42 | Search, Compete/Grow/Scale cards, grouped goals | — |
| 07 | Goal S43 | **Title, intent, market**, kit ribbon, **tool rows with TrustLine + Learn button + DepthLabel**, alternatives, safety note, NextStepCard | Learn button, trust line, next step |
| 08 | Goal, safety sheet | Bottom sheet on phone / dialog on desktop | — |
| 09 | Kits S49 | Two photo feature kits, 12 icon kits | Calmer grid |
| 10 | Kit S50 | Photo hero, **Continue at step N**, stepper with current step expanded, kids safety note, NextStepCard | Next step |
| 11 | Tool S09 | **Logo, name, TrustLine**, price and checks box with Preview explainer, **paths for your job first**, Learn button, who uses it, similar tools, Suggest an edit, NextStepCard | Trust box, job-first paths |
| 12 | Tool, availability | Error banner under the header (D-074) | — |
| 13 | Path, job-specific S30 | DepthLabel "Written for nurses", modules with outcome + practice + time, progress, NextStepCard | Job-specific content |
| 14 | Path, general S30 | DepthLabel "General guide" + depth explainer with job chips | Honest labelling |
| 15 | Helper S40 | Photo hero, **"What is a helper?" explainer**, stages, helper bar + first-run coach mark | Explainer, coach mark |
| 16 | Workbench S45 | Greeting, stats, Continue card, suggestions with "Why these?", skills, starred | — |
| 17 | Sign-in S44 | Sheet/dialog over context: Google, email link, Not now, 18+ note | — |
| 18 | Consent S46 | Three switches, all off | — |
| 19 | Privacy S46 | Switches with dates, what we store, download, delete | — |
| 20 | Suggest edit S36 | Sheet with reason chips, text, link, email opt-in | — |
| 21 | Status + What's new S48/S37 | Timeline + public change log | — |
| 22 | Trending S47 | Market tabs, ranked list, deltas | — |
| 23 | How we review S17 | The three label meanings, 5-step pipeline, suggest-an-edit prompt | New: explains labels |
| 24–27 | 404, offline, error, no results | Illustration, title, one sentence, two actions | — |

## 6. Interaction and motion
- Durations from tokens: fast 120ms (chips, toggles), base 180ms (stars, ticks), slow 240ms (sheets), layout 320ms. `prefers-reduced-motion` sets all to 0.
- Sheets: bottom sheet below 768px, centred dialog above. Focus trapped, Esc closes, focus returns to the trigger.
- Skeletons only after 300ms. No infinite animations (the V2.5 IdentityRibbon drift is **removed**, D-095).
- Toasts confirm saves: "Starred. Saved on this device. Undo".

## 7. Copy rules added in V2.8
- Say "learning path", not "roadmap", in UI copy (users read "roadmap" as a project plan). Code may keep `roadmap`.
- Say "tools for nurses", not "your toolkit as a Nurse".
- Buttons start with a verb: "Learn Canva", "Show my tools", "Start module".
- No superlatives (doc 07 §4.7); check-design warns.

## 8. Accessibility (unchanged bar, new checks)
WCAG 2.2 AA. New automated checks in `tools/design-audit.mjs`: no horizontal overflow at 390px; every control ≥ 24×24 px; brand fonts loaded; required components present. Manual checks stay in doc 13.

## 9. Definition of done for any screen
1. Matches its reference screen at 390 / 834 / 1440 in light and dark (side-by-side in the audit report).
2. `node tools/check-design.mjs src` → 0 errors.
3. `node tools/design-audit.mjs --base <url> --only <screen>` → 0 failures.
4. Owner ticks "OK" in the audit report and records it in `design/SIGNOFF.md`.
