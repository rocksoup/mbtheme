# Current Work: Bookshelf Templates & Cover Quality

Context for handoff.

## Goal
- Keep `/reading/` powered by Micro.blog’s bookshelf data with high-quality covers.
- Ensure all reading templates stay in sync (partial, page layout, section layout).
- Avoid regressions from the 0.1.53 draft that accidentally broke the CSS path.

## Changes in progress (v0.1.55)
- `layouts/partials/reading-content.html`
  - Uses `.cover_url` with `.image` fallback.
  - Normalizes Google Books zoom to `zoom=0` (handles encoded `%26zoom%3D5`).
  - Currently simplified: uses the normalized URL directly for `src` (previous srcset attempt caused broken URLs on Micro.blog).
  - Adds `data-cover-ver="0.1.55"` for live verification.
- `layouts/page/reading.html` and `layouts/reading/single.html` mirror the same cover logic.
- `layouts/partials/head.html`
  - Fixes the stray leading space in the CSS href.
  - Bumps generator meta to `Saunter 0.1.55`.
- `plugin.json` bumped to `0.1.55` so Micro.blog picks up the update.

## What to verify after deploy
1) Live `/reading/` shows `generator` = 0.1.55.
2) Book cover `<img>` tags include `data-cover-ver="0.1.55"` and valid `src` URLs (no “zoom=5” only strings).
3) CSS loads correctly (no `%20css/main.css` href).
4) Covers appear for books that only provide `.image` (not just `.cover_url`).

## Background
- Live site was on 0.1.52 with working covers, but 0.1.53 introduced a broken CSS path (`" css/main.css"`).
- Bookshelf data arrives via `.Site.Data.bookshelves` from Micro.blog; some items use `.image` instead of `.cover_url`.
- High-res requirement: Google Books URLs should use `zoom=0`; Micro.blog’s CDN sizes can be bumped via `srcset`.
