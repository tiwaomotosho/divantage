# 02 — Information Architecture and Content Model

## 1. Primary navigation
Keep the primary navigation compact:
- **Discover** — tools, tasks, categories, industries, and collections.
- **Learn** — tutorials, courses, guides, and learning paths.
- **Playbooks** — multi-step workflows and practical systems.
- **Projects** — exercises and applied examples (may launch later).
- **About** — mission, editorial standards, and facilitator/initiative background.

Persistent global elements:
- Search.
- Explore categories.
- Optional saved items/account entry.
- Theme preference if supported.
- Clear footer links for editorial policy, privacy, accessibility, contact, and corrections.

On mobile, use a compact header and a menu/drawer. Do not hide the most important search action behind a menu.

## 2. Main content types
1. **Tool** — a product or service that helps complete one or more tasks.
2. **Task** — a user goal, e.g. remove an image background.
3. **Guide** — an explanatory or step-by-step resource.
4. **External resource** — a tutorial, course, video, official documentation, or article.
5. **Workflow / Playbook** — a sequence combining tasks and tools.
6. **Learning path** — an ordered set of resources aimed at a capability.
7. **Project / Challenge** — a practical activity with an objective and success criteria.
8. **Category** — a navigable classification.
9. **Audience profile** — a discovery lens, not a permissions boundary.
10. **Industry** — a context in which tools/tasks are used.
11. **Collection** — an editorially curated set of resources.
12. **Comparison** — a structured evaluation of similar tools.
13. **Editorial update** — a record of changes, corrections, and review decisions.

## 3. Taxonomy dimensions
Use multiple facets instead of one rigid tree. A tool can belong to multiple categories and support multiple tasks.

### Functional domains
- AI assistants and intelligent tools.
- Graphic design and visual communication.
- Video production and editing.
- Audio, voice, and music.
- Writing and publishing.
- Research and information discovery.
- Office productivity and documents.
- Data, analytics, and visualisation.
- Coding and software development.
- Websites, ecommerce, and digital presence.
- Marketing, sales, and customer acquisition.
- Business operations and management.
- Education and personal development.
- Career development and employment.
- Collaboration and communication.
- Automation and integration.
- Digital security, privacy, and accessibility.
- Everyday digital life.
- Industry-specific technology.
- Emerging technologies.

### Additional facets
- Task supported.
- Audience/role.
- Industry.
- Skill level: beginner, intermediate, advanced.
- Price model: free, freemium, free trial, paid, open source, enterprise/quote-based, unknown.
- Platform: web, Windows, macOS, Linux, Android, iOS, browser extension, API.
- Deployment: hosted, self-hosted, desktop, mobile, hybrid.
- AI involvement: core AI, optional AI, no AI/unknown.
- Language and region support where verified.
- Accessibility features where verified.
- Data sensitivity suitability, where evidence exists.
- Last-reviewed status.
- Editorial confidence/status.

## 4. Core content relationships
- A tool supports many tasks.
- A task can be solved by many tools.
- A tool may have many alternatives.
- A guide may explain a task or tool.
- A resource may support several guides or learning paths.
- A workflow consists of ordered steps; each step may reference tools, tasks, inputs, outputs, and checks.
- A learning path contains ordered or optional resources.
- Categories and industries can be assigned to many content records.
- A collection can contain any approved content type.
- Every record has a canonical slug and stable internal ID.

## 5. Tool record schema
Required fields:
- `id` — stable unique identifier.
- `name`.
- `slug`.
- `one_line_summary`.
- `description`.
- `official_url`.
- `primary_category_ids`.
- `task_ids`.
- `pricing_model` (controlled vocabulary).
- `pricing_source_url` when price claims are made.
- `last_verified_at`.
- `editorial_status` (draft, in_review, published, needs_review, archived).
- `created_at`, `updated_at`.

Recommended fields:
- `developer_or_publisher`.
- `logo_asset` (only where permitted).
- `screenshots` (only with appropriate rights).
- `platforms`.
- `deployment_types`.
- `key_capabilities`.
- `best_for`.
- `not_ideal_for`.
- `limitations`.
- `free_tier_details`.
- `paid_plan_summary`.
- `trial_details`.
- `open_source_status` and repository URL when applicable.
- `account_required`.
- `region_availability`.
- `language_support`.
- `privacy_notes` with source.
- `accessibility_notes` with source.
- `tutorial_resource_ids`.
- `alternative_tool_ids`.
- `comparison_ids`.
- `source_records`.
- `review_interval_days`.
- `confidence_level`.
- `correction_notes`.

Never infer pricing or feature availability from a tool's name or category. Use `unknown` when not verified.

## 6. Task record schema
- `id`, `name`, `slug`, `plain_language_question`.
- `problem_statement`.
- `expected_outcome`.
- `prerequisites`.
- `difficulty`.
- `estimated_time` (label as estimate).
- `budget_constraint`.
- `device_constraint`.
- `step_by_step_method`.
- `recommended_tool_ids`.
- `alternative_methods`.
- `quality_checks`.
- `privacy_or_safety_notes`.
- `related_task_ids`.
- `resource_ids`.
- `last_reviewed_at`.

## 7. External resource schema
- `id`, `title`, `canonical_url`, `publisher`.
- `resource_type` (official docs, video, course, article, community, template, other).
- `summary`.
- `language`.
- `cost_status` (free, freemium, paid, subscription, unknown).
- `registration_required` (yes, no, unknown).
- `estimated_duration` when known.
- `skill_level`.
- `related_tool_ids`, `related_task_ids`, `related_guide_ids`.
- `source_checked_at`, `last_link_checked_at`.
- `editorial_status`, `quality_notes`.

## 8. Workflow/playbook schema
- `id`, `title`, `slug`, `outcome`.
- `audiences`, `difficulty`, `estimated_duration`.
- `required_inputs`.
- `steps[]` containing order, purpose, instructions, tools, expected output, validation check, fallback.
- `total_cost_notes`.
- `privacy_notes`.
- `success_criteria`.
- `common_failure_modes`.
- `related_resources`.
- `last_reviewed_at`.

## 9. Search behaviour
Search should cover titles, summaries, tasks, aliases, categories, and curated keywords.
- Support common-language queries and spelling variants.
- Rank exact title/task matches above broad matches.
- Consider user-selected budget, platform, level, and audience facets.
- Show why a result matches when helpful, e.g. “Free tier”, “Android app”, “Beginner guide”.
- Provide spelling suggestions and related searches.
- Offer helpful empty states and allow users to broaden filters.
- Do not let selected audience profile exclude otherwise relevant results.
- Track zero-result queries in aggregate, privacy-conscious analytics.

## 10. URL and SEO conventions
- Stable, readable slugs.
- Canonical URLs for each public record.
- Descriptive titles and summaries.
- Open Graph/social metadata.
- Breadcrumbs on deeper pages.
- Structured data only when accurate and appropriate.
- No duplicate thin pages generated solely to capture keywords.
- Preserve redirects when slugs change.
- Never publish private admin or draft URLs in search indexes.

## 11. Editorial states
`draft → in_review → published → needs_review → published/updated`  
Records may also be `archived` when discontinued or no longer useful. Keep an archival record so inbound links can explain the status and suggest alternatives.
