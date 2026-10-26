# 08 — Acceptance Criteria and Test Plan

## 1. Release readiness checklist
### Product
- [ ] A first-time visitor can explain the platform's purpose after viewing the home page.
- [ ] Users can browse without an account.
- [ ] Search supports tools, tasks, guides, resources, and workflows.
- [ ] Audience paths do not restrict access to the full library.
- [ ] Every public record has a stable URL.
- [ ] Tool profiles explain use cases and limitations, not just marketing copy.
- [ ] Pricing/access labels distinguish free, freemium, trial, paid, open-source, and unknown states.
- [ ] Changeable claims have sources and review dates.
- [ ] Related content is useful and relevant.
- [ ] Sharing a deep link works for a first-time visitor.

### Design and accessibility
- [ ] Layout tested on narrow phones, large phones, tablets, laptops, and wide screens.
- [ ] No unintended horizontal overflow.
- [ ] Keyboard navigation works for core flows.
- [ ] Focus indicators are visible.
- [ ] Screen-reader labels exist for controls.
- [ ] Contrast is checked.
- [ ] Reduced-motion preference is respected.
- [ ] Forms have labels and understandable error messages.
- [ ] Zoom and text resizing do not break essential content.
- [ ] Loading, empty, error, and success states are designed.

### Content operations
- [ ] Editors can draft, review, publish, update, and archive records.
- [ ] Required-field validation prevents incomplete records from being published.
- [ ] Change history is recorded.
- [ ] Link checking and stale-content queues work.
- [ ] Corrections can be submitted without an account.
- [ ] Backups and restore procedure are tested.
- [ ] Content export is documented.

### Technical
- [ ] HTTPS and security headers are configured.
- [ ] Secrets are not present in client bundles or source control.
- [ ] Core pages meet agreed performance budgets on representative devices.
- [ ] Critical flows have automated tests.
- [ ] Production monitoring and error reporting are active.
- [ ] Rollback procedure is documented.

## 2. Critical test scenarios
1. Search “edit videos for free”; results should reflect known pricing states and not label a paid-only product as free.
2. Search for a task with no exact match; show useful related categories and a way to broaden the search.
3. Filter by Android; only include products whose Android support is verified or clearly label unknown availability.
4. Open a tool page from an external shared link while logged out; content remains accessible.
5. Open a discontinued product; show an archive notice and alternatives if available.
6. Open a page with unknown pricing; do not invent a price.
7. Use the site with keyboard only; all core controls remain operable.
8. Enable reduced motion; non-essential animations are reduced or removed.
9. Submit a correction form; confirmation is shown and the item enters a review queue.
10. Attempt to publish a record without required sources; the system blocks or clearly warns according to editorial policy.
11. Simulate search-service failure; preserve query and provide a retry state.
12. Simulate an external link failure; the content page remains usable.
13. Check a page on a slow connection; essential text and controls appear before decorative assets.
14. Change a slug; old URL redirects to the canonical URL.
15. Export content; IDs, relationships, source records, and review dates remain intact.

## 3. User validation
Test with representative participants:
- student;
- beginner with low digital confidence;
- professional;
- small-business owner;
- creator;
- person using an older or lower-powered phone;
- user who relies on keyboard or assistive technology, where possible.

Ask participants to complete realistic tasks rather than merely rate the design:
- find a suitable free tool;
- learn how to complete a task;
- compare two alternatives;
- locate an official tutorial;
- share a useful guide;
- report outdated information.

Observe completion, confusion, and workarounds. Prioritise the most consequential problems.
