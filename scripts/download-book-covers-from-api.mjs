// ABOUTME: Downloads high-quality book cover images from Google Books API
// ABOUTME: Uses bookshelves.json data to get book ISBNs and fetch original covers

import fs from 'fs/promises';
import { createWriteStream } from 'fs';
import https from 'https';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, '../../microintegrations/data/bookshelves.json');
const OUTPUT_DIR = path.join(__dirname, '../static/images/books');

// Ensure output directory exists
await fs.mkdir(OUTPUT_DIR, { recursive: true });

// Download an image
async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    protocol.get(url, (res) => {
      if (res.statusCode === 200) {
        const fileStream = createWriteStream(filepath);
        res.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          resolve();
        });
        fileStream.on('error', reject);
      } else {
        reject(new Error(`Failed to download: ${res.statusCode}`));
      }
    }).on('error', reject);
  });
}

// Extract Google Books ID from cover URL
function extractGoogleBooksId(coverUrl) {
  if (!coverUrl) return null;
  const match = coverUrl.match(/[?&]id=([^&]+)/);
  return match ? match[1] : null;
}

// Get high quality cover from Google Books
function getHighQualityCoverUrl(coverUrl) {
  const bookId = extractGoogleBooksId(coverUrl);
  if (!bookId) return coverUrl;

  // Get the original high-quality image from Google Books
  return `https://books.google.com/books/content?id=${bookId}&printsec=frontcover&img=1&zoom=0&source=gbs_api`;
}

// Main function
async function main() {
  console.log('Reading bookshelves data...');
  const data = JSON.parse(await fs.readFile(DATA_FILE, 'utf8'));

  const allBooks = [
    ...(data.currentlyReading || []),
    ...(data.wantToRead || []),
    ...(data.finished || [])
  ];

  console.log(`Found ${allBooks.length} books`);

  for (const book of allBooks) {
    // Extract ISBN from URL if not in data
    let isbn = book.isbn;
    if (!isbn && book.url) {
      const match = book.url.match(/\/books\/(\d+)/);
      isbn = match ? match[1] : null;
    }

    if (!isbn) {
      console.log(`⚠ Skipping ${book.title} (no ISBN)`);
      continue;
    }

    const filename = `${isbn}.jpg`;
    const filepath = path.join(OUTPUT_DIR, filename);

    if (await fs.access(filepath).then(() => true).catch(() => false)) {
      console.log(`✓ Skipping ${book.title} (already exists)`);
      continue;
    }

    try {
      const imageUrl = getHighQualityCoverUrl(book.cover_url);
      console.log(`Downloading ${book.title}...`);
      console.log(`  URL: ${imageUrl}`);
      await downloadImage(imageUrl, filepath);
      console.log(`✓ Saved ${filename}`);
    } catch (error) {
      console.error(`✗ Failed to download ${book.title}: ${error.message}`);
    }

    // Rate limit
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\nDone! Book covers saved to:', OUTPUT_DIR);
}

main().catch(console.error);
