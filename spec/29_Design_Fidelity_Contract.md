# 29 — Design fidelity contract: what stops the build from drifting from the concept

## 1. The honest answer
Nothing can make drift literally *impossible*: a builder (human or Claude Code) can always write different code. What V2.8 does is make drift **expensive, visible and blocked**:

- **The look is shipped as code, not as pictures.** The app imports the same token CSS and the same component stylesheet that render the reference screens. If the app uses those files, it cannot look different without someone editing them, and editing them is a reviewed design change.
- **The asset set is closed.** Fonts, photos, icons, tool logos and illustrations come only from this patch. Anything else fails the lint.
- **Machines check every build.** A static lint and a browser audit compare the app against the reference: tokens, fonts, components, sizes, overflow and touch targets. CI fails on any error.
- **A person signs off what machines can't judge.** A side-by-side report (reference vs app) has an owner tick-box per screen. The approved screenshots then become visual-regression baselines, so later changes can't drift silently.

## 2. Order of authority (when things disagree)
1. `design/tokens/tokens.json` (values)
2. `design/components/da.css` (how components look)
3. `design/reference/screens/*.html` (what is on each screen, and where)
4. `docs/28_UIUX_Brief_V2_8.md` (why, and the rules in words)
5. Older docs (04, 06, 13, the V1 concept board)

To change the look, change 1–3 first in a design PR, regenerate the references (`build/` scripts or by hand), get owner approval, then change the app.

## 3. The seven locks
| # | Lock | Mechanism | File(s) | Fails when |
|---|---|---|---|---|
| L1 | **One source of values** | Tokens → generated CSS/TS/Tailwind theme | `design/tokens/*`, `tools/build-tokens.mjs` | Generated files hand-edited or stale |
| L2 | **Same stylesheet** | App imports `fonts.css`, `tokens.css`, `da.css` globally; React components output the same class names (§5) | `design/components/da.css` | Class names renamed or styles re-implemented differently (caught by L5) |
| L3 | **Closed asset set** | Photos manifest, icon set, tool logos, illustrations, self-hosted fonts | `assets/**`, `design/fonts/**` | External image or font URL, unknown photo slug, unknown icon, icon library import |
| L4 | **Static lint** | `tools/check-design.mjs` | — | Raw colours, raw font families, arbitrary Tailwind colours, remote fonts, icon libraries (errors); arbitrary sizes, superlatives, `!important` (warnings) |
| L5 | **Runtime audit** | `tools/design-audit.mjs` against every mapped route, phone + desktop, light + dark | `design/fidelity.config.json`, `design/reference/anatomy.json`, `design/reference/style-fingerprint.json` | Missing required component (`data-da`), H1 font/weight, primary colour/radius, card radius, header/tab bar height differ; horizontal overflow; target < 24px; fonts not loaded |
| L6 | **Human sign-off** | Audit report puts reference and app side by side with an "Owner OK" tick per screen/viewport/theme | `design-audit-report/index.html`, `design/SIGNOFF.md` | A screen ships without a recorded OK |
| L7 | **No silent regressions** | After sign-off, app screenshots become Playwright `toHaveScreenshot` baselines (max diff 1%) | `tests/visual/*.spec.ts` (template in `tools/templates/`) | Any later pixel drift > threshold |

Self-test: `node tools/design-audit.mjs --reference` audits the reference screens against themselves and must pass (it does: 27 screens × 2 viewports × 2 themes).

## 4. Wiring it into the repo (do this first)
1. Copy `design/`, `assets/` (to `public/assets/`), `tools/` and `CLAUDE.md` into the repo root.
2. Global CSS entry (e.g. `src/styles/global.css`):
   ```css
   @import "../../design/fonts/fonts.css";
   @import "../../design/tokens/tokens.css";
   @import "../../design/tokens/tailwind-theme.css"; /* only if using Tailwind v4 */
   @import "../../design/components/da.css";
   ```
