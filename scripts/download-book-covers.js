// ABOUTME: Downloads book cover images from the reading page
// ABOUTME: Saves them locally with ISBN-based filenames for theme use

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const READING_PAGE_URL = 'https://noise.stoneberg.net/reading/';
const OUTPUT_DIR = path.join(__dirname, '../static/images/books');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Fetch and parse the reading page
async function fetchReadingPage() {
  return new Promise((resolve, reject) => {
    https.get(READING_PAGE_URL, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// Extract book data from HTML
function extractBookData(html) {
  const books = [];
  const bookCardRegex = /<a href="https:\/\/micro\.blog\/books\/(\d+)"[^>]*>[\s\S]*?<img src="([^"]+)"[\s\S]*?alt="Cover of ([^"]+)"[\s\S]*?<div class="book-title">([^<]+)<\/div>[\s\S]*?<div class="book-author">([^<]*)<\/div>/g;

  let match;
  while ((match = bookCardRegex.exec(html)) !== null) {
    const [, isbn, cdnUrl, altTitle, title, author] = match;

    // Decode the CDN URL to get the original Google Books URL
    let imageUrl = cdnUrl.trim();
    if (imageUrl.includes('cdn.micro.blog/photos/')) {
      // Extract the encoded URL after /600x/
      const encodedUrl = imageUrl.split('/600x/')[1];
      if (encodedUrl) {
        imageUrl = decodeURIComponent(encodedUrl);
      }
    }

    books.push({
      isbn: isbn.trim(),
      imageUrl,
      title: title.trim(),
      author: author.trim()
    });
  }

  return books;
}

// Download an image
async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    protocol.get(url, (res) => {
      if (res.statusCode === 200) {
        const fileStream = fs.createWriteStream(filepath);
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

// Main function
async function main() {
  console.log('Fetching reading page...');
  const html = await fetchReadingPage();

  console.log('Extracting book data...');
  const books = extractBookData(html);

  console.log(`Found ${books.length} books`);

  for (const book of books) {
    const filename = `${book.isbn}.jpg`;
    const filepath = path.join(OUTPUT_DIR, filename);

    if (fs.existsSync(filepath)) {
      console.log(`✓ Skipping ${book.title} (already exists)`);
      continue;
    }

    try {
      console.log(`Downloading ${book.title}...`);
      await downloadImage(book.imageUrl, filepath);
      console.log(`✓ Saved ${filename}`);
    } catch (error) {
      console.error(`✗ Failed to download ${book.title}: ${error.message}`);
    }

    // Rate limit to be nice to the CDN
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\nDone! Book covers saved to:', OUTPUT_DIR);
  console.log('\nNext steps:');
  console.log('1. Review the downloaded images');
  console.log('2. Update reading-content.html to use local images');
  console.log('3. Commit and push the changes');
}

main().catch(console.error);
