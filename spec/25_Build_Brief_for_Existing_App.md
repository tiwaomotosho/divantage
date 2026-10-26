# 25 — Build Brief for the Existing App (V2.6)

**Version:** 2.6 · **Audience:** whoever builds in the owner's repository (`github.com/tiwaomotosho/divantage`, Bun + Vite + React 19 + React Router 7, prerendered, on Vercel). **Status:** a brief, not code. No app is produced by this pack.

**Assumption to check first.** The paths below (`app/`, `src/lib/`, `content/`, `api/v1/`, `scripts/`, `tests/`, `docs/`) are assumed from the pilot's description. Map them to the real tree before starting; if they differ, change the paths, not the order.

## Step 0 — Fix the pilot's known issues (before any V2.6 work)
These were found in the earlier review of the pilot (section 7.2). Each is small and each blocks trust in what follows.
1. Cloudflare Turnstile **secret** must live only in server environment variables, never in client code.
2. CI must run **tests before deploy**, on the right branch.
3. Remove `|| true` from CI steps so failures fail the build.
4. **Escape** user-supplied text in suggestion/issue creation.
5. **Wire analytics** to the 47-event contract (`analytics/events.json`) instead of ad hoc calls.
6. **One content source**: the app reads generated JSON from the pack; no hand-copied lists.

> **V2.8 UI work:** copy `design/`, `tools/` and `CLAUDE.md` into the repo and `assets/` into `public/assets` (patch part with assets), then follow doc 29 §4. Build screens in the order 01, 04, 07, 11, 13/14, 10, 15, 03, then the rest.

## Step 1 — Content and generators (no UI)
1. Copy `spec-assets/taxonomy/` (goals, alternatives, intents, markets, availability), the 1,781-tool registry, `tool-profiles.json`, kits, goal links, safety and roadmaps into `content/` (V2.7: read doc 26).
2. Run `spec-assets/generators/rebuild_all.sh` in CI; fail on any validator error. Validators: identity, catalogue, goals, profiles, discovery, feature matrix.
3. Never edit generated JSON; edit `spec-assets/taxonomy/source/*.txt`.

## Step 2 — Public, no-account features (Beta)
Order: goals index and search (S42, S43) → intent chips → alternatives and availability on the tool page → device stars and My workbench (S45, local) → continue card. Each sits behind its flag (`goals`, `intent_chips`, `alternatives`, `stars`, `continue_card`). Acceptance: TC-133 to TC-141.

## Step 3 — Accounts (Launch, behind `accounts`)
1. **Spike S-2** (one day): Auth.js vs Clerk vs Supabase Auth; write the result as ADR-010.
2. Provision Postgres through the Vercel Marketplace (Neon). Run `db/0002_accounts_profiles_postgres.sql` on an empty database in a test project; fix any error; record it in the changelog. **It has never been executed.**
3. Build sign-in (S44) with email code + Google; the prompt rules in doc 24 §7.
4. Build profile, export, delete (S46). Consent switches default off.
5. Sync device stars and progress on sign-in. Acceptance: TC-142 to TC-145.

## Step 4 — Recommendations and trending (Launch)
1. Recommendation service implements R1–R8 exactly as doc 24 §9, with a "why" string per card. Unit-test every rule with fixtures.
2. `refresh_trending` runs daily (Vercel Cron). The page stays hidden until the activity gate is met.
3. Acceptance: TC-146 to TC-148.

## Step 5 — Retention loop
Stage outputs, the outcome prompt, suggestion status page, personal what's new. Acceptance: TC-149 and TC-150.

## Definition of done
`rebuild_all.sh` clean; all P1 tests pass; every `launch: true` flag is ON; `validate_feature_matrix.py` clean; counsel has reviewed consent wording (doc 12 §6).
