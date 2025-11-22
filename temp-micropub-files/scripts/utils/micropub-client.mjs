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
