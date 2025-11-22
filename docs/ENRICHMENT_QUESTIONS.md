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

**Last updated:** 2025-11-22
