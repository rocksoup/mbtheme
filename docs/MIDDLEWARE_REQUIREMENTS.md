# Middleware Enrichment Requirements

This document outlines the expected behavior and current issues with the Micro.blog post enrichment middleware ([rocksoup/microintegrations](https://github.com/rocksoup/microintegrations)).

## Current Problem

Posts with content type prefixes ("Watched:", "Reading:", "Show:") are **not being enriched with artwork**. The middleware should be automatically fetching posters, book covers, and other imagery and adding them to posts via the `image` field.

## Expected Behavior

### 1. Content Type Detection

The middleware should detect three content types by scanning post content:

| Content Type | Prefix | Category to Add | Example |
|-------------|--------|----------------|---------|
| Movies/TV | `Watched:` | `watch` | "Watched: Dune Part 2 🍿" |
| Books | `Reading:` or `Read:` | `read` | "Reading: Project Hail Mary 📚" |
| Concerts/Events | `Show:` | `shows` | "Show: Radiohead @ Climate Pledge Arena 🎵" |

**Detection Logic:**
- Check post title first (if present)
- Check first line of post content/summary (for titleless posts)
- Case-insensitive matching
- Match at start of line only (after trimming whitespace)

### 2. Category Enrichment

When a content type prefix is detected, the middleware should:

1. Add the appropriate category to the post's `categories` array
2. Preserve any existing categories (append, don't replace)
3. Use lowercase category names: `"watch"`, `"read"`, `"shows"`

**Example Post Update:**
```json
{
  "content": "Watched: Arrival 🍿\n\nIncredible sci-fi film about linguistics.",
  "categories": ["watch"],  // ← Added by middleware
  "image": "https://..."     // ← Added by middleware
}
```

### 3. Artwork Enrichment

The middleware should fetch and attach artwork based on content type:

#### For Movies/TV (`Watched:`)
- **Source:** TMDB (The Movie Database) API
- **Process:**
  1. Extract title from "Watched: {title}" (remove emoji, trim)
  2. Search TMDB for the title
  3. Get poster URL (prefer high-res: w500 or original)
  4. Add to post as `image` field
- **Fallback:** If TMDB fails, try OMDB or leave image empty
- **Field:** `image: "https://image.tmdb.org/t/p/w500/{poster_path}"`

#### For Books (`Reading:`)
- **Source:** Open Library Covers API
- **Process:**
  1. Extract title/author from "Reading: {title}" or "Read: {title}"
  2. Search Open Library for ISBN or work ID
  3. Get cover URL
  4. Add to post as `image` field
- **Fallback:** Try Google Books API if Open Library fails
- **Field:** `image: "https://covers.openlibrary.org/b/id/{cover_id}-L.jpg"`

#### For Concerts (`Show:`)
- **Source:** TBD (Spotify Artist Images, MusicBrainz, or venue photos)
- **Process:** Not yet implemented
- **Priority:** Low (can be added later)
- **Field:** `image: "..."` (when implemented)

### 4. Post Update Flow

The expected middleware flow:

```
1. Post created in Micro.blog
   ↓
2. Webhook triggers middleware
   ↓
3. Middleware fetches post content
   ↓
4. Detect content type prefix
   ↓
5. If detected:
   - Add category
   - Fetch artwork from external API
   - Update post via Micro.blog API
   ↓
6. Updated post appears in Micro.blog with:
   - categories: ["watch"]
   - image: "https://..."
```

## Current Issues to Investigate

### Issue 1: Artwork Not Being Added

**Symptom:** Posts with "Watched:" prefix are published but have no `image` field.

**Questions to Check:**
- Is the middleware webhook being triggered at all?
- Is the middleware detecting the "Watched:" prefix correctly?
- Is the TMDB API call succeeding? (Check logs)
- Is the Micro.blog API update call succeeding?
- Are there any errors in middleware logs?

**Test Case:**
```markdown
Post content: "Watched: The Shawshank Redemption 🍿"

Expected result:
- categories: ["watch"]
- image: "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg"

Actual result:
- categories: ??? (unknown - check if this is working)
- image: missing
```

### Issue 2: Category Addition

**Unknown:** Are categories being added at all, or is the entire enrichment failing?

**Test:** Create a new post with "Watched: Test Movie 🍿" and check if:
1. Webhook fires
2. Middleware processes it
3. Post is updated with `categories: ["watch"]` (even without image)

## Required Middleware Functionality

### API Endpoints Needed

**TMDB API:**
- Search endpoint: `GET /search/movie?query={title}`
- Configuration: `GET /configuration` (to get image base URL)
- API Key: Required (check if configured)

**Open Library API:**
- Search: `GET /search.json?q={title}&limit=1`
- Covers: `https://covers.openlibrary.org/b/id/{id}-L.jpg`
- No API key required

**Micro.blog API:**
- Get post: `GET /micropub?q=source&url={post_url}`
- Update post: `POST /micropub` with `action=update`
- Authentication: Bearer token (check if configured)

### Environment Variables to Check

```bash
TMDB_API_KEY=xxx           # For movie posters
MICROBLOG_TOKEN=xxx        # For updating posts
WEBHOOK_SECRET=xxx         # For validating webhooks
```

### Example Enrichment Code

```javascript
async function enrichPost(post) {
  const content = post.content || '';
  const title = post.name || '';

  let categories = post.categories || [];
  let imageUrl = null;

  // Check for "Watched:" prefix
  const watchedMatch = (title || content).match(/^Watched:\s*(.+?)(?:\s*🍿)?$/im);
  if (watchedMatch) {
    const movieTitle = watchedMatch[1].trim();

    // Add category
    if (!categories.includes('watch')) {
      categories.push('watch');
    }

    // Fetch poster from TMDB
    try {
      const tmdbResult = await searchTMDB(movieTitle);
      if (tmdbResult && tmdbResult.poster_path) {
        imageUrl = `https://image.tmdb.org/t/p/w500${tmdbResult.poster_path}`;
      }
    } catch (err) {
      console.error('TMDB fetch failed:', err);
    }
  }

  // Similar logic for "Reading:" and "Show:"

  // Update post in Micro.blog
  if (categories.length > 0 || imageUrl) {
    await updateMicroblogPost(post.url, {
      categories: categories,
      ...(imageUrl && { image: imageUrl })
    });
  }
}
```

## Testing Checklist

- [ ] Middleware webhook receives new posts
- [ ] "Watched:" prefix detection works for titled posts
- [ ] "Watched:" prefix detection works for titleless posts
- [ ] TMDB API key is configured and valid
- [ ] TMDB search returns results for common movies
- [ ] Poster URLs are constructed correctly
- [ ] Micro.blog API authentication works
- [ ] Post update API call succeeds
- [ ] Updated post appears in Micro.blog with image field
- [ ] Category "watch" is added to post
- [ ] Existing categories are preserved (if any)
- [ ] Error handling logs failures appropriately

## Success Criteria

When working correctly, the middleware should:

1. ✅ Detect "Watched:", "Reading:", "Show:" in new posts
2. ✅ Add appropriate category (`watch`, `read`, `shows`)
3. ✅ Fetch artwork from external API (TMDB, Open Library)
4. ✅ Update post in Micro.blog with `categories` and `image` fields
5. ✅ Handle errors gracefully (log but don't crash)
6. ✅ Work for both titled and titleless posts
7. ✅ Process updates within 5 seconds of post creation

## Integration with Theme

The Saunter theme (`rocksoup/mbtheme`) is designed to work with enriched posts:

**Category-Based Filtering:**
```go
{{ $posts := where .Site.RegularPages "Params.categories" "intersect" (slice "watch") }}
```

**Image Display:**
```go
{{ if .Params.image }}
  <img src="{{ .Params.image }}" alt="Poster for {{ $title }}">
{{ else }}
  <div class="watch-poster-placeholder">
    <span>{{ $title }}</span>
  </div>
{{ end }}
```

**Fallback Support:**
If middleware fails, theme falls back to prefix-based detection (slower but functional).

## Migration Path

### Phase 1: Fix Artwork Enrichment (IMMEDIATE)
- Diagnose why images aren't being added
- Fix TMDB API integration
- Test with sample posts

### Phase 2: Add Category Enrichment (NEXT)
- Implement category addition on detection
- Update existing posts (optional backfill)

### Phase 3: Add Book Covers (SOON)
- Implement Open Library integration for "Reading:" posts
- Test with book posts

### Phase 4: Add Concert Images (FUTURE)
- Design approach for "Show:" posts
- Evaluate Spotify/MusicBrainz APIs

## Questions for Middleware Session

1. **Is the middleware running at all?**
   - Check webhook logs
   - Verify endpoint is reachable

2. **What is the current detection logic?**
   - Review code for prefix matching
   - Does it handle titleless posts?

3. **Is TMDB API configured?**
   - API key present?
   - Rate limits being hit?

4. **Are Micro.blog API calls succeeding?**
   - Check response codes
   - Authentication valid?

5. **What do the logs show?**
   - Any error messages?
   - Are enrichments being attempted?

## Resources

- **Middleware Repository:** https://github.com/rocksoup/microintegrations
- **Theme Repository:** https://github.com/rocksoup/mbtheme
- **TMDB API Docs:** https://developers.themoviedb.org/3
- **Open Library API:** https://openlibrary.org/dev/docs/api/covers
- **Micro.blog API:** https://help.micro.blog/t/micropub-api/68
- **Content Types Guide:** docs/content-types.md

---

**Created:** 2025-11-22
**For:** Micro.blog middleware enrichment troubleshooting
**Status:** Active issue - artwork not being added to posts
