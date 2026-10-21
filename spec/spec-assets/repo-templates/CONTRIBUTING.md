# Contributing

Thank you! This project gets better because people who do the work tell us what's right, wrong or missing.

## The easiest way: "Suggest an edit" (no account)
Every page on the site has a **Suggest an edit** button. Tell us what's wrong or missing and, if you can, what it should say. A reviewer reads every suggestion. If it's accepted, it's usually live within a week, and you can choose to be thanked by name.

## What we're looking for
- **Your profession or role isn't listed,** or it's listed under a name nobody uses where you live.
- **A tool people like you really use** is missing.
- **A course outline** is in the wrong order, too hard, too easy or missing something important.
- **Facts about a tool** (price, free plan, platforms, availability) are wrong. Please include a link to the official page.
- **A tool was renamed, bought or shut down.**
- **Broken links, typos, accessibility problems.**

## Rules that keep it trustworthy
1. **Facts need a source:** a link to the tool's official page, or reputable news for shutdowns.
2. **Say if you work with a tool's company.** Vendor suggestions are welcome and are labelled. Nobody can pay for placement or ranking.
3. **No personal data about other people.**
4. **Be kind.** See `CODE_OF_CONDUCT.md`.

## For developers and technical editors (pull requests)
- **Content lives in plain-text source files** in `spec-assets/taxonomy/source/` (one line per item; formats in doc 20 §2). Don't edit generated JSON.
- **After editing, run:**
  ```
  bash spec-assets/generators/rebuild_all.sh
  npm i minisearch@7.1.2
  node spec-assets/search/identity-harness.mjs .
  ```
  Commit the source and the regenerated files together.
- **Every PR gets a preview link.** CI must be green. One approval is needed (two for removals, lenses or code; see doc 22 §3.4).
- **Sign off your commits** (Developer Certificate of Origin): `git commit -s`.
- **Licences:** code is MIT (`LICENSE`), content is CC BY 4.0 (`LICENSE-CONTENT.md`). By contributing you agree your contribution is licensed the same way.

## What happens to your suggestion
`new` → `triaged` → `accepted` / `accepted-with-edits` / `needs-source` / `duplicate` / `declined` (with a reason). Accepted changes appear on the **What's new** page.
