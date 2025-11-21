const fs = require('fs');
const path = require('path');

// Configuration
const USERNAME = process.argv[2] || 'jared'; // Default to 'jared' or pass as arg
const OUTPUT_DIR = path.join(__dirname, '../examples/demo-site/data');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function fetchBookshelves() {
    console.log(`Fetching bookshelves for ${USERNAME}...`);

    // Micro.blog Bookshelves API (Public Feeds)
    // https://micro.blog/books/USERNAME/SHELF.json

    const shelves = ['currently-reading', 'want-to-read', 'finished-reading'];
    const data = {};

    for (const shelf of shelves) {
        try {
            const url = `https://micro.blog/books/${USERNAME}/${shelf}.json`;
            console.log(`Fetching ${url}...`);
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to fetch ${shelf}: ${response.statusText}`);
            const json = await response.json();

            // Transform to match theme expectation
            // Theme expects: .Site.Data.bookshelves.currentlyreading
            // API returns: { items: [...] }
            // We need to map items to the structure used in templates

            const key = shelf.replace(/-/g, '');
            data[key] = json.items.map(item => ({
                title: item.title,
                author: item.authors ? item.authors.map(a => a.name).join(', ') : '',
                cover_url: item.image,
                isbn: item.id, // Using ID as ISBN/Link identifier
                url: item.url
            }));

        } catch (error) {
            console.error(`Error fetching ${shelf}:`, error.message);
            // Fallback/Empty for demo
            const key = shelf.replace(/-/g, '');
            data[key] = [
                {
                    title: "Demo Book " + shelf,
                    author: "Demo Author",
                    cover_url: "https://micro.blog/images/blank_avatar.png", // Placeholder
                    isbn: "123456789",
                    url: "https://example.com"
                }
            ];
        }
    }

    fs.writeFileSync(path.join(OUTPUT_DIR, 'bookshelves.json'), JSON.stringify(data, null, 2));
    console.log('Saved bookshelves.json');
}

async function fetchWatching() {
    console.log(`Fetching watching data for ${USERNAME}...`);

    // Micro.blog Watching API (Public Feed)
    // Usually exposed via a category feed or similar. 
    // For now, we'll simulate it or try to fetch a known feed if available.
    // Since there's no standard "watching" endpoint documented like books, 
    // we might need to fetch the main feed and filter, or use a specific category.
    // However, the bug report mentions "middleware-generated data feed (data/watched.enriched.json)".
    // We will create a dummy enriched file for now to verify the template.

    const dummyData = {
        movies: [
            {
                title: "Example Movie",
                watched_date: new Date().toISOString(),
                year: "2024",
                notes: "A great movie.",
                poster_url: "https://image.tmdb.org/t/p/w500/kqjL17yufvn9OVLyXYpvtyrFfak.jpg", // Mad Max: Fury Road
                url: "https://example.com"
            }
        ]
    };

    // Create directory if needed
    const watchedDir = path.join(OUTPUT_DIR, 'watched');
    if (!fs.existsSync(watchedDir)) {
        fs.mkdirSync(watchedDir, { recursive: true });
    }

    fs.writeFileSync(path.join(OUTPUT_DIR, 'watched.enriched.json'), JSON.stringify(dummyData, null, 2));
    // Also save as watched.json in case template checks that
    fs.writeFileSync(path.join(OUTPUT_DIR, 'watched.json'), JSON.stringify(dummyData, null, 2));

    console.log('Saved watched.enriched.json');
}

async function main() {
    await fetchBookshelves();
    await fetchWatching();
}

main();
