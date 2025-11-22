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

**Last updated:** 2025-11-22