3. `package.json` scripts:
   ```json
   "design:tokens": "node tools/build-tokens.mjs",
   "design:check": "node tools/check-design.mjs src",
   "design:audit": "node tools/design-audit.mjs --base http://localhost:4173",
   "design:selftest": "node tools/design-audit.mjs --reference"
   ```
4. CI: copy `tools/templates/design-ci.yml` to `.github/workflows/design.yml`.
5. Pre-commit: copy `tools/templates/pre-commit` to `.husky/pre-commit` (or `.git/hooks/pre-commit`).
6. PR template: append `tools/templates/PULL_REQUEST_TEMPLATE.md`.
7. Map routes in `design/fidelity.config.json` as screens get built (null = not built yet).

## 5. Component contract (class → React component)
Every component sets the same `data-da` attribute as the reference. The audit looks for these.

| Reference markup | React component | `data-da` |
|---|---|---|
| `header.hdr` | `<Header>` | `header` |
| `nav.tabbar` | `<TabBar>` | `tabbar` |
| `.helperbar` + `.coach` | `<HelperBar>` + `<HelperCoachmark>` | `helper-bar`, `helper-coachmark` |
| `.input[data-da=identity-picker]` | `<IdentityPicker>` | `identity-picker`, `identity-chip`, `identity-example` |
| `.btn.p` / `.btn.s` / `.btn.g` / `.btn.t` | `<Button variant="primary\|secondary\|ghost\|teal">` | `primary-cta` on the page's main action |
| `.chip` | `<Chip pressed selected size>` | — |
| `.tag.h-{hue}` | `<Tag hue>` | — |
| `.tile.h-{hue}` | `<IconTile icon hue size>` | — |
| `.card` (`.el`, `.feat`, `.soft`, `.ink`) | `<Card variant>` | per use |
| `.trust` | `<TrustLine price verification>` | `trust-line`, `price`, `verified` / `preview-label` |
| `.tag.depth-*` | `<DepthLabel kind>` | `depth-label` |
| `.next` | `<NextStepCard>` | `next-step` |
| `article[data-da=tool-row]` | `<ToolRow>` | `tool-row`, `learn-tool` |
| `article[data-da=need-card]` | `<NeedCard>` | `need-card`, `need-feedback` |
| `.safe` | `<SafetyNote>` | `safety-note` |
| `.banner.err` | `<AvailabilityBanner>` | `availability-banner` |
| `.step` | `<KitStep>` | `kit-step` |
| `.sheet` + `.scrim` | `<Sheet>` | `safety-sheet`, `sign-in-sheet`, `suggest-sheet` |
| `picture[data-da=photo]` | `<Picture slug ratio>` (`assets/photos/Picture.tsx`) | `photo` |
| `img.tl` | `<ToolLogo slug size>` (`assets/tool-logos/ToolLogo.tsx`) | `tool-logo` |
| `svg` icons | `<Icon name>` (`assets/icons/Icon.tsx`) | — |

## 6. Sign-off procedure (L6)
1. Run `npm run build && npm run preview`, then `npm run design:audit`.
2. Open `design-audit-report/index.html`. For each row: the checks pass, and the app matches the reference in layout, hierarchy, spacing rhythm, colour use and imagery. Content may differ (real data), structure may not.
3. Record in `design/SIGNOFF.md`: screen, viewport, theme, date, who, build hash.
4. Generate baselines: `npx playwright test tests/visual --update-snapshots` and commit them.

## 7. What is allowed to differ
- Real content (names, counts, tools, text) replaces sample content.
- Data-driven list lengths.
- Accessibility improvements that don't change the look (ARIA, focus order).
- Anything approved in a design PR that updated tokens, `da.css` and the reference first.

## 8. What Claude Code must not do (also in `CLAUDE.md`)
Invent colours, fonts, radii, shadows or spacing; add an icon library; hot-link or generate images; restyle a component locally; skip `data-da` attributes; mark a screen done without the audit and a sign-off.
