# 16 — Deployment and Operations Runbook

> **V2.8 hosting correction (D-069 / 32):** hosting is Vercel + Neon. Where this document says Cloudflare, Pages, Workers, D1, KV or wrangler, read the Vercel equivalent in `32_V2_8_Pack_Corrections.md` §2. Product behaviour and privacy rules are unchanged.


**Version:** 2.6 · Stack per 11 (Bun + Vite + React, ADR-008); host Vercel with Neon Postgres (ADR-009, D-083). Replace `digitaladvantage.example` once D-019 is decided.

## 1. Environments
| Environment | Where | Data | Secrets | Who deploys |
|---|---|---|---|---|
| Local | `bun run dev` (Vite + React Router) + `wrangler pages dev` for Functions + local D1 | Repo content; `CONTENT_INCLUDE_IN_REVIEW=true` | `.dev.vars` (git-ignored), **test** Turnstile keys, a token for a *test* corrections repo | Developer |
| Preview | Cloudflare Pages preview per PR (`*.pages.dev`) | Repo content incl. in_review (banner); noindex header | Preview env vars: test Turnstile keys, test corrections repo, separate D1 (`da-preview`) | Automatic on PR |
| Production | Cloudflare Pages production branch `main` → custom domain | Published only | Production env vars | Merge to `main` (requires approval + green CI) |

Development data is the repo content itself; no production personal data is ever copied. The test corrections repo holds only synthetic reports.

## 2. First-time setup (checklist)
1. Create the GitHub org or user repos `digital-advantage` (public) and `da-corrections` (private). Enable:
   - 2FA requirement;
   - secret scanning and push protection;
   - Dependabot.
2. Add branch protection on `main`: PR required, 1 approving review (CODEOWNERS), status checks required, no force push, linear history.
3. Add `CODEOWNERS` and the PR template (review checklist 07 §7).
4. Create the Cloudflare Pages project linked to the repo:
   - build `bun run build`;
   - output `build/client`;
   - set `BUN_VERSION` (Bun is supported by the Pages build image; confirm the default and supported versions in the current Cloudflare docs) and `NODE_VERSION` only if a tool needs it.
5. Record the current free-plan limits for Pages, Functions, D1 and Turnstile in `docs/limits.md`, with the date checked.
6. Create the D1 databases `da-prod` and `da-preview`; bind them as `DB`; run `wrangler d1 migrations apply`.
7. Create the Turnstile widget (managed mode) for the domain and the preview domain.
8. Create a fine-grained GitHub token: repo `da-corrections` only, Issues read/write, 90-day expiry. Store it as `CORRECTIONS_GITHUB_TOKEN`. Put a calendar reminder for rotation.
9. Set all env vars from `spec-assets/config/env.example`.
10. Copy `spec-assets/config/_headers` to `public/_headers`; compute the theme-script SHA-256 and replace the CSP placeholder.
11. Enable Cloudflare Web Analytics for the domain.
12. Set up the uptime monitor (D-018).
13. Add the custom domain; check that TLS is automatic and HSTS is on.
14. Add `security.txt` and `SECURITY.md`.

## 3. CI pipeline (`.github/workflows/ci.yml`, on PR)
Steps run in order; the PR cannot merge unless all pass.
1. `bun install --frozen-lockfile`
2. `bun run lint` (ESLint, Prettier, Stylelint with a rule banning raw colours and px values outside tokens)
3. `bun run typecheck`
4. `bun run validate:content` (schema + integrity; `--production` rules on `main`)
5. `bun run test` (unit, component, integration)
6. `bun run test:search` (test-set threshold)
7. `bun run build`
8. `bun run scan:dist` (private fields, secrets, illustrative records, forbidden JSON-LD properties)
9. `bun run test:e2e` (against the built site served locally) + axe
10. Lighthouse CI against the preview URL (performance budgets)
11. dependency audit (`bun audit`; confirm it exists in the pinned Bun version, otherwise use OSV-Scanner) (fails on high/critical)

## 4. Release procedure
- **Content-only change:**
  1. PR → CI → preview review → approval → merge.
  2. Production deploys automatically (about 2–5 minutes).
  3. Smoke test: open the changed pages on the live site.
- **Code change:** as above, plus:
  - the reviewer runs the manual keyboard check on affected screens;
  - tag the release `vYYYY.MM.DD-n`;
  - write release notes (15 §5).
- **Migrations:**
  - D1 migrations run **before** merging code that depends on them (`wrangler d1 migrations apply da-prod` by the maintainer). They must be backwards-compatible with the currently deployed code (expand → deploy → contract).
  - Content migrations run inside the PR (09 §5).
