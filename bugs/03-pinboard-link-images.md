## Title
Show images for Pinboard link posts on list and detail views

## Summary
Pinboard-imported link posts should display a preview image both on the Links listing and on the single post page. Ideally the image comes from the pinned page’s Open Graph/cover image. The listing preview should be clickable to the detail page; the detail page should show the same image once (no duplicates).

## Context / Why
- Links page currently shows text-only entries; many pinned pages have strong imagery (see screenshot), but it’s not surfaced.
- Visual previews improve scannability and engagement for link posts.
- Micro.blog’s Pinboard integration may already store image metadata; if not, we need a reliable fallback strategy.

## Requirements
- Identify an image source for Pinboard-imported posts:
  - Prefer existing frontmatter fields if present (`featured_image`, `image`, or first entry in `images`).
  - If Pinboard/Micro.blog provides a meta image field, use it (needs validation).
  - Allow optional theme param to declare the field name for link images (e.g., `params.pinboard_image_field` or `params.pinboard_category` to key off category + field).
- Links list page:
  - Show a thumbnail/hero image per item (responsive, top-aligned). Image links to the post detail.
  - Lazy-load images; include `alt` text (use title or domain if none).
  - Keep layout clean in light/dark modes; avoid stretching tall images (use aspect-ratio or max-height).
- Single link detail page:
  - Render the same image above the content if not already in the body.
  - Avoid duplicate rendering when authors embed the image manually.
- Fallbacks:
  - If no image is available, maintain current text-only layout (no broken images).
- Performance/accessibility:
  - Use `loading="lazy"` and width/height/aspect ratio to prevent CLS.
  - Ensure keyboard navigation still works; images remain clickable anchors.

## Acceptance Criteria
- Every Pinboard-imported link post that has an image field shows a preview image on `/links/` and on its detail page.
- The image on `/links/` links to the detail page; the detail page shows the same image once, above the content.
- If no image is available for a link post, it renders without an image and without layout glitches.
- Dark mode styles remain legible; images keep their aspect ratio without distortion.
- No duplicate images when the URL already appears in the post body.

## Options / Questions
- Confirm what Micro.blog Pinboard import stores: do we get `featured_image`, `image`, `images`, or a custom field? Inspect a sample exported Pinboard post to decide the canonical field.
- If no image field exists, options include:
  1) Add a post-processor to fetch the page’s Open Graph image and store it in frontmatter.
  2) Allow manual override via frontmatter (`featured_image`) on link posts.
  3) Add a theme param to map a Pinboard-specific field if Micro.blog adds one later.

## Technical Notes
- Likely touchpoints: `layouts/partials/post-summary.html` (list previews), `layouts/_default/single.html` (detail hero), `static/css/main.css` (image sizing), maybe `static/js/saunter.js` if we add lazy-loading helpers (though native `loading="lazy"` may suffice).
- Reuse existing featured image detection logic to avoid duplication; add a guard to skip rendering when image appears in body content.
- Consider adding a consistent aspect ratio (e.g., 4:3 or 16:9) with `object-fit: cover` and a subtle border radius to match theme style.
