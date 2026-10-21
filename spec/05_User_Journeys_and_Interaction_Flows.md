# 05 — User Journeys and Interaction Flows

**Version:** 2.5 · Diagrams are Mermaid and render in GitHub. Screen IDs refer to `04`.

## 1. Search flow (Journeys B, C, D)
```mermaid
flowchart TD
  A[Visitor types in any search field] -->|>=2 chars| B{Index loaded?}
  B -- no --> C[Fetch /api/v1/search-index.json<br/>skeleton after 300 ms]
  C -->|fail| E[ErrorPanel: Try again / Browse categories<br/>query kept; error_shown]
  C -->|ok| D
  B -- yes --> D[Show up to 6 suggestions]
  D -->|choose suggestion| P[Detail page; search_result_opened from=suggestions]
  D -->|Enter / submit| F[S02 /search?q=... pushState; search_submitted]
  F --> G{Results after AND?}
  G -- yes --> H[Results + intent chips + filters]
  G -- no --> I{Results after OR?}
  I -- yes --> H2[Results + notice 'match some of your words']
  I -- no --> Z[Zero-result state; search_zero_results]
  H --> J[Apply filter; filter_applied; URL updated]
  J --> K{Any results?}
  K -- no --> L[Filters empty state: remove individual / all]
  K -- yes --> H
  H --> P2[Open result; search_result_opened]
  Z --> M[Did you mean / category tiles / Suggest coverage → S18]
```
**Back/Forward:** the result set, filters, tab and page are restored from the URL, and scroll position is restored by the browser. Typing uses `replaceState`; submit and filter changes use `pushState`.

## 2. Browse flow (no search) — Journey A (classroom QR)
```mermaid
flowchart LR
  QR[QR code → / ] --> H[S01 Home]
  H -->|Audience card| AU[S07 For students]
  H -->|Category tile| CA[S04 Category]
  H -->|Try something practical| T[S06 Task]
  AU --> T
  CA --> T
  T -->|Recommended tool| TO[S09 Tool]
  T -->|Share| SH[native share / copy link]
  TO -->|Visit official site| EXT[(Official site)]
```
**Rule:** no screen in this flow requires search, an account or JavaScript (except Share).

## 3. Tool discovery and decision — Journey C (free-tool seeker)
1. The visitor searches "free video editor". Cost intent is detected, so tools that can be started without paying are boosted and a chip offers "Only show options you can start without paying".
2. The visitor taps the chip. `cost=can-start-free` is applied, and paid-only tools disappear while the filter is on.
3. The visitor opens Shotcut (S09) and sees the "Open source" badge, "checked 21 Oct 2026", the platforms and the limitation "Desktop only".
4. They follow "Compare free video editors" to S14 and read the best-fit statements.
5. They click "Visit official site" (`official_link_clicked`).

**Acceptance:** at no point is a freemium or trial product labelled "Free" (V1 test 1).

## 4. Resource use
S06/S09 → ResourceCard (type, cost, sign-up shown before leaving) → S11 (optional) → "Open on {publisher}" → external.
- If the link is broken: S11 shows "This link may no longer work" and the replacement resource.
- The visitor can report the problem via "Report an issue", with `type=broken_link` prefilled.

## 5. Playbook completion — Journey D
```mermaid
flowchart TD
  S[S13 Playbook] --> B[Before you start: inputs & prerequisites]
  B --> St[Steps 1..n<br/>each: instructions → expected output → Check]
  St -->|Check fails| FB[Fallback / Troubleshooting accordion]
  FB --> St
  St --> V[Final check]
  V --> CL[Completion checklist]
  CL -->|all ticked| OK[Success message; playbook_checklist_completed]
  OK --> N[Next: related playbooks / share]
```
The checklist state lives in memory only and resets on reload. This is stated in small text under the checklist: "Ticks aren't saved."

## 6. Correction reporting
```mermaid
sequenceDiagram
  participant V as Visitor
  participant P as Content page
  participant F as /report (S18)
  participant API as POST /api/v1/corrections
  participant T as Turnstile verify
  participant GH as Private repo da-corrections
  V->>P: "Report an issue with this page"
  P->>F: /report?page=/tools/zotero&record=tool_zotero
  V->>F: choose type, details, (email + consent)
  F->>API: JSON body + turnstile_token (+ Idempotency-Key)
  API->>API: schema validation, honeypot, rate limit
  API->>T: verify token (server-side secret)
  T-->>API: success
  API->>GH: create issue (labels: correction, type:pricing, record:tool_zotero)
  GH-->>API: 201
  API-->>F: 201 {reference: DA-20261021-7K3Q}
  F->>V: S19 Thanks + reference
```
Failures follow the S18 error table. The issue body never includes the visitor's IP address.

