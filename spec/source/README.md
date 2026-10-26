# Maintainer scripts (Python 3.12)

These scripts produced `assets/`, `design/reference/` and the concept board. Builders don't need them. Use them to change the concept itself (doc 29 §2).

| Script | Makes |
|---|---|
| `icons.py` | The icon geometry (single source for `assets/icons`) |
| `build_assets.py` | Icons, taxonomy visual map, photo crops/formats/LQIP + manifest, tool monograms, illustrations |
| `build_brand.py` | Logo mark, outlined wordmark, favicons, PWA icons, web manifest |
| `build_screens.py` | The 27 responsive reference screens |
| `render_ref.py` | Golden PNGs, `anatomy.json`, `style-fingerprint.json` |
| `build_og.py` | OG share images |
| `build_board.py` | `design/Concept_Board_V2_8.pdf` |

**Requirements:** Pillow (with AVIF/WebP), fontTools, cairosvg, playwright (Chromium).
**Paths:** the constants at the top of each script (`P`, `PACK`, `UP`, the Chromium path) point at the original build machine. Set them to your patch root, the unzipped V2.7 pack, and the folder holding the source photos before running.
**Order:** `build_assets.py` → `build_brand.py` → `build_screens.py` → `render_ref.py` → `build_og.py` → `build_board.py`.
