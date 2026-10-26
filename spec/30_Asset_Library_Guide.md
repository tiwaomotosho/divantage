# 30 — Asset library guide (no image generator needed)

Everything the UI needs visually ships in `assets/` and `design/fonts/`. Claude Code (or any builder) only has to **copy and reference** these files. It must not generate, download or hot-link images (D-097, check-design L3).

Copy `assets/` to `public/assets/` so files are served at `/assets/...`.

## 1. Inventory
| Folder | What | Count | Use with |
|---|---|---|---|
| `photos/` | Real-people photography, 4 crops (wide 16:9, card 4:3, square 1:1, portrait 4:5) × up to 3 widths (480, 960, 1600) × AVIF/WebP/JPG, plus LQIP blur and dominant colour in `manifest.json` | 11 photos · 240 files | `photos/Picture.tsx` |
| `icons/` | 107 outline icons (24px, 2px stroke, currentColor) as SVG files, a sprite, a TS module and an `<Icon>` component; `index.html` shows them all | 107 | `icons/Icon.tsx` |
| `tool-logos/` | Monogram SVG for **every** registry tool (1,781), coloured by tool category; `overrides/` for licensed brand marks | 1,781 | `tool-logos/ToolLogo.tsx` |
| `illustrations/` | Two-tone spot illustrations for states (not-found, offline, error, no-results, empty-stars, success, sign-in, helper-intro, suggestion-sent, next-step, trust-review, kids-safety), light and dark | 12 × 2 | `<picture>` with a dark `<source>` |
| `brand/` | Logo mark (light, dark, mono), glyph, outlined wordmark (light, dark), favicon (SVG with dark mode, ICO), PNG icons 16–512, maskable icons, apple-touch-icon, `manifest.webmanifest`, `head-snippet.html`, Google "G" for the sign-in button | 20 | `<head>`, header |
| `og/` | Social share images 1200×630: default, kit, goal and tool templates (PNG + the HTML that made them) | 4 | `og:image` |
| `maps/taxonomy-visuals.json` | Icon + hue for all 24 sectors, 9 skill groups, 29 kits (+ photo), 3 intents, 19 tool categories, 9 safety tags, nav | 1 | Lookups (D-096) |
| `design/fonts/` | Schibsted Grotesk, Inter, IBM Plex Mono, variable WOFF2, Latin + Latin Extended, `fonts.css` | 12 faces | Global CSS import |

## 2. Photos
| Slug | Tier | Best for | Kits that use it (`taxonomy-visuals.json`) |
|---|---|---|---|
| remote-worker | A | Hero, cards, OG | get-a-remote-job, become-a-freelancer |
| musician-studio | A | Helper hero (musician) | release-my-music, start-a-youtube-channel |
| shop-owner | A | Cards, entrepreneur helper | sell-on-whatsapp, run-a-small-shop, sell-online-in-nigeria, start-a-business-in-nigeria |
| helping-parent | A | Helping mode, safety, life roles | stay-safe-online, manage-money-at-home, keep-my-child-safe-online |
| nurse-tablet | B | Identity header, mosaic tile | run-a-clinic-or-practice |
| farmer-field | B | Mosaic tile, cards | farm-smarter |
| developer-laptop | B | Cards | learn-to-code, get-a-tech-job, learn-ai-skills |
| tailor-phone | B | Cards | build-a-brand |
| kids-coding | B | Kit hero, cards | teach-kids-programming |
| teacher-class | B | Cards | teach-online, study-for-free-online, pass-my-exams |
| people-collage | B | OG default, about | — |

- **Tier A:** 1536px sources; fine everywhere.
- **Tier B:** cropped from one collage (≤ 976px source); fine for cards and tiles, soft as full-width heroes. Replace before public launch (checklist P-6). Kits without a photo use their icon tile (by design, D-095).
- **Rules:** always use `<Picture>` (gives srcset, lazy loading, LQIP, focal point). Alt text comes from the manifest; don't write your own. To add a photo, add files with the same naming and a manifest entry (`slug`, `alt`, `focal`, `tier`, `tags`). The build script is `build/build_assets.py` in the patch source.
- **Provenance:** concept imagery generated with Microsoft Copilot (Oct 2026).

## 3. Icons
- Import `{ Icon }` from `assets/icons/Icon.tsx` and use `<Icon name="route" size={20} />`. Names are file names in `icons/outline/`.
- Sizes: 16 (inline, tags), 18–20 (buttons, inputs), 23 (tab bar), 24+ (tiles scale up inside the tile).
- Icons are decorative by default (`aria-hidden`). Pass `label` only when the icon is the only content of a control.
- Need a new icon? Add an SVG on the same 24px grid with a 2px round stroke to `icons/outline/`, then regenerate `icons.ts` and the sprite. Never import an icon library (lint error).

## 4. Tool logos
- `<ToolLogo slug="canva" size="sm|md|lg" />` → 32 / 44 / 72px. Rounded square, white initials, category colour.
- Monograms avoid trademark issues and keep 1,781 tools visually consistent.
- To use a real logo: put `overrides/{slug}.svg`, add a row to `overrides/LICENCES.md`, and set `override` in `index.json`.

## 5. Illustrations
```html
<picture><source media="(prefers-color-scheme: dark)" srcset="/assets/illustrations/offline-dark.svg">
<img src="/assets/illustrations/offline-light.svg" alt="" width="200" height="150"></picture>
```
When the app uses `data-theme` toggling, pick the file in code from the active theme.

## 6. Brand
Paste `brand/head-snippet.html` into the document head. Header logo: `.brand` markup from any reference screen (mark + live text wordmark). Use `wordmark-*.svg` only where live text isn't possible (emails, PDFs, partner pages). **The name is still a placeholder (D-019)**: when it changes, update the wordmark text and re-run the brand build.

## 7. Performance budgets
| Asset | Budget |
|---|---|
| Hero photo (phone) | ≤ 60 KB (AVIF 480/960) |
| Card photo | ≤ 35 KB |
| Fonts on first view | ≤ 110 KB (2 latin faces, variable) |
| Icon per page | inline, ≤ 1 KB each |
| Tool logos | ≤ 1 KB each, cacheable for 1 year |
