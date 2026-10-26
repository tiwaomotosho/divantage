# 32. V2.8 pack corrections: checklist status and hosting map
**Version:** 2.8 · **Date:** 26 October 2026 · **Companion to:** `Digital_Advantage_V2_8_Verification_Checklist.md`

This document records what V2.8 changed for each checklist item, and what is still open. Nothing here changes a product decision. Four statuses are used:
- **Fixed**: changed in this pack and checked by a script or test where one exists.
- **Partly**: improved, with a named remainder.
- **Owner**: needs a decision from the product owner (EniTiwa), counsel or the build team. Not decided here.
- **Open**: content or checking work not done in V2.8.

## 1. Status by checklist item

### P. Pilot round 1
| Item | Status | Note |
|---|---|---|
| P-1 iPhone bugs | Partly | Spec and tests added (D-101, TC-176 to TC-178; reference audit passes). Needs a real iPhone and Android check on the build (R-11). |
| P-2 Role-specific learning paths | Open | 1,058 roadmaps are archetype-only. V2.8 labels them "General guide" (D-094). Writing role-specific paths is content work. |
| P-3 to P-5 | Partly | Next-step card, coach mark and explainer specified (D-092, D-100). Follow-up with respondents is yours. |
| P-6, P-7 | Partly | Promise (D-104) and colour budget (D-095) specified and linted. Promise test with 5 new people not run. |
| P-8 Trust signals | Partly | TrustLine rule (D-093); profile validator now fails a web-seen tool without a price check that loses its Preview label. |
| P-9, P-10 | Open | Identity-to-need review and missing occupations need the respondents. |
| P-11, P-12 | Fixed | `spec-assets/qa/pilot-round-2-form.md` carries the quotas and follow-ups. Recruitment is yours. |
| P-13 | Owner | Photo tier-B replacement date. |

### Q. Design patch
| Item | Status | Note |
|---|---|---|
| Q-1 to Q-3 | Fixed | Tokens in sync; lint 0 errors; reference audit 108 checks, 0 failing. |
| Q-4, Q-5 | Partly | Lint test passes; reference screens open, with images empty until the assets are added (see Q-6). |
| Q-6, Q-8, Q-14 | Deferred | Need the patch's `assets/` folder, which the owner uploads at the build point (`ASSETS_AT_BUILD.md`). |
| Q-7 | Partly | Rule is in doc 31 §4; compare on 10 tools once the build shows the label. |
| Q-9 | Partly | Fonts folder is in the pack; confirm `OFL.txt` after the assets part arrives. |
| Q-10, Q-11, Q-15 | Owner | D-091, D-105, AI-image disclosure. |
| Q-12, Q-13 | Fixed | TC-169 to TC-188 (188 tests), 7 events (60), 5 flags (38), feature rows F-49 to F-56 (56); matrix validator 0 errors. |
| R-1 to R-12 | Open | Build-time checks; they apply to the app, not to this pack. |

