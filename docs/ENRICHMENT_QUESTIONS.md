# Post Enrichment Implementation - Open Questions

This document tracks questions and decisions needed before/during implementation of the post-facto enrichment system.

## Status Legend
- 🔴 **Blocking** - Must answer before proceeding
- 🟡 **Important** - Should answer soon, affects design
- 🟢 **Nice to have** - Can defer or decide during implementation
- ✅ **Resolved** - Question answered, decision made

---

## Questions

### 1. Micropub UPDATE API Support 🔴 **BLOCKING**

**Question:** The plan relies heavily on Micropub's `update` action (POST_ENRICHMENT_IMPLEMENTATION.md lines 252-323). Have you or the middleware developer verified that Micro.blog fully supports this?

**Why it matters:** The entire enrichment workflow depends on being able to update existing posts via Micropub. If this doesn't work, we need a different approach (delete/repost, native Micro.blog API, etc.).

**What we need:**
- Test Micropub UPDATE on a real Micro.blog post
- Verify it can update the `photo` field (used for images)
- Verify it can update the `category` field
- Understand any quirks or limitations in Micro.blog's implementation

**W3C Spec Reference:** https://www.w3.org/TR/micropub/#update

**Proposed Test:**
```javascript
// Create a test post
POST https://micro.blog/micropub
{
  "type": ["h-entry"],
  "properties": {
    "content": ["Test post for UPDATE verification"]
  }
}

// Then try to update it
POST https://micro.blog/micropub
{
  "action": "update",
  "url": "https://noise.stoneberg.net/2025/11/22/test-post.html",
  "replace": {
    "photo": ["https://example.com/test-image.jpg"]
  }
}
```

**Action items:**
- [ ] Create test post in Micro.blog
- [ ] Attempt UPDATE via Micropub with image
- [ ] Verify post is updated correctly
- [ ] Document any issues or limitations
- [ ] If UPDATE doesn't work, research alternatives

**Status:** 🔴 **BLOCKING** - Must verify before Milestone 1

---

### 2. Should We Remove Content Prefixes After Enrichment? ✅ **RESOLVED**

**Question:** After enrichment adds the image and category, should we remove the "Watched:", "Reading:", "Show:" prefix from the post content?

**Example:**
```markdown
Before: "Watched: Her 🍿"
After:  "Her 🍿"  (prefix removed)
```

**Why it matters:** Affects user experience and theme compatibility.

**Arguments for removal:**
- Cleaner appearance once categorized
- Category makes the prefix redundant
- Metadata belongs in frontmatter, not content

**Arguments against removal:**
- Prefix is part of the post's voice/tone
- Removing changes the user's original expression
- Theme's prefix fallback logic needs it for legacy posts
- User intentionally wrote it that way

**Decision:** ✅ **Keep the prefix**

**Rationale:**
- The prefix is how the user naturally expresses the activity ("Watched: Her 🍿")
- It's part of the content's meaning, not just metadata
- Removing it would alter the user's original post
- Theme already handles both category-based and prefix-based filtering
- Legacy posts without categories still work with prefix fallback

**Implementation note:** Enrichment adds `image` + `category` but leaves `content` unchanged.

**Status:** ✅ **RESOLVED** - Decision made: keep prefixes

---

### 3. Should We Enrich Draft Posts or Only Published Posts? ✅ **RESOLVED**

**Question:** Should the enrichment script process draft posts, or only published posts?

**Why it matters:** Affects filtering logic when fetching posts from Micro.blog API or feed.

**Arguments for enriching drafts:**
- Drafts will eventually be published, so enrich them early
- User can preview enriched post before publishing

**Arguments against enriching drafts:**
- Drafts may be unfinished or experimental
- User might delete or heavily edit draft before publishing
- Wasted API calls to TMDB/OpenLibrary for content that never goes live
- Published posts are the "source of truth"

**Decision:** ✅ **Only enrich published posts**

**Rationale:**
- Drafts are work-in-progress and may never be published
- Avoids wasting external API quota on temporary content
- Simpler filtering logic (no need to track draft state changes)
- Enrichment happens hourly anyway, so published posts get enriched quickly

