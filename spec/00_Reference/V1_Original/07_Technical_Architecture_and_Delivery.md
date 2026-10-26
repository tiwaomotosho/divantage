# 07 — Technical Architecture and Delivery

## 1. Architecture goals
- Ship a fast responsive experience.
- Keep structured content separate from UI.
- Support search and editorial workflows.
- Make the public catalogue usable without accounts.
- Allow gradual introduction of personalisation and AI.
- Keep content portable and avoid unnecessary vendor lock-in.
- Support reliable backups and straightforward deployment.

## 2. Recommended logical architecture
1. **Presentation layer:** responsive web UI, accessible components, routing, metadata.
2. **Content layer:** structured records for tools, tasks, guides, resources, workflows, categories, and collections.
3. **Search layer:** indexed text and facets; optional semantic retrieval later.
4. **Editorial/admin layer:** authenticated content management, review queues, source records, version history.
5. **Monitoring layer:** uptime, errors, link checks, performance, and content freshness.
6. **Optional account layer:** bookmarks and learning progress, introduced when justified.
7. **Optional AI layer:** natural-language discovery grounded in published records with citations/links and clear uncertainty.

This is a logical model, not a mandate for a particular framework or hosting provider.

## 3. Technology selection criteria
Choose tools based on:
- developer capability and maintenance capacity;
- mobile performance;
- accessibility support;
- SEO and metadata support;
- content modelling and editorial workflow;
- search quality;
- security updates and ecosystem maturity;
- cost at expected scale;
- export and backup options;
- deployment and rollback simplicity.

Do not choose a stack solely because it is fashionable. Before implementation, confirm hosting, CMS, database, search, authentication, analytics, and budget decisions.

## 4. Content storage
Use a structured database or headless CMS that supports relationships, validation, drafts, review states, and exports. Store source references as structured data rather than burying them in prose.

Use stable IDs and slugs. Keep the public content model independent of the presentation framework so content can be reused in search, category pages, learning paths, and future applications.

## 5. Search implementation
MVP:
- full-text search;
- typo tolerance where supported;
- filters/facets;
- aliases and tags;
- query suggestions;
- relevance tuning;
- zero-result reporting.

Later:
- semantic search;
- query interpretation;
- AI-assisted refinement;
- recommendations based on declared preferences.

If semantic or AI search is unavailable, ordinary search must remain fully functional.

## 6. External links and monitoring
- Run scheduled link checks with sensible rate limits.
- Do not repeatedly hammer external websites.
- Record status, last checked time, and failure history.
- Treat temporary errors separately from confirmed removals.
- Send failures to an editorial queue.
- Respect robots, terms, and copyright.
- Do not scrape sites at scale without reviewing applicable terms and permissions.
- For YouTube or other video platforms, use permitted APIs or curated URLs; do not assume arbitrary crawling or downloading is allowed.

## 7. Security
- HTTPS everywhere.
- Secure admin authentication and role-based access.
- Server-side secrets only.
- Input validation and output escaping.
- Rate limits on public forms and search endpoints where needed.
- Secure headers and dependency updates.
- Backups with restore tests.
- Audit logs for editorial changes.
- Least-privilege access.
- Incident response and rollback documentation.

## 8. Privacy
Public browsing should not require personal data. If accounts are added:
- collect only what is needed;
- explain why each field is collected;
- provide account deletion and data export where applicable;
- document retention;
- protect personal data;
- do not sell user data;
- minimise retention of free-text searches;
- obtain appropriate consent for non-essential tracking where required.

Obtain legal/privacy review for launch markets and third-party integrations.

## 9. Analytics
Start with a small, documented event set:
- search submitted;
- filter applied;
- content page viewed;
- official external link clicked;
- tutorial opened;
- resource shared;
- correction submitted;
- optional learning-path started/completed.

Do not record passwords, private account data, or unnecessary sensitive text. Aggregate where possible. Define retention and access controls.

## 10. Deployment and operations
- Separate development, staging, and production environments.
- Use environment variables for configuration and secrets.
- Automated linting, type checks, unit tests, and critical end-to-end tests.
- Preview content before publishing.
- Back up database and assets.
- Test restoration.
- Maintain a release checklist and rollback path.
- Monitor errors and performance after launch.
- Document who owns incidents and content freshness.

## 11. Suggested build sequence
1. Validate information architecture with representative users.
2. Establish design tokens and component library.
3. Implement core content schemas.
4. Build home, search, category, tool, task, resource, and workflow pages.
5. Implement admin editing and review workflow.
6. Populate a high-quality starter library.
7. Run accessibility, responsive, security, and performance testing.
8. Launch to a small group of students and other target users.
9. Observe search gaps and usability issues.
10. Improve before expanding the catalogue aggressively.

## 12. Avoid premature complexity
Do not build accounts, social networking, elaborate gamification, or AI agents before the core discovery and content quality work. The initial system should be useful, fast, maintainable, and demonstrably reliable.
