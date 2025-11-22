# Micropub Implementation - Code Files

## Quick Copy Reference

Copy these code blocks into your microintegrations repository.

---

## File 1: `scripts/utils/micropub-client.mjs`

**Location:** `scripts/utils/micropub-client.mjs`

/**
 * Micropub Client for Micro.blog
 *
 * Provides functions to update existing posts via the Micropub protocol.
 * @see https://www.w3.org/TR/micropub/#update
 */

/**
 * Update an existing post on Micro.blog via Micropub
 *
 * @param {string} postUrl - The URL of the post to update
 * @param {Object} updates - Fields to update
 * @param {string} [updates.photo] - Photo URL to add/update
 * @param {string[]} [updates.category] - Categories to set
 * @param {Object} options - Configuration
 * @param {string} options.token - Micro.blog app token
 * @param {boolean} [options.dryRun=false] - Preview mode (don't actually update)
 * @returns {Promise<Object>} Update result
 */
export async function updateMicroblogPost(postUrl, updates, options = {}) {
  const { token, dryRun = false } = options;

  if (!token) {
    throw new Error('Micropub token is required (set MICROBLOG_TOKEN env var)');
  }

  if (dryRun) {
    console.log(`[DRY RUN] Would update post: ${postUrl}`);
    console.log('  Updates:', JSON.stringify(updates, null, 2));
    return { url: postUrl, dryRun: true, updates };
  }

  // Build Micropub update request
  const body = {
    action: 'update',
    url: postUrl,
    replace: {}
  };

  // Add photo if provided
  if (updates.photo) {
    body.replace.photo = [updates.photo];
  }

  // Add categories if provided
  if (updates.category) {
    body.replace.category = updates.category;
  }

  try {
    // Send to Micro.blog Micropub endpoint
    const response = await fetch('https://micro.blog/micropub', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Micropub update failed (${response.status}): ${errorText}`);
    }

    // Micro.blog returns 200/201 on success, sometimes with Location header
    const location = response.headers.get('Location');

    return {
      url: location || postUrl,
      status: 'updated',
      statusCode: response.status
    };

  } catch (error) {
    console.error(`Failed to update ${postUrl}:`, error.message);
    throw error;
  }
}

/**
 * Fetch posts from Micro.blog JSON Feed
 *
 * @param {string} feedUrl - URL to the JSON feed (e.g., https://username.micro.blog/feed.json)
 * @param {Object} [options={}] - Options
 * @param {number} [options.limit] - Maximum number of posts to fetch
 * @returns {Promise<Array>} Array of post objects
 */
export async function fetchMicroblogPosts(feedUrl, options = {}) {
  const { limit } = options;

  try {
    const response = await fetch(feedUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch feed: ${response.status} ${response.statusText}`);
    }

    const feed = await response.json();
    let posts = feed.items || [];

    if (limit) {
      posts = posts.slice(0, limit);
    }

    // Transform to a consistent format
    return posts.map(item => ({
      url: item.id || item.url,
      title: item.title || '',
      content: item.content_html || item.content_text || '',
      contentText: item.content_text || '',
      date: item.date_published,
      categories: item.tags || [],
      // Check for existing images
      images: item.image ? [item.image] : (item.attachments || [])
        .filter(a => a.mime_type && a.mime_type.startsWith('image/'))
        .map(a => a.url)
    }));

  } catch (error) {
    console.error('Failed to fetch Micro.blog posts:', error.message);
    throw error;
  }
}

---

## File 2: `scripts/enrich-watched-micropub.mjs`

**Location:** `scripts/enrich-watched-micropub.mjs`

#!/usr/bin/env node

/**
 * Enrich Watched Movies Posts with TMDB Posters via Micropub
 *
 * This script:
 * 1. Fetches recent posts from Micro.blog JSON feed
 * 2. Identifies "Watched:" posts without images
 * 3. Fetches movie posters from TMDB
 * 4. Updates the posts via Micropub to add the poster
 *
 * Environment variables required:
 * - MICROBLOG_TOKEN: App token from https://micro.blog/account/apps
 * - MICROBLOG_FEED_URL: Your feed URL (e.g., https://noise.stoneberg.net/feed.json)
 * - TMDB_API_KEY: API key from https://www.themoviedb.org/settings/api
 *
 * Optional:
 * - DRY_RUN=true: Preview mode, doesn't actually update posts
 * - WATCH_LIMIT=10: Maximum number of posts to check (default: 50)
 */

