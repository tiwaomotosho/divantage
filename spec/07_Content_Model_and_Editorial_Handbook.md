# 07 — Content Model and Editorial Handbook

**Version:** 2.1 · **Authoritative schemas:** `spec-assets/schemas/*.schema.json` (JSON Schema 2020-12). **Reference validator:** `spec-assets/validate_catalogue.py`. **Examples:** `08_Starter_Catalogue/records/`.

## 1. Content types
| Type | ID prefix | Schema | Folder in repo | Release |
|---|---|---|---|---|
| Tool | `tool_` | tool.schema.json | `content/tools/` | R1 |
| Task (how-to) | `task_` | task.schema.json | `content/tasks/` | R1 |
| External resource | `res_` | resource.schema.json | `content/resources/` | R1 |
| Playbook | `pb_` | playbook.schema.json | `content/playbooks/` | R1 |
| Comparison | `cmp_` | comparison.schema.json | `content/comparisons/` | R1 |
| Collection | `col_` | collection.schema.json | `content/collections/` | R1.5 (reserved) |
| Static page | — | Markdown + frontmatter (title, description, updated_at) | `content/pages/` | R1 |
| Curation lists | — | `{ "items": ["id", …] }` | `content/curation/` | R1 |
| Redirects | — | redirects.schema.json | `content/redirects.json` | R1 |

**Exclusions.** A record is not created for:
- products with no confirmable official URL;
- products that only resell or wrap another tool without adding a distinct capability (link the original instead);
- content about regulated advice (medical, legal, investment) beyond pointing to official resources;
- adult, gambling or weapons tools;
- browser extensions or apps that require excessive permissions with no clear purpose.

## 2. Shared fields (every record)
| Field | Type | Rule | Public? |
|---|---|---|---|
| `schema_version` | const "2.0" | Bump on breaking schema change, with a migration script | No |
| `id` | string | Stable forever; prefix + snake_case | Yes (in exports) |
| `slug` | string | Unique per type; changes need `redirect_from` | Yes |
| `is_illustrative` | boolean | true = demo data; CI blocks it in production | No |
| `redirect_from` | slug[] | Old slugs → 301 to the current one | No |
| `sources[]` | Source | id, type, url, title, publisher, checked_at, supports[], quote (private), notes (private) | Yes, except private fields |
| `editorial` | object | status, author, reviewer, dates, interval, confidence, solo_approval, change_summary, public_corrections[], internal_notes (private) | Partly: last_verified_at, public_corrections |
| `disclosure.commercial_relationship` | const "none" | D-001 | Shown on S16 as policy, not per page |

Fields marked `x-visibility: private` in the schemas are stripped from the build output, record JSON endpoints and the export.

## 3. Type-specific fields (summary)
The full constraints (types, lengths, enums, required fields) are in the schema files. This table gives the intent of each field.

**Tool:**
- name, official_name, official_url (https), developer_or_publisher;
- summary (20–140 characters, plain language);
- description (120–1200 characters);
- category_ids (1–4), task_ids (≥ 1), audience_ids, skill_level;
- `pricing{model, verification_status, source_ids, checked_at, free_tier_details, trial_details, paid_plan_summary, costs_beyond_price, price_points[]}`;
- `platforms{values, verification_status, source_ids}`;
- deployment[], ai_involvement, availability_status, account_required;
- `open_source{is_open_source, licence (SPDX if verified), repository_url, source_ids}`;
- key_capabilities[], limitations[], privacy_notes[] and accessibility_notes[], each a sourced_text `{text, kind: fact|editorial, source_ids}`;
- best_for[], not_ideal_for[], learning_curve (editorial), getting_started[];
- region_availability, language_support;
- relations: resource_ids, alternative_tool_ids, comparison_ids, playbook_ids;
- search_aliases[].

