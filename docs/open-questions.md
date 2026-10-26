# Open questions (V2.8 build)

| # | Question | Where | Current behaviour |
|---|---|---|---|
| Q-1 | Price chips are AI-drafted; "Free" shows beside a Preview label for 365 tools (checklist 7.4, FR-038). Confirm D-084 overrides "never show Free unless confirmed". | 26 §2, checklist 2.5/7.4 | Shown with the Preview label, as the reference does. |
| Q-2 | Device market: the site defaults to Nigeria (`en-NG`) for ranking and availability banners; visitors change it on Search. Is a first-visit country prompt wanted? | D-074 | Default Nigeria, changeable, stored on device. |
| Q-3 | Need cards' tile icon and hue come from the need's skill group (taxonomy-visuals has no per-need entry). | D-096 | Skill-group visual. |
| Q-4 | Identity header photo: only nurses have an identity photo; others use a sector photo from the closed set (tier B photos must be replaced before launch, D-097). | D-097 | Sector mapping in `content.server.ts`. |
| Q-5 | Store for anonymous counters, need feedback and rate limits on Vercel (Neon per doc 32). Not provisioned. | D-083, FR-114 | Need feedback hides the card for the visit; nothing is sent. Events are logged only. |
| Q-6 | Turnstile on Vercel (doc 32 §2: owner choice). | 12 | Server verifies only when `TURNSTILE_SECRET_KEY` is set; no widget rendered yet. |
| Q-7 | D-091 fonts, D-105 precedence, D-019 brand, D-027 legal text. | doc 31/32 | Fonts as shipped; brand via `BRAND_NAME`; legal pages show `TODO(owner)`. |
| Q-8 | Owner sign-off (L6) and visual baselines (L7) | doc 29 §6 | Not done: run the audit and review `design-audit-report/index.html`. |
| Q-9 | Demo data to remove before public launch: `da.account.v1` demo sign-in, `public/data/trending.json` (`demo: true`), `content/contributors.json` (`demo: true`), sample sections in `/admin/report`, demo status in `/suggestions/{ref}`. | Owner decision 26 Oct 2026 | All labelled on screen. |
| Q-10 | `/admin/report` is public in this preview (no access control on Vercel yet). | doc 20 §9 | noindex only. |