## 7. Editorial operations — Journey F
```mermaid
flowchart TD
  D1[Discover candidate<br/>(research queue, zero-result queries, corrections)] --> D2[Check duplicates:<br/>search repo + validator name check]
  D2 --> D3[Research official sources<br/>record sources[] with quotes]
  D3 --> D4[Create JSON from template<br/>status: draft]
  D4 --> D5[Open PR, set status: in_review<br/>label: content]
  D5 --> CI{CI: schema + integrity + links + search test set + build}
  CI -- fail --> D4
  CI -- pass --> PV[Cloudflare preview deployment<br/>in_review visible with banner]
  PV --> R{Reviewer (≠ author when possible)<br/>uses Review checklist 07 §7}
  R -- changes --> D4
  R -- approve --> PUB[Author sets status: published, reviewer, published_at<br/>merge → production deploy]
  PUB --> SCH[next_review_at scheduled]
  SCH --> MON[Weekly jobs: link check + freshness report]
  MON -->|overdue / broken / correction| NR[status: needs_review]
  NR --> D3
  NR -->|discontinued| AR[availability: discontinued<br/>status: archived + alternatives]
```

## 8. Theme switching
1. On first load, an inline head script reads `localStorage['da-theme']` (in try/catch) and sets `data-theme` before first paint.
2. The toggle cycles through System → Light → Dark. It is a menu button with three radio options and announces "Theme: Dark".
3. If storage fails, the toggle still works for the current page.

## 9. V2.1 — Journey G: "Who are you?" (identity-first)
```mermaid
flowchart TD
  H[S01 Home] --> P{Who are you?}
  P -->|types 'rad'| SG[Suggestions: Radiologist, Radiographer, Radio Presenter…]
  SG -->|choose Radiographer| C1[Chip added; identity_selected sector=health]
  P -->|taps example chip 'Nurse'| C1
  C1 --> N[What would you like to do? need chips:<br/>View & analyse medical images · Structure radiology reports · Translate…]
  N -->|need chip| L[S28 /for/radiographer/radiant-dicom-viewer lens]
  C1 -->|Show my toolkit| T[S27 /for/radiographer]
  T --> NC[Need card → tool → 'How radiographers use…']
  NC --> L
  L --> M[Tick 'I can do this' on modules — device only]
  L --> SH[Explain this to someone → share/print]
```

## 10. Journey H: helping someone else
1. Turn on "I'm helping someone else".
2. "Who are you helping?" → "Farmer".
3. The toolkit page reads "Digital toolkit for Farmers" with the helper banner "Sharing with a farmer? Use the toolkit card below."
4. Choose Print or "WhatsApp text". The card lists 6 needs with one starter tool each and the first module to learn.
5. `toolkit_shared` fires (method only).

## 11. Journey I: tool-first cross-domain discovery ("clarity tool")
1. The visitor searches "canva" and opens S09.
2. **Who uses Canva** shows 19 sectors.
3. **Surprising uses** shows Pastors → worship media, Nurses → patient leaflets, Farmers → harvest price lists.
4. The visitor opens "Canva for farmers and agribusinesses" (S29).
5. They pick their own identity in the lens switcher and the path re-orders for them (S28).

## 12. Journey J: one person, several identities
A nurse who is also a content creator picks both. The toolkit shows tabs for **Nurse** and **Content creator** plus **Shared by both** (for example *Create clear patient information* ↔ *Short video*). Lenses from both identities appear in "Start learning".

## 13. V2.5 — Journey K: following a helper
```mermaid
flowchart TD
  A[Home: Who are you? or Or follow a guide] --> B{Helper chosen?}
  B -- from home card or S27 button --> C[S40 Helper page]
  B -- from S39 --> C
  C -->|Start| D[Helper becomes active on this device<br/>helper_started]
  D --> E[Open a step's tool: S09 tool page<br/>tool recorded as opened]
  E --> F[S41 pill follows on every page<br/>Where this fits on the tool page]
  F -->|Tap pill| G[Sheet: stage, next step, Open tool]
  G -->|Open next tool| E
  F -->|Back to S40| H[Tick 'You're done when' lines<br/>stage node fills]
  H -->|Last stage done| I[Quiet finish: share, other helpers]
  F -->|Pause| J[Pill hidden, progress kept, Resume in header]
  F -->|Clear my progress| K[All helper keys removed]
```
**Rules:** progress never leaves the device (FR-069); no streaks, points or badges; the helper never blocks navigation (the person can ignore the pill).

## 14. Journey L: starting a helper for someone else
`S40 [Start for someone else]` → optional label ("for Mum", device only) → the helper runs as in Journey K → [Share] sends a link to the helper page (no label) or the WhatsApp text (≤ 1,000 characters) → the friend opens the link and starts their own helper. The same screens serve both journeys; only the pill's wording changes ("for {label}").
