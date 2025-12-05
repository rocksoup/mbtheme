# Book Cover Fallback Strategy

*Last Updated: v0.1.69*

## Overview
The `/reading` page (and related sections) uses a robust client-side fallback strategy to ensure book covers always display gracefully, avoiding broken image icons (404s).

## Data Sources
The theme attempts to load book covers from three sources in priority order:

1.  **Primary: OpenLibrary / High-Res CDN**
    *   Constructed using the book's ISBN: `https://covers.openlibrary.org/b/isbn/{isbn}-L.jpg?default=false`
    *   Or a Google Books URL forced to `zoom=0` (high quality).
2.  **Secondary: Micro.blog / Original URL**
    *   The original `cover_url` or `.image` provided by the Micro.blog API.
    *   Often a Google Books thumbnail (`zoom=1`) or a cached Micro.blog CDN URL.
3.  **Fallback: Visual Placeholder**
    *   A CSS-styled box displaying "Cover unavailable".

## How It Works
Instead of guessing which URL is valid on the server-side (which caused broken images when OpenLibrary missed a book), we use the browser's `onerror` event.

```html
<img src="{PrimarySource}"
     data-fallback-src="{SecondarySource}"
     onerror="if (this.getAttribute('data-fallback-src') && this.src !== this.getAttribute('data-fallback-src')) { 
                this.src = this.getAttribute('data-fallback-src'); 
                this.removeAttribute('data-fallback-src'); 
              } else { 
                this.style.display='none'; 
                this.nextElementSibling.style.display='flex'; // Shows placeholder
              }"
     ...>
```

## Troubleshooting

### "Soft 404" Placeholders
Sometimes a book cover will display a generic "No Image Available" graphic instead of the theme's clean placeholder.

*   **Cause:** The Primary source failed (404), triggering the Secondary source. The Secondary source (often Google Books via Micro.blog) returns a **200 OK** status but serves an image of text saying "No Image".
*   **Why it happens:** Since it is a valid Status 200 image, the browser accepts it and does not trigger the final error handler.
*   **Fix:** Manually update the book entry in your Micro.blog Bookshelf.
    1.  Edit the book.
    2.  Provide a valid image URL (e.g., from Amazon or the publisher).
    3.  Alternatively, use a valid ISBN that OpenLibrary recognizes.
