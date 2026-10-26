# 09 — Master Prompt for an AI Coding Tool or Development Team

You are building **Digital Advantage**, a global, responsive digital discovery and learning platform. Treat this specification pack as the source of truth. Do not reduce the product to a generic landing page or an unstructured AI tools list.

## Mission
Help users discover digital tools, learn practical skills, and apply workflows to compete, grow, and scale. Start from the user's goal, then connect them to suitable tools, learning resources, and concrete steps.

## Required implementation behaviour
1. Read all specification files before implementation.
2. Identify unresolved decisions; list them clearly rather than silently inventing business facts.
3. Propose a maintainable architecture and explain trade-offs.
4. Build a working responsive web application, not only static mockups.
5. Implement the shared design system as reusable tokens and components.
6. Prioritise the home page, search, category pages, tool pages, task guides, resources, and workflows.
7. Implement accessible loading, empty, error, and success states.
8. Ensure the public library works without authentication.
9. Keep content structured and portable.
10. Include an editorial/admin workflow or clearly document the chosen CMS integration.
11. Do not fabricate tool data, prices, capabilities, official URLs, reviews, or testimonials.
12. If seed data is needed, use a small, clearly labelled illustrative dataset and mark unverified fields as unknown. Do not present examples as verified current recommendations.
13. Implement search that works without generative AI.
14. If AI discovery is implemented, ground answers in approved content and link to source records.
15. Respect reduced motion and target WCAG 2.2 AA.
16. Include automated tests for critical flows.
17. Provide setup, environment, migration, deployment, backup, and rollback documentation.
18. Do not expose secrets in client-side code.
19. Do not scrape or republish external tutorials without respecting source terms and copyright.
20. Do not claim the catalogue is exhaustive unless the data supports that claim.

## Visual direction
Vibrant learning adventure: expressive but mature, welcoming, colourful, high-quality, readable, mobile-first. Use purposeful animation and polished transitions, not gratuitous effects. Maintain clear hierarchy and ample whitespace. The product should not look like a formal conference website or a generic enterprise dashboard.

## Home page must include
- Brand and concise mission.
- Prominent “What would you like to achieve?” search.
- Example queries.
- Audience/path shortcuts that do not restrict the library.
- Category discovery.
- Practical tasks or playbooks.
- Trust/freshness explanation.
- Shareable deep links and useful footer information.

## Before declaring complete
- Run lint/type checks and tests.
- Check responsive layouts.
- Test keyboard navigation and reduced motion.
- Validate empty/error/loading states.
- Confirm search and deep links work.
- Verify no fake pricing or unsupported claims exist.
- Document what is implemented, what is stubbed, and what remains.
- Provide a list of files changed and exact commands to run the application.

## Definition of success
A new visitor can arrive with a practical goal, find relevant guidance, understand the available options and constraints, and take a useful next step without needing to understand the internal structure of the platform.
