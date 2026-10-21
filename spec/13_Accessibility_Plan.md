# 13 — Accessibility Plan

**Version:** 2.1 · **Target:** WCAG 2.2 Level AA (V1 NFR-019), verified by automated and manual testing. A formal external audit is recommended before public launch, if capacity allows.

## 1. WCAG 2.2 AA mapping (key criteria → implementation → test)
| SC | Requirement | Implementation in this product | Test |
|---|---|---|---|
| 1.1.1 Non-text content | Text alternatives | Decorative motif SVGs `aria-hidden`; monogram tiles `aria-hidden` (name adjacent); icon buttons have `aria-label`; category icons decorative (label visible) | axe + manual |
| 1.3.1 Info & relationships | Semantics | Landmarks; headings in order; `<ol>` for steps; `<table>` with `<th scope>` for comparisons; fieldset/legend for filters; dt/dd for At a glance | axe + SR walkthrough |
| 1.3.2 Meaningful sequence | DOM order = visual order | No CSS reordering of content (grid `order` banned by lint) | Manual |
| 1.3.5 Identify input purpose | `autocomplete` | Email field `autocomplete="email"` | axe |
| 1.4.1 Use of colour | Not colour alone | Pricing/status badges have text; filter selection has a check icon; links underlined; unknown cells use text + dashed outline | Manual |
| 1.4.3 / 1.4.6 Contrast | ≥ 4.5:1 text | Tokens verified (contrast report, both themes); body ink ≥ 7:1 | Script + axe |
| 1.4.4 Resize text / 1.4.10 Reflow | 200% text; 320 px reflow | rem/clamp type; no fixed-height text containers; comparison stacks; tabs scroll in their own container | Playwright at 320 px; manual 400% zoom |
| 1.4.11 Non-text contrast | ≥ 3:1 UI | Input borders use border-strong; focus ring ≥ 3:1 | Script |
| 1.4.12 Text spacing | Survives spacing overrides | No clipped text; tested with a text-spacing bookmarklet | Manual |
| 1.4.13 Content on hover/focus | Dismissible, hoverable, persistent | Tooltips dismiss on Esc; suggestions stay while hovered | Manual |
| 2.1.1 / 2.1.2 Keyboard, no trap | All operable | Native elements; drawer traps focus *intentionally* with Esc to exit | Playwright keyboard tests |
| 2.4.1 Bypass blocks | Skip link | "Skip to main content", first focusable element | axe |
| 2.4.3 Focus order | Logical | DOM order; focus moves to the error summary, new results and S19's H1 | Manual |
| 2.4.4 Link purpose | Descriptive | Cards: link text = title; "Visit official site" + accessible name includes the tool name; no bare "click here" | axe + manual |
| 2.4.7 Focus visible / **2.4.11 Focus not obscured (min)** | Visible, not hidden by sticky UI | 3 px ring; `scroll-padding-top` = header height + 16 px so sticky header/sub-header never covers focused items | Playwright check of the focused element's bounding box vs header |
| 2.5.3 Label in name | Visible label inside accessible name | Buttons' `aria-label` starts with the visible text | axe |
| **2.5.7 Dragging movements** | No drag-only | No drag interactions | — |
| **2.5.8 Target size (min)** | ≥ 24×24 | We use ≥ 44×44 for primary targets; inline text links are exempt | Playwright measurement on key controls |
| 3.1.1 Language of page | `lang` | `<html lang="en-GB">` | axe |
| 3.2.1 / 3.2.2 On focus / input | No surprise context change | Filters update results but never navigate; example chips submit only on activation | Manual |
| **3.2.6 Consistent help** | Help in the same place | "Report an issue" and Contact in the footer on every page, same order | Manual |
| 3.3.1 / 3.3.3 Error identification & suggestion | Clear errors | Inline + summary; plain-language fixes | Playwright |
| **3.3.7 Redundant entry** | Don't ask twice | Report form prefills page/record from the referrer link | Manual |
| **3.3.8 Accessible authentication (min)** | No cognitive tests | Turnstile managed/invisible mode (no puzzles); email fallback if it fails | Manual |
| 4.1.2 Name, role, value | ARIA patterns | Combobox, tabs, disclosure, menu button, dialog patterns per WAI-ARIA APG | axe + SR |
| 4.1.3 Status messages | Live regions | Result counts, toasts, "Sending…", checklist success via `role="status"`/polite live regions | SR walkthrough |
| 2.3.3 (AAA, adopted) Animation from interactions | Reduced motion | `prefers-reduced-motion` tokens zero all motion | Playwright emulation |