import { fetchMicroblogPosts, updateMicroblogPost } from './utils/micropub-client.mjs';

const DRY_RUN = process.env.DRY_RUN === 'true';
const MICROBLOG_TOKEN = process.env.MICROBLOG_TOKEN;
const MICROBLOG_FEED_URL = process.env.MICROBLOG_FEED_URL;
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const WATCH_LIMIT = parseInt(process.env.WATCH_LIMIT || '50', 10);

/**
 * Check if post is a "Watched:" post
 */
function isWatchedPost(post) {
  const text = (post.title + ' ' + post.contentText).toLowerCase();
  return /^\s*watched:/im.test(text);
}

/**
 * Extract movie title from "Watched:" post
 */
function extractMovieTitle(post) {
  const text = post.title || post.contentText || '';

  // Remove "Watched:" prefix
  let title = text.replace(/^watched:\s*/i, '').trim();

  // Remove emoji (🍿) and anything after it
  title = title.replace(/🍿.*$/, '').trim();

  // Extract year if present: "Movie Name (2021)"
  const yearMatch = title.match(/\((\d{4})\)/);
  const year = yearMatch ? yearMatch[1] : null;
  title = title.replace(/\s*\(\d{4}\)/, '').trim();

  // Remove trailing punctuation
  title = title.replace(/[.,!?]+$/, '');

  return { title, year };
}

/**
 * Fetch movie poster from TMDB
 */
async function fetchTMDBPoster(movieTitle, year = null) {
  if (!TMDB_API_KEY) {
    throw new Error('TMDB_API_KEY not set');
  }

  const searchUrl = new URL('https://api.themoviedb.org/3/search/movie');
  searchUrl.searchParams.set('api_key', TMDB_API_KEY);
  searchUrl.searchParams.set('query', movieTitle);

  if (year) {
    searchUrl.searchParams.set('year', year);
  }

  try {
    const response = await fetch(searchUrl.toString());

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return null;
    }

    // Get the first result's poster
    const movie = data.results[0];
    if (!movie.poster_path) {
      return null;
    }

    // Return w500 size poster URL
    return `https://image.tmdb.org/t/p/w500${movie.poster_path}`;

  } catch (error) {
    console.error(`  ❌ TMDB fetch failed: ${error.message}`);
    return null;
  }
}

/**
 * Process and enrich a single watched post
 */
