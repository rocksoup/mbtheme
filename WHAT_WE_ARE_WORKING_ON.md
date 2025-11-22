# Current Work: Watching Page Not Showing Posts (Micro.blog)

Context for handoff to another developer.

## Problem
- The `/watching/` page renders “No watching data found” on the live site (https://noise.stoneberg.net/watching/), even though the archive feed contains five “Watched:” posts (e.g., `https://noise.stoneberg.net/2025/11/14/watched-singles-love-the-seattle.html`).
- Those posts have **empty titles**; the “Watched:” prefix only appears in `content_text`/body.

## Current local changes (uncommitted due to permission issues)
- `layouts/partials/watching-grid.html`:
  - Scans `.Site.AllPages.ByDate.Reverse`.
  - Matches “Watched:” against title **or** `plainify .Content` when title is empty.
  - Adds a visible debug block on the page that shows:
    - `pages={{ len $.Site.AllPages }} matched={{ len $posts }}`
    - The first 20 pages with `kind/type/title/rel/layout/section/bundle/file`.
- `plugin.json` version bumped to `0.1.38`.
- `layouts/partials/head.html` generator meta bumped to `Saunter 0.1.38`.
- These edits are present in the working tree but **not staged/committed** because `git add` was denied.

## What to do next
1) Commit and push the current changes (version 0.1.38 with debug) so Micro.blog pulls them.
2) After deploy, load `/watching/` and read the on-page debug block to see:
   - Whether `pages` is > 0 and what `kind/type` the first items have.
   - Whether any items match; if matched = 0, the matching logic still isn’t seeing “Watched:” in the fields Hugo provides.
3) If `pages` is 0, Micro.blog isn’t delivering content to the theme (check blog scope/visibility in Micro.blog).
4) If `pages` > 0 but none match, expand debug to dump `.Content` for a few items or temporarily render all items (no filter) to see their shape; then refine the match.
5) Once the filter works and cards render, remove the debug blocks and bump the version again (e.g., 0.1.39).

## Useful evidence
- Archive JSON shows the posts with empty `title` and the text in `content_text`. Example entry:
  ```json
  {
    "id": "https://noise.stoneberg.net/2025/11/14/watched-singles-love-the-seattle.html",
    "title": "",
    "content_text": "Watched: Singles 🍿\nLove the Seattle vibes. 🇲🇽 2025\n",
    "date_published": "2025-11-14T08:14:58-08:00"
  }
  ```
- Latest live generator before this work was 0.1.37; 0.1.38 (with debug) hasn’t been deployed because commit/push didn’t happen.

