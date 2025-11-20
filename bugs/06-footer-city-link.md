## Title
Fix footer city link target and trailing period

## Summary
The footer’s city tagline shows “Made with ❤️ in Seattle, Washington.” but the link currently points to `/location/` and includes a trailing period after “Washington.” It should link to `/seattle/` and omit the trailing period in the linked text.

## Context / Why
- The link is broken/misleading, sending users to `/location/` instead of the intended `/seattle/`.
- The extra period in the link text looks awkward and should be removed.

## Requirements
- Update footer city link to use `/seattle/` (or the configured URL) instead of `/location/`.
- Remove the trailing period from the link text itself; punctuation after the link should be handled outside the anchor if needed.
- Ensure backwards compatibility with existing `params.city_tagline` config shape (string or object).
- Keep dark/light mode and spacing unchanged.

## Acceptance Criteria
- Footer tagline link goes to `/seattle/` (or `params.city_tagline.url` if set accordingly) and displays “Seattle, Washington” with no period at the end.
- No regressions to newsletter/footer layout or city tagline rendering in other pages.
- If `city_tagline` is provided as a string, it still renders without adding an extra trailing period.

## Technical Notes
- Likely touchpoint: `layouts/partials/site-footer.html`.
- If `city_tagline.url` is configured, honor that; otherwise default to `/seattle/` for this site. Avoid hard-coding if a config param already defines the URL.