async function enrichWatchedPost(post) {
  // Extract movie title
  const { title, year } = extractMovieTitle(post);

  console.log(`\n📽️  ${title}${year ? ` (${year})` : ''}`);
  console.log(`   Post: ${post.url}`);

  // Check if already has an image
  if (post.images && post.images.length > 0) {
    console.log(`   ⏭️  Already has image, skipping`);
    return { skipped: true, reason: 'has-image' };
  }

  // Fetch poster from TMDB
  console.log(`   🔍 Searching TMDB...`);
  const posterUrl = await fetchTMDBPoster(title, year);

  if (!posterUrl) {
    console.log(`   ❌ No poster found`);
    return { skipped: true, reason: 'no-poster' };
  }

  console.log(`   ✅ Poster found: ${posterUrl}`);

  // Update post via Micropub
  console.log(`   📝 Updating post...`);

  try {
    const result = await updateMicroblogPost(
      post.url,
      {
        photo: posterUrl,
        category: post.categories.includes('watching') ? post.categories : [...post.categories, 'watching']
      },
      {
        token: MICROBLOG_TOKEN,
        dryRun: DRY_RUN
      }
    );

    if (DRY_RUN) {
      console.log(`   🔍 [DRY RUN] Would update post`);
    } else {
      console.log(`   ✅ Post updated!`);
    }

    return {
      success: true,
      title,
      year,
      posterUrl,
      postUrl: post.url
    };

  } catch (error) {
    console.error(`   ❌ Update failed: ${error.message}`);
    return {
      error: true,
      title,
      postUrl: post.url,
      errorMessage: error.message
    };
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('='.repeat(60));
  console.log('🎬 Enrich Watched Movies with TMDB Posters (via Micropub)');
  console.log('='.repeat(60));

  if (DRY_RUN) {
    console.log('⚠️  DRY RUN MODE - No posts will be updated');
  }

  console.log('');

  // Validate required environment variables
  if (!MICROBLOG_TOKEN) {
    console.error('❌ Error: MICROBLOG_TOKEN not set');
    console.error('   Get a token from: https://micro.blog/account/apps');
    process.exit(1);
  }

  if (!MICROBLOG_FEED_URL) {
    console.error('❌ Error: MICROBLOG_FEED_URL not set');
    console.error('   Example: https://yourblog.micro.blog/feed.json');
    process.exit(1);
  }

  if (!TMDB_API_KEY) {
    console.error('❌ Error: TMDB_API_KEY not set');
    console.error('   Get an API key from: https://www.themoviedb.org/settings/api');
    process.exit(1);
  }

  console.log(`📡 Fetching posts from: ${MICROBLOG_FEED_URL}`);

  // Fetch posts
  let posts;
  try {
    posts = await fetchMicroblogPosts(MICROBLOG_FEED_URL, { limit: WATCH_LIMIT });
    console.log(`   Found ${posts.length} posts\n`);
  } catch (error) {
    console.error(`❌ Failed to fetch posts: ${error.message}`);
    process.exit(1);
  }

  // Filter for "Watched:" posts
  const watchedPosts = posts.filter(isWatchedPost);

  if (watchedPosts.length === 0) {
    console.log('ℹ️  No "Watched:" posts found');
    process.exit(0);
  }

  console.log(`🎯 Found ${watchedPosts.length} watched posts`);

  // Process each watched post
  const results = {
    updated: [],
    skipped: [],
    errors: []
  };

  for (const post of watchedPosts) {
    const result = await enrichWatchedPost(post);

    if (result.success) {
      results.updated.push(result);
    } else if (result.error) {
      results.errors.push(result);
    } else if (result.skipped) {
      results.skipped.push(result);
    }

    // Rate limit: wait a bit between requests to be nice to APIs
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Summary');
  console.log('='.repeat(60));
  console.log(`   Updated: ${results.updated.length}`);
  console.log(`   Skipped: ${results.skipped.length}`);
  console.log(`   Errors: ${results.errors.length}`);
  console.log('='.repeat(60));

  if (results.updated.length > 0) {
    console.log('\n✅ Updated posts:');
    results.updated.forEach(r => {
      console.log(`   - ${r.title}${r.year ? ` (${r.year})` : ''}`);
    });
  }

  if (results.errors.length > 0) {
    console.log('\n❌ Errors:');
    results.errors.forEach(r => {
      console.log(`   - ${r.title}: ${r.errorMessage}`);
    });
  }

  console.log('');

  // Exit with error if any errors occurred
  if (results.errors.length > 0) {
    process.exit(1);
  }
}

main().catch(error => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});

---

## File 3: `.github/workflows/enrich-watched.yml`

**Location:** `.github/workflows/enrich-watched.yml`

name: Enrich Watched Movies (Micropub)

on:
  # Run hourly at :30 past the hour
  schedule:
    - cron: '30 * * * *'

  # Allow manual trigger
  workflow_dispatch:

permissions:
  contents: read

jobs:
  enrich-watched:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run enrichment via Micropub
        env:
          MICROBLOG_TOKEN: ${{ secrets.MICROBLOG_TOKEN }}
          MICROBLOG_FEED_URL: ${{ secrets.MICROBLOG_FEED_URL }}
          TMDB_API_KEY: ${{ secrets.TMDB_API_KEY }}
          WATCH_LIMIT: 50
        run: node scripts/enrich-watched-micropub.mjs

---

## File 4: Update `package.json`

Add this to your scripts section:

```json
{
  "scripts": {
    "enrich:watched": "node scripts/enrich-watched.mjs",
    "enrich:watched:micropub": "node scripts/enrich-watched-micropub.mjs"
  }
}
```

---

**End of Code Files**
