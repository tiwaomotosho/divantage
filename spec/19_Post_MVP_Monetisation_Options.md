# 19 — Post-MVP Monetisation Options (exploratory)

**Version:** 2.1 · **Status:** Decision needed after MVP (D-050). **The MVP stays fully free and non-commercial (D-001).** This document only prepares the thinking, so the MVP is built in a way that doesn't block good options later.

## 1. Principles any model must keep
1. **The map stays free.** "Who are you?", identity toolkits, needs, tool pages, the "who uses this" views and roadmap outlines stay free forever. That free layer is the clarity tool and the reason people trust and share Digital Advantage.
2. **Never sell rankings.** Fit order inside a need and lens content can't be bought. Any sponsored placement is labelled, separate and optional (V1 06 §9).
3. **Never sell personal data.** Paid features may store data only for the paying user's benefit, under a clear privacy notice.
4. **Pay for depth, convenience and outcomes, not for access to basic knowledge.**

## 2. What the MVP lets people taste (all free)
- Every identity toolkit, need and lens.
- Every roadmap outline, with in-browser "I can do this" ticks.
- Starter projects, pitfalls and "explain this to someone" cards.
- Search, sharing, printing and toolkit cards.

## 3. Candidate paid features
| Feature | Free tier | Paid tier idea | Why people would pay | Dependencies |
|---|---|---|---|---|
| **Account and progress sync** | Ticks saved on one device | Progress across devices, history, streak-free milestones | Serious learners | Accounts (R2) |
| **Guided learning plans** | Outline + starter project | A week-by-week plan from your identity, level and hours per week; reminders | Turns intent into habit | Accounts, notifications |
| **Practice packs** | One practice task per module | Downloadable datasets, templates, solution walkthroughs per lens (e.g. a drilling survey dataset, a clinical-audit template) | Saves hours; job-relevant | Content production |
| **Skill check-ins and certificates of completion** | Self-ticks | Short assessed tasks reviewed by peers or experts; shareable certificate stating exactly what was assessed (never implying accreditation) | Career signalling | Assessment design, moderation |
| **Grounded AI coach** | — (AI is R2) | Ask questions answered *only* from Digital Advantage content with links; personalised to your identity | Convenience | AI layer, safety review |
| **Teams and organisations** | Public toolkits | Organisation workspace: assign roadmaps to staff by role, track completion, add internal tools and policies | Training budgets exist here | Accounts, admin UI |
| **Institution licences** | — | Schools, universities, churches and mosques, professional bodies, NGOs, government programmes: branded spaces and reporting | Mission-aligned revenue | Same as teams |
| **Expert sessions** | Expert-validated content | Paid live clinics with validated practitioners ("Excel for drilling engineers: live") | Access to people | Expert programme |
| **Offline packs** | Print toolkit card | Downloadable offline bundles of lenses/roadmaps for low-connectivity users | Real need in many markets | PWA/offline build |

## 4. Candidate business models
| Model | How it works | Fit with principles | Risks |
|---|---|---|---|
| Freemium individual | Free map + paid "Pro" (sync, plans, practice packs, AI coach) | Good | Low conversion if Pro value isn't clear |
| B2B / institutional | Organisations pay per seat or per programme | Very good: users stay free | Sales effort; admin features needed |
| Grants and sponsorship of public good | Foundations or development partners fund identities/sectors (e.g. "Health workers' digital skills") with disclosure | Good if editorially independent | Funding cycles; perception |
| Clearly labelled sponsored placements | Vendors pay for a labelled "Featured" slot *outside* fit order | Acceptable only with strict separation | Trust erosion if overdone |
| Affiliate links | Commission on referrals | Weakest fit (incentive to push paid tools) | Bias perception; disclosure burden |

**Recommended direction to test first (not decided):**
1. **Institutional licences**, because organisations already pay for training and users stay free.
2. **Practice packs and guided plans** as individual Pro, because they are the most tangible value.

Avoid affiliate links unless a strong independence policy and audit exist.

## 5. How much should free give? (starting hypothesis to test)
- **Free:** 100% of discovery and every outline; one practice task per module; local progress; print/share.
- **Pro:** practice packs, cross-device progress, guided plans, AI coach, certificates.
- **Organisation:** everything in Pro for members, plus admin, assignments, reporting and custom content.

## 6. What the MVP must do now so these remain possible
- Keep stable IDs for identities, needs, roadmaps, modules and lenses (done in V2.1). Future progress, plans and practice packs key off them.
- Keep the `disclosure` field in schemas (constant "none" while D-001 stands) so commercial disclosure can be added by migration.
- Record anonymous, aggregate demand signals (identity sector, need chips, lens views, toolkit shares) to show which sectors would value paid depth.
- Don't build payment, accounts or gating in the MVP.

## 7. Decisions needed after MVP (D-050)
1. The individual Pro scope and price test (by market; local pricing matters).
2. Whether to pursue institutional licences first, and which sector to start with.
3. The sponsorship and independence policy text, if any sponsorship is accepted.
4. Payment providers by launch market.
5. The certificate wording and assessment standards.
