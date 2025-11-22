# Post Enrichment Implementation - Open Questions

This document tracks questions and decisions needed before/during implementation of the post-facto enrichment system.

## Status Legend
- 🔴 **Blocking** - Must answer before proceeding
- 🟡 **Important** - Should answer soon, affects design
- 🟢 **Nice to have** - Can defer or decide during implementation
- ✅ **Resolved** - Question answered, decision made

---

## Questions

### 1. Micropub UPDATE API Support 🔴 **BLOCKING - VALIDATION REQUIRED**

**Nature:** This is more of a **validation** than a question. If Micropub UPDATE works, we can proceed with the implementation plan as designed. If it doesn't work, we need to revisit the entire approach.

**Question:** The plan relies heavily on Micropub's `update` action (POST_ENRICHMENT_IMPLEMENTATION.md lines 252-323). Does Micro.blog fully support Micropub UPDATE for modifying existing posts?

**Why this is critical:** The entire background enrichment workflow depends on being able to update existing posts via Micropub. If this doesn't work, the current plan is not viable and we need a fundamentally different approach.

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
- [ ] If UPDATE doesn't work, evaluate alternatives below

**Alternative approaches if Micropub UPDATE fails:**

If Micro.blog doesn't support Micropub UPDATE, here are potential alternatives:

**Option A: Delete and Recreate**
- Fetch original post content
- Delete original post via Micropub DELETE
- Create new post with same content + image + category
- Preserve original publication date
- **Risk:** Loses post URL, breaks existing links

**Option B: Native Micro.blog API**
- Research Micro.blog's native API (not Micropub)
- May have direct post editing endpoints
- Requires different authentication approach
- **Unknown:** What capabilities exist?

**Option C: Manual Hugo Frontmatter**
- Can't modify posts in Micro.blog directly
- Instead, override in Hugo theme
- Maintain external mapping file: `{post_url: {image: url, category: watch}}`
- Theme reads mapping and injects image/category at build time
- **Pro:** No Micropub needed
- **Con:** Metadata not in Micro.blog (two sources of truth)

**Option D: Hybrid Approach**
- Use Micropub to create new "enrichment annotation" posts
- Special post type: references original post, contains image
- Theme detects and merges annotation into original display
- **Pro:** No modification of originals
- **Con:** Complex theme logic

**Recommendation if UPDATE fails:** Research Option B (native Micro.blog API) first, fall back to Option C (Hugo mapping) if needed. Avoid Option A (breaks URLs) and Option D (too complex).

**Status:** 🔴 **BLOCKING - VALIDATION REQUIRED** - Must verify before Milestone 1

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

### 8. Should We Support Force Re-enrichment? ✅ **RESOLVED**

**Question:** Should the enrichment script support re-enriching posts that have already been enriched?

**Why it matters:** Affects how the script handles already-processed posts and enables manual overrides.

**Use cases for re-enrichment:**

1. **Better artwork becomes available:** TMDB adds higher quality poster later
2. **Initial enrichment failed:** Movie wasn't in TMDB at first, but is now
3. **Wrong artwork:** Script picked wrong movie/book, user wants to retry
4. **Database updates:** External API (TMDB/OpenLibrary) data improved
5. **Testing:** Developer wants to test enrichment on specific posts

**Current behavior (from implementation plan):**
- `needsEnrichment()` skips posts that already have `image` field
- Enrichment log tracks previously processed posts
- Once enriched, posts are never re-processed

**Option A: No force re-enrichment**

**Pros:**
- Simple: Stick to current logic
- Prevents duplicate API calls
- No additional flags or complexity

**Cons:**
- Can't fix incorrect enrichments
- Can't benefit from API improvements
- Manual workarounds needed (delete image field, edit log)

**Option B: Add --force flag**

**Pros:**
- Gives manual control when needed
- Can target specific post URLs
- Can re-process all posts if needed
- Simple flag-based interface

**Cons:**
- Slightly more complex script logic
- Need to bypass eligibility checks

**Decision:** ✅ **Add force re-enrichment support**

**Rationale:**
- Provides escape hatch for edge cases
- Useful for testing and debugging
- Simple to implement (bypass image field check)
- Not used in normal hourly runs (only when manually triggered)
- Gives user control over their enrichments

**Implementation approach:**

**Command-line interface:**
```bash
# Re-enrich specific post
node scripts/post-enrichment.mjs --force --url https://noise.stoneberg.net/2025/11/22/watched-her.html

# Re-enrich all posts matching prefix (last 48 hours)
node scripts/post-enrichment.mjs --force --all

# Re-enrich specific post in dry run
DRY_RUN=true node scripts/post-enrichment.mjs --force --url https://noise.../post.html
```

**Code changes:**
```javascript
function needsEnrichment(post, options = {}) {
  // Force flag bypasses all checks
  if (options.force) {
    return detectContentType(post) !== null;
  }

  // Normal eligibility checks
  if (post.image) return false;
  if (alreadyEnriched(post.url)) return false;

  return detectContentType(post) !== null;
}
```

**Safety considerations:**
- `--force` only works with manual `workflow_dispatch` triggers
- Not available in scheduled hourly runs
- Requires explicit URL or `--all` flag (prevents accidents)
- Dry run mode available for testing

**Implementation note:** Add to Milestone 4 (Main Script) or Milestone 7 (Testing) as "nice to have" feature.

**Status:** ✅ **RESOLVED** - Decision made: implement --force flag

---

### 9. What Terminology Should We Use? ✅ **RESOLVED**

**Question:** What's the correct term for this enrichment system?

**Why it matters:** Consistency in documentation, code comments, and discussion.

**Options considered:**

**"Middleware"**
- Traditional meaning: Software that processes requests/responses in real-time
- Implies processing *during* the posting workflow
- Not accurate: Our system runs *after* posts are published
- Common term but misleading in this context

**"Post-processing"**
- Accurate: Processing happens after posting
- Generic: Could mean many things
- Not very descriptive

**"Background enrichment"**
- Accurate: Runs in background (hourly GitHub Actions)
- Descriptive: Clearly conveys what it does (enriches posts)
- Distinguishes from real-time "middleware"
- Easy to understand

**Decision:** ✅ **Use "background enrichment"**

**Rationale:**
- More accurate than "middleware" (not processing during request cycle)
- Clearly describes the system: enriches posts in the background
- Distinguishes from future real-time webhook-based approaches
- Better matches the actual architecture (scheduled polling)

**Terminology guide:**

| Use this | Not this | Context |
|----------|----------|---------|
| Background enrichment system | Middleware | Overall system |
| Enrichment script | Middleware script | The Node.js script |
| Enrichment workflow | Middleware workflow | GitHub Actions workflow |
| Post enrichment | Middleware processing | The act of adding artwork/categories |
| Background process | Middleware service | The scheduled job |

**Documentation updates needed:**
- File names can stay as-is (POST_ENRICHMENT_IMPLEMENTATION.md is accurate)
- MIDDLEWARE_REQUIREMENTS.md could be renamed if needed
- Future code/comments should use "background enrichment"

**Status:** ✅ **RESOLVED** - Use "background enrichment" terminology

---

**Last updated:** 2025-11-22
