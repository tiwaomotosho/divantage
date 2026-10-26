# 06 — Visual Design System

> **Superseded for visuals by V2.8.** Doc 28 (UI/UX brief), doc 29 (fidelity contract), `design/tokens/tokens.json` and `design/reference/screens/` now govern look and components. Fonts changed by D-091 (revertible). Keep this document for history and for sections not repeated in doc 28.

**Version:** 2.5 · **Source of truth:** `spec-assets/tokens/tokens.json`. `tokens.css` is generated from it and must not be edited by hand. Contrast for every intended pairing is verified in `spec-assets/tokens/contrast-report.md` (0 failures).

## 1. Art direction
"A vibrant learning adventure for real-world digital capability" (V1).

**The look.** Warm paper-like canvas, deep ink text, a saturated violet for action, teal for discovery, coral and amber for moments of achievement. Display type is expressive (Bricolage Grotesque, a grotesque with some personality) and is used only for big headings. Body and UI text use Atkinson Hyperlegible Next, which was designed for legibility; that choice is a signal that accessibility is part of the brand.

**Signature motif: "paths and nodes."** Thin hand-drawn-looking paths connect small circular nodes, suggesting a route from a goal to an outcome. It appears in:
- the home hero (decorative SVG);
- the How-it-works strip (four nodes);
- the playbook timeline rail.

It never sits behind body text.

**Not:** glassmorphism, gradients on text, stock photos, third-party logos, confetti bursts, dark-pattern urgency.

## 2. Colour
Semantic tokens: `--da-color-*`, with exact hex values in tokens.json.

| Token | Light | Dark | Use |
|---|---|---|---|
| ink | #16142B | #F4F1EA | Body text, headings |
| ink-muted | #55526B | #BDB9CC | Secondary text, captions |
| ink-subtle | #6A6780 | #A39FB5 | Metadata (dates, counts). Still ≥ 4.5:1 |
| canvas | #FBF8F3 | #110F1F | Page background |
| surface / surface-raised | #FFFFFF | #1B1930 / #25233D | Cards, panels / menus, drawers |
| surface-sunken | #F3EEE5 | #0C0B17 | Code blocks, inset areas, filter column |
| border / border-strong | #E3DCD0 / #8A8373 | #36334F / #7C7899 | Card edges / input borders (≥ 3:1, WCAG 1.4.11) |
| primary (+hover, pressed) | #4B2BD6 | #A797FF | Primary buttons, links, selected states |
| primary-soft / on-primary-soft | #EEEAFD / #3B1FB3 | #2D2660 / #D0C8FF | Selected chips, badges |
| secondary (+soft) | #0F766E | #4FD1C5 | Discovery accents, "can start free" badge |
| accent / accent-soft | #F2613F / #FFE9E2 | #FF8A6B / #3D2019 | Decorative highlights, success moments (never text on white) |
| highlight | #F5B83D | #F5C35A | Decorative only (motif nodes, underline swashes) |
| success / warning / error / info (+soft) | see tokens | see tokens | Status text and callouts |
| focus | #4B2BD6 | #C9BFFF | 3 px focus ring with 2 px offset |
| disabled-bg / disabled-fg | #ECE7DF / #8E8A99 | #24223A / #7F7B95 | Disabled controls (exempt from contrast, but kept legible) |
| overlay | rgba(22,20,43,.56) | rgba(5,4,12,.72) | Scrim behind drawers and dialogs |

**Category hues.** Eight pairs, `--da-hue-{violet|teal|coral|amber|blue|green|pink|slate}-{bg|fg}`. Categories are assigned hues in `categories.json`. A tile always carries its icon and its text label, so colour is never the only identifier.

**Rules:**
- Text only goes on canvas, surface, surface-raised, surface-sunken or a `*-soft` background.
- Saturated colours are never used behind paragraphs.
- Pricing badges use neutral styling (border-strong outline, ink text). The one exception is `starts_without_paying`, which uses secondary-soft with a ✓ icon and the text label, so it is not colour-only.

