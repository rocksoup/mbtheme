# Watching Page - Micropub Implementation Checklist

## 📋 Overview

**Problem:** Images aren't showing on the watching page because the current enrichment writes to a data file that the theme never reads.

**Solution:** Implement Micropub-based enrichment that updates actual Micro.blog posts with poster images.

---

## ✅ Implementation Complete!

**Status:** 🎉 **FULLY DEPLOYED AND WORKING**

All components have been successfully implemented and are running in production.

### Theme Repo (mbtheme)
- [x] Fixed image extraction from post content HTML
- [x] Removed debug output from watching page
- [x] Bumped version to 0.1.46
- [x] Committed and merged to main

**Commit:** `fefa0f7` - "Fix watching page image display and remove debug output"

### Microintegrations Repo
- [x] Implemented Micropub client (`scripts/utils/micropub-client.mjs`)
- [x] Implemented enrichment script (`scripts/enrich-watched-micropub.mjs`)
- [x] Created GitHub Actions workflow (`.github/workflows/enrich-watched.yml`)
- [x] Added npm script `enrich:watched:micropub`
- [x] Configured all required secrets
- [x] Fixed content extraction for feeds without `content_text`
- [x] Fixed URL to use canonical domain (`noise.stoneberg.net`)
- [x] Fixed TMDB search to sort by popularity

**Key Commits:**
- `7ba3b45` - Add Micropub post enrichment implementation
- `3028fde` - Fix content extraction from feeds without content_text
- `15d37f2` - Fix movie title extraction to use only first line
- `adfd7ed` - Fix Micropub URL to use canonical domain
- `47875a4` - Sort TMDB search results by popularity

---

## 🎯 Deployment Steps (Completed)

### Step 1: Get Micro.blog App Token ✅

- [x] Go to https://micro.blog/account/apps
- [x] Click "New App Token"
- [x] Name it: "Post Enrichment" or "Micropub Enrichment"
- [x] Copy the generated token (save it somewhere secure)

---

### Step 2: Add Files to microintegrations Repository

**Location of implementation files:** `/tmp/micropub-implementation/`

#### File 1: `scripts/utils/micropub-client.mjs`

