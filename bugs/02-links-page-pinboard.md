## Title
Fix Links page: pinboard-sourced items, menu active state, and missing entries

## Summary
The `Links` page should list all Pinboard-synced link posts and highlight the Links nav item when viewing this page. Today, the active trail does not highlight, Pinboard items are not clearly identified, and some expected link posts are missing from the listing.

## Context / Why
- Links page is meant to surface Pinboard imports, but it currently shows mixed content without clear attribution.
- The nav “Links” item does not show as active when on `/links/`, reducing orientation.
- Some link posts that exist in Micro.blog/Pinboard aren’t showing on the page, suggesting filtering/frontmatter/taxonomy issues.
- User has been using Micro.blog’s category tool; we need to confirm whether categories vs. type vs. section are being used to identify link posts.

## Requirements
- Clearly identify Pinboard-sourced items on the Links page (e.g., badge or byline noting “Imported from Pinboard”).
- Ensure the nav “Links” item is marked active when the current page is `/links/`.
- Ensure all Pinboard link posts appear on `/links/`:
  - Define/confirm the filtering rule for link posts (e.g., `Type` equals `links`, or `Params.categories` contains `links`, or a flag like `pinboard: true`).
  - Update the template to filter based on the agreed rule and include all matches in date-desc order.
- Preserve existing metadata display (title/summary, URL, date, categories).
- Keep pagination consistent with other list pages.

## Acceptance Criteria
- Navigating to `/links/` highlights the “Links” menu item (same active class as other sections).
- Pinboard-imported posts render with a visible indicator (label/icon) differentiating them from native posts.
- All link posts that meet the agreed selection rule appear on `/links/` in reverse chronological order with dates, URL, and badges intact.
- No non-link posts appear on `/links/`.
- Mobile/desktop layouts remain consistent with current styling.

## Technical Notes
- Likely touchpoints: `layouts/_default/list.html` (for listing logic if `/links/` uses list), `layouts/index.html` or `layouts/partials/post-summary.html` if special casing is needed, and `layouts/partials/site-header.html` for active nav state.
- Determine selection rule:
  - If Micro.blog Pinboard integration sets a category or type, prefer that (e.g., `Type == "links"` or category `links`).
  - If necessary, add support for a frontmatter flag like `pinboard: true`.
  - Micro.blog’s category tool may be adding taxonomy categories; verify how these map to Hugo frontmatter in the content export.
- Active nav: ensure menu item matching works for `/links/` (check `IsMenuCurrent`/`HasMenuCurrent` or URL matching).
- Consider adding an optional theme param (e.g., `pinboardCategory = "links"` or `pinboardFlag = "pinboard"`) to avoid hard-coding.