**Task:**
- title (the visitor's question), short_title, family_id;
- problem_statement, expected_outcome, prerequisites[], difficulty;
- estimated_time{label, minutes_min/max, is_estimate:true};
- budget_note, device_note, low_bandwidth_note;
- steps[] `{n, title, instructions, tool_ids, expected_result, warning}`;
- recommended_tool_ids, alternative_methods, quality_checks, common_mistakes, privacy_or_safety_notes;
- relations; category_ids; audience_ids; search_aliases.

**Resource:**
- title, publisher, canonical_url, resource_type, summary, learning_outcome;
- language (BCP 47), cost_status, registration_required, estimated_duration, skill_level;
- prerequisites, limitations, publisher_updated_at;
- embed_policy (always link_only);
- `link_check{last_checked_at, last_status, consecutive_failures}`;
- related ids; replacement_resource_id.

**Playbook:**
- title, outcome, audience_ids, difficulty, estimated_duration;
- prerequisites, required_inputs, tool_ids, low_cost_alternatives[];
- steps[] `{n, title, purpose, instructions, tool_ids, expected_output, check, fallback, warning}`;
- verification (final check);
- total_cost_notes, privacy_notes, accessibility_notes, low_bandwidth_notes;
- success_criteria, common_failure_modes, troubleshooting[], example{input, output};
- relations.

**Comparison:**
- title, decision_question, tool_ids (2–3);
- rows[] `{dimension, cells{tool_id: {text, kind: fact|editorial|unknown, source_ids}}}`, 5–9 rows from the fixed dimension list;
- best_fit[] (one per tool), method_note.

## 4. Evidence policy (G22)
1. **Source types and what they may support** are defined in `vocabularies.json#source_type`. The validator enforces it: for example, an `independent` source can never be the only support for pricing, platforms, licence or availability.
2. **Hierarchy:**
   1. official pricing page;
   2. official site or docs;
   3. official changelog or status page;
   4. official repository or licence;
   5. reputable independent source (context only);
   6. community or tutorial (tips only).
3. **A fact needs a source.** Every `kind: fact` item cites at least one source checked within the record's review interval.
4. **Quote what you saw.** Add a short verbatim `quote` (private) to each source. This lets the reviewer check the claim without revisiting the page.
5. **Search snippets, AI answers and memory are not evidence.** Use them only to find the official page.
6. **Absence of evidence means `unknown`.** Never infer pricing, platforms or features from a product's name or category (V1 02 §5).
7. **Editorial judgements** (learning curve, best fit, "our view" limitations) are allowed. They are labelled `editorial`, must be reasonable and fair, and must not use superlatives ("best", "safest", "cheapest") without a defensible, stated basis.

## 5. Pricing policy (G21)
- Use the 10-value vocabulary. Labels shown to the public come only from `vocabularies.json`.
- **free:** the core use described costs nothing. If a trial exists, the model is not `free`; this is CI-enforced.
- **freemium:** a usable free tier exists. `free_tier_details` must state its main limits (quota, features, storage).
- **open_source:** source code available under a stated licence. If the licence is not OSI-approved (e.g. "fair-code"), set `is_open_source: false`, give the licence name and use `mixed` or another fitting model. n8n in the pilot catalogue is the worked example.
- **mixed:** use when editions differ materially, and explain in `free_tier_details`, `trial_details` and `paid_plan_summary`.
- **Price points are optional.** When given, each one needs plan, amount, ISO currency, period, region note, `is_promotional`, source and checked date. They are displayed with "shown {date} — may vary". If you can't verify the billing period, don't record a price point; describe the offer in `paid_plan_summary` instead (DaVinci Resolve Studio is the worked example).
- **costs_beyond_price:** use it for hosting, domains, hardware, data, transaction or API costs.
- **Unknown pricing** displays "Price not confirmed — check the official site". Never "Free".

## 6. Freshness lifecycle (G23)
Two fields plus one computed flag (D-008):

| Editorial status | Who can set it | Required checks |
|---|---|---|
| draft | Any contributor | None (not built for production) |
| in_review | Author (opening the PR) | CI passes: schema, integrity, link check on changed URLs, search test set, build |
| published | Approver, on merge | Review checklist §7 complete; reviewer set; `published_at` and `last_verified_at` set; `next_review_at` ≤ `last_verified_at` + interval |
| needs_review | Anyone via PR; automatically by jobs (2 consecutive link failures, overdue > 30 days, accepted correction pending) | Reason recorded in `change_summary`; a public notice is added if a material claim is affected |
| archived | Approver | `availability_status` = discontinued, or no longer useful; alternatives set; public correction note added |

Allowed transitions:
- draft → in_review;
- in_review → draft | published;
- published → needs_review | archived;
- needs_review → published | archived;
- archived → needs_review (to restore).

| Availability status | Set when | Public effect |
|---|---|---|
| active | Official site works and the product is offered | — |
| beta / limited | Stated by an official source | Notice |
| temporarily_unavailable | Official site down on 2 checks ≥ 24 h apart, or official status page says so | Notice; rank ×0.6 |
| discontinued | Official announcement, or site gone for 30+ days with no successor | Archive notice + alternatives; rank ×0.25 |
| unknown | Not yet verified | No notice |

**Review intervals:** the defaults are in D-023. Set `review_interval_days` per record; shorter is always allowed. `next_review_at` = `last_verified_at` + interval.

**Overdue:** the editor dashboard flags a record the day after its due date. The public notice appears after 30 days overdue (FR-041).

**Renaming or acquisition:** keep the `id`; update the name and slug (adding the old slug to `redirect_from`); add a `public_corrections` note such as "Renamed from X (date)". If a product is merged into another, archive it with an alternative pointing to the successor.

## 7. Editorial roles and review checklist (G24, G28)
| Role | Can | GitHub implementation |
|---|---|---|
| Product owner | Approve policy, taxonomy, decisions; publish | Admin; CODEOWNER for `/spec-assets/`, `/content/curation/`, `/02_*` |
| Editor / approver | Review and publish content | Write access + CODEOWNER for `/content/**` |
| Contributor / researcher | Draft content, open PRs | Fork or branch PRs; no merge rights |
| Technical maintainer | Code, CI, deploys | Write access; CODEOWNER for `/src/`, `/functions/`, `.github/` |
| Correction triager | Triage reports | Access to the private `da-corrections` repo only |

One person may hold several roles. Self-approval is allowed only in solo mode: it is labelled `solo-approval` and listed in the monthly report (D-024).

**Review checklist.** Paste this into the PR template; every box must be ticked before merge.
- [ ] Helps solve a defined task; the title is understandable to a beginner.
- [ ] Official URL confirmed and opens.
- [ ] Every `fact` has a source of an allowed type, checked within the interval, with a quote.
- [ ] Pricing label matches the evidence; free-tier and trial limits stated; no "free" for freemium or trial.
- [ ] Platforms and region verified, or left unknown.
- [ ] Limitations are honest and include at least one meaningful limitation.
- [ ] Editorial statements are labelled, fair and free of unsupported superlatives.
- [ ] Tutorials and resources work and are relevant.
- [ ] Related links are useful (no filler).
- [ ] Not a duplicate (validator name check plus a manual search).
- [ ] Plain, inclusive, non-promotional language; British spelling.
- [ ] Review date and next review date set.
- [ ] Viewed in the preview deployment on mobile width.

**Escalation.**
- **Disagreements:** the reviewer and author discuss in the PR. If they can't agree, the product owner decides and the reason is recorded in the PR.
- **Claims needing extra review:** privacy and security claims, accessibility claims, and anything about safety need the product owner's approval.

## 8. Corrections handling (G25)
1. **Intake.** Reports arrive as issues in the private repo, labelled `correction`, `type:{issue_type}` and `record:{id}`.
2. **Triage (target: 7 days, D-038).**
   - Label as `valid`, `duplicate`, `cannot-reproduce`, `out-of-scope` or `spam`.
   - Spam is closed without reply.
   - Contact details are never copied to the public repo.
3. **Verify.**
   - Check the claim against official sources.
   - A report is not evidence on its own (V1 06 §8).
   - Material errors (pricing, availability, safety) set the record to `needs_review` in a PR straight away.
4. **Fix.**
   - A content PR that references the private issue by its DA- reference only, never the reporter.
   - Add a `public_corrections` note for material changes ("Updated Zapier free-plan limits (21 Oct 2026)").
5. **Close.**
   - With an outcome label (`fixed`, `no-change`, `wont-fix`) and, if the reporter consented to contact, a short reply.
   - Contact details are redacted when the issue closes. An automated job also redacts the email from any issue 90 days after creation.
6. **Escalate.** Security or privacy issues (for example, a report that a listed tool is malicious) go to the product owner immediately. The record can be hidden by setting it to `needs_review` and adding a top notice within 24 hours.

## 9. Automated validation rules (G19.3)
These run in CI on every PR and nightly. Errors block merge; warnings are reported.

**Errors:**
- schema violations;
- duplicate id or slug;
- filename ≠ slug;
- a reference to a missing record;
- a self-reference as an alternative;
- step numbering not 1..n;
- a fact without a source;
- a citation of an unknown source;
- a source type not allowed for the claim kind;
- a pricing model ≠ unknown without an official source;
- `free` with trial details;
- platform values without a source, or marked unverified;
- a licence without a source;
- comparison cells that don't match the tool list;
- `next_review_at` beyond the interval;
- redirect loops;
- non-empty commercial disclosure.

**Production build only, also errors:**
- `is_illustrative: true`;
- overdue records (the build lists them; the release owner may override with a dated waiver in the PR).

**Warnings:**
- a source never cited;
- status draft or in_review (excluded from production);
- a possible near-duplicate name.

## 10. Rights and disclosure policy (G38)
- **Original text** is licensed CC BY 4.0 (D-025), with attribution "Digital Advantage".
- **Third-party content** is linked, never copied or embedded. The exception is short quotations used as evidence, which stay private.
- **No third-party logos or screenshots in R1** (D-037). Product names are used descriptively only.
- **Non-commercial statement** on S16: "Digital Advantage does not accept payment, sponsorship, affiliate commissions or free products in exchange for coverage or ranking. No company reviews our content before publication."
- **If D-001 ever changes,** V1 06 §9 applies in full before any commercial content ships, and the schema `disclosure` constant changes in a versioned migration.

## 11. AI-assisted content operations
AI tools may:
- suggest candidates;
- draft summaries from sources the editor has opened;
- propose classifications;
- detect duplicates;
- monitor pages for change.

AI tools may **not**:
- be cited as a source;
- set a record to published;
- add a fact without a human-checked source;
- write limitations that weren't verified or labelled editorial.

Records drafted with AI assistance name it in `editorial.author` (as the pilot records do) and need a human reviewer.

## 12. Templates
Copy a pilot record from `08_Starter_Catalogue/records/{type}/` and replace the values. A blank template must still pass schema validation once filled in; the fixtures in `spec-assets/fixtures/` show valid and invalid patterns.

## 13. V2.1 content types and rules (identity layer)
| Type | Source of truth | Schema | Editable by |
|---|---|---|---|
| Sector, family, identity | `spec-assets/taxonomy/source/identities.txt` → generated JSON | identity.schema.json | Product owner (taxonomy) |
| Need | `spec-assets/taxonomy/source/needs.txt` → `taxonomy/needs.json` | need.schema.json | Editors (PR); owner approves new needs |
| Tool registry entry | `spec-assets/taxonomy/source/registry.txt` → `08_Starter_Catalogue/registry/tools-registry.json` | registry-entry.schema.json | Editors |
| Roadmap | `records/roadmaps/{slug}.json` | roadmap.schema.json | Editors + educators |
| Lens (flagship) | `records/lenses/{roadmap}--{need}.json` | lens.schema.json | Editors + domain experts |

**Source formats** are documented at the top of each `.txt` file, one line per item, so non-technical editors can add a profession or need in a single line. CI regenerates the JSON and runs `validate_identity_layer.py`.

**Writing rules for the identity layer:**
1. **Identity labels:**
   - use the most common international title (British spelling);
   - put local and regional names in aliases (okada rider, keke rider, ajo collector, OAP);
   - avoid gendered titles (Chair, not Chairman) except where the alias is how people search.
2. **Need labels** start with a verb and describe an outcome ("Check drugs, doses and interactions"). No tool names in need labels.
3. **Tool fit order** within a need is editorial: best general fit first, considering cost-to-start, availability and learning curve. It is never sold (D-001, doc 19).
4. **Roadmap modules:**
   - an outcome starting "You can…";
   - 2–10 topics;
   - one practice task anyone can do with free or sample data;
   - estimated hours labelled as an estimate;
   - need tags that are honest (tag a module only if it is genuinely core for that need).
5. **Flagship lenses** must state *what is different* from generic use. If you can't say what's different, it shouldn't be a flagship lens. Extra modules carry the specific knowledge (formulas, standards, workflows) of the profession.
6. **No video-platform links** (D-043). Use official documentation or text resources in the resources collection.
7. **Safety-critical professions** (health, engineering, legal, aviation, finance): lenses must state the limits of the tool and when specialist, certified or approved systems are required. Examples:
   - "screening spreadsheet ≠ final casing design";
   - "machine translation ≠ consent";
   - "non-certified DICOM viewer ≠ primary diagnosis".
8. **Expert validation:** `expert_validation.status` moves pending → in_review → validated through a PR reviewed by a named practitioner. Their name, role and date are recorded with consent.
9. **AI-drafted guidance is allowed** (D-044) but must be labelled through `expert_validation` and must never include changeable factual claims about tools (prices, platforms) unless they are sourced in the tool's full profile.

## 14. V2.2 — catalogue operations
Day-to-day catalogue work (adding tools, professions, needs and skills; roadmap tiers and upgrades; the tool lifecycle; intake from searches and suggestions; KPIs) is specified in **20 — Admin and Catalogue Operations Manual**. The evidence and pricing policy in this handbook still governs every factual claim. Generated "standard" roadmaps are editorial guidance (labelled as such) and make no factual claims about the tool's pricing or availability.
