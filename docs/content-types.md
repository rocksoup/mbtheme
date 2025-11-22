# Content Type Filtering

This guide explains how to use categories to organize and display different types of content (books, movies, concerts) on dedicated pages.

## Overview

The Saunter theme supports filtering posts by category using Hugo's built-in taxonomy system. This is more reliable and performant than text-based prefix matching.

**Supported Content Types:**
- **Read** - Books you're reading (`categories: ["read"]`)
- **Watch** - Movies and TV shows (`categories: ["watch"]`)
- **Shows** - Concerts and live events (`categories: ["shows"]`)

## How It Works

### Category-Based Filtering (Recommended)

Posts are tagged with categories, either manually or automatically by middleware:

```yaml
---
date: 2025-11-21T10:00:00-07:00
categories: ["watch"]
---

Watched: Dune Part 2 🍿

Incredible cinematography. The desert scenes are breathtaking.
```

The theme filters posts using Hugo's `where` function:

```go
{{ $posts := where .Site.RegularPages "Params.categories" "intersect" (slice "watch") }}
```

**Benefits:**
- ✅ Fast (Hugo indexes taxonomies automatically)
- ✅ Reliable (no text parsing needed)
- ✅ Flexible (easy to combine, exclude, or filter)
- ✅ Standard (works with other Hugo themes and tools)

### Prefix Fallback (Legacy Support)

For backwards compatibility, the theme falls back to prefix-based detection when no category is found:

```yaml
---
date: 2025-11-21T10:00:00-07:00
# No categories field
---

Watched: Her 🍿
```

The theme will scan the content for "Watched:", "Reading:", or "Show:" prefixes. This is slower and more brittle, but ensures old posts still work.

## Content Types

### Watch - Movies & TV

**Authoring:**
```
Watched: The Shawshank Redemption 🍿

Incredible story about hope and friendship.
```

**With Category (Recommended):**
```yaml
---
categories: ["watch"]
---

Watched: The Shawshank Redemption 🍿
```

**Display:** `/watching/` page shows all posts with `categories: ["watch"]`

**Middleware Enrichment:**
- Automatically adds `categories: ["watch"]` when it detects "Watched:"
- Fetches poster from TMDB/IMDB and adds as `image` field
- Updates post in Micro.blog with enriched data

### Read - Books

**Authoring:**
```
Reading: Project Hail Mary 📚

Fantastic sci-fi with humor and heart.
```

**With Category (Recommended):**
```yaml
---
categories: ["read"]
---

Reading: Project Hail Mary 📚
```

**Display:** `/reading/` page shows both:
- Posts with `categories: ["read"]`
- Books from Micro.blog Bookshelves (native integration)

**Note:** The reading page primarily uses Micro.blog's native Bookshelves feature, but you can also post reading updates as regular posts with the "read" category.

### Shows - Concerts & Live Events

**Authoring:**
```
Show: Radiohead @ Climate Pledge Arena 🎵

Amazing setlist. They played Paranoid Android!
```

**With Category (Recommended):**
```yaml
---
categories: ["shows"]
---

Show: Radiohead @ Climate Pledge Arena 🎵
```

**Display:** `/shows/` page shows all posts with `categories: ["shows"]`

**Middleware Enrichment:**
- Automatically adds `categories: ["shows"]` when it detects "Show:"
- Could fetch artist images or venue photos (future enhancement)

## Setting Up Content Type Pages

### 1. Create the Page

Create a markdown file in your `content/` directory:

**For Watching:**
```markdown
---
title: "Watching"
type: "watching"
url: "/watching/"
menu: "main"
weight: 40
---

Movies and TV shows I've watched.
```

**For Shows:**
```markdown
---
title: "Shows"
type: "shows"
url: "/shows/"
menu: "main"
weight: 50
---

Concerts and live events I've attended.
```

### 2. Create the Layout Template

The theme already includes `layouts/watching/single.html` which uses the `watching-grid.html` partial.

For shows, you'd create a similar layout at `layouts/shows/single.html`:

```go
{{ define "main" }}
<article class="content-page">
  <header class="page-header">
    <h1>{{ .Title }}</h1>
    {{ with .Content }}
    <p>{{ . }}</p>
    {{ end }}
  </header>

  {{ partial "shows-grid.html" . }}
</article>
{{ end }}
```

### 3. Create the Grid Partial

Create `layouts/partials/shows-grid.html`:

```go
{{/* Method 1: Category-based filtering (RECOMMENDED) */}}
{{ $posts := where .Site.RegularPages "Params.categories" "intersect" (slice "shows") }}

{{/* Method 2: Prefix-based fallback for legacy posts */}}
{{ if eq (len $posts) 0 }}
  {{ range .Site.Pages }}
    {{ if eq .Kind "page" }}
      {{ $summary := .Summary | default "" }}
      {{ if hasPrefix $summary "Show:" }}
        {{ $posts = $posts | append . }}
      {{ end }}
    {{ end }}
  {{ end }}
{{ end }}

{{/* Display the grid */}}
{{ if gt (len $posts) 0 }}
<div class="shows-grid">
  {{ range $posts }}
    {{/* Extract show title */}}
    {{ $rawTitle := .Title | default "" }}
    {{ if not $rawTitle }}
      {{ $summary := .Summary | default "" }}
      {{ $plainSummary := $summary | plainify }}
      {{ $firstLine := index (split $plainSummary "\n") 0 | default "" }}
      {{ $rawTitle = $firstLine }}
    {{ end }}
    {{ $title := $rawTitle | replaceRE "^Show:\\s*" "" | replaceRE "🎵.*$" "" | trim " \t\r\n" }}

    <article class="show-card">
      <div class="show-meta">
        <h3><a href="{{ .RelPermalink }}">{{ $title }}</a></h3>
        <time datetime="{{ .Date.Format "2006-01-02" }}">{{ .Date.Format "January 2, 2006" }}</time>
      </div>
      {{ with .Summary }}<p>{{ . | truncate 100 }}</p>{{ end }}
    </article>
  {{ end }}
</div>
{{ else }}
<div class="empty-state">
  <p>No shows found.</p>
</div>
{{ end }}
```