### V2.7 items
| Item | Status | Note |
|---|---|---|
| 1.1 to 1.5 | Fixed | Rebuild and the three search harnesses run clean (see CHANGELOG for counts). |
| 1.6 | Partly | `goal-harness.mjs` and the SQL test are now listed in `rebuild_all.sh` output as manual follow-ups; the CI template still needs them added by the build team. |
| 1.7 | Open | Id spot-check not repeated. |
| 2.1 to 2.4 | Owner | D-105 (proposed) resolves these once confirmed. |
| 2.5 Price claims vs Preview | Owner | Rule conflict stays open; needs owner and legal call. |
| 2.6 | Open | Reader-confusion note only. |
| 3.1, 3.2, 3.6, 3.7 | Partly | Banners added to docs 10, 11, 12, 16 and the mapping in §2 below. Bodies still use Cloudflare words. A full rewrite is a build-time task. |
| 3.3 | Fixed | Cloudflare `_headers` moved to `spec-assets/config/legacy/`; `vercel.json` added with headers and the noindex rule for preview URLs. |
| 3.4 | Fixed | `env.example` rewritten with database URL, auth secret, Google OAuth, email sender and cron secret. |
| 3.5 | Owner | Spike S-1 target (Vercel rather than Cloudflare Pages). Stated in §2; confirm. |
| 3.8 | Fixed | `rate_limits` table (hashed key, window, count) in migration 0002 and purged by `purge_old_rows()`. |
| 3.9 | Fixed | `0001_analytics_counters.sql` marked RETIRED. |
| 4.1 | Open | OpenAPI still lists 6 paths; the V2.7 static endpoints are described in doc 10 only. |
| 4.2, 4.3 | Partly | 4.2 covered by the doc 10 banner. 4.3 (session cookie vs cookieless CSRF reasoning) not reviewed. |
| 5.1 to 5.4, 5.6 | Open | Roadmap tier counts and content quality unchanged. Roadmap bodies for scratch, trainual, opay and similar tools were not rewritten. |
| 5.5 | Open | Validator still measures coverage, not tier. |
| 5.7 | Fixed | DepthLabel rule (D-094). |
| 6.1, 6.2, 6.10 | Owner | Counsel review. |
| 6.3, 6.4 | Fixed | Separate recommend and trending consents; profile consent is nullable, so every switch starts off. |
| 6.5 | Fixed | Stars accept kits. |
| 6.6 | Fixed | Trending window comment and behaviour made consistent with "rolling 7 days". |
| 6.7 | Fixed | `purge_old_rows()` holds the 90-day deletes; the schedule is a Vercel cron entry in `vercel.json`. |
| 6.8 | Partly | Migration now executed on PGlite (Postgres in WebAssembly) by `spec-assets/db/run-and-test.mjs`: 7 checks pass. **Not run on Neon.** Do that before launch. |
| 6.9 | Fixed | Doc 12 now says "until close or 90 days, whichever is first". |
| 7.1 | Fixed | 1,781 profiles; 5 web-seen, 1,776 AI-drafted. |
| 7.2 | Open | The 5 web-seen sources are articles, not official pages, and have no URLs. They do not meet FR-096 for removing the Preview label; none have. |
| 7.3 | Fixed | Validator change described in P-8. |
| 7.4, 7.6, 7.7 | Open | Free chips beside the Preview label, accuracy spot-check of 10 profiles, placeholder check. |
| 7.5 | Fixed | 29 superlative descriptions neutralised in `tool_profiles.txt`. |
| 7.8 | Open | Payload rule stated in doc 14; not measured. |
| 8.1, 8.2 | Fixed | 97.0%; the "same kind is not substitutable" caveat stays. |
| 8.3 | Partly | Remote job board order corrected; other goals not reviewed. |
| 8.4 to 8.6, 8.8 | Open | Unchanged. |
| 8.7 | Fixed | `showmax` removed from the goal's search words. Uber note kept. |
| 8.9 | Fixed | Local tools: 130 distinct = 98 Nigeria + 58 Africa − 26 in both. The CHANGELOG now says so. |
| 9.1 | Fixed | Kit hints now use each identity's own needs plus a rotating generic set; the top kit's share fell from 81.8% to about 24.7%. Not user-tested. |
| 9.2 | Fixed | Short keywords match whole words; keywords tightened; the named false positives no longer tag. Safety tags are still AI-drafted. |
| 9.3, 9.4 | Open | Non-Nigerian view of help bodies; human read of ten safety panels. |
| 9.5 | Open | Not re-checked. |
| 10.1 | Fixed | `outcome_prompt` and `suggestion_status` default off. |
| 10.2, 10.3 | Owner / Open | Gate naming; tests remain "Not run", as expected for a spec. |
| 10.4 | Fixed | 56 features, 0 errors. |
| 11.1 | Fixed | Infinite animation removed. |
| 11.2, 11.3, 11.4 | Open | Doc 05 and 13 coverage; prerender size estimate; gzip size of the goal index. |
| 12.1 to 12.4, 12.6 to 12.8 | Open | Housekeeping not done, except as listed in the README. |
| 12.3 | Fixed | README contents table lists docs 24 to 32. |
| 12.5 | Fixed | D-084 to D-090 rows have the right cell count. |
| 13 | Owner | All decisions in checklist §13 remain open. |
| 14 | Open | V1 reference files, sampled records and the pilot build were not audited. |

## 2. Cloudflare to Vercel mapping
Read doc 10 §1 and §5, doc 11 (§1 diagram, §3 repo layout, §5, ADR-008), doc 12 §1 to §4 and doc 16 §1 to §6 with this table (D-083).

| Where the doc says | Read as |
|---|---|
| Cloudflare Pages | Vercel project (static output plus functions) |
| Pages Functions in `functions/` | Vercel Functions in `api/` |
| Workers cron | Vercel Cron (`vercel.json` `crons`) |
| D1 | Neon Postgres (`0002_accounts_profiles_postgres.sql`) |
| KV or D1 rate-limit counters | `rate_limits` table in Neon |
| Turnstile | Keep Cloudflare Turnstile as a standalone widget, or swap for another bot check (owner choice) |
| `wrangler` commands | Vercel CLI or dashboard |
| Pages rollback | Vercel "Promote previous deployment" |
| `*.pages.dev` noindex rule | `*.vercel.app` noindex rule in `vercel.json` |
| Encrypted env vars (Cloudflare) | Vercel encrypted environment variables |
| Processor list (Cloudflare) | Vercel, Neon, the chosen auth provider, the email sender |
| Spike S-1 "Bun on Cloudflare Pages" | Spike S-1 "Bun, Vite and React Router prerender on Vercel" |

## 3. What stays open on purpose
D-091 fonts, D-105 precedence, D-019 brand, D-027 legal and markets, D-061 licences, D-018 monitor, D-077 auth spike, D-012, D-050, the price-claims conflict (2.5), and counsel review of consent, age rule and the kids panel. No document in this pack treats any of them as settled.
