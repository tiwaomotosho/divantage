# Assets arrive at build time (V2.8)

The design patch ships in two parts. This pack holds **Part 1 (core)** on purpose, so the spec stays light and is not repeated in every version. The owner uploads **Part 2 (assets)** when the build starts.

## What Part 2 adds
- `assets/`: photos (4 crops × 3 formats with LQIP), icons and sprite, 1,781 tool monograms, two-tone illustrations, brand kit, OG images, `assets/maps/taxonomy-visuals.json`.
- `design/reference/png/`: golden screenshots (phone, desktop, light, dark).
- `design/Concept_Board_V2_8.pdf`.

## What to do at the build point
1. Unzip Part 2 into the repo root so the paths above exist. Do not rename or regenerate anything.
2. Run `node tools/build-tokens.mjs` (no diff expected), then `node tools/check-design.mjs src` and `node tools/design-audit.mjs --reference`.
3. Run the checks that need the assets (checklist): Q-6 (29/29 kit icons and hues), Q-8 (1,781 monograms), Q-9 (`design/fonts/OFL.txt`), Q-14 (read the 11 photo alt texts), Q-15 (AI-image disclosure decision).
4. Builders must not generate or substitute images while Part 2 is absent. Use the reference screens' placeholders and leave the slot empty.

## Status until then
Checks Q-6, Q-8, Q-14 and any image-dependent screen review are **deferred, not failed**. Everything else in the checklist is unaffected.
