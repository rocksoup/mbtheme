## Title
Build Reading page from Micro.blog Bookshelves (Currently Reading / Want to Read / Have Read)

## Summary
Create a Reading page that pulls live bookshelf data from Micro.blog into three stacked sections: “Currently Reading,” “Books I want to Read,” and “Books I have Read.” The page should render the latest bookshelf entries (cover, title, author, optional link/notes) from Micro.blog, matching the wireframe layout and staying in sync automatically.

## Context / Why
- The current Reading page is mostly static and doesn’t surface bookshelf data.
- Micro.blog supports Bookshelves (see https://help.micro.blog/t/bookshelves/515) and exposes feeds we can consume.
- Bringing bookshelf data into the theme keeps the page fresh without manual edits.

## Requirements
- Page sections (top to bottom):
  1) Currently Reading
  2) Books I want to Read
  3) Books I have Read
- Each section lists books pulled dynamically from Micro.blog Bookshelves.
  - Show cover image (if available), title, and author; include link to Micro.blog book page or original source if provided.
  - Optional: include any short note/description if present in the bookshelf entry.
- Keep layout simple and responsive; works on mobile and desktop.
- No duplicate separators or extra spacing at the bottom; consistent with other list styling.
- Uses live data from Micro.blog (no manual content duplication).

## Acceptance Criteria
- Visiting `/reading/` shows three sections in order: Currently Reading, Books I want to Read, Books I have Read.
- Each section displays the corresponding bookshelf items (covers, titles, authors) pulled from Micro.blog.
- Covers are sized consistently and don’t distort; text remains legible in light/dark mode.
- If a shelf is empty, show a short friendly empty state (e.g., “No books here right now.”) instead of blank space.
- Page renders without JavaScript errors; if remote fetch fails, show an inline error/empty message instead of breaking the page.

## Notes (Dec 4 2025)
- Source of covers is Micro.blog’s Bookshelves data (`.Site.Data.bookshelves`) using `cover_url` with `image` as fallback. URLs are served via Micro.blog’s CDN wrapping Google Books.
- Cover order (v0.1.66): 1) Google zoom=0 with `/photos/2000x/`, 2) Open Library ISBN, 3) original URL as last resort.
- If all sources fail, the template shows “Cover unavailable” and adds hidden `data-missing-cover` spans with title/ISBN for debugging.
- For performance, consider moving normalization to microintegrations to cache/store the final URL once instead of per-render.

## Technical Notes
- References: https://help.micro.blog/t/bookshelves/515 (more docs on Micro.blog site).
- Decide on data source:
  - If Micro.blog exposes JSON/Feed endpoints per shelf (e.g., currently-reading, want-to-read, finished), fetch those.
  - Alternatively, add Hugo data pulls if Micro.blog syncs bookshelf content into the export; otherwise, use client-side fetch.
- Template touchpoints: likely `layouts/_default/single.html` override for `reading` type, or a dedicated `layouts/reading/single.html`; add CSS in `static/css/main.css`; optional JS helper in `static/js/saunter.js` if using client-side fetch.
- Config: consider a theme param for bookshelf handles/IDs (e.g., `params.bookshelves.current`, `want`, `finished`) so URLs aren’t hard-coded.
- Accessibility: headings for each section (`h2`/`h3`), semantic lists, `alt` for covers, graceful empty states.
