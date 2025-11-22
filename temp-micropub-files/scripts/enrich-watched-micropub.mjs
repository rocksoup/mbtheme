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
