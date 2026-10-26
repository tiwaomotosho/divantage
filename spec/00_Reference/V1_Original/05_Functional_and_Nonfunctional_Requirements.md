# 05 — Functional and Nonfunctional Requirements

## 1. Functional requirements

### Search and discovery
- FR-001: Users can search public content without an account.
- FR-002: Search indexes tools, tasks, guides, workflows, resources, learning paths, and collections.
- FR-003: Users can filter by content type, category, price model, platform, difficulty, and audience where data exists.
- FR-004: Search state is represented in the URL when practical, so searches can be shared.
- FR-005: Zero-result pages offer useful alternatives and ways to broaden the search.
- FR-006: Search must not require generative AI.
- FR-007: If AI-assisted discovery is implemented, recommendations must be grounded in published records and link to evidence.

### Content pages
- FR-008: Every published content record has a stable URL.
- FR-009: Tool pages display official links, use cases, pricing/access status when verified, limitations, related resources, and review date.
- FR-010: Changeable factual claims have source records and verification dates.
- FR-011: Unknown values are shown as unknown or omitted; they are not guessed.
- FR-012: External resources have a clear type and cost status where verified.
- FR-013: Related content is relevant and not simply random.
- FR-014: Discontinued products can be archived with an explanatory notice and alternatives.

### Sharing and SEO
- FR-015: Public pages provide descriptive page titles and social sharing metadata.
- FR-016: Share links work without requiring recipients to sign in.
- FR-017: Canonical URLs and redirects are maintained.
- FR-018: Public content is indexable according to editorial policy; admin/draft content is not.

### Personalisation (later release)
- FR-019: Users may select multiple interests without restricting the catalogue.
- FR-020: If accounts are implemented, users can save and remove bookmarks.
- FR-021: Learning progress is only shown when a reliable progress model exists.
- FR-022: Account deletion and data export processes are documented and implemented as applicable.

### Editorial/admin
- FR-023: Editors can create, edit, review, publish, update, and archive records.
- FR-024: Publishing validation checks required fields and source requirements.
- FR-025: Editorial changes record author, timestamp, and a change summary.
- FR-026: Review queues surface stale records and broken links.
- FR-027: Corrections can be submitted by visitors without exposing private admin tools.
- FR-028: Public contributions require moderation before publication.
- FR-029: Admin access is role-based and protected.
- FR-030: Content can be exported in a documented, portable format.

### Analytics
- FR-031: Measure useful product events with privacy-conscious settings.
- FR-032: Avoid collecting sensitive free-text search content unless necessary and clearly disclosed.
- FR-033: Analytics events and retention rules are documented.
- FR-034: Do not use deceptive consent patterns.

## 2. Nonfunctional requirements

### Performance
- NFR-001: Prioritise fast initial rendering on mobile connections.
- NFR-002: Optimise images, fonts, scripts, and third-party embeds.
- NFR-003: Load below-the-fold content progressively.
- NFR-004: Avoid blocking the main thread with heavy animations.
- NFR-005: Establish real performance budgets and test on representative low/mid-range devices and network conditions.

### Reliability
- NFR-006: Public pages should remain usable if optional analytics or AI services fail.
- NFR-007: Provide clear error and retry states.
- NFR-008: Back up content and test restoration.
- NFR-009: Monitor availability and critical failures after launch.

### Security and privacy
- NFR-010: Use secure transport and appropriate security headers.
- NFR-011: Validate and sanitise user input.
- NFR-012: Protect admin routes and secrets.
- NFR-013: Apply least privilege to administrative roles.
- NFR-014: Minimise personal data collection.
- NFR-015: Document third-party data flows and retention.
- NFR-016: Follow applicable privacy and data-protection obligations for launch markets.
- NFR-017: Never expose API keys or secrets in client code.
- NFR-018: Protect forms against spam and abuse.

### Accessibility and usability
- NFR-019: Target WCAG 2.2 AA.
- NFR-020: Core discovery and reading flows must work with keyboard navigation.
- NFR-021: Respect reduced-motion settings.
- NFR-022: Ensure layouts work at zoom and larger text sizes.
- NFR-023: Avoid colour-only status communication.

### Maintainability and portability
- NFR-024: Separate content from presentation.
- NFR-025: Use documented schemas and migrations.
- NFR-026: Keep content exportable.
- NFR-027: Automate tests for critical paths.
- NFR-028: Document setup, deployment, backup, and rollback.
- NFR-029: Avoid unnecessary vendor lock-in.
- NFR-030: Pin and update dependencies responsibly.

## 3. Error and edge cases
- Search service unavailable: show a clear error and retry; preserve query.
- No results: offer related categories and remove-filter action.
- Missing official URL: do not publish a tool as fully verified.
- Pricing source unavailable: mark pricing unknown and give review date.
- Broken tutorial: flag for editorial review and offer alternatives if available.
- Discontinued tool: show archive notice and relevant alternatives.
- External site unavailable: do not imply Digital Advantage controls that site.
- Anonymous visitor: retain full access to public content.
- Slow connection: prioritise text and essential controls; defer nonessential visuals.
- Motion reduction enabled: remove nonessential animated transitions.