## 2. Component accessibility requirements
Each component in 06 §6 states its semantics. These patterns are mandatory:
- **Search combobox:**
  - input `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`;
  - listbox options with `role="option"`;
  - group labels via `role="group"` + `aria-label`.
- **Menu drawer and filter drawer:** `role="dialog"`, `aria-modal="true"`, labelled by their heading; background `inert`.
- **Theme toggle:** a menu button opening a `role="menu"` with `menuitemradio`, `aria-checked`.
- **Accordion:** `<button aria-expanded aria-controls>`; the panel is a region only if there are 6 or fewer accordions on the page.
- **Tabs (search types):** tablist/tab/tabpanel, manual activation, arrow keys move.
- **Error summary:** `role="alert"` on first appearance, receiving focus.

## 3. Assistive-technology and browser test matrix
| Platform | Browser | Screen reader | Priority |
|---|---|---|---|
| Android 12+ (mid-range phone) | Chrome | TalkBack | P1 (primary audience is mobile-first) |
| iOS 17+ | Safari | VoiceOver | P1 |
| Windows 11 | Chrome or Edge | NVDA (current) | P1 |
| Windows 11 | Firefox | NVDA | P2 |
| macOS (current) | Safari | VoiceOver | P2 |
| Any | Chrome | Keyboard only, no SR | P1 |
| Any | Chrome | 200% and 400% zoom; Windows High Contrast / forced colours | P1 |

## 4. Automated tests (CI)
- `@axe-core/playwright` on every route template in both themes, at 360 px and 1280 px. **Any serious or critical violation fails the build.**
- Contrast script on tokens (it fails on any regression).
- Playwright keyboard journeys: TC-042 (search → filter → open result → official link) and TC-036 (report form errors).
- Reduced-motion emulation test: no element has a non-zero `transition-duration` on hover/focus (TC-048).
- Forced-colours emulation snapshot: focus ring and badges stay visible (`forced-color-adjust` left at auto; borders on badges).

## 5. Manual test procedure (each release candidate)
1. **Keyboard:** complete Journeys A–D (05) using only the keyboard. Note any focus loss, invisible focus or trap.
2. **Screen reader (P1 rows of §3):** on S01, S02, S06, S09, S13, S14 and S18:
   - heading list makes sense;
   - landmarks present;
   - the results count is announced;
   - filter chips are announced;
   - the form error summary is read;
   - S19 announces success.
3. **Zoom:** 400% zoom at 1280 px width, every core route. No horizontal scroll and nothing clipped.
4. **Text spacing override:** no overlap.
5. **Mobile:** TalkBack on a mid-range Android phone over a throttled connection; check that touch targets are comfortable.
6. **Record:** log findings as GitHub issues labelled `a11y` with severity (critical/serious/moderate/minor) and the SC number.

**Launch gate:** no open critical or serious issues without a dated, owner-approved exception.

## 6. Content accessibility rules (editors)
- Plain language: aim for reading age 12–14 on summaries and steps.
- Write alt text for any future images (describe the purpose, not the appearance).
- Link text must describe the destination.
- Never convey meaning by colour or position ("the green button") in instructions.
- Note accessibility information about tools only when it is sourced.
- The accessibility statement (S23) lists known limitations and a contact route, and is reviewed every 6 months.

## 7. V2.1 additions
- **IdentityPicker** follows the WAI-ARIA combobox pattern with a multi-select listbox:
  - `aria-multiselectable="true"` on the listbox;
  - selected chips rendered as a list of buttons before the input;
  - Backspace in an empty input focuses the last chip (it does not delete it silently);
  - Escape closes the suggestions;
  - announcements via a polite live region.
- **Level tabs** use the tabs pattern on mobile and are plain headed regions on desktop. Never use colour alone for levels: text label + icon.
- **"I can do this" checkboxes** are native inputs with the label "I can do this: {module title}".
- **Toolkit card print view** must pass contrast in greyscale; the QR code has adjacent text containing the URL.
- **Reading level:** need descriptions and module outcomes target reading age 12–14 (13 §6). Lens extra modules may use technical terms but must define them on first use.
- **New P1 manual checks:** S01-R picker with NVDA and TalkBack; S29 lens page with VoiceOver; the print toolkit card.
