# 10 — API Specification

**Version:** 2.1 · **Machine-readable contract:** `spec-assets/api/openapi.yaml` (OpenAPI 3.1). Request bodies reference the JSON Schemas.

## 1. Shape of the R1 API
R1 is a static site, so most "read" operations are static files generated at build time. Only three operations run server code (Cloudflare Pages Functions).

| Operation (Gap Analysis §21.1) | How it is served | Auth | Cache |
|---|---|---|---|
| Search content | Client-side MiniSearch over `GET /api/v1/search-index.json` | None | 5 min + SWR 1 day |
| Browse categories / tasks / tools | Static HTML pages (S03–S08); data in page | None | CDN default for HTML (revalidate on deploy) |
| Retrieve tool / task / resource / playbook / comparison | Static HTML + `GET /api/v1/records/{type}/{slug}.json` | None | 5 min + SWR 1 day |
| Retrieve related content | Precomputed at build into each record JSON as `related{}` (ids + titles) | None | as above |
| Retrieve collections | R1.5 | — | — |
| Full export | `GET /export/catalogue-v2.json` | None | 1 hour |
| Submit correction | `POST /api/v1/corrections` (Function) | None + bot check | `no-store` |
| Analytics event | `POST /api/v1/events` (Function) | None | `no-store` |
| Health | `GET /api/v1/health` (Function) | None | `no-store` |

**Pagination, sorting and filtering** for search happen client-side on the index (search-config `pagination`, `facets`). Static list pages are not paginated in R1. Lists over 60 items get letter jump-navs; if any list exceeds 200 items, add static pagination `/tools/page/{n}`.

**Public-field rule:** the build strips `x-visibility: private` fields, records whose `editorial_status` is draft or in_review (production), and `editorial.author`/`reviewer` (shown only as "Reviewed by the Digital Advantage editorial team"). A test (TC-052) scans all built JSON for the strings `internal_notes`, `"quote"` and `"notes"`.

## 2. POST /api/v1/corrections — behaviour
**Order of checks.** Any failure stops processing and returns the Error schema.

| # | Check | Failure response |
|---|---|---|
| 1 | Method is POST | 405 |
| 2 | `Content-Type: application/json` | 415 |
| 3 | Body ≤ 8 KB | 413 |
| 4 | JSON parses | 400 `invalid_body` |
| 5 | Honeypot `website` empty | **201 with a fake reference.** Silently discarded so bots learn nothing. |
| 6 | Schema valid | 400 `invalid_field` with `field` |
| 7 | `page_url` is a same-site path | 400 `invalid_field` |
| 8 | Rate limit: 5 per 10 min per hashed IP | 429 `rate_limited` + `Retry-After` |
| 9 | Turnstile verified server-side (secret never sent to the client) | 403 `bot_check_failed` |
| 10 | Idempotency-Key seen in the last 24 h | 201 with the original reference |
| 11 | Create GitHub issue (timeout 8 s, 1 retry on 5xx) | 502 `upstream_unavailable`, `retryable: true` |
| 12 | Success | 201 `{ ok: true, reference }` |

**Issue format.** The title is `[{issue_type}] {record_id or page_url}`. The body is Markdown built from **escaped** fields:
- page, record, type, description, supporting URL;
- contact email, only if consent is true;
- reference, user agent family (e.g. "Chrome/Android"), timestamp.

Labels: `correction`, `type:{issue_type}`, `record:{id}`, `status:new`. **Never** include IP addresses, full user agents or headers.

**Reference format:** `DA-{YYYYMMDD}-{4 chars base32}`, generated server-side and stored in the issue body for lookup.

## 3. POST /api/v1/events — behaviour
- Accept only event names and props defined in `analytics/events.json`. Unknown props are dropped; unknown events are ignored.
- **Normalise the query string:**
  1. NFKC;
  2. lowercase;
  3. trim;
  4. collapse whitespace;
  5. redact email/phone patterns;
  6. truncate to 80 characters.
- Upsert into D1 `event_counts` with the dims (allowed `aggregate_by` props, sorted JSON).
- Always respond 204, even for invalid input (no oracle), except 429 for rate limiting (60 per minute per hashed IP).
- If the D1 write fails, log it and still return 204.

## 4. GET /api/v1/health
Returns `{status:"ok", build:"<git sha>", content_built_at:"<iso>"}`. It does not touch D1 or GitHub; it only proves the Function runtime and deployment are up.

