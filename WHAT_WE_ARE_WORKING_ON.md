# Current Work: Bookshelf Templates & Cover Quality

Context for handoff.

## Goal
- Keep `/reading/` powered by Micro.blog’s bookshelf data with high-quality covers.
- Eliminate 404 broken image icons using robust client-side fallback.

## Completed Changes (v0.1.69)
- `layouts/partials/reading-content.html` (and mirrored in `page/reading.html`, `reading/single.html`)
  - Implemented client-side fallback chain using `onerror`.
  - Preference order: 
    1. **Primary**: Open Library (High Res) OR Google Zoom 0.
    2. **Secondary**: Original Micro.blog URL (`cover_url` or `.image`).
    3. **Fallback**: Clean placeholder "Cover unavailable".
  - `data-cover-ver="0.1.69"` attribute added for verification.
- `plugin.json` bumped to `0.1.69`.

## What to verify after deploy
1. Live `/reading/` page loads with no broken images.
2. Inspect a book cover:
   - Verify `onerror` handler is present.
   - Verify `data-cover-ver="0.1.69"`.
3. Verify that books with missing OpenLibrary covers gracefully show the Micro.blog version or placeholder.

## Background
- Previous iterations attempted server-side guessing which led to 404s.
- This new approach relies on the browser to detect broken images and swap sources efficiently.
