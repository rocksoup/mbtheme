// Quick helper to fetch "Watched:" posts from a Micro.blog site archive JSON feed.
// Usage:
//   node scripts/fetch-watched-posts.js https://noise.stoneberg.net
//
// Notes:
// - This uses the public archive feed at /archive/index.json (no auth).
// - It looks at both title and content_text because short posts often have empty titles.
// - Output is printed to stdout; nothing is written to disk.

const site = process.argv[2];

if (!site) {
  console.error('Usage: node scripts/fetch-watched-posts.js <site root, e.g., https://noise.stoneberg.net>');
  process.exit(1);
}

const feedUrl = new URL('/archive/index.json', site).href;

async function fetchWatched() {
  console.log(`Fetching archive feed: ${feedUrl}`);
  const res = await fetch(feedUrl);
  if (!res.ok) {
    throw new Error(`Failed to fetch archive: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  const items = data.items || [];

  const watched = items.filter((item) => {
    const title = (item.title || '').trim();
    const content = (item.content_text || '').trim();
    return title.startsWith('Watched:') || content.startsWith('Watched:');
  });

  console.log(`Found ${watched.length} "Watched:" posts`);
  watched.slice(0, 10).forEach((item, idx) => {
    const title = (item.title || item.content_text || '').trim().split('\n')[0];
    console.log(
      `#${idx + 1} ${title} — ${item.date_published} — ${item.id || item.url || 'no id'}`
    );
  });
}

fetchWatched().catch((err) => {
  console.error(err);
  process.exit(1);
});
