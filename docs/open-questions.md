# Open questions

Per doc 17: when the spec is unclear, the question is listed here instead of being decided silently.

| # | Question | Where | Current behaviour |
|---|---|---|---|
| Q-1 | **Hosting is Vercel, not Cloudflare Pages** (owner instruction, overrides D-069/ADR-008 host). D1 (event counters), Cloudflare Access (A01 admin report) and Cloudflare Web Analytics have no direct equivalent. Which store for aggregate counters: Vercel KV / Upstash Redis / Postgres? Which access control for A01: Vercel Password Protection / Vercel Authentication? | 11 §1, 14 §2, 20 §9 | `/api/v1/events` validates and logs, returns 204. A01 not built (flag `admin_report` is off in beta). |
| Q-2 | Rate limiting for `/api/v1/corrections` needs a shared store on Vercel (functions are stateless). Same store as Q-1? | 12 | Best-effort in-memory limit per function instance. |
| Q-3 | Turnstile is Cloudflare's. Keep it on Vercel (works cross-host) or switch to another bot check? | 12, S18 | Server verifies Turnstile only when `TURNSTILE_SECRET_KEY` is set; the client widget is not yet rendered. |
| Q-4 | Pilot guides (`pilot-profiles.json`) contain cost and platform text that is AI-drafted and unverified. D-048 forbids price/platform claims for tools without a full profile. | 22 §5, D-048 | Tool pages show the guide's how-to content (first hour, watch out, learn next) but **not** its cost or platforms. |
| Q-5 | "Surprising uses" (03 §6.4) mentions a fixed category→sector affinity table that does not exist in `sectors.json`. | 03 §6.4 | Uses the sectors after the tool's largest (home) sector, by identity count, first 3 with a matching need. |
| Q-6 | Families and sectors have no `description` field, but S27 says the intro line comes from it. | 04 S27 | A generated sentence: "Part of {family} in {sector}." |
| Q-7 | Identity × tool pages (S28) and combined toolkits (`/for/a+b`) are not prerendered (≈ 2 million combinations). | ADR-008 | Rendered in the browser from `/data/id/*.json` and `/data/tool/*.json`; `noindex`. Without JavaScript they show the SPA fallback. |
| Q-8 | Brand name (D-019). | 21 | Configurable via `BRAND_NAME` env var; default "Digital Advantage". |
| Q-9 | Legal text (privacy, terms, accessibility statement, contact email). | D-027 | Placeholders marked `TODO(owner)`. |