- **Feature flags:** environment variables (e.g. `FEATURE_COMPARISONS=true`) read at build time; used to hide R1.5 features until ready.
- **Smoke tests after every production deploy** (a GitHub Action calling the production URL):
  - `/` 200;
  - `/api/v1/health` 200 with the new SHA;
  - `/search?q=video` HTML 200;
  - one tool page 200;
  - `/sitemap.xml` 200.

  A failure triggers the rollback criteria.

## 5. Rollback, backups and restore
**Rollback criteria:** any of the following:
- smoke test fails;
- a P1 journey is broken;
- wrong or harmful content is live;
- errors spike after a deploy.

**Rollback procedure:**
1. In Cloudflare Pages → Deployments, choose the last good deployment → "Rollback". This takes about 1 minute and doesn't touch content history.
2. Open a `git revert` PR for the offending commit, so `main` matches what is live.
3. If a D1 migration was involved, only ever roll forward with a fix migration (migrations are additive per §4).
4. Write an incident note (§7).

**Backups:**
- **Content:** Git is the source of truth. A weekly Action mirrors `digital-advantage` to a second remote (e.g. GitLab or Codeberg, private mirror), and the export JSON is attached to a weekly release artifact.
- **D1:** a weekly `wrangler d1 export da-prod` → artifact kept for 90 days.
- **Corrections repo:** a monthly `gh` issue export to a private artifact (90 days).

**Restore drill (quarterly; before public launch):**
1. Restore the content mirror to a new repo and build it on a new Pages project.
2. Import the D1 export into a scratch database.
3. Confirm record counts and the latest content dates.
4. Record the result in `docs/drills.md`.

## 6. Scheduled jobs
| Job | Schedule (UTC) | Action |
|---|---|---|
| Freshness report | Daily 05:00 | Update the pinned public issue; open a needs_review PR for > 30 days overdue |
| Link check (lychee) | Weekly, Monday 03:00 | Update `link_check`; flag confirmed failures; summary in the freshness issue |
| Analytics retention | Daily 03:00 (Cron Trigger Worker or Action via the D1 API) | Delete per D-026 |
| Weekly metrics report | Monday 06:00 | Private issue in `da-corrections` (or a separate private `da-ops` repo) |
| Correction email redaction | Daily 04:00 | Redact emails from closed issues and from issues older than 90 days |
| Backups | Weekly, Sunday 02:00 | §5 |
| Dependency updates | Weekly | Dependabot PRs |
| Token rotation reminder | Every 80 days | Issue assigned to the maintainer |

## 7. Incident procedure
Severity levels:
- **SEV1:** site down, or harmful or wrong safety content live. Respond immediately.
- **SEV2:** a core journey is broken, or the correction form is down. Respond within 24 hours.
- **SEV3:** degraded or cosmetic. Handle at the next working session.

Steps:
1. **Acknowledge.** The technical maintainer is incident owner for code and infrastructure; the product owner for content.
2. **Mitigate:** rollback, set the record to needs_review with a notice, or disable the Function by removing its route.
3. **Communicate:** a short banner on the site for SEV1 longer than 1 hour, via a build flag `SITE_NOTICE`.
4. **Resolve.**
5. **Post-incident note** (blameless) in `docs/incidents/YYYY-MM-DD.md`: timeline, cause, fix, prevention.

**Security incidents** (for example, token leaked):
1. Revoke and rotate the token immediately.
2. Review the audit logs (GitHub and Cloudflare).
3. Assess data exposure.
4. If personal data was exposed, follow the legal obligations identified in D-027.

## 8. Periodic reviews
| Every | Review |
|---|---|
| Month | Freshness and metrics summary; solo-approval list; open corrections age |
| Quarter | Access review (who has write/admin; remove inactive users); restore drill; dependency major upgrades; `events.json` still minimal? |
| 6 months | Accessibility statement; privacy notice; decision register (any "Decision needed" left?); search synonyms vs. zero-result queries |

## 9. Handover package checklist (Gap Analysis §30.4)
- [ ] README (setup, scripts, architecture summary pointing to 11)
- [ ] `.env.example` / `.dev.vars.example` (from spec-assets/config/env.example)
- [ ] Schemas (`schemas/`) and the validator
- [ ] D1 migrations
- [ ] Seed data = `content/` (pilot catalogue) + `tests/fixtures`
- [ ] Tests and how to run them
- [ ] Deployment, rollback, backup and restore (this document)
- [ ] `docs/limits.md`, `docs/drills.md`, `docs/incidents/`
- [ ] Known limitations and deferred work (release notes)