**Implementation note:** When fetching posts (Milestone 1, Task 1.2), filter to only include posts with `published` status. If using JSON Feed, only feed items are published posts anyway.

**Status:** ✅ **RESOLVED** - Decision made: published only

---

### 4. How to Handle Multiple Content Type Prefixes in One Post? ✅ **RESOLVED**

**Question:** What should the enrichment script do if a single post contains multiple content type prefixes?

**Example:**
```markdown
Watched: Her 🍿 and Reading: Project Hail Mary 📚

Both were amazing!
```

**Why it matters:** Affects detection logic and which enrichment type to apply.

**Possible approaches:**

**Option A: First match only**
- Detect first prefix found ("Watched:" in example above)
- Enrich with movie poster only
- Simple, predictable behavior

**Option B: Multiple enrichments**
- Detect all prefixes
- Add multiple images (if Micropub supports array of photos)
- Add multiple categories (`watch` + `read`)
- More complex logic

**Option C: Skip/error**
- Treat as ambiguous and skip enrichment
- Log as error for manual review
- Conservative approach

**Decision:** ✅ **First match only**

**Rationale:**
- Most posts contain only one content type (single movie, single book, etc.)
- Simple, predictable behavior
- Avoids complexity of handling multiple images per post
- Micropub photo field handling for multiple images may vary
- User can create separate posts for separate content items
- Edge case that won't occur frequently in practice

**Implementation note:** Detection function returns on first match. If post starts with "Watched: X and Reading: Y", only "Watched:" is processed. Test case already exists in POST_ENRICHMENT_IMPLEMENTATION.md line 782.

**Status:** ✅ **RESOLVED** - Decision made: first match only

---

### 5. Polling vs Webhook Architecture? ✅ **RESOLVED**

**Question:** Should enrichment use polling (scheduled GitHub Actions) or webhook-based (real-time trigger) architecture?

**Why it matters:** Fundamental architecture decision affecting latency, complexity, and infrastructure.

**Option A: Polling (Scheduled GitHub Actions)**

**Pros:**
- Simple: No server required
- Reliable: GitHub Actions infrastructure
- Free: Within GitHub Actions limits
- Easy backfill: Just adjust time window
- Low maintenance: No uptime monitoring needed
- Works with existing workflow patterns (like Pinboard sync)

**Cons:**
- Latency: Up to 1 hour delay (hourly cron)
- Not real-time: Can't enrich immediately after posting

**Option B: Webhook (Real-time Server)**

**Pros:**
- Near-instant: Enrichment within seconds
- Real-time: Better user experience
- Event-driven: Only runs when needed

**Cons:**
- Complex: Requires running server
- Cost: Server hosting fees
- Reliability: Need uptime monitoring
- Maintenance: More moving parts
- Backfill: Requires separate script

**Decision:** ✅ **Polling (GitHub Actions hourly)**

**Rationale:**
- Personal blog with low posting volume (not 100+ posts/day)
- Hour delay acceptable given theme's prefix fallback shows posts immediately
- Simpler infrastructure with no server management
- Free within GitHub Actions limits
- Theme already designed for "post first, enrich later" workflow
- Can always migrate to webhooks later if real-time becomes critical

**Implementation note:** Use cron schedule `'30 * * * *'` (runs at :30 past each hour), offset from Pinboard sync which runs on the hour. 48-hour lookback window provides safety buffer for any missed runs.

**Status:** ✅ **RESOLVED** - Decision made: polling with hourly GitHub Actions

---

### 6. How to Fetch Posts from Micro.blog? ✅ **RESOLVED**

**Question:** Should we use Micro.blog's API to fetch posts, or use the existing JSON Feed?

**Why it matters:** Affects implementation complexity for Milestone 1, Task 1.2 (Post Fetching).

**Option A: Micro.blog API**

**Pros:**
- Native API access
- More flexible querying
- Direct control over filtering

