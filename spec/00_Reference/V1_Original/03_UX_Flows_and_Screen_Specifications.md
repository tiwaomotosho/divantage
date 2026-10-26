# 03 — UX Flows and Screen Specifications

## 1. Global UX direction
The experience should feel like a vibrant learning adventure: lively, welcoming, and rewarding, but not childish or visually noisy. It should feel independent of a conference or a formal institution. Every page should be useful as a standalone entry point from a shared link or search engine.

## 2. Home page
### Desktop layout
1. **Header:** wordmark, Discover, Learn, Playbooks, Projects (if live), About, search icon/input, optional saved-items control.
2. **Hero:** strong headline, short explanatory copy, large search field.
3. **Quick-start prompt:** “What would you like to achieve?” with example queries.
4. **Choose a path:** audience cards (student, professional, business owner, creator, job seeker, exploring).
5. **Explore capabilities:** colourful category tiles with distinct icons/illustrations.
6. **Try something practical:** curated starter tasks/playbooks.
7. **Popular and recently reviewed:** editorially selected resources; do not fabricate live popularity.
8. **How it works:** Discover → Learn → Apply → Grow.
9. **Trust statement:** explain sourcing, pricing labels, and review dates.
10. **Footer:** about, editorial standards, corrections, privacy, accessibility, contact.

### Mobile layout
- Compact header with wordmark and menu.
- Search is visible early and spans the available width.
- Hero copy is short.
- Audience cards become a horizontal scroll row or a two-column grid; never require horizontal scrolling for essential content.
- Category cards use a responsive grid.
- Reduce decorative animation and preserve fast rendering.
- Avoid a giant full-screen hero that pushes all useful content below the fold.
- Primary interactions should be reachable with one hand where practical.

### Suggested homepage copy
**Headline:** Make technology your advantage.  
**Subheading:** Discover tools, learn practical skills, and find better ways to get things done.  
**Search prompt:** What would you like to achieve?  
**Search examples:** “Edit videos for free”; “Research a topic”; “Automate repetitive work”; “Build a website”; “Learn a digital skill”.  
**Secondary action:** Explore the library.

## 3. Search results
- Preserve the user's query in the search field.
- Show result count only when meaningful and accurate.
- Tabs or filters may separate Tools, Tasks, Guides, Playbooks, and Learning resources.
- Filters: category, price model, platform, difficulty, audience, AI involvement.
- Sort options: relevance, recently reviewed, beginner-friendly (only if data supports it).
- Cards show title, plain-language summary, content type, relevant tags, price/access label if known, and review status/date.
- Never label something “best” without a clear and defensible editorial basis.
- Provide “clear filters”, suggested searches, and useful zero-result states.

## 4. Category landing page
- Category name and short explanation.
- Popular tasks in that category.
- Subcategories.
- Curated tools and guides.
- Beginner starting point.
- Related workflows.
- Filters and search within category.
- “Suggest a resource” entry point only if moderation process exists.

## 5. Tool detail page
Recommended order:
1. Tool name, concise summary, official-site link.
2. Pricing/access label with a last-verified date.
3. “What it helps you do” in plain language.
4. Best-fit users and use cases.
5. Key capabilities.
6. Limitations and “may not be ideal if…”.
7. Getting started.
8. Tutorials and official documentation.
9. Alternatives and comparisons.
10. Related tasks and workflows.
11. Privacy/security notes where relevant and sourced.
12. Sources, last-reviewed date, correction/report link.

External links should be clearly identified. Opening external links in a new tab is acceptable when it improves continuity, but make that behaviour consistent and accessible.

## 6. Task guide page
- User problem as the title or opening question.
- Expected result.
- What is needed.
- Step-by-step instructions.
- Recommended approach plus alternatives.
- Cost and device considerations.
- How to verify the result.
- Common mistakes.
- Relevant tutorials.
- Related tasks and next steps.
- Last-reviewed date.

## 7. Workflow/playbook page
- Outcome and who it is for.
- Difficulty and estimated time, clearly marked as estimates.
- Inputs and prerequisites.
- Stepper/timeline showing ordered stages.
- For each step: goal, instructions, tool options, expected output, check, fallback.
- Estimated costs and potential subscriptions.
- Privacy considerations.
- Completion checklist.
- Share/print-friendly layout.

## 8. Learning path page
- Clear outcome and intended learner.
- Starting skill level.
- Modules in sequence.
- Estimated effort, not a promise.
- Resource type labels.
- Practical checkpoint after each module.
- Progress tracking only for logged-in users, if supported.
- Allow visitors to browse the whole path without signing up.

## 9. Comparison page
- Explain the decision being compared.
- Use a consistent feature set and disclose unknowns.
- Distinguish verified facts from editorial judgement.
- Compare pricing model, platform, core use cases, limitations, and learning curve.
- Include “best fit for” language rather than universal winners.
- Link to individual profiles and official sources.
- Add a review date.

## 10. About and trust pages
- Explain the mission and independent long-term purpose.
- Briefly identify the initiative's origin without making the site conference-dependent.
- Explain how tools and resources are selected.
- Explain pricing labels and review process.
- Disclose sponsorships or affiliate relationships if ever used.
- Provide correction/contact route.
- Publish privacy and accessibility statements.

## 11. Key user journeys
### Journey A — classroom visitor
QR/link → home → choose a path or search → open task guide → follow steps → save/share resource → continue independently later.

### Journey B — search engine visitor
Search engine → standalone tool/task page → understand value and limits → follow official tutorial → explore related alternatives or workflow.

### Journey C — free-tool seeker
Search query → filter by free/free tier/open source → read limitations and date → compare alternatives → visit official site.

### Journey D — goal-led beginner
Describe goal → receive categories/tasks/tools → choose a guide → complete first action → find next learning step.

### Journey E — returning learner
Open saved item or learning path → continue from last checkpoint (account feature) → complete project → share result/resource.

### Journey F — content editor
Admin login → create/edit record → add sources → run required-field checks → submit for review → reviewer approves → publish → schedule/queue review.

## 12. Interaction and feedback states
Every interactive component must define:
- default state;
- hover/focus state;
- pressed/selected state;
- loading state;
- success state;
- empty state;
- error state;
- disabled state when relevant.

Do not use colour alone to communicate state. Provide text labels, icons with accessible names, and visible keyboard focus.