## 3. Typography
| Token | Size (mobile → desktop) | Line height | Tracking | Family / weight | Use |
|---|---|---|---|---|---|
| display | 36 → 64 px (`clamp`) | 1.04 | −0.02em | Display 750 | Home H1 only |
| h1 | 30 → 44 px | 1.10 | −0.015em | Display 700 | Page titles |
| h2 | 24 → 32 px | 1.18 | −0.01em | Display 700 | Section titles |
| h3 | 20 → 24 px | 1.25 | 0 | Text 700 | Card titles, step titles |
| h4 | 18 px | 1.30 | 0 | Text 700 | Sub-sections |
| body-lg | 19 px | 1.60 | 0 | Text 400 | Lead paragraphs, hero copy |
| body | 17 px | 1.60 | 0 | Text 400 | Default body |
| small | 15 px | 1.50 | 0 | Text 400 | Metadata, captions (minimum size for any text) |
| label | 14 px | 1.30 | 0.01em | Text 600 | Badges, chip labels, form labels. Sentence case, never all caps |
| code | 15 px | 1.50 | 0 | Mono 400 | Code, references |

Further rules:
- Reading width is capped at `68ch` for body copy.
- Links are underlined (1px, offset 3px, 2px on hover), coloured `link`, with `link-visited` for visited links.
- Long titles wrap with `text-wrap: balance` on headings and `overflow-wrap: anywhere` for long product names. Card titles clamp at 2 lines.
- Fonts are self-hosted WOFF2 variable fonts. The text face is preloaded; the display face uses `font-display: swap` with a metrics-adjusted fallback (`size-adjust`) to limit layout shift.

## 4. Layout, spacing, shape
- **Spacing scale (px):** 0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96 (`--da-space-{0..24}`). No arbitrary values.
- **Containers:** content max 1200 px; wide max 1440 px (home hero band); reading max 68ch.
- **Gutters:** 16 px (< 768), 24 px (768–1279), 32 px (≥ 1280). Respect `env(safe-area-inset-*)`.
- **Section spacing:** `clamp(48px, 6vw, 96px)`. Grid gap: 16 px, or 24 px at ≥ 1024.
- **Grids:**
  - Cards use `repeat(auto-fill, minmax(260px, 1fr))`, capped at the column counts in §5.
  - Detail pages use a reading column plus a 300 px rail at ≥ 1024.