## 5. External services (Gap Analysis §21.3)
| Service | Purpose | Data sent | Retained by service | Dependency if down | Cost assumption | Privacy notes | Replacement |
|---|---|---|---|---|---|---|---|
| Cloudflare Pages + Functions | Hosting, CDN, 3 functions | HTTP requests | Provider logs | Site down (mitigation: static rollback, uptime alert) | Free tier expected to suffice at launch; confirm limits | Data processor for request metadata | Netlify, Vercel, any static host + functions |
| Cloudflare D1 | Aggregate counters | Event name + aggregate dims | Until our retention jobs delete | Analytics lost for that period; site unaffected | Free tier expected | No personal data | SQLite on any host, or drop analytics |
| Cloudflare Web Analytics | Cookieless page views, Core Web Vitals | Page URL, referrer, UA-derived data, per provider | Per provider | No page-view stats | Free | Disclose in privacy notice | Plausible, Umami, GoatCounter |
| Cloudflare Turnstile | Bot check on the correction form | Browser signals, per provider | Per provider | Form shows the email fallback | Free | Disclose in privacy notice | hCaptcha, honeypot + rate limit only |
| GitHub (public repo) | Code, content, PR review, CI (Actions) | Content | Indefinite | No publishing; the site stays up | Free for public repos | Contributor usernames are public | GitLab, Codeberg |
| GitHub (private repo) | Correction reports | Report fields | Until deleted; email redacted | Corrections API returns 502; email fallback shown | Free | Contains optional emails: restrict access | Any issue tracker, D1 table |
| Font & icon packages (npm) | Self-hosted fonts and icons | None at runtime | — | — | Free (OFL/ISC) | No third-party font requests | — |
| lychee (in GitHub Actions) | Link checking | HEAD/GET to external URLs | — | Freshness report delayed | Free | Identify with a UA string and contact URL; rate-limited | Any link checker |

## 6. Versioning and deprecation
- `/api/v1` is stable for R1–R1.5. Additive JSON fields are non-breaking.
- Removing or renaming fields requires `/api/v2`. v1 stays available for at least 6 months afterwards, sending `Deprecation: true` and `Sunset` headers.
- Export files are versioned by name (`catalogue-v2.json`).

## 7. V2.1 static read endpoints
| Path | Content | Size budget (gzip) | Cache |
|---|---|---|---|
| `/api/v1/identities-index.json` | MiniSearch index for identities: slug, label, aliases, parent label, family label, sector label, kind | ≤ 60 KB (V2.2: ~49 KB with family labels inline, ~41 KB with numeric family/sector refs, the recommended form) | 1 day + SWR |
| `/api/v1/identities/{slug}.json` | Identity with resolved needs (core/sector/universal) and lens links | ≤ 8 KB | 5 min + SWR |
| `/api/v1/needs/{slug}.json` | Need with tools (registry fields + profile summary if profiled) and identities by sector | ≤ 20 KB | 5 min + SWR |
| `/api/v1/roadmaps/{slug}.json` | Roadmap with modules | ≤ 10 KB | 5 min + SWR |
| `/api/v1/lenses/{roadmap}--{need}.json` | Lens with composed path | ≤ 10 KB | 5 min + SWR |
| `/api/v1/tools/{slug}/who-uses.json` | Identities grouped by sector, plus surprising uses | ≤ 15 KB | 5 min + SWR |
| `/export/identity-layer-v2.1.json` | Full export of sectors, families, identities, needs, registry, roadmaps and lenses (CC BY 4.0) | — | 1 h |

No new write endpoints. Identity never appears in any request body or URL query sent to Functions (FR-054).

## 8. V2.2 additions
| Path | Content | Size budget (gzip) | Cache |
|---|---|---|---|
| `/api/v1/skills-index.json` | Skills type-ahead: slug, label, group, keywords, top tool names | ≤ 15 KB (~6 KB) | 1 day + SWR |
| `/api/v1/skills/{slug}.json` | Skill with level descriptors, needs, ranked tools, roadmaps and identity counts by sector | ≤ 15 KB | 5 min + SWR |
| `/export/occupations-v2.2.csv` | The occupations directory (18 §19), CC BY 4.0 | — | 1 h |

**Corrections endpoint changes (additive, non-breaking):**
- `issue_type` gains `suggest_tool`, `suggest_identity`, `suggest_need`, `suggest_helper` (V2.5), `roadmap_feedback` and `tool_discontinued`.
- `record_id` also accepts `id_`, `need_`, `rm_`, `lens_` and `skill_` ids (schema updated).
- Issues are labelled `type:{issue_type}`. Suggestion types also get the `suggestion` label so the admin can filter them (20 §3).

## 9. V2.3 changes (additive)
**`POST /api/v1/corrections` is also the Suggest-an-edit endpoint** (22 §3). The schema `correction-request.schema.json` adds:
- `proposed_text` (≤ 2,000 characters);
- `conflict_of_interest` (boolean);
- `credit_name` (≤ 60 characters; no `<>@` or newlines);
- `credit_consent` (must be true if `credit_name` is present).

The schema also requires `supporting_url` for `pricing`, `feature`, `availability` and `tool_discontinued`.

**Issue body additions:**
- proposed text;
- the "Conflict of interest: yes" line;
- the credit name and consent, only when consented.

**Labels added:**
- `suggestion` (for the `suggest_*`, `roadmap_feedback` and `tool_discontinued` types);
- `conflict-of-interest`;
- `credit-consented`.

**Static additions:**
| Path | Content | Cache |
|---|---|---|
| `/api/v1/whats-new.json` | Weekly entries: date, title, page, credit (consented only) | 5 min + SWR |
| `/api/v1/flags.json` | Public flag values for client islands (no secrets) | 1 min |