**Cons:**
- Need to research API endpoints
- May require authentication
- Documentation may be sparse
- Need to understand date filtering capabilities
- More moving parts

**Option B: JSON Feed**

**Pros:**
- Feed already exists at `https://noise.stoneberg.net/feed.json`
- Standard JSON Feed format (well-documented)
- No authentication needed for public feeds
- Simple fetch and parse
- Already tested and working
- Contains all published posts

**Cons:**
- Less flexible filtering
- May have size limits (typically last N posts)
- Can't query specific date ranges via API
- Client-side filtering required

**Decision:** ✅ **Use JSON Feed for post fetching**

**Rationale:**
- JSON Feed already exists and is publicly accessible
- Standard format is well-documented and stable
- No need to research Micro.blog's internal API
- Simpler implementation (just `fetch()` and parse JSON)
- 48-hour lookback window means we're only processing recent posts anyway
- Feed likely contains more than 48 hours of posts
- Can always switch to API later if feed proves insufficient

**Implementation approach:**
```javascript
async function fetchRecentPosts() {
  const feed = await fetch('https://noise.stoneberg.net/feed.json');
  const data = await feed.json();

  const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

  return data.items.filter(post => {
    const pubDate = new Date(post.date_published);
    return pubDate > twoDaysAgo;
  });
}
```

**Feed format reference:** https://www.jsonfeed.org/version/1.1/

**Implementation note:** Milestone 1, Task 1.2 simplified - no API research needed, just fetch and parse JSON Feed. Posts are already in usable format with `content_text`, `date_published`, and `url` fields.

**Status:** ✅ **RESOLVED** - Decision made: use JSON Feed

---

### 7. Where Should We Store the Enrichment Log? ✅ **RESOLVED**

**Question:** Where should the `.enrichment-log.json` file be stored and how should it be managed?

**Why it matters:** Affects repository cleanliness and log persistence strategy.

**Option A: Commit to Repository**

**Pros:**
- Simple: Log tracked in git history
- Always available in repository
- Easy to access and review

**Cons:**
- Clutters git history with frequent `[skip ci]` commits
- Log grows over time
- Every enrichment run = new commit
- Noise in commit history

**Option B: GitHub Gist**

**Pros:**
- Separate from main repository
- Updatable via API
- No repository commits

**Cons:**
- More complex: Need Gist API integration
- Additional secret management
- External dependency

**Option C: Store in Repository but .gitignore + GitHub Actions Artifacts**

**Pros:**
- Log persists locally during runs
- No git history clutter
- GitHub Actions can upload as artifact
- Can download artifacts from Actions UI
- Keeps repository clean
- Log survives between workflow runs (via artifact download)

**Cons:**
- Artifacts expire after 90 days (GitHub default)
- Slightly more complex workflow setup
- Need to download previous artifact at start of each run

**Decision:** ✅ **Store in repository with .gitignore, use GitHub Actions artifacts**

**Rationale:**
- Keeps repository commit history clean
- Log is preserved via GitHub Actions artifacts
- Can review logs by downloading artifacts from Actions runs
- No external dependencies (Gist API)
- Workflow can restore previous log from artifacts
- 90-day artifact retention is sufficient for enrichment history

**Implementation approach:**

1. **Add to `.gitignore`:**
```
.enrichment-log.json
```

2. **GitHub Actions workflow:**
```yaml
steps:
  - name: Download previous enrichment log
    uses: actions/download-artifact@v4
    with:
      name: enrichment-log
    continue-on-error: true  # First run won't have artifact

  - name: Run enrichment
    run: node scripts/post-enrichment.mjs

  - name: Upload enrichment log
    uses: actions/upload-artifact@v4
    with:
      name: enrichment-log
      path: .enrichment-log.json
      retention-days: 90
```

**Implementation note:** Update POST_ENRICHMENT_IMPLEMENTATION.md lines 410-424 to remove git commit step and add artifact upload/download instead.

**Status:** ✅ **RESOLVED** - Decision made: .gitignore + GitHub Actions artifacts

---

**Last updated:** 2025-11-22
