# CLAUDE.md: rules for building Digital Advantage (V2.8 design patch)

You are implementing an approved design. The look is fixed; your job is to reproduce it faithfully with real data.

> Assets (`assets/`, `design/reference/png/`) are added by the owner at build time. If they are absent, read `ASSETS_AT_BUILD.md`; do not generate or substitute images.

## Before you write any UI code
1. Read `docs/28_UIUX_Brief_V2_8.md` (what and why) and `docs/29_Design_Fidelity_Contract.md` (the rules you will be checked against).
2. Open the reference screen for the page you are building: `design/reference/screens/<NN-name>.html`. Read its markup. Look at `design/reference/png/<NN-name>/phone-light.png`, `desktop-light.png` and the dark versions.
3. Reuse the reference markup's class names and `data-da` attributes in your React components. The styles come from `design/components/da.css`, which the app imports globally.

## Hard rules (CI fails if you break them)
- **No raw values.** No hex, rgb or hsl colours, no font-family literals, no Tailwind arbitrary colours. Use `var(--da-*)` tokens or classes from `da.css` / `tailwind-theme.css`.
- **No new visual primitives.** Don't add colours, shadows, radii, font sizes or spacing that aren't in `design/tokens/tokens.json`. If you think one is needed, stop and ask; it is a design change (doc 29 §2).
- **Closed asset set.** Images only via `<Picture slug>` from `assets/photos/manifest.json`; tool logos via `<ToolLogo>`; icons via `<Icon name>`; illustrations from `assets/illustrations`. No icon libraries. No external image or font URLs. You cannot and must not generate images.
- **Fonts are self-hosted** from `design/fonts/fonts.css`. Never add Google Fonts.
- **Every component carries its `data-da` attribute** as in the reference (table in doc 29 §5).
- **Mandatory V2.8 patterns:** one `NextStepCard` at the end of identity, goal, tool, path, kit and helper pages; a "Learn {tool}" button on every tool row and tool page; a TrustLine (price + Checked/Preview) on every tool mention; a DepthLabel on every learning path.
- **Phone first and nothing cut off.** Build at 390px first. No horizontal overflow. Fixed bars reserve their space (`main` padding). Every visible control must do something.
- **Copy:** "learning path" not "roadmap" in UI text; "Tools for {job}"; no superlatives.

## Commands
```bash
node tools/build-tokens.mjs           # after any change to tokens.json
node tools/check-design.mjs src       # static lint: must be 0 errors
node tools/design-audit.mjs --reference                       # self-test: must pass
node tools/design-audit.mjs --base http://localhost:4173 --only 07-goal   # check a built screen
```

## Definition of done for a screen
- Matches the reference at 390 / 834 / 1440 px, light and dark (content may differ, structure may not).
- `check-design` 0 errors; `design-audit --only <screen>` 0 failures.
- Route mapped in `design/fidelity.config.json`.
- Ask the owner to review `design-audit-report/index.html` and record sign-off in `design/SIGNOFF.md`. Don't mark the task complete before that.

## When the reference doesn't cover something
Compose it from existing `da.css` components and the closest reference screen. Note it in the PR as "new composition, needs design review". Don't invent new styling.