## Middleware Integration

Your middleware can automatically add categories when posting to Micro.blog:

```javascript
// Example middleware enrichment
function enrichPost(content) {
  let categories = [];
  let imageUrl = null;

  // Detect content type and enrich
  if (content.match(/^Watched:/i)) {
    categories.push("watch");
    imageUrl = await fetchMoviePoster(content); // TMDB API
  } else if (content.match(/^Reading:/i)) {
    categories.push("read");
    imageUrl = await fetchBookCover(content); // Open Library API
  } else if (content.match(/^Show:/i)) {
    categories.push("shows");
    // Could fetch artist/venue images in the future
  }

  return {
    content: content,
    categories: categories,
    image: imageUrl,
    // ... other fields
  };
}
```

**Middleware Repository:** [rocksoup/microintegrations](https://github.com/rocksoup/microintegrations)

## Migration Strategy

### Phase 1: Current State (Working)
- Prefix-based detection works for all existing posts
- Theme has fallback logic for legacy content

### Phase 2: Add Category Support (Recommended Next Step)
1. Update middleware to add categories when posting
2. New posts automatically get categorized
3. Theme uses category filter first, prefix as fallback

### Phase 3: Backfill Old Posts (Optional)
You can manually add categories to existing posts in Micro.blog:

```yaml
---
title: "Watched: Her"
date: 2025-11-14T08:17:48-08:00
categories: ["watch"]  # Add this manually
---
```

Or write a script to bulk-update via Micro.blog API.

### Phase 4: Future (Clean)
- All posts have categories
- Can remove prefix fallback code
- Faster, cleaner template logic

## Advanced Usage

### Multiple Categories

Posts can have multiple categories:

```yaml
---
categories: ["watch", "favorite", "sci-fi"]
---

Watched: Arrival 🍿
```

Filter by multiple categories:

```go
{{ $sciFiMovies := where .Site.RegularPages "Params.categories" "intersect" (slice "watch" "sci-fi") }}
```

### Excluding Categories

Show all posts except certain types:

```go
{{ $posts := where .Site.RegularPages "Params.categories" "not in" (slice "watch" "read" "shows") }}
```

### Combining with Tags

Use both categories and tags for more granular filtering:

```yaml
---
categories: ["watch"]
tags: ["horror", "2024"]
---
```

```go
{{ $horrorMovies := where (where .Site.RegularPages "Params.categories" "intersect" (slice "watch")) "Params.tags" "intersect" (slice "horror") }}
```

## Performance

**Category filtering is fast:**
- Hugo indexes taxonomies at build time
- `where` function uses indexes (O(1) lookup)
- No need to iterate through all pages

**Prefix fallback is slow:**
- Must iterate through ALL pages (O(n))
- Text parsing on every page
- Only used when no categories found

**Recommendation:** Prioritize adding categories to new posts via middleware.

## Troubleshooting

### Posts not showing up

1. **Check the category is correct:**
   ```yaml
   categories: ["watch"]  # Lowercase
   # NOT: categories: ["Watched"]
   ```

2. **Verify post is published:**
   - Check `draft: false` (or omit draft field)
   - Ensure date is not in the future

3. **Add debug output:**
   ```go
   <div>Debug: Found {{ len $posts }} posts</div>
   {{ range $posts }}
     <div>{{ .Title }} - {{ .Params.categories }}</div>
   {{ end }}
   ```

### Old posts missing

If using category filtering only (no prefix fallback):
- Old posts without categories won't show
- Either add categories manually or keep prefix fallback

### Wrong content type

Make sure categories match exactly:
- `"watch"` not `"watched"` or `"Watched"`
- `"read"` not `"reading"` or `"Read"`
- `"shows"` not `"show"` or `"Shows"`

## Examples

### Personal Watchlist

Create a page showing only movies you want to watch:

```go
{{ $watchlist := where .Site.RegularPages "Params.categories" "intersect" (slice "watch" "want-to-watch") }}
```

### This Year's Concerts

```go
{{ $thisYear := now.Year }}
{{ $yearPosts := where .Site.RegularPages ".Date.Year" $thisYear }}
{{ $concerts := where $yearPosts "Params.categories" "intersect" (slice "shows") }}
```

### Favorite Books

```go
{{ $favoriteBooks := where (where .Site.RegularPages "Params.categories" "intersect" (slice "read")) "Params.tags" "intersect" (slice "favorite") }}
```

## Summary

**Use categories for:**
- ✅ New content (via middleware)
- ✅ Fast, reliable filtering
- ✅ Future flexibility

**Use prefix fallback for:**
- ✅ Legacy posts without categories
- ✅ Backwards compatibility
- ⚠️ Not recommended for new content

**Next Steps:**
1. Update middleware to add categories when posting
2. Test with new posts
3. Gradually migrate old posts (optional)
4. Eventually remove prefix fallback (future)

---

**See also:**
- [SYSTEM_DOCUMENTATION.md](SYSTEM_DOCUMENTATION.md) - Complete system architecture
- [Working with Titleless Posts](SYSTEM_DOCUMENTATION.md#working-with-titleless-posts) - Understanding titleless post detection
- [Middleware Repository](https://github.com/rocksoup/microintegrations) - External enrichment system
