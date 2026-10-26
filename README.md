# Digital Advantage (R1, spec V2.8)

**Find the tools people in your job use. Learn them step by step.**

2,603 jobs and roles, 279 needs, 1,050 goals, 29 kits, 1,781 tools (each with a profile and a learning path), 63 skills and 3 helpers. Static, no accounts in beta.

Built with **Bun + Vite + React + React Router 7** (`ssr: false`, prerendered) and deployed to **Vercel**. The look is the approved V2.8 concept: read `CLAUDE.md`, `spec/28_UIUX_Brief_V2_8.md` and `spec/29_Design_Fidelity_Contract.md` before changing UI.

## Commands

```bash
bun install
bun run dev              # data, then the dev server
bun run build            # data → prerender (~5,900 pages) → per-page CSP hashes
bun run preview          # serve build/client like Vercel (port 4173)
bun run typecheck
bun test                 # identity engine parity + goal search harness (131 queries)
bun run design:check     # static design lint (must be 0 errors)
bun run design:selftest  # audit the reference screens (must pass)
bun run design:audit     # audit the running preview against the references
```

## Layout

| Path | What |
|---|---|
| `design/` | V2.8 tokens, fonts, `da.css`, 27 reference screens + golden PNGs, fidelity config, sign-off log. Don't hand-edit. |
| `public/assets/` | Closed asset set: photos, icons, 1,781 tool monograms, illustrations, brand, OG images, taxonomy visuals. |
| `tools/` | `build-tokens.mjs`, `check-design.mjs`, `design-audit.mjs`, CI/hook/PR templates. |
| `content/` | Catalogue and taxonomy from the V2.8 pack (goals, kits, profiles, alternatives, markets, safety). |
| `src/lib/` | Framework-free logic: identity engine, search (identity, goals/kits, content), lens composition, loader. |
| `app/` | Routes (one per screen), `components/da.tsx` (V2.8 component library), shell, sheets, on-device stores. |
| `scripts/` | `build-data.ts`, `postbuild.ts` (CSP), `preview.ts`. |
| `api/v1/` | Vercel Functions: corrections, events, health. |
| `docs/` | `deviations.md`, `open-questions.md`. |

## Flags

Beta defaults from `content/config/feature-flags.json`. `FLAG_PROFILE=launch` for launch values; `FLAG_<NAME>=on|off` per flag. Accounts, trending and suggestion status stay off until Launch.

## Deploy (Vercel)

`vercel.json` sets install, build, output, headers, redirects and the SPA fallback. Environment: `SITE_URL`, `BRAND_NAME`, optional `CORRECTIONS_GITHUB_REPO` + `CORRECTIONS_GITHUB_TOKEN`, optional `TURNSTILE_SECRET_KEY`, `FLAG_*`.

## Privacy

Roles, stars, ticks, kit steps and helper progress live only in `localStorage` (`da.identities.v1`, `da.device.v1`, `da.ticks.v1`, `da.helper.v1`). Nothing is sent to a server.
