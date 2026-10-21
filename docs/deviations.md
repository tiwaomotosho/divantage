# Deviations from the specification

"None" is the expected answer (doc 17). Each item here was required by the owner or by the platform, or is a known gap still to close.

| Spec | What differs | Why |
|---|---|---|
| D-069, ADR-008, 11 §1, 16 | Hosted on **Vercel** (static `build/client` + Vercel Functions in `api/v1/`) instead of Cloudflare Pages + Pages Functions. `_headers` is expressed in `vercel.json`. | Owner instruction. See open questions Q-1 to Q-3 for the Cloudflare-only services. |
| 06 §8, 12 (CSP) | The CSP is delivered **per page** as a `<meta>` tag with SHA-256 hashes of that page's inline scripts (`scripts/postbuild.ts`), plus a header with `frame-ancestors 'none'` (meta CSP cannot set it). | React Router prerendering writes page-specific inline scripts; one static hash list cannot cover them. Spec 12 allows a per-page meta CSP. |
| 14 (404 status) | Unknown paths are served `__spa-fallback.html`, which renders S24 with HTTP 200. | Vercel static hosting cannot return 404 and also serve client-rendered routes (S28, combined toolkits) from the same rewrite. |
| 06 §10 (no raw px) | A few non-token values remain in `app.css` (tactile offset shadows, 56 px tall controls, tab-bar height, print colours). | Values come from 06 §12 prose with no token yet; to be added to `tokens.json` and regenerated. |
| 17 (validator port) | `scripts/validate-content.ts` (port of `validate_catalogue.py`) and the Zod parity test are **not yet written**. | Next milestone (C). The Python validators in `spec/spec-assets/` still run. |
| 17 (search parity) | Search runtime is a port of `reference-harness.mjs`, extended with registry tools, needs, skills and helpers; the test-set score has not been re-run on the extended index. | Next milestone (D). |
