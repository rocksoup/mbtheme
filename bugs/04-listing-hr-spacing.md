## Title
Remove trailing horizontal rules in teaser listings

## Summary
Teaser/listing pages currently render horizontal rules (`<hr>` or bordered separators) between items but also leave one (or more) at the bottom after the final item. Listings should have separators only between items—never after the last teaser. Screenshot shows two HRs before the footer/newsletter on `/links/`.

## Context / Why
- Extra separators at the end of lists look broken and add visual noise.
- Consistency across list templates (home, section, taxonomy, links) is needed to avoid regressions.

## Requirements
- Ensure list templates render separators only between items, not after the last one.
- Apply fix to all teaser/list contexts (homepage feed, section lists, taxonomy lists, links page, archives) that use the shared partial.
- Keep spacing consistent after the final item before footer/newsletter; no double gaps.
- Dark/light mode visuals remain consistent.

## Acceptance Criteria
- On `/links/` and other listing pages, there is no horizontal rule after the final item; separators appear only between items.
- Newsletter/footer begins directly after the final item’s spacing (no extra HR).
- Pagination still works and does not reintroduce extra separators.
- No regressions to item spacing on mobile/desktop.

## Technical Notes
- Likely touchpoint: `layouts/partials/post-summary.html` (or surrounding list templates) where item-level borders are applied.
- If using CSS borders on `.post-summary`, add `:last-of-type` guards or template conditionals to skip border on the last item.
- Verify both `layouts/index.html` and `_default/list.html` / `taxonomy.html` usages.