## 10. V2.1 pipeline additions
- **CI step 4a** `bun run build:taxonomy`: regenerate the identity, needs and registry JSON from `spec-assets/taxonomy/source/*.txt` (port of `build_identity.py`). Fail if the regenerated output differs from the committed JSON (so editors commit both).
- **CI step 4b** `bun run validate:identity`: port of `validate_identity_layer.py` (0 errors required; warnings reported).
- **CI step 6a** `bun run test:identity-search`: identity and route queries in `search-test-set.json` must pass 100%.
- **Weekly link check:** now covers all registry `official_url` values (723, rate-limited per host). Results update `url_status`.
- **Monthly:** review `generated/who-uses-each-tool.json` for the 10 tools with the most identities but no full profile → profiling queue.

## 11. V2.2 pipeline and operations additions
- **CI step 4a (replaces the V2.1 step):** `bash spec-assets/generators/rebuild_all.sh` (port to `bun run build:taxonomy` when convenient). It regenerates identities (with ISCO-08), needs, registry, handwritten and generated roadmaps, lenses, skills and the occupations directory, then fails if any generated file differs from the committed one (TC-105).
- **CI step 4b:** `validate_identity_layer.py` now also gates ISCO-08 completeness (436/436), skills reachability (279/279 needs) and roadmap coverage (≥ 90%).
- **CI step 6a:** the identity harness runs 48 queries (identity, route, skill). 100% is required.
- **Nightly (R1.5):** generate the admin report (A01) from the analytics aggregates, `da-corrections` issues and the link-check results.
- **Day-to-day catalogue operations** (intake, routine, lifecycle, KPIs, hiring) are in **20 — Admin and Catalogue Operations Manual**.

## 12. V2.3 delivery rules (D-064; doc 22 §4)
- **Trunk-based:**
  - `main` is always deployable; merge = production deploy;
  - every PR gets a Cloudflare Pages preview URL, posted on the PR;
  - no long-lived branches.
- **Release cadence:** at least weekly (Friday). Urgent content fixes ship any day.
- **Rollback:** Cloudflare Pages → Deployments → "Rollback to this deployment" (≈ 1 minute), then revert the merge so `main` matches.
- **Feature flags:** `spec-assets/config/feature-flags.json` (build time) plus `FLAG_<NAME>` environment overrides (runtime, no deploy). Review flags monthly and remove those past their `review_by` date.
- **What's new:** on merge of a PR labelled `user-visible`, CI appends `{date, title, page, credit}` to `content/whats-new.json` (credit only if the issue carries `credit-consented`).
- **Repository setup** (copy `spec-assets/repo-templates/`):
  - licences;
  - CONTRIBUTING and the code of conduct;
  - issue forms, the PR template and labels;
  - the reference `ci.yml`.

  Enable branch protection (CI green + 1 approval), secret scanning and push protection.

## V2.5 additions
- **Spike S-1 first** (11, ADR-008): record build time, file count, bundle size, the CSP approach and Bun on Pages in `docs/limits.md` before Milestone B.
- **Prerender size:** the build writes an `.html` and a `.data` file per prerendered route. Check the host's current file and build-time limits against the full route list, and keep the beta on core routes plus the single-page fallback if needed. `public/_redirects` must serve `/__spa-fallback.html` (or the framework's fallback file) for unmatched paths while the fallback is in use.
- **CI additions:**
  - `python3 -I spec-assets/validate_feature_matrix.py .` (TC-130): fails the PR when the feature matrix is out of step.
  - `bash spec-assets/generators/rebuild_all.sh` now also builds `helpers.json` and validates it (TC-126).
  - `bun run test:components` (React Testing Library) runs with the unit tests.
  - `scripts/csp-hashes.ts` runs after the build; CI fails if any prerendered page has an inline script without a matching hash (TC-129).
- **Helpers are content:** adding or changing a helper is a PR to `helpers.txt` (20 §15). Turning one on for everyone is a change to the `listed` array of the `helpers` flag.
- **Rollback** is unchanged (one click in Cloudflare Pages); helper progress lives on devices and is not affected by a rollback. A schema change to `da.helper.v1` needs a new key version and a read-old, write-new migration in the app.

## V2.7 additions
The weekly job also lists profiles whose `checked_on` is older than 180 days and every profile still at `ai_draft` that is used in a kit. Publish the count of verified profiles on the admin report. Check the safety-panel links (EFCC, SEC, CBN, NAFDAC, NDPC) in the weekly link check.
