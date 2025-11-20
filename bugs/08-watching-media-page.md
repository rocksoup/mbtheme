## Title
Add “Watching” nav page with Micro.blog watching entries and poster art

## Summary
Add a “Watching” link to the main navigation that opens a page listing all “watching” media posts from Micro.blog. The page should pull Micro.blog’s watching entries (movies/shows) and display each item with its poster/cover art (similar to the Links image work). Poster art should appear on the listing and the detail page.

## Context / Why
- Micro.blog supports a “watching” post type; user example: https://noise.stoneberg.net/2025/11/14/watched-pretty-woman-a-time.html.
- Want a dedicated page that aggregates these entries, with visual artwork to improve scannability.
- Needs to parallel the bookshelf approach (Reading) but for watched media.

## Requirements
- Navigation: add “Watching” to the header nav.
- Page at `/watching/` that lists all watching posts with:
  - Title of the media, date, and optionally category/tag chips.
  - Poster/cover art thumbnail (clickable to the detail page).
  - Short summary/notes if present.
- Detail page: show the same poster art above the content (avoid duplicates if already in body).
- Data source:
  - Use Micro.blog’s watching entries (confirm how they’re exposed—category/tag/type or dedicated feed). Support configuring the taxonomy/flag via theme params (e.g., `params.watchingCategory`, `params.watchingType`).
- Fallbacks:
  - If no poster available, render text-only without layout glitches.
- Consistent styling with other lists (no trailing separators, responsive layout, dark mode).

## Acceptance Criteria
- “Watching” appears in header navigation and highlights when on `/watching/`.
- `/watching/` lists all watching posts in reverse chronological order with poster art when available; each links to its detail page.
- Visiting a watching post shows the poster once above the content; no duplicates if author embeds the image.
- If poster cannot be resolved, the entry still renders cleanly (no broken images).
- Mobile and desktop layouts remain consistent; no extra HR at page end.

## Technical Notes
- Touchpoints: `layouts/partials/site-header.html` (nav), list template (new `layouts/watching/list.html` or `_default/list.html` filtering), `layouts/_default/single.html` (image rendering), `layouts/partials/post-summary.html`, CSS in `static/css/main.css`.
- Poster sourcing:
  - Prefer existing frontmatter fields (`featured_image`, `image`, `images[0]`) if Micro.blog sets them for watching posts.
  - If not present, consider fetching OG image similar to the Links image ticket; allow a theme param to map a watching-specific image field.
- Add config params to avoid hard-coding selection (category/tag/type).
- Keep lazy loading (`loading="lazy"`), proper `alt`, and guard against rendering the same URL already in post body content.
