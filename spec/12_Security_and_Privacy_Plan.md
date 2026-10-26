# 12 — Security and Privacy Plan

> **V2.8 hosting correction (D-069 / 32):** hosting is Vercel + Neon. Where this document says Cloudflare, Pages, Workers, D1, KV or wrangler, read the Vercel equivalent in `32_V2_8_Pack_Corrections.md` §2. Product behaviour and privacy rules are unchanged.


**Version:** 2.5 · Applies to R1 as designed in 11. This plan does **not** claim legal compliance; launch-market legal review is D-027.

## 1. Assets and trust boundaries
| Asset | Sensitivity | Where |
|---|---|---|
| Published content | Public | Repo, CDN |
| Unpublished drafts | Low (public repo PRs are visible) | Repo branches. **Note:** draft PRs in a public repo are public. Sensitive research (e.g. reports about malicious tools) goes in the private repo. |
| Correction reports (may include an email) | Personal data | Private repo |
| Secrets: GitHub token, Turnstile secret, rate-limit salt, D1 binding | High | Cloudflare encrypted env vars |
| Aggregate analytics | Low | D1 |
| Repo write access | High (can publish) | GitHub |

## 2. Threat model (Gap Analysis §23)
| Threat | Applies? | Mitigation | Test |
|---|---|---|---|
| Spam and abuse of the correction form | Yes | Turnstile (server-verified), honeypot, 5/10 min rate limit, 8 KB body cap, schema validation, idempotency | TC-033, TC-053 |
| XSS via content | Yes (editors write JSON) | React escapes by default; **no `dangerouslySetInnerHTML`** on record fields (lint rule); Markdown pages rendered with raw HTML disabled; strict CSP in which every inline script (the theme script and the scripts prerendering emits) is covered by a build-time hash, never `unsafe-inline` | TC-054 |
| XSS via reports | Low (reports aren't rendered on the site) | Issue body built from escaped Markdown; GitHub sanitises too | TC-053 |
| Injection (SQL) | D1 events endpoint | Prepared statements only; event and dimension allow-lists | Unit |
| Broken access control | Repo publishing; private repo | Branch protection on `main` (PR + 1 approval + CI green + no force push); CODEOWNERS; 2FA required for org members; private repo limited to triagers | Manual audit (16 §8) |
| Session theft / insecure auth | No user sessions for anonymous visitors; for signed-in users (V2.6) HttpOnly Secure SameSite=Lax cookies, one-time codes with expiry and rate limits | GitHub accounts with 2FA for editors | — |
| CSRF | Corrections endpoint is cookieless | No cookies or ambient auth. Content-Type JSON required (not form-encodable), plus an Origin header check equal to SITE_URL | TC-053 |
| Open redirect | `_redirects` only (static) | Redirect targets must be internal paths (schema pattern `^/`) | Validator |
| Malicious external links | Linked tools/resources could be compromised | Official-source policy; weekly link check; `rel="noopener"`; corrections can trigger a 24 h takedown (07 §8) | TC-046 |
| SSRF | Link checker fetches arbitrary URLs | Runs in GitHub Actions (isolated, no internal network); https only; no credentials in that job; the Functions never fetch user-supplied URLs (the supporting_url is stored, never fetched) | Review |
| File-upload risks | No uploads | — | — |
| Secret exposure | Yes | Secrets only in CF env and GitHub encrypted secrets; `.dev.vars` git-ignored; secret scanning + push protection on; client bundle scanned in CI for token patterns | TC-056 |
| DoS | Static CDN absorbs most | Function rate limits; CF default DDoS protection | — |
| Excessive scraping | Content is CC BY and exported anyway | No mitigation needed; rate-limit the Functions only | — |
| Supply chain | npm dependencies | Committed `bun.lock` and `bun install --frozen-lockfile`; Bun does not run dependency lifecycle scripts unless a package is listed in `trustedDependencies` (keep that list empty or minimal, reviewed in PRs); Dependabot alerts; dependency audit in CI (fail on high/critical in runtime deps); minimal dependencies | TC-057 |
| Unauthorised editorial changes | Yes | Branch protection; CODEOWNERS; signed commits recommended; Git history is the audit log | Manual |
| Exposure of correction reports | Yes | Private repo; reference numbers only in public PRs; email redaction job | TC-058 |
| Exposure of account information | None for anonymous visitors; for signed-in users (V2.6) minimal fields, encryption in transit and at rest by the host, export and delete | — | — |

## 3. Minimum controls checklist (Gap Analysis §23.1)
- [ ] Server-side validation (JSON Schema) for all Function inputs; output encoding everywhere.
- [ ] Authorisation is not needed for public endpoints; GitHub permissions handle editorial access.
- [ ] Secrets in CF/GitHub secret stores; **GitHub token scoped to Issues: read/write on `da-corrections` only, 90-day expiry**.
- [ ] HTTPS only, with HSTS. Security headers per `spec-assets/config/_headers`. CSP has no `unsafe-inline` or `unsafe-eval`.
- [ ] Rate limits on both POST endpoints.
- [ ] Dependencies patched weekly; vulnerability scanning in CI.
- [ ] Logs exclude bodies, emails, tokens and IPs. Functions log only: route, status, error code, duration.
- [ ] Least privilege: contributors can't merge; triagers can't access the main repo admin settings.
- [ ] Backups and a tested restore (16 §5).
- [ ] Vulnerability reporting: `/.well-known/security.txt` pointing to the contact email; `SECURITY.md` in the repo.
- [ ] Incident handling: 16 §7.

## 4. Privacy data inventory (Gap Analysis §23.2)
| Data element | Why | Stored where | Access | Retention | Deletion | Third party | Notice/consent |
|---|---|---|---|---|---|---|---|
| Report: page, type, description, supporting URL | Fix the content | Private GitHub repo | Triagers, owner | Indefinite (no personal data expected; triagers redact any personal data found in descriptions) | Manual | GitHub (processor) | Privacy notice + form notice |
| Report: email (optional) | Follow up | Private repo issue | Triagers, owner | Until close or 90 days | Automated redaction | GitHub | Explicit consent checkbox |
| Turnstile signals | Bot protection | Cloudflare | Cloudflare | Per provider | — | Cloudflare | Privacy notice |
| Aggregate event counts | Product measurement | D1 | Owner, maintainer | 25 months | Scheduled | Cloudflare (processor) | Privacy notice; no cookies |
| Zero-result query text (normalised, redacted) | Find content gaps | D1 | Owner, maintainer | 90 days | Scheduled | Cloudflare | Privacy notice explicitly mentions it |
| Page-view analytics | Traffic, Core Web Vitals | Cloudflare Web Analytics | Owner | Per provider | — | Cloudflare | Privacy notice; cookieless |
| IP address | Rate limiting | Memory/KV as a salted hash, TTL ≤ 10 min | None | ≤ 10 min | TTL | Cloudflare | Privacy notice |
| Theme preference | Remember the visitor's choice | Visitor's browser only | Visitor | Until cleared | Visitor | None | Privacy notice (strictly functional) |
| Editor GitHub usernames | Public authorship history | GitHub | Public | Indefinite | — | GitHub | Contributor guidelines |

**Not collected from anonymous visitors:** names, accounts, cookies for tracking, advertising IDs, precise location, full search history.

**Privacy notice (S21) must state:**
- the table above in plain language;
- that there are no ads or tracking cookies;
- how to ask for report data to be deleted (email contact with the DA- reference);
- the controller's contact details (D-019/D-027).

## 5. Data subject requests
Because we hold almost no personal data:
- **Report-email deletion:** search the private repo for the reference or email, redact it, and confirm within 30 days.
- **Requests about analytics:** explain that no identifiers are held.

## 6. Legal review items (D-027, before public launch)
- Confirm the launch-market data-protection obligations (for example, the Nigeria Data Protection Act 2023 if the initial audience is in Nigeria; GDPR/UK GDPR if EU/UK users are targeted).
- Confirm that cookieless aggregate analytics without a consent banner is acceptable in those markets.
- Approve the privacy notice, terms of use and the CC BY 4.0 content licence statement.
- Confirm trademark use is nominative only (product names, no logos).

## V2.3 additions — contributions and beta
| Data | Purpose | Where | Shown publicly? | Retention | Lawful basis / control |
|---|---|---|---|---|---|
| Suggestion text, proposed text, source link | Improve the catalogue | Private `da-corrections` issue | Only as edited content after approval | Issue lifetime; reviewers delete personal data about others | Legitimate interest; licence notice on the form |
| Credit name (optional) | Thank the contributor | Issue + record credit line + S37/S38 | **Yes, with consent** | Until withdrawn | Consent (tick); withdrawal via the same form |
| Email (optional, flag `suggest_email`) | Reply to the contributor | Issue only | No | Until close or 90 days, whichever is first | Consent. **Off in the private beta** until the privacy notice is approved (D-027) |
| Conflict-of-interest flag | Transparency | Issue label | No | Issue lifetime | — |

**Controls:**
- **Reviewer duty:** remove any personal data about third parties from issues before acting on them.
- **Moderation:** decline abusive content; block repeat abusers by hashed IP within the rate-limit window only (no long-term IP storage).
- **Beta:** the whole site is `noindex` (flag `noindex_site`) and uses only aggregate analytics. Invite links carry no tracking parameters.
- **Public repository:** never commit `.env`, tokens, issue exports or anything from `da-corrections`. CI secret scanning is on (GitHub push protection).

## V2.5 additions — helpers and device storage
| Data | Where | Sent to a server? | Notes |
|---|---|---|---|
| Active helper, ticks, tools opened, "for someone" label | `localStorage` key `da.helper.v1` on the device | **Never** | Contains no identity slug. The label is free text the person types about someone else, so it never leaves the device and is not included in share links. "Clear my progress" removes it. |
| Aggregate helper events | D1 counters | Yes, aggregate only | `helper_started`, `helper_stage_completed`, `helper_panel_opened`, `helper_shared` carry the helper slug and stage number (or page kind or method) and nothing else. Helper pages are public content pages, so the slug is not a personal attribute. It is never joined with an identity or sector. Counts under 5 are hidden in reports (events.json global rules). |
- **Threat: shared device.** Someone using a shared device can see another person's helper progress. Mitigation: "Clear my progress" is one tap in the panel; the privacy page says progress is stored on the device.
- **Threat: inline-script CSP gap** from prerendered pages. Mitigation: build-time hashing (TC-129); no `unsafe-inline`.
- **Threat: label as a vector for abuse** (a label is displayed back only to the same person on the same device, as escaped text, max 40 characters).

## V2.6 additions — accounts, profile and trending
- **Two modes.** Anonymous: unchanged (aggregate counters only). Signed-in (optional, D-076): email, chosen identities, intents, market, stars, progress, stage outputs, outcomes, recommendation feedback and activity.
- **Consent.** Three separate switches, all off until chosen: save progress; use my profile to recommend; count me in trending. Withdrawing a switch stops that use.
- **Retention.** Activity kept 90 days; account data until the person deletes it; one-time codes expire in 10 minutes.
- **Rights.** Export (JSON) and delete in S46; requests by email are handled as in §5.
- **Trending.** Aggregates only, k ≥ 10 per row, no row shows who is counted.
- **Age.** Sign-in is offered to people 18 and over; no date of birth is collected.
- **Legal review (before public launch):** consent wording, lawful basis and retention under the Nigeria Data Protection Act 2023 (and GDPR where visitors are in the EU), cross-border transfer to the Postgres region, the age rule, and whether registration with the regulator is needed. This is a list of questions for counsel, not legal advice.

## V2.7 additions — profiles, safety and children
- **Preview label is a safety control (D-084).** Showing an unchecked price without the label could mislead someone into paying. The label cannot be switched off for unverified profiles (flag `tool_profiles`), and CI fails if it is missing.
- **Safety notes (D-087).** They state what to check and never certify. Wording is reviewed by a person before launch, jobs, money and kids first. Do not add affiliate or sponsor text to a panel.
- **Suggestions without tracking (D-089).** R9 to R12 use the page, the session or the on-device identity only. TC-166 verifies that nothing is stored for anonymous visitors.
- **Children (D-090).** Accounts are for adults. Do not collect a child's name, photo or school. The kids panel links to guidance on children's data under NDPA 2023. Counsel should confirm the age rule and the wording.
- **Reporting scams.** Panels point to official bodies (EFCC Eagle Eye, SEC Nigeria, CBN, NAFDAC, NDPC). Check each link in the weekly link check; agencies move pages.
- **No payments or personal data** are added by V2.7.