- [ ] Create directory: `scripts/utils/` (if it doesn't exist)
- [ ] Create file: `scripts/utils/micropub-client.mjs`
- [ ] Copy content from: `/tmp/micropub-implementation/scripts/utils/micropub-client.mjs`

<details>
<summary>Click to view file content</summary>

```javascript
// See: /tmp/micropub-implementation/scripts/utils/micropub-client.mjs
// OR run: cat /tmp/micropub-implementation/scripts/utils/micropub-client.mjs
```
</details>

#### File 2: `scripts/enrich-watched-micropub.mjs`

- [ ] Create file: `scripts/enrich-watched-micropub.mjs`
- [ ] Copy content from: `/tmp/micropub-implementation/scripts/enrich-watched-micropub.mjs`

<details>
<summary>Click to view file content</summary>

```javascript
// See: /tmp/micropub-implementation/scripts/enrich-watched-micropub.mjs
// OR run: cat /tmp/micropub-implementation/scripts/enrich-watched-micropub.mjs
```
</details>

#### File 3: Update `package.json`

- [ ] Open `package.json`
- [ ] Add new npm script:

```json
{
  "scripts": {
    "enrich:watched": "node scripts/enrich-watched.mjs",
    "enrich:watched:micropub": "node scripts/enrich-watched-micropub.mjs"
  }
}
```

#### File 4: Update `.github/workflows/enrich-watched.yml`

- [ ] Replace existing workflow file
- [ ] Copy content from: `/tmp/micropub-implementation/.github-workflows-enrich-watched.yml`

<details>
<summary>Click to view workflow content</summary>

```yaml
name: Enrich Watched Movies (Micropub)

on:
  schedule:
    - cron: '30 * * * *'
  workflow_dispatch:

permissions:
  contents: read

jobs:
  enrich-watched:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - name: Enrich posts via Micropub
        env:
          MICROBLOG_TOKEN: ${{ secrets.MICROBLOG_TOKEN }}
          MICROBLOG_FEED_URL: ${{ secrets.MICROBLOG_FEED_URL }}
          TMDB_API_KEY: ${{ secrets.TMDB_API_KEY }}
        run: npm run enrich:watched:micropub
```
</details>

---

### Step 3: Configure GitHub Repository Secrets

Go to your `microintegrations` repo → Settings → Secrets and variables → Actions

- [ ] Add secret: **MICROBLOG_TOKEN**
  - Value: The token from Step 1

- [ ] Add secret: **MICROBLOG_FEED_URL**
  - Value: `https://noise.stoneberg.net/feed.json`

- [ ] Verify secret: **TMDB_API_KEY**
  - Should already exist
  - If not, get from: https://www.themoviedb.org/settings/api

---

### Step 4: Commit and Push Changes

- [ ] Stage all new files
- [ ] Commit with message: "Add Micropub post enrichment implementation"
- [ ] Push to main branch (or create PR)

```bash
git add scripts/utils/micropub-client.mjs
git add scripts/enrich-watched-micropub.mjs
git add package.json
git add .github/workflows/enrich-watched.yml
git commit -m "Add Micropub post enrichment implementation"
git push
```

---

### Step 5: Test the Implementation

#### Local Testing (Optional)

- [ ] Create `.env` file with:

```bash
MICROBLOG_TOKEN=your_token_here
MICROBLOG_FEED_URL=https://noise.stoneberg.net/feed.json
TMDB_API_KEY=your_tmdb_key
DRY_RUN=true
```

- [ ] Run: `npm run enrich:watched:micropub`
- [ ] Verify output shows "DRY RUN" and lists posts that would be updated
- [ ] Check no errors occur

#### GitHub Actions Testing

- [ ] Go to Actions tab in microintegrations repo
- [ ] Find "Enrich Watched Movies (Micropub)" workflow
- [ ] Click "Run workflow" (manual trigger)
- [ ] Monitor the run
- [ ] Check logs for success

---

### Step 6: Verify Posts Were Updated

- [ ] Wait for workflow to complete
- [ ] Go to Micro.blog → Posts
- [ ] Open one of the "Watched:" posts (e.g., "Her" or "Pretty Woman")
- [ ] Check if post now has a photo/image attached
- [ ] Refresh your watching page: https://noise.stoneberg.net/watching/
- [ ] Verify posters now show for enriched posts

---

### Step 7: Enable Automatic Enrichment

- [ ] Verify hourly schedule is enabled in workflow (already in the YAML)
- [ ] Monitor first few automatic runs
- [ ] Check GitHub Actions → Workflow runs for any errors

---

## 📊 Expected Results

### Before Micropub Implementation:
```
GitHub Action → Fetch TMDB → Write data/watched.enriched.json → Commit
Theme → Finds posts via categories → Ignores data file → No images shown ❌
```

### After Micropub Implementation:
```
GitHub Action → Fetch posts → Get TMDB posters → Update posts via Micropub
Micro.blog → Rebuilds site with updated posts
Theme → Finds posts with photo field → Shows images ✅
```

---

## 🔍 How to View Implementation Files

All implementation files are in: `/tmp/micropub-implementation/`

To view a file:
```bash
cat /tmp/micropub-implementation/scripts/utils/micropub-client.mjs
cat /tmp/micropub-implementation/scripts/enrich-watched-micropub.mjs
cat /tmp/micropub-implementation/.github-workflows-enrich-watched.yml
cat /tmp/micropub-implementation/README.md
cat /tmp/micropub-implementation/IMPLEMENTATION_SUMMARY.md
```

To list all files:
```bash
find /tmp/micropub-implementation -type f
```

---

## 🐛 Troubleshooting

### Error: "Micropub update failed: 401"
- **Issue:** Invalid or missing token
- **Fix:** Check MICROBLOG_TOKEN secret is correct, regenerate if needed

### Error: "No poster found"
- **Issue:** Movie not in TMDB or title mismatch
- **Fix:**
  - Add year to post: "Watched: Her (2013)"
  - Check movie exists on TMDB
  - Verify title spelling

### Posts not updating
- **Issue:** Wrong feed URL or Micropub endpoint
- **Fix:**
  - Verify MICROBLOG_FEED_URL is correct
  - Check workflow logs for specific error
  - Ensure token has "post" permission

### Images still not showing after enrichment
- **Issue:** Micro.blog may not have rebuilt yet
- **Fix:**
  - Wait 5-10 minutes for rebuild
  - Check post on Micro.blog admin to see if photo field was added
  - Hard refresh browser (Cmd+Shift+R or Ctrl+Shift+F5)

---

## 📚 Additional Resources

- **Micropub Spec:** https://www.w3.org/TR/micropub/
- **Micro.blog Apps:** https://micro.blog/account/apps
- **TMDB API Docs:** https://developers.themoviedb.org/3
- **Implementation Details:** `/tmp/micropub-implementation/README.md`

---

## 🎉 Success Criteria

- [ ] Workflow runs without errors
- [ ] Posts get `photo` field added via Micropub
- [ ] Watching page shows movie posters
- [ ] Hourly enrichment runs automatically
- [ ] New "Watched:" posts get enriched within 1 hour

---

## 📝 Notes

- The script adds a 500ms delay between API calls to be respectful
- Posts with existing images are skipped automatically
- The `watching` category is added if not already present
- DRY_RUN mode available for testing without updates
- Rate limits: TMDB allows 40 requests per 10 seconds

---

**Created:** 2025-11-22
**Theme Version:** 0.1.46
**Implementation:** Micropub-based post enrichment