- **Radius:** xs 4 (badges inside inputs) · sm 8 (inputs, chips) · md 12 (buttons) · lg 16 (cards) · xl 24 (hero panels, drawers' top corners on mobile) · pill (chips, badges).
- **Elevation:**
  - shadow-1: cards at rest.
  - shadow-2: hover/raised cards, menus.
  - shadow-3: drawers and dialogs.
  - In dark mode, elevation also lightens the surface (surface → surface-raised).
- **Borders:** hairline 1 px for card edges; strong 2 px for selected states; focus ring 3 px + 2 px offset, drawn with `outline` so it isn't clipped.
- **Icons:** Lucide (ISC licence), stroke 1.75. Sizes 16/20/24/32; category tile icons 32 on a 48 px tile.
- **Aspect ratios:** card media 16:9 (not used in R1), illustrations 4:3, OG images 1200×630.
- **Z-index:** base 0 · raised 10 · sticky 100 · dropdown 200 · drawer 300 · overlay 390 · dialog 400 · toast 500 · skip-link 600.
- **Touch:** minimum target 44×44 CSS px. Default control height 48 px; compact 40 px, which is allowed only at ≥ 1024 with a pointer.

## 5. Responsive behaviour matrix
Breakpoints (min-width): **sm 480 · md 768 · lg 1024 · xl 1280** (D-022). Design and test at 320, 360, 390, 430, 768 (portrait tablet), 1024 (landscape tablet), 1280, 1440 and 1920, plus 200% and 400% zoom (400% at 1280 is equivalent to 320 CSS px reflow).

| Aspect | < 480 | 480–767 | 768–1023 | 1024–1279 | ≥ 1280 |
|---|---|---|---|---|---|
| Header | 56 px; wordmark, search icon, menu | same | 64 px; + theme toggle | full nav + inline search | same, wider search |
| Navigation | Right drawer | Right drawer | Right drawer | Inline + Discover mega-panel | same |
| Gutter | 16 | 16 | 24 | 24 | 32 |
| Card grid | 1 col | 1–2 col | 2 col | 3 col | 3–4 col |
| Category tiles | 2 col | 3 col | 4 col | 4–6 col | 6 col |
| Audience cards | 2 col | 2 col | 3 col | 6 col | 6 col |
| Search filters | Bottom-sheet drawer | Bottom sheet | Side drawer | Left column 280 px | same |
| Detail rail | Inline after header | Inline | Inline | Sticky right rail 300 px | same |
| Comparison | Stacked cards + tool switcher | same | Table, sticky first column | Table | Table |
| Dialog/drawer | Full width, 90vh max | same | 420 px side | 420 px side | same |
| Footer | Accordions | Accordions | 2×2 grid | 4 columns | 4 columns |
| Type | clamp minimums | interpolating | interpolating | interpolating | clamp maximums |
| Interaction | Touch-first; no hover dependency | same | Hybrid | Pointer hover lift enabled via `@media (hover:hover)` | same |

No horizontal page overflow at any width ≥ 320 px. This is tested in CI (TC-040).

## 6. Component catalogue
Each component lists its anatomy, variants, content limits, states, accessibility, motion, and do/don't. The state coverage matrix is in `04` §5.

**Header.** Skip link, wordmark, nav, search, theme toggle, menu button. Variants: default, compact on scroll (shadow-1 appears after 8 px scroll; height unchanged to avoid shift). A11y: `<header>`, `<nav aria-label="Main">`. Don't hide search on mobile home.

**MenuDrawer.** Scrim, panel, close button, nav list, theme radio group. Opens on Menu click. Focus goes to the close button and is trapped; Esc and scrim click close it, and focus returns to Menu. Motion: slide-in from right, duration-base, ease-enter; out at duration-fast, ease-exit. Reduced motion: no slide.

**SearchField.** Variants: hero (control height 56, body-lg text, primary-coloured search button with label "Search"), header (48), compact (40). Anatomy: visible label (the hero label is the prompt "What would you like to achieve?"), input `type="search"`, clear button (× "Clear search", shown only when there is a value), submit button. ARIA combobox + listbox for suggestions. Max 120 characters.

**SuggestionPanel.** Up to 6 options, grouped with group labels (How-tos, Tools, Playbooks, Categories). Each option shows a type icon, title and short summary. Highlight with primary-soft. Motion: fade + translateY(4px → 0), duration-fast. Reduced motion: instant.

**Button.**
- Variants: primary (primary bg, on-primary text), secondary (surface bg, border-strong 1 px, ink), tertiary/link, danger (not used in R1).
- Sizes: 48 / 40 height, radius md, label text style, sentence case.
- States: hover darkens (primary-hover); pressed scale-press 0.98 + primary-pressed; disabled uses the disabled tokens with `aria-disabled`; loading shows an 18 px spinner left of the text, the text changes ("Sending…"), and the width is locked.
- External variant: trailing external icon + visually hidden " (official site)".
- Don't: two primary buttons in one view.

**IconButton.** 44×44, ghost style. A tooltip on hover/focus repeats the accessible name. Requires `aria-label`.

**ExampleChip / FilterChip / IntentChip.**
- Pill shape, height 40 (44 touch area via padding), label text style.
- ExampleChip: surface + border.
- FilterChip (applied): primary-soft background with an × icon; name "Remove filter: {value}".
- IntentChip: dashed secondary border with a "+" icon ("Only show options you can start without paying").
- Max label 40 characters.

**AudienceCard.** Icon (32), label (h4), one-line helper ("Study smarter, research and present"). Radius lg, shadow-1. Whole card is a link.

**CategoryTile.** A 48 px hue tile with the icon, label (h4, 2 lines max) and a record count in small text ("12 tools and how-tos"). Hover: lift −2 px + shadow-2.

**ContentCard.** Variants: task, tool, playbook, resource, comparison, result.
- Anatomy: type label (label style, ink-muted, with type icon) · title (h3, 2 lines) · summary (3 lines) · meta row (badges: pricing for tools, level, estimate for tasks/playbooks, publisher for resources) · "Reviewed {Mon YYYY}".
- Tool cards show a monogram tile (first letter of the name, display face, 40 px, category hue).
- One link per card (on the title), stretched over the card via `::after`. Secondary links inside cards are not allowed.
- Loading: a skeleton with the same dimensions.

**PricingBadge.**
- Label from vocabularies (e.g. "Free tier + paid plans"), always paired with "checked {d Mon YYYY}" on detail pages.
- An info icon links to S17#pricing-labels.
- `unknown`: dashed border, label "Price not confirmed".
- Never coloured green for "free" alone; the starts_without_paying ✓ treatment is the only highlight.

**PlatformList.** Inline list of platform labels with icons. When unverified: "Platform not confirmed" in ink-subtle with a dashed underline linking to S17#platforms.

**AvailabilityNotice / ArchiveNotice.** A callout with the info or warning tone and the text from `availability_status.public_notice`. Placed above the fold.

**MetaRow, Badge.** Small text with 16 px icons separated by middots. Badges are pill-shaped, label style, on surface-sunken.

**Stepper.**
- Variants: simple (tasks) and timeline (playbooks).
- Number token: a 32 px circle with a primary border and ink number. The completed visual (filled) is used only by the checklist, not by scrolling.
- Timeline rail: a 2 px line in border colour; the motif node is highlighted for the current step.
- Semantics: `<ol>`.

**Callout.** Tones: info, warning, success, error. Anatomy: an icon, a bold title (optional) and text, on a soft background with a 4 px left border in the tone colour. Warnings use `<aside aria-label="Warning">`.

**Checklist.** Native checkboxes (20 px visual, 44 px target) with labels. Completion message in a success Callout (`role="status"`).

**Accordion.** A button with a chevron (rotates 180°, duration-base); the panel uses `hidden` until open. Multiple panels may be open at once.

**Tabs.** Underline style with a 3 px primary indicator. Manual activation. The tab list scrolls horizontally inside its own container on narrow screens.

**FilterGroup / FilterDrawer.**
- Fieldset + legend; checkbox list. Each option shows a count, e.g. "Android (4)".
- Groups longer than 6 options show the first 6 plus "Show {n} more".
- Drawer footer: sticky "Show {n} results" (primary) and "Clear all" (tertiary).

**ComparisonTable.** Specified in 04 S14. Cell kinds:
- fact: plain text;
- editorial: "Our view" mini-badge;
- unknown: ink-subtle text, dashed outline, "Not yet verified".

The sticky first column has a shadow edge while scrolled.

**SourcedList & source superscripts.** Superscript numerals [1] link to the Sources list anchors. The list shows title, publisher (small) and "checked {date}", with an external icon.

**TrustFooter.** On surface-sunken, radius lg. Contains Sources (an accordion, closed by default on mobile, open on desktop), "Last reviewed" and "Report an issue". The overdue notice uses the warning tone.

**Breadcrumb.** `<nav aria-label="Breadcrumb">` + `<ol>`; the current page has `aria-current="page"`. On mobile the middle items collapse to "…".

**Toast.** Bottom-centre on mobile, bottom-right on desktop. Auto-dismisses after 4 s, but pauses on hover or focus. `role="status"`. Max 1 visible. Motion: fade + 8 px rise.

**Form controls.**
- Label above the input; hint text in ink-muted below the label.
- Error text in error colour with an icon, below the input, linked via `aria-describedby`; the input gets `aria-invalid` and a 2 px error border.
- Inputs are 48 px high, radius sm, with a border-strong border.
- The textarea grows to 8 lines, then scrolls.
- Required fields are marked "(required)" in text, not with an asterisk alone.

**ErrorSummary.** An error callout at the top of the form, titled "There's a problem", listing anchor links to each field. It receives focus on a failed submit.

**EmptyState / ErrorPanel.** A small motif illustration (aria-hidden), an h2 message, one supporting sentence, a primary action and optionally a secondary one.

**Skeleton.** surface-sunken blocks matching the final layout. A shimmer animation runs at 1.2 s linear only when motion is allowed; under reduced motion the blocks are static. Appears after 300 ms; shows for at least 300 ms once it appears, to avoid flicker.

**Footer.** See 03 §2.4.

**ThemeToggle.** An icon button that opens a menu with radio items (System, Light, Dark). The icon reflects the current setting.

**ShareButton.** Secondary button with a "Share" label and icon.

**Monogram tile.** 40/56 px square, radius md, category hue bg/fg, first letter of the name in the display face. `aria-hidden` (the name is adjacent).

## 7. Motion specification
Tokens: durations instant 0 / fast 120 / base 180 / slow 240 / layout 320 ms. Easings:
- standard `cubic-bezier(.2,0,0,1)`;
- enter `(0,0,0,1)`;
- exit `(.4,0,1,1)`;
- emphasized `(.3,0,0,1.15)` (slight overshoot, used only for success moments).

| Interaction | Trigger | Property | Duration / easing | Distance / scale | Delay | Interruption | Reduced motion |
|---|---|---|---|---|---|---|---|
| Card hover lift | pointer hover | transform, shadow | fast / standard | −2 px | 0 | Reverses from the current value | No lift; shadow change only |
| Card / button press | pointerdown | transform | fast / standard | scale .98 | 0 | Release restores | Colour change only |
| Suggestions open | ≥ 2 chars + results | opacity, transform | fast / enter | 4 px up | 0 | New input re-renders without re-animating | Instant |
| Suggestions close | Esc / blur / select | opacity | fast / exit | — | 0 | — | Instant |
| Drawer open | Menu / Filters | transform, scrim opacity | base / enter | 100% → 0 | 0 | A close mid-open reverses | Instant |
| Drawer close | Esc, scrim, close | transform | fast / exit | 0 → 100% | 0 | — | Instant |
| Accordion | toggle | grid-template-rows 0fr→1fr, chevron rotate | base / standard | — | 0 | Reverses | Instant |
| Filter chip add | filter applied | opacity, scale | fast / emphasized | .96 → 1 | 0 | — | Instant |
| Results update | filter/query change | none | — | — | — | — | — |
| Toast | show/hide | opacity, transform | base / enter; fast / exit | 8 px | 0 | A new toast replaces the old | Fade only |
| Skeleton → content | data ready | opacity | fast / standard | — | 0 | — | Instant swap |
| Checklist complete | last item ticked | opacity, transform on message; node pulse on rail | slow / emphasized | 4 px; scale 1.04 once | 0 | — | Message appears instantly; no pulse |
| Home motif draw | page load | stroke-dashoffset | 640 ms / standard | — | 120 ms | Not replayed | Final state, no draw |
| Grid entrance (lists only on first render) | load | opacity | fast | — | stagger 30 ms, max 150 ms | — | None |
| Playbook rail progress | scroll | transform scaleY | linear, scroll-linked | — | — | — | Hidden |

**Prohibited:**
- infinite animations (except the skeleton shimmer while loading);
- parallax;
- autoplaying media;
- confetti;
- page transitions that delay content;
- animating layout properties (width, height, top) other than the accordion's grid technique.

The implementation uses CSS transitions only. No animation library ships in R1.

## 8. Dark theme
- **Default:** follow system (`prefers-color-scheme`).
- **Manual override:** `data-theme` on `<html>`, persisted in `localStorage['da-theme']` and wrapped in try/catch.
- **No flash:** an inline, CSP-hashed `<head>` script sets `data-theme` before CSS paints. Signed-in behaviour does not apply (no accounts).
- **Design:** dark mode is designed, not inverted:
  - surfaces lighten with elevation;
  - primary is lifted to #A797FF so it reaches ≥ 4.5:1;
  - shadows are deeper;
  - category hues have dedicated dark pairs.
- **Images and illustrations:** SVG illustrations use `currentColor` and token variables so they re-theme. Raster images (none in R1) would get `filter: brightness(.9)` in dark mode.
- **Verification:** contrast is checked separately per theme (contrast report).

## 9. Illustration and iconography
- **Motif illustrations:** inline SVG, 1.75 px strokes in ink-muted, nodes in highlight/accent/secondary. Max 3 colours per illustration.
- **Empty-state and error illustrations:** 120 px, from the same family.
- **Licensing:** all illustrations are original and created for the project (CC BY 4.0). Icons are Lucide (ISC). No third-party logos (D-037).

## 10. Design handoff checklist (V1 §11, kept)
Every new screen or component PR must include:
- states for mobile, tablet and desktop;
- the tokens used (no raw values; a lint rule blocks hex and px values outside tokens.css);
- the component states from 04 §5;
- empty, loading and error states;
- keyboard and focus order;
- motion and reduced-motion behaviour;
- real content examples (from the pilot catalogue);
- accessibility notes;
- asset rights.

## 11. V2.1 components (identity-first)
**IdentityPicker** (multi-select combobox):
- Input 56 px high, with the visible label "Who are you?" in h2 style.
- Suggestion rows: identity label (body, 600 weight), then family › sector (small, ink-muted), with "Specialism of {parent}" when relevant.
- Max 8 rows.
- Selected chips sit above the input: primary-soft background, × button 44 px target.
- Dark mode uses surface-raised for the panel.
- Example chips sit below the input in the ExampleChip style with a leading person icon.

**NeedChip:** pill with the task-family icon + need label (max 48 characters, truncated with a full accessible name). Selected state = secondary-soft + ✓.

**NeedCard:** surface card, radius lg. Header: need label (h3) + task-family icon tile (category hue). Body: up to 4 ToolRows (monogram 32 px, name, a pricing badge or "Profile coming soon" in ink-subtle). Footer: lens link (primary link style).

**IdentityChip:** small pill linking to an identity, with a sector hue dot **plus** text (never colour alone).

**WhoUsesCluster:** sector accordion (heading with count) → wrap of IdentityChips.

**SurprisingUseCard:** 3-up cards. Large display-face quote of the use ("Pastors use Canva for worship media"), then sector label and lens link. The motif node graphic sits in the corner (decorative).

**LevelTabs / LevelColumns:**
- Three levels: Beginner (teal), Intermediate (violet), Expert (coral) hues, **each with its text label and an icon** (seedling / stairs / summit).
- Desktop: 3 columns. Mobile: tabs.
- Module count and estimated hours in the header ("6 modules · about 14 h").

**ModuleCard:**
- title (h4);
- outcome sentence ("You can…");
- topics as a comma list (small);
- practice task in a sunken box with a pencil icon;
- an estimate badge ("≈ 2 h");
- an "I can do this" checkbox (44 px target);
- a "Specific to {need}" badge for extra modules (accent-soft).

Completed state: border-strong becomes the success colour with a ✓ icon and the text "Done" (not colour alone).

**LensHeader:** H1, a "Written for" chip row, and a "Not the generic course" callout (info tone) containing *what is different*.

**ToolkitCard (print):**
- A4/Letter, single page, black-on-white print stylesheet.
- Header: "Digital toolkit for {plural}" + site URL + QR code (generated at build as SVG).
- 6 rows: need → starter tool → first module.
- Footer: "Free at digitaladvantage.example".

**HelpingModeSwitch:** a native checkbox styled as a switch, label "I'm helping someone else", with a hint line.

**Motion:**
- Chip add: scale .96→1 (fast).
- Level tab switch: none (instant).
- Module tick: checkmark draws in 180 ms; none under reduced motion.

## 12. V2.5 — Very visual, sleek and responsive (D-070)
The owner asked for "a very visual appealing and sleek responsive web app". This section turns that into rules. The V2 colour tokens and typefaces stay (D-020, D-021, contrast-checked, 0 failures). A change to them needs a designer's sign-off and a re-run of the contrast report.

### 12.1 Principles
1. **One memorable thing per screen, everything else quiet.** Home: the question. Helper page: the route rail. Tool page: the learning path.
2. **Mobile first, thumb first.** Primary navigation is a bottom tab bar on phones; secondary actions live in sheets; every target is 44 px or larger.
3. **Big, confident type.** The display face (Bricolage Grotesque, D-020) carries personality: H1 at `clamp(2.4rem, 7.5vw, 4.75rem)`, heavy weight, tight tracking, left aligned. Body text stays in the readable text face with lines under 70 characters.
4. **Tactile controls.** Pill-shaped buttons and search field with a 2 px ink outline and a hard 3–5 px offset shadow, so primary actions look pressable. Feature blocks use large radii (24–28 px); small chips use full pills.
5. **Colour by meaning.** Ink on paper for reading; the `highlight` token for the single primary call to action on a screen; soft tokens for helper tints. No gradient washes as decoration.
6. **Motion that answers the person, plus one exception.** Sheets, progress and presses animate in response to actions. The only motion that runs by itself is the identity ribbon on the home page (below). Reduced motion turns all of it off.
7. **Dark theme is first class**, not an inversion (§8).
8. **Visual richness must fit the budget** (14 §3): SVG and CSS only in R1, no photographs.

### 12.2 Helper tints
Each listed helper takes one soft token by its position in the `listed` array: `highlight`, `secondary-soft`, `accent-soft`, `primary-soft`, then repeat. Text on every tint is `ink`. Measured contrast of ink (#16142B) on the light-theme tints: highlight 10.1, secondary-soft 15.9, accent-soft 15.4, primary-soft 15.3 (all above 4.5). Check the dark-theme pairs with the contrast script before build (TC-131).

### 12.3 New components
| Component | Purpose and rules |
|---|---|
| **IdentityRibbon** | Two interleaved rows of 40–60 recognisable identities (from `config/home-featured.json`), each a link, drifting slowly in opposite directions. Pauses on hover and focus. Duplicates for the loop are `aria-hidden` and not focusable. Under reduced motion it becomes a static, wrapped list. Edges fade. Decorative layer only: the picker is the way in. |
| **HelperCard** | A large tinted block (not a grey card): title in the display face, one-line promise, "{stages} stages · {tools} tools", a round arrow button. Hover lifts 4 px; no hover effect on touch. |
| **RouteRail** | The helper page spine: numbered round nodes joined by a dashed line, one node per stage. The number is information (a real sequence). A completed stage fills its node and shows a check. |
| **StepRow** | A tool, what to do, first win, badge ("Full guide" or "Guide in progress"). A row with a hairline border, not a card. |
| **DoneChecklist** | Native checkboxes in a soft secondary panel; ticked lines are struck through and muted. |
| **HelperPill** and **HelperSheet** | S41. The pill is a rounded bar with a progress ring; the sheet is a bottom sheet (phones) or popover (desktop). Rules in 04 §9. |
| **BottomTabBar** | Four tabs with icons and labels; the active tab's icon sits on a `highlight` disc. Hidden from 720 px. Respects the device's bottom safe area. |
| **ProgressBar** | 10 px track and fill, labelled, sticky under the header on S40. |

### 12.4 Responsive checks
Test at 320, 390, 768 and 1280 px in both themes, with 400% zoom. No horizontal scroll. The pill and tab bar never cover content (the page reserves their height). TC-131 captures screenshots of the home hero, the helper rail and the tab bar.
