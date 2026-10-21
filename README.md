# Digital Advantage (R1, spec V2.5)

Identity-first, non-commercial guide to digital tools: "Who are you?" → a toolkit of needs, tools and three-level course outlines for 2,603 professions and life roles, 723 tools, 63 skills and three helpers.

Built with **Bun + Vite + React + React Router 7 (framework mode, `ssr: false`, prerendered)**, deployed to **Vercel** as static files plus three functions.

## Commands

```bash
bun install
bun run dev          # builds data, then starts the dev server
bun run build        # data → prerender (~5,800 pages) → per-page CSP hashes
bun run preview      # serve build/client locally
bun run typecheck
bun test             # identity-engine parity with the Python reference
```

## Layout

| Path | What |
|---|---|
| `content/` | Catalogue records, registry, taxonomy and config copied from the spec pack (content as data, D-064). |
| `src/lib/` | Framework-free TypeScript: `identity.ts` (port of `reference_engine.py`), `search.ts` (port of the search harnesses), `lensview.ts`, `format.ts`, `content.server.ts` (build-time loader). |
| `app/` | React Router app: `root.tsx`, `routes.ts`, `routes/*` (one file per screen), `components/*`, `lib/` (on-device stores, lazy indexes, flags). |
| `scripts/build-data.ts` | Type-ahead and search indexes, per-identity/per-tool JSON for client routes, sitemap, robots, export, flags. |
| `scripts/postbuild.ts` | Adds a hashed Content-Security-Policy to every HTML page (no `unsafe-inline`). |
| `api/v1/` | Vercel Functions: `corrections`, `events`, `health`. |
| `spec/` | The full product spec (V2.5) for reference. |
| `docs/` | `open-questions.md`, `deviations.md`. |

## Feature flags

Defaults are the **private-beta** values from `content/config/feature-flags.json`. Set env vars at build time:

- `FLAG_PROFILE=launch` to use the public-launch values;
- `FLAG_<NAME>=on|off` to override one flag (e.g. `FLAG_EXPLORE_TOOLS=on`).

## Deploying to Vercel

`vercel.json` sets the build (`bun run build`), output (`build/client`), redirects, security headers and the SPA fallback for client-rendered routes. Set these environment variables in the Vercel project:

| Variable | Purpose |
|---|---|
| `SITE_URL` | Canonical origin for the sitemap and robots (e.g. `https://example.vercel.app`). |
| `BRAND_NAME` | Brand shown in the UI (D-019 pending). |
| `CORRECTIONS_GITHUB_REPO`, `CORRECTIONS_GITHUB_TOKEN` | Private repo and fine-grained token (Issues only) for suggestions. Without them, suggestions are logged. |
| `TURNSTILE_SECRET_KEY` | Optional bot check on suggestions. |
| `FLAG_*` | Feature flags, as above. |

## Privacy

The chosen identity, roadmap ticks and helper progress live only in `localStorage` (`da.identities.v1`, `da.ticks.v1`, `da.helper.v1`) and are never sent anywhere (D-053).
