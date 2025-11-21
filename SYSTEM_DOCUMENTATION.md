# Saunter Theme - Comprehensive System Documentation

**Version:** 0.1.25
**Last Updated:** 2025-11-21
**Theme:** Saunter - Editorial-style Hugo theme for Micro.blog

---

## ⚠️ Important Note

**This is a custom theme built for a specific site and workflow.** It is not intended for general distribution or use by others.

**Key Principles:**
- **Hard-coded configuration is acceptable** when it serves the specific needs of this site
- **Micro.blog built-in features should be used** when available, but may be overridden if necessary
- **Any deviations from Micro.blog conventions** must be clearly documented and consulted on
- **Customization over generalization** - this theme prioritizes specific requirements over broad compatibility

When deciding between using Micro.blog's built-in features or creating custom overrides, consult the site owner and document the decision and rationale clearly.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Middleware Integration](#middleware-integration)
4. [Micro.blog Platform Integration](#microblog-platform-integration)
5. [Content Authoring](#content-authoring)
6. [Content Display & Rendering](#content-display--rendering)
7. [Configuration Reference](#configuration-reference)
8. [Development & Deployment](#development--deployment)

---

## System Overview

### What is Saunter?

**Saunter** is a Hugo static site theme specifically designed for Micro.blog hosting. It's an editorial-style blogging theme that provides:

- Modern, clean design with light/dark mode support
- Integration with Micro.blog's native features (Bookshelves, Search, Newsletter)
- Support for multiple content types (posts, links, reading, watching)
- External service integration via middleware (Pinboard bookmarks)
- Responsive design optimized for reading
- Accessibility-first approach

### Technology Stack

```mermaid
graph TB
    A[Content Sources] --> B[Hugo Static Site Generator]
    B --> C[Micro.blog Platform]
    C --> D[CDN/Live Site]

    E[Middleware] --> C
    F[External APIs] --> C

    style B fill:#0EA5E9
    style C fill:#FF6B35
    style A fill:#A7C957
```

**Core Technologies:**
- **Generator:** Hugo Extended (v0.91+)
- **Platform:** Micro.blog (hosting & content management)
- **Fonts:** Fraunces (headings), Inter (body) via Google Fonts
- **Analytics:** Umami (privacy-focused)
- **Styling:** Vanilla CSS with CSS Custom Properties
- **JavaScript:** Vanilla JS (no frameworks)

---

## Architecture

### High-Level System Architecture

```mermaid
graph TB
    subgraph "Content Creation Layer"
        A1[Micro.blog Editor]
        A2[Pinboard Bookmarks]
        A3[Micro.blog Bookshelves]
        A4[Data Files]
    end

    subgraph "Integration Layer"
        B1[microintegrations Middleware]
        B2[Micro.blog API]
    end

    subgraph "Build Layer"
        C1[Hugo Templates]
        C2[CSS/JS Assets]
        C3[Hugo Build Engine]
    end

    subgraph "Delivery Layer"
        D1[Static HTML/CSS/JS]
        D2[Micro.blog CDN]
        D3[Browser]
    end

    A1 --> B2
    A2 --> B1
    B1 --> B2
    A3 --> B2
    A4 --> C3
    B2 --> C3
    C1 --> C3
    C2 --> C3
    C3 --> D1
    D1 --> D2
    D2 --> D3

    style C3 fill:#0EA5E9
    style B2 fill:#FF6B35
```

### Directory Structure

```
mbtheme/
├── config.json              # Theme default configuration
├── plugin.json              # Micro.blog plugin metadata (VERSION CRITICAL)
├── theme.toml               # Hugo theme metadata
├── dev.sh                   # Local development server script
│
├── layouts/                 # Template files (Hugo Go templates)
│   ├── _default/
│   │   ├── baseof.html     # Base HTML wrapper (all pages)
│   │   ├── single.html     # Single post/page view + search
│   │   ├── list.html       # Archive/section lists
│   │   ├── taxonomy.html   # Category/tag detail pages
│   │   └── terms.html      # Category/tag index pages
│   │
│   ├── index.html          # Homepage timeline
│   ├── 404.html            # Error page
│   │
│   ├── partials/           # Reusable components
│   │   ├── head.html       # <head> section (meta, fonts, CSS)
│   │   ├── site-header.html    # Header with nav & theme toggle
│   │   ├── site-footer.html    # Footer with newsletter
│   │   ├── post-summary.html   # Post card component
│   │   ├── category-badge.html # Category badges with emoji
│   │   ├── newsletter.html     # Newsletter signup form
│   │   ├── search.html         # Search icon link
│   │   └── watching-grid.html  # Movie/TV grid layout
│   │
│   ├── post/single.html        # Blog post layout
│   ├── reading/single.html     # Bookshelf page
│   ├── watching/              # Movie/TV tracking pages
│   ├── links/single.html       # Links/bookmarks page
│   ├── location/single.html    # Location pages (e.g., /seattle)
│   ├── colophon/single.html    # About the site/tech stack
│   ├── styleguide/single.html  # Design system documentation
│   │
│   └── shortcodes/
│       └── tweetarchive.html   # Twitter archive shortcode
│
├── static/                 # Static assets
│   ├── css/
│   │   └── main.css        # Primary stylesheet (1015 lines)
│   └── js/
│       └── saunter.js      # Theme JS (nav, dark mode, newsletter)
│
├── docs/                   # User documentation
│   ├── configuration.md
│   ├── customization.md
│   └── development.md
│
└── README.md               # Main documentation
```

### Template Hierarchy

```mermaid
graph TB
    A[baseof.html<br/>Base Template] --> B[head.html]
    A --> C[site-header.html]
    A --> D[Main Content Block]
    A --> E[site-footer.html]
    A --> F[saunter.js]

    C --> C1[Navigation]
    C --> C2[Search Link]
    C --> C3[Theme Toggle]

    D --> D1[index.html<br/>Homepage]
    D --> D2[single.html<br/>Single Post]
    D --> D3[list.html<br/>Archives]
    D --> D4[Special Pages]

    D1 --> G[post-summary.html]
    D2 --> G
    D3 --> G

    G --> H[category-badge.html]

    E --> I[newsletter.html]

    D4 --> D4A[reading/single.html]
    D4 --> D4B[watching/single.html]
    D4 --> D4C[links/single.html]
    D4 --> D4D[location/single.html]

    style A fill:#0EA5E9
    style G fill:#A7C957
```

---

## Middleware Integration

### Overview

The Saunter theme integrates with an external middleware system called **microintegrations** that syncs data from external services into Micro.blog.

### 🎯 Key Architectural Principle: Micro.blog as Source of Truth

**All production data lives in Micro.blog's database.** The theme never directly queries external APIs or relies on local data files in production.

**How Enrichment Works:**

```mermaid
graph TB
    subgraph "Enrichment Layer"
        A[External Source<br/>Pinboard, TMDB, etc.]
        B[Middleware<br/>microintegrations]
    end

    subgraph "Source of Truth"
        C[Micro.blog API]
        D[Micro.blog Database]
    end

    subgraph "Presentation Layer"
        E[Hugo Build]
        F[Theme Templates]
        G[Static Site]
    end

    A -->|Raw data| B
    B -->|Fetch artwork<br/>& metadata| A
    B -->|POST enriched<br/>data| C
    C -->|Store| D
    D -->|Provide data| E
    E -->|Render| F
    F -->|Generate| G

    style D fill:#FF6B35
    style B fill:#A7C957
    style G fill:#0EA5E9
```

**Key Points:**
1. **Middleware enriches BEFORE posting** - Fetches artwork, metadata, etc.
2. **Micro.blog stores enriched data** - Database contains complete information
3. **Theme reads from Micro.blog only** - No external API calls at build time
4. **Data files are for local dev only** - Not used in production

**Enrichment Workflows:**

**Workflow A: Pre-Enrichment (Pinboard Links)**
1. User bookmarks in Pinboard
2. Middleware fetches from Pinboard RSS
3. Middleware enriches with OG images/metadata
4. Middleware posts to Micro.blog
5. Theme displays enriched content

**Workflow B: Post-Facto Enrichment (Books/Movies)**
1. User posts "Watched: Movie Title" directly in Micro.blog (no poster)
2. Middleware periodically polls Micro.blog for unenriched posts
3. Middleware detects missing artwork (`image` field empty)
4. Middleware fetches poster from TMDB API
5. Middleware updates Micro.blog post with `image` field
6. Theme displays enriched content on next build

Both workflows result in Micro.blog as the source of truth with enriched data.

### Architecture

```mermaid
graph LR
    A[Pinboard<br/>RSS Feed] --> B[microintegrations<br/>GitHub Actions]
    B --> C[Micro.blog API]
    C --> D[Hugo Build]
    D --> E[Saunter Theme]
    E --> F[Live Site]

    B -.Hourly Sync.-> B
    C -.Triggers.-> D

    style B fill:#FF6B35
    style C fill:#0EA5E9
```

### Middleware Configuration

**Repository:** `https://github.com/rocksoup/microintegrations`

**Main Script:** `scripts/microblog-sync.mjs`

**Environment Variables:**
```bash
PINBOARD_MICROBLOG_FEED_URL  # URL to Pinboard RSS feed
MICROBLOG_TOKEN              # Authentication token for Micro.blog API
DRY_RUN                      # Testing flag (preview without posting)
```

**Automation:**
- GitHub Actions runs hourly
- Fetches new bookmarks from Pinboard RSS
- Transforms into Micro.blog post format
- Posts to Micro.blog API with metadata

### Data Flow: Pinboard to Live Site

```mermaid
sequenceDiagram
    participant P as Pinboard
    participant GHA as GitHub Actions
    participant MB as Micro.blog API
    participant Hugo as Hugo Build
    participant Site as Live Site

    Note over GHA: Runs hourly
    GHA->>P: Fetch RSS feed
    P-->>GHA: Return bookmarks
    GHA->>GHA: Transform data
    GHA->>MB: POST /posts
    MB-->>GHA: 201 Created
    MB->>Hugo: Trigger rebuild
    Hugo->>Hugo: Process templates
    Hugo->>Site: Deploy static files

    Note over Site: Link appears with<br/>"Links" category &<br/>bookmark_of URL
```

### How Theme Handles Middleware Data

The theme recognizes middleware-synced posts through specific frontmatter parameters:

**Post Structure from Middleware:**
```yaml
---
title: "Interesting Article Title"
date: 2025-11-21T10:00:00-07:00
categories:
  - Links                                    # Required for filtering
bookmark_of: "https://example.com/article"  # Source URL
image: "https://example.com/og-image.jpg"   # Optional OG image
---

Your commentary or notes about the link...
```

**Template Detection:**

In `layouts/partials/post-summary.html`:
```go
{{ with .Params.bookmark_of }}
<a class="bookmark-link" href="{{ . }}" rel="noopener" target="_blank">
  Source ↗
</a>
{{ end }}
```

In `layouts/_default/single.html`:
```go
{{ with .Params.bookmark_of }}
  (via <a href="{{ . }}">{{ (urls.Parse .).Host }}</a>)
{{ end }}
```

**Links Page Filtering:**

In `layouts/links/single.html`:
```go
{{ range $page := .Site.RegularPages }}
  {{ range $page.Params.categories }}
    {{ if or (eq (lower .) "links") (eq . "Links") }}
      {{/* Display this post */}}
    {{ end }}
  {{ end }}
{{ end }}
```

---

## Micro.blog Platform Integration

### Overview

Micro.blog serves as both the **content management system** and **hosting platform**. The theme is deeply integrated with Micro.blog's features and APIs.

### Micro.blog Hosting Model

```mermaid
graph TB
    subgraph "Developer"
        A1[Push to GitHub]
    end

    subgraph "Micro.blog Platform"
        B1{Version Changed?}
        B2[Pull Theme]
        B3[Hugo Build]
        B4[Deploy to CDN]
    end

    subgraph "User Actions"
        C1[Write Post]
        C2[Add Book]
        C3[External Middleware]
    end

    A1 --> B1
    B1 -->|Yes| B2
    B1 -->|No| X[No Update]
    B2 --> B3

    C1 --> B3
    C2 --> B3
    C3 --> B3

    B3 --> B4
    B4 --> D[Live Site]

    style B3 fill:#0EA5E9
    style B1 fill:#FF6B35
```

**Key Points:**
- Micro.blog monitors `plugin.json` version field
- Version increment triggers automatic theme update
- Hugo compilation happens on Micro.blog servers
- Immediate deployment to CDN upon build completion

### Version Management (CRITICAL)

**Two locations must be updated for theme updates:**

1. **`plugin.json`:**
```json
{
  "version": "0.1.24"
}
```

2. **`layouts/partials/head.html`:**
```html
<meta name="generator" content="Saunter 0.1.24">
```

**Why This Matters:**
- Micro.blog ONLY detects updates via `plugin.json` version
- Without version increment, changes won't deploy
- Both should stay in sync for consistency

### Micro.blog-Specific Features

#### 1. Microblog-Style Posts

**Short posts without titles (Twitter-like):**

```yaml
---
date: 2025-11-21T10:00:00-07:00
microblog: true  # Optional - auto-detected if no title
---

Your short post content here...
```

**Template Detection:**
```go
{{- $showTitle := and $title (not .Params.microblog) -}}
{{ if $showTitle }}
  <h2>{{ $title }}</h2>
{{ end }}
```

#### 2. Bookshelves Integration

**Data Flow:**

```mermaid
graph LR
    A[User adds book<br/>in Micro.blog] --> B[Micro.blog<br/>Bookshelves API]
    B --> C[.Site.Data.bookshelves]
    C --> D[reading/single.html<br/>template]
    D --> E[Rendered<br/>bookshelf page]

    style B fill:#FF6B35
    style C fill:#A7C957
```

**Data Structure:**
```json
{
  "currentlyreading": [
    {
      "title": "Book Title",
      "author": "Author Name",
      "isbn": "9781234567890",
      "cover_url": "https://covers.openlibrary.org/..."
    }
  ],
  "wanttoread": [...],
  "finishedreading": [...]
}
```

**Template Access (with fallbacks):**
```go
{{/* Tries multiple key variations for API compatibility */}}
{{ with .Site.Data.bookshelves.currentlyreading }}
  {{ $currentlyReading = . }}
{{ end }}

{{ with .Site.Data.bookshelves.wanttoread }}
  {{ $wantToRead = . }}
{{ else with .Site.Data.bookshelves.want }}
  {{ $wantToRead = . }}
{{ else with index .Site.Data.bookshelves "want-to-read" }}
  {{ $wantToRead = . }}
{{ end }}
```

**Cover Image Optimization:**
```go
{{ .cover_url | replaceRE "/300x/" "/600x/" | replaceRE "%26zoom%3D[15]" "%26zoom%3D0" }}
```

#### 3. Twitter Archive Integration

**Shortcode:** `{{< tweetarchive >}}`

**How it works:**
```mermaid
sequenceDiagram
    participant User as User
    participant Page as Post/Page
    participant JS as JavaScript
    participant API as Micro.blog API
    participant Display as Rendered UI

    User->>Page: Load page with shortcode
    Page->>JS: Initialize tweetarchive
    JS->>API: GET /twitter/archive/{site}/{path}
    API-->>JS: Return JSON data
    JS->>Display: Render tweets
```

**API Endpoints:**
- `https://micro.blog/twitter/archive/{site_id}/recent.json` - Recent tweets
- `https://micro.blog/twitter/archive/{site_id}/years.json` - Available years
- `https://micro.blog/twitter/archive/{site_id}/{year}/{month}.json` - Month archive
- `https://micro.blog/twitter/archive/{site_id}/search.json?q=keyword` - Search

#### 4. Search Integration

**Micro.blog Search Plugin provides:**
- JSON feed at `/archive/index.json`
- Client-side search via JavaScript
- No external search service needed

**Data Structure:**
```json
{
  "version": "https://jsonfeed.org/version/1",
  "items": [
    {
      "id": "https://example.com/2024/11/post-title",
      "title": "Post Title",
      "content_text": "Post content...",
      "date_published": "2024-11-21T10:00:00-07:00"
    }
  ]
}
```

#### 5. Newsletter Integration

**🎯 Architectural Decision: Mailchimp Instead of Micro.blog Native**

This site **intentionally uses Mailchimp** rather than Micro.blog's built-in newsletter feature. This is a deliberate deviation from Micro.blog conventions.

**Current Configuration (Mailchimp):**
```json
{
  "newsletter": {
    "enabled": true,
    "action": "https://stoneberg.us6.list-manage.com/subscribe/post?u=...",
    "method": "post",
    "placeholder": "Email address",
    "button": "Subscribe"
  },
  "mailchimp_honeypot": "b_abc123_def456"
}
```

**Rationale:**
- Greater control over email design and delivery
- Advanced segmentation and analytics
- Established subscriber base in Mailchimp
- Custom automation workflows

**Theme Implementation:**
- Theme checks for `newsletter.action` parameter
- **If action URL provided** → Renders Mailchimp form with honeypot protection
- **If action is empty** → Falls back to Micro.blog native button

**To disable Micro.blog native newsletter at platform level:**
1. Go to Micro.blog Dashboard → Settings → Newsletter
2. Disable newsletter feature
3. This prevents Micro.blog from sending notifications while Mailchimp remains active

**Alternative: Micro.blog Native (not currently used):**
```html
<form action="https://micro.blog/users/follow" method="post">
  <input type="email" name="email" required>
  <button type="submit">Subscribe</button>
</form>
```

### Publishing Workflow

```mermaid
graph TB
    subgraph "Content Creation"
        A1[Write in Micro.blog Editor]
        A2[External Middleware<br/>Pinboard, enrichment, etc.]
    end

    subgraph "Micro.blog Processing"
        B1[Store in Database]
        B2[Provide Data to Hugo]
        B3[Assign Frontmatter]
    end

    subgraph "Hugo Build"
        C1[Process Templates]
        C2[Detect Post Type]
        C3[Apply Layout]
        C4[Generate HTML]
    end

    subgraph "Deployment"
        D1[Static Files]
        D2[CDN Distribution]
        D3[Live Site]
    end

    A1 --> B1
    A2 --> B1
    B1 --> B2
    B2 --> B3
    B3 --> C1
    C1 --> C2
    C2 --> C3
    C3 --> C4
    C4 --> D1
    D1 --> D2
    D2 --> D3

    style C2 fill:#A7C957
    style B1 fill:#FF6B35

    Note1[All content lives in<br/>Micro.blog's database]
```

---

## Content Authoring

### Content Type Overview

```mermaid
mindmap
  root((Content Types))
    Regular Posts
      Long-form articles
      With titles
      Featured images
      Categories/tags
    Microblog Posts
      Short posts
      No titles
      Twitter-like
    Link Posts
      From Pinboard
      bookmark_of URL
      External source
    Reading
      Books from Micro.blog
      Three shelves
      API-driven
    Watching
      Movies/TV shows
      Poster grids
      Data files or posts
    Special Pages
      Colophon
      Location pages
      Style guide
```

### 1. Regular Blog Posts

**Creation Method:** Write in Micro.blog editor or create Markdown file

**Frontmatter:**
```yaml
---
title: "My Post Title"
date: 2025-11-21T10:00:00-07:00
categories:
  - journal
  - design
featured_image: "https://example.com/image.jpg"
---

Your post content here with **markdown** formatting.
```

**Authoring Workflow:**

```mermaid
flowchart TD
    A[Start Writing] --> B{Has Title?}
    B -->|Yes| C[Regular Post]
    B -->|No| D[Microblog Post]

    C --> E[Add Categories]
    C --> F[Add Featured Image]
    C --> G[Write Content]

    D --> G

    G --> H[Publish]
    H --> I[Hugo Build]
    I --> J[Live on Site]

    E -.Optional.-> G
    F -.Optional.-> G
```

**Available Parameters:**
- `title` - Post title (omit for microblog posts)
- `date` - Publication date (ISO 8601 format)
- `categories` - Array of categories
- `tags` - Array of tags
- `featured_image` / `image` / `images[]` - Featured image
- `hide_featured_image` - Prevent automatic image display
- `description` - Meta description for SEO
- `microblog` - Force microblog rendering

### 2. Microblog Posts

**What Makes Them Different:**
- No title or empty title
- Content displays directly (no heading)
- Twitter/Mastodon-like short posts

**Creation:**
```yaml
---
date: 2025-11-21T10:00:00-07:00
categories:
  - journal
---

Just saw the most amazing sunset. The sky was painted in shades of orange and pink.
```

**Template Behavior:**
```go
{{- $title := .Title -}}
{{- if not $title }}
  {{- $title = (.Summary | plainify | truncate 80) -}}
{{- end -}}
{{- $showTitle := and $title (not .Params.microblog) -}}

{{ if $showTitle }}
  <h2><a href="{{ .RelPermalink }}">{{ $title }}</a></h2>
{{ end }}
```

### 3. Link/Bookmark Posts

**Source:** Pinboard via microintegrations middleware

**Structure:**
```yaml
---
title: "Interesting Article Title"
date: 2025-11-21T10:00:00-07:00
categories:
  - Links  # Required
bookmark_of: "https://source-url.com"
image: "https://example.com/og-image.jpg"  # Optional
---

Your commentary about the link...
```

**Workflow:**

```mermaid
sequenceDiagram
    participant U as User
    participant PB as Pinboard
    participant MW as Middleware
    participant MB as Micro.blog
    participant Site as Live Site

    U->>PB: Bookmark URL
    Note over MW: Hourly sync
    MW->>PB: Fetch RSS
    PB-->>MW: Return bookmarks
    MW->>MW: Transform data
    MW->>MB: POST /posts
    MB->>MB: Hugo build
    MB->>Site: Deploy

    Note over Site: Appears on /links/<br/>with "Links" category
```

**Display Features:**
- Shows "Source ↗" link to original URL
- Displays domain in title: `(via example.com)`
- Appears on dedicated `/links/` page
- Can include OG image from bookmarked page

### 4. Reading/Bookshelf Content

**🎯 Source of Truth: Micro.blog Bookshelves API**

In production, book data comes from Micro.blog's native Bookshelves feature.

**Authoring & Enrichment Workflow:**
1. **You add book** in Micro.blog Bookshelves (by ISBN or title)
2. **Micro.blog enriches** automatically by fetching cover from Open Library
3. **API provides** enriched data via `.Site.Data.bookshelves`
4. **Theme reads** and displays with covers
5. **(Optional) Middleware can monitor** for missing covers and backfill from alternative sources

Note: Micro.blog handles book enrichment natively, so middleware is typically not needed for books unless cover art is unavailable from Open Library.

```mermaid
graph LR
    A[Add book in<br/>Micro.blog UI] --> B[Micro.blog<br/>Bookshelves API]
    B --> C[Automatic enrichment<br/>with cover_url]
    C --> D[Theme reads<br/>.Site.Data.bookshelves]
    D --> E[Displays on<br/>/reading/]

    style B fill:#FF6B35
    style C fill:#A7C957
```

**Local Development Only: Data Files**

For local testing without Micro.blog connection, create `data/bookshelves.json`:
```json
{
  "currentlyreading": [
    {
      "title": "The Midnight Library",
      "author": "Matt Haig",
      "isbn": "9780525559474",
      "cover_url": "https://covers.openlibrary.org/b/isbn/9780525559474-L.jpg"
    }
  ],
  "wanttoread": [],
  "finishedreading": []
}
```

**Page Setup:**
```yaml
---
title: "Reading"
type: "reading"
url: "/reading/"
---

Books I'm reading, want to read, and have finished.
```

**Template Features:**
- Three sections with headings
- Responsive grid layout
- Books link to `https://micro.blog/books/{isbn}`
- Cover images optimized (600x resolution)
- Graceful fallback for missing covers

### 5. Watching Content

**🎯 Source of Truth: Micro.blog Posts**

In production, movie/TV data comes from posts with "Watched:" prefix stored in Micro.blog's database.

**Authoring & Enrichment Workflow:**
1. **You author** in Micro.blog: Create post "Watched: Movie Title" (artwork optional)
2. **Middleware monitors** Micro.blog for posts without `image` field
3. **Middleware enriches** by fetching poster from TMDB/IMDB API
4. **Middleware updates** the post in Micro.blog with `image` frontmatter
5. **Hugo rebuilds** with enriched data
6. **Theme displays** poster from Micro.blog post

This means you can post immediately without artwork, and the middleware will enrich it later.

**Production: Posts with "Watched:" Prefix**

```yaml
---
title: "Watched: The Shawshank Redemption"
date: 2025-11-21T10:00:00-07:00
image: "https://example.com/poster.jpg"  # Enriched by middleware
---

Incredible story about hope and friendship. Morgan Freeman's narration is perfect.
```

**Local Development Only: Data Files**

For local testing, create `data/watched.enriched.json`:
```json
{
  "movies": [
    {
      "title": "The Shawshank Redemption",
      "watched_date": "2025-11-14",
      "year": "1994",
      "poster_url": "https://example.com/poster.jpg",
      "notes": "Incredible story about hope and friendship.",
      "placeholder": false,
      "url": "https://www.imdb.com/title/tt0111161/"
    }
  ]
}
```

**Production Workflow - Post-Facto Enrichment:**

```mermaid
sequenceDiagram
    participant User
    participant MB as Micro.blog
    participant MW as Middleware
    participant TMDB as TMDB API
    participant Site as Live Site

    User->>MB: POST "Watched: Movie Title"<br/>(no image field)
    MB->>Site: Hugo build
    Site->>Site: Display without poster<br/>(graceful fallback)

    Note over MW: Runs periodically<br/>(e.g., hourly)

    MW->>MB: GET posts without images
    MB-->>MW: Return unenriched posts
    MW->>TMDB: Fetch poster for movie
    TMDB-->>MW: Return poster_url
    MW->>MB: UPDATE post with image field
    MB->>Site: Hugo rebuild
    Site->>Site: Display with poster

    Note over Site: Source of truth:<br/>Micro.blog database<br/>(now enriched)
```

**Local Development Workflow:**

```mermaid
flowchart TD
    A[Testing locally] --> B[Create data/watched.enriched.json]
    B --> C[Hugo reads local data]
    C --> D[Renders grid with posters]
    D --> E[Test appearance locally]

    style B fill:#FFA500
    Note1[Not used in production]
```

**Page Setup:**
```yaml
---
title: "Watching"
type: "watching"
url: "/watching/"
---

Movies and TV shows I've watched.
```

### 6. Special Content Types

#### Colophon Page

**Purpose:** Technical documentation about how the site is built

```yaml
---
title: "Colophon"
type: "colophon"
url: "/colophon/"
menu: "main"
weight: 100
---
```

**Features:**
- Hardcoded content in template
- No body content needed
- Documents platform, theme, middleware, credits

#### Location Page

**Purpose:** Custom pages for cities/locations with live imagery

```yaml
---
title: "Seattle"
type: "location"
hero_image: "https://example.com/seattle-cam.jpg"
hero_caption: "Seattle waterfront - live view"
---

I live in Seattle, a beautiful city in the Pacific Northwest...
```

**Features:**
- Hero image with caption
- Can use live webcam URLs
- JavaScript refreshes images with cache-busting

#### Style Guide Page

**Purpose:** Visual reference for all theme components

```yaml
---
title: "Style Guide"
type: "styleguide"
url: "/styleguide/"
---
```

**Features:**
- Documents design system
- Shows typography, colors, spacing
- Live component examples
- Useful for theme development

---

## Content Display & Rendering

### Homepage Timeline

**Template:** `layouts/index.html`

**Flow:**

```mermaid
flowchart TD
    A[User visits homepage] --> B[Load index.html]
    B --> C{mainSections<br/>configured?}
    C -->|Yes| D[Filter by mainSections]
    C -->|No| E[Filter by year sections]

    D --> F[Get RegularPages]
    E --> F

    F --> G[Paginate results]
    G --> H[Loop through pages]
    H --> I[Render post-summary.html<br/>for each post]
    I --> J[Show pagination controls]
    J --> K[Display timeline]
```

**Template Logic:**
```go
{{ $sections := .Site.Params.mainSections }}
{{ if not $sections }}
  {{ $sections = slice }}
{{ end }}

{{ $pages := .Site.RegularPages }}
{{ if gt (len $sections) 0 }}
  {{ $pages = where $pages "Type" "in" $sections }}
{{ else }}
  {{ $pages = where $pages "Section" "matches" "^[0-9]{4}$" }}
{{ end }}

{{ $paginator := .Paginate $pages }}
{{ range $paginator.Pages }}
  {{ partial "post-summary.html" . }}
{{ end }}
```

**Post Summary Component:**

```mermaid
graph TB
    A[post-summary.html] --> B{Has featured<br/>image?}
    B -->|Yes| C{Already in<br/>content?}
    C -->|No| D[Render image]
    C -->|Yes| E[Skip image]

    B -->|No| E

    E --> F{Show title?}
    F -->|Yes| G[Render H2 with link]
    F -->|No| H[Skip title]

    G --> I[Render content]
    H --> I

    I --> J{Has bookmark_of?}
    J -->|Yes| K[Show 'Source ↗' link]
    J -->|No| L[Skip bookmark link]

    K --> M[Render categories]
    L --> M

    M --> N[Render date]
```

### Single Post Rendering

**Template Hierarchy:**

```mermaid
graph TB
    A[baseof.html] --> B[head.html]
    A --> C[site-header.html]
    A --> D{Content Type?}
    A --> E[site-footer.html]

    D -->|post| F[post/single.html]
    D -->|links| G[links/single.html]
    D -->|reading| H[reading/single.html]
    D -->|watching| I[watching/single.html]
    D -->|location| J[location/single.html]
    D -->|default| K[_default/single.html]

    F --> L[Render content]
    G --> M[Filter Links category]
    H --> N[Display bookshelves]
    I --> O[Display movie grid]
    J --> P[Hero image + content]
    K --> L

    L --> Q[Show title]
    L --> R[Show categories]
    L --> S[Show date]

    M --> T[Loop posts with<br/>Links category]
    T --> U[Use post-summary.html]

    style A fill:#0EA5E9
    style D fill:#A7C957
```

**Featured Image Logic:**
```go
{{/* Check multiple possible image parameters */}}
{{ $image := "" }}
{{ with .Params.featured_image }}
  {{ $image = . }}
{{ else with .Params.image }}
  {{ $image = . }}
{{ else }}
  {{ with .Params.images }}
    {{ $image = index . 0 }}
  {{ end }}
{{ end }}

{{/* Only show if not hidden and not already in content */}}
{{ if and $image (not .Params.hide_featured_image) }}
  {{ if not (in .RawContent $image) }}
    <img src="{{ $image }}" loading="lazy">
  {{ end }}
{{ end }}
```

### Archive & List Pages

**Template:** `layouts/_default/list.html`

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant Hugo
    participant Template

    User->>Browser: Visit /2024/ or /categories/journal
    Browser->>Hugo: Request page
    Hugo->>Template: Load list.html
    Template->>Template: Get .Paginator.Pages
    Template->>Template: Loop and render post-summary
    Template->>Browser: Return HTML
    Browser->>User: Display list page
```

**Features:**
- Shows page title and description
- Paginates posts (same as homepage)
- Uses post-summary partial for consistency
- Pagination controls at bottom

### Navigation System

**Template:** `layouts/partials/site-header.html`

**Components:**

```mermaid
graph LR
    A[Site Header] --> B[Brand/Logo]
    A --> C[Primary Nav]
    A --> D[Nav Tools]

    C --> C1[Menu Items]
    C --> C2{Desktop}
    C --> C3{Mobile}

    C2 -->|Show| E[Horizontal List]
    C3 -->|Show| F[Hamburger Menu]

    D --> D1[Search Icon]
    D --> D2[Theme Toggle]

    style A fill:#0EA5E9
```

**Menu Configuration:**

From `config.json`:
```json
{
  "menu": {
    "main": [
      {"name": "All", "url": "/"},
      {"name": "Journal", "url": "/categories/journal"},
      {"name": "Links", "url": "/links/"},
      {"name": "Books", "url": "/reading/"},
      {"name": "Watching", "url": "/watching/"}
    ]
  }
}
```

**Active State Detection:**
```go
{{ $isActive := false }}
{{ if eq $url "/" }}
  {{ $isActive = eq $.RelPermalink $url }}
{{ else if hasPrefix $.RelPermalink $url }}
  {{ $isActive = true }}
{{ end }}

<a {{ if $isActive }}class="active"{{ end }}>
```

**Mobile Menu Flow:**

```mermaid
sequenceDiagram
    participant User
    participant Button as Hamburger Button
    participant Nav as Navigation
    participant JS as JavaScript

    User->>Button: Click hamburger
    Button->>JS: Fire click event
    JS->>Nav: Toggle .show class
    JS->>Button: Update aria-expanded
    Nav->>User: Display menu overlay

    User->>Nav: Click link
    JS->>Nav: Auto-close menu

    Note over User,JS: Also closes on:<br/>- Click outside<br/>- ESC key
```

### Search Functionality

**How It Works:**

```mermaid
flowchart TD
    A[User visits /search/] --> B[Page loads]
    B --> C[JavaScript fetches<br/>/archive/index.json]
    C --> D[Store data in memory]
    D --> E[User types query]
    E --> F[Split into keywords]
    F --> G[Filter posts]
    G --> H{All keywords<br/>match?}
    H -->|Yes| I[Include in results]
    H -->|No| J[Exclude from results]
    I --> K[Render result card]
    K --> L[Display results]

    style C fill:#A7C957
    style G fill:#0EA5E9
```

**Search Algorithm:**
```javascript
const keywords = query.toLowerCase().split(/\s+/);
const matches = archive.items.filter(item => {
  const content = (
    (item.title || "") + " " +
    (item.content_text || "")
  ).toLowerCase();

  // All keywords must match (AND logic)
  return keywords.every(kw => content.includes(kw));
});
```

**Features:**
- Client-side (no server needed)
- Real-time as you type
- URL parameter sync (`?q=keyword`)
- Searches titles and content
- All keywords must match (AND)
- Case-insensitive

### Category System

**Badge Component:** `layouts/partials/category-badge.html`

**Emoji Mapping:**

```mermaid
graph LR
    A[Category Name] --> B{Match Category}
    B -->|journal| C["🗒️ journal"]
    B -->|links| D["🔗 links"]
    B -->|books| E["📚 books"]
    B -->|movies| F["🎬 movies"]
    B -->|photos| G["📷 photos"]
    B -->|unknown| H["🌀 category"]

    style B fill:#A7C957
```

**Implementation:**
```go
{{ $emoji := "🌀" }}
{{ $lower := lower . }}

{{ if in (slice "journal" "journals") $lower }}
  {{ $emoji = "🗒️" }}
{{ else if in (slice "links" "link") $lower }}
  {{ $emoji = "🔗" }}
{{ else if in (slice "books" "book" "reading") $lower }}
  {{ $emoji = "📚" }}
{{ else if in (slice "movies" "movie" "films" "film") $lower }}
  {{ $emoji = "🎬" }}
{{ else if in (slice "photos" "photo") $lower }}
  {{ $emoji = "📷" }}
{{ else if eq $lower "notes" }}
  {{ $emoji = "🗒️" }}
{{ end }}

<span class="category-badge">
  <span class="category-emoji">{{ $emoji }}</span>
  <a href="/categories/{{ . | urlize }}">{{ . }}</a>
</span>
```

**Taxonomy Pages:**
- `/categories/` - List all categories
- `/categories/journal/` - All posts in "journal" category
- `/tags/` - List all tags
- `/tags/seattle/` - All posts tagged "seattle"

### Theme Toggle (Light/Dark Mode)

**System Flow:**

```mermaid
stateDiagram-v2
    [*] --> CheckStorage
    CheckStorage --> SystemMode: No preference stored
    CheckStorage --> StoredMode: Preference found

    SystemMode --> CheckSystemPreference
    CheckSystemPreference --> DarkMode: System prefers dark
    CheckSystemPreference --> TimeBasedFallback: No system preference

    TimeBasedFallback --> DarkMode: 7pm to 6am
    TimeBasedFallback --> LightMode: 6am to 7pm

    StoredMode --> LightMode: Light mode stored
    StoredMode --> DarkMode: Dark mode stored
    StoredMode --> CheckSystemPreference: System mode stored

    LightMode --> ApplyLightTheme
    DarkMode --> ApplyDarkTheme

    ApplyLightTheme --> [*]
    ApplyDarkTheme --> [*]
```

**JavaScript Implementation:**
```javascript
function resolveTheme(mode) {
  if (mode === 'system') {
    // Check media query
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    // Fallback to time-based
    const hour = new Date().getHours();
    return (hour >= 19 || hour < 6) ? 'dark' : 'light';
  }
  return mode;
}

function applyTheme(mode) {
  const theme = resolveTheme(mode);
  if (theme === 'dark') {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
}
```

**UI Components:**

```mermaid
graph TB
    A[Theme Toggle Button] --> B[Click]
    B --> C[Show Dropdown Menu]
    C --> D1[Light Option]
    C --> D2[Dark Option]
    C --> D3[System Option]

    D1 --> E[Store 'light']
    D2 --> F[Store 'dark']
    D3 --> G[Store 'system']

    E --> H[Apply Theme]
    F --> H
    G --> H

    H --> I[Update Body Class]
    I --> J[CSS Variables Update]
```

**CSS Variables:**
```css
:root {
  --color-text: #111827;
  --color-bg: #F9FAFB;
  --color-link: #0EA5E9;
}

body.saunter.dark-mode {
  --color-text: #E5E7EB;
  --color-bg: #111827;
  --color-link: #60A5FA;
}
```

### Newsletter Signup

**Flow:**

```mermaid
sequenceDiagram
    participant User
    participant Form
    participant JS as JavaScript
    participant Iframe as Hidden Iframe
    participant Server as Newsletter Service

    User->>Form: Enter email
    User->>Form: Click Subscribe
    Form->>JS: Submit event
    JS->>Form: Disable button
    JS->>Form: Show "Submitting..."
    Form->>Iframe: Submit to service
    Iframe->>Server: POST request

    Note over JS: Wait 1.5s timeout

    JS->>Form: Hide form
    JS->>User: Show "Thank you!" message
```

**Configuration Options:**
```json
{
  "newsletter": {
    "enabled": true,
    "title": "Subscribe to get updates",
    "copy": "Get new posts in your inbox",
    "action": "https://micro.blog/users/follow",
    "method": "post",
    "placeholder": "your@email.com",
    "button": "Subscribe"
  }
}
```

**Spam Protection:**
- Honeypot field (hidden from users)
- Bots fill honeypot, form rejected server-side
- User-friendly (no CAPTCHA)

### JavaScript Features

**File:** `static/js/saunter.js`

**Architecture:**

```mermaid
graph TB
    A[DOMContentLoaded Event] --> B[initializeTheme]
    A --> C[setupThemeToggle]
    A --> D[setupNavigation]
    A --> E[setupNewsletter]
    A --> F[refreshSeattleCam]

    B --> B1[Read localStorage]
    B --> B2[Apply theme class]

    C --> C1[Attach click handlers]
    C --> C2[Watch system preference]

    D --> D1[Hamburger toggle]
    D --> D2[Click outside]
    D --> D3[ESC key]
    D --> D4[Focus management]

    E --> E1[Form submit handler]
    E --> E2[Button state]
    E --> E3[Confirmation display]

    F --> F1[Find webcam images]
    F --> F2[Add cache-busting]

    style A fill:#0EA5E9
```

**Feature Summary:**
- **Theme Management:** Light/dark/system with localStorage
- **Navigation:** Mobile menu with accessibility
- **Newsletter:** Enhanced form with confirmation
- **Seattle Cam:** Live webcam refresh
- **No Dependencies:** Pure vanilla JavaScript

---

## Configuration Reference

### Site Configuration

**File:** `config.json`

```json
{
  "title": "Your Site Title",
  "description": "Site description/tagline",
  "author": "Your Name",

  "params": {
    "author_name": "Your Name",
    "author_username": "microblog_username",
    "description": "Site tagline",

    "mainSections": ["post", "posts"],

    "show_categories": true,
    "dark_mode": "auto",

    "city_tagline": {
      "text": "Made with ❤️ in",
      "location": "Seattle, Washington",
      "url": "/seattle/"
    },

    "colophonURL": "/colophon/",

    "newsletter": {
      "enabled": true,
      "title": "Subscribe to get updates",
      "copy": "Get new posts in your inbox",
      "action": "https://micro.blog/users/follow",
      "method": "post",
      "placeholder": "you@email.com",
      "button": "Subscribe"
    },

    "mailchimp_honeypot": "b_abc123_def456",

    "customCSS": "/css/custom.css",
    "plugins_js": ["https://example.com/plugin.js"],

    "rssURL": "feed.xml",
    "theme_seconds": 1234567890
  },

  "menu": {
    "main": [
      {"name": "All", "url": "/", "weight": 1},
      {"name": "Journal", "url": "/categories/journal", "weight": 2},
      {"name": "Links", "url": "/links/", "weight": 3},
      {"name": "Books", "url": "/reading/", "weight": 4},
      {"name": "Watching", "url": "/watching/", "weight": 5}
    ]
  }
}
```

### Frontmatter Parameters

**Standard Parameters:**
```yaml
title: "Post Title"                    # Post title (omit for microblog)
date: 2025-11-21T10:00:00-07:00       # Publication date
type: "post"                           # Content type
url: "/custom-url/"                    # Custom permalink
description: "Meta description"        # SEO description
```

**Image Parameters:**
```yaml
featured_image: "https://..."          # Priority 1
image: "https://..."                   # Priority 2
images: ["https://...", "https://..."] # Priority 3 (uses first)
hide_featured_image: true              # Don't auto-display
```

**Taxonomy:**
```yaml
categories: ["journal", "design"]
tags: ["seattle", "typography"]
```

**Special Parameters:**
```yaml
microblog: true                        # Force microblog rendering
bookmark_of: "https://..."             # Link post source URL
hero_image: "https://..."              # Location page hero
hero_caption: "Caption text"           # Hero image caption
```

### Menu Configuration

```yaml
menu: "main"                           # Add to main nav
weight: 100                            # Menu ordering (lower = earlier)
```

### CSS Custom Properties

```css
/* Typography */
--font-heading: "Fraunces", serif
--font-body: "Inter", sans-serif
--font-size-base: 1rem
--line-height-relaxed: 1.75

/* Colors (Light Mode) */
--color-text: #111827
--color-text-muted: #6B7280
--color-link: #0EA5E9
--color-bg: #F9FAFB
--color-border: #E5E7EB

/* Spacing */
--space-4: 1rem
--space-6: 1.5rem
--space-8: 2rem
--space-12: 3rem

/* Layout */
--content-width: 768px
```

---

## Development & Deployment

### Local Development

**Setup:**
```bash
# Clone the repository
git clone https://github.com/rocksoup/mbtheme.git
cd mbtheme

# Run development server
./dev.sh
```

**Development Script (`dev.sh`):**
```bash
#!/bin/bash
THEMES_DIR="$(dirname "$(pwd)")"

hugo server \
  --source examples/demo-site \
  --themesDir "$THEMES_DIR" \
  --theme mbtheme \
  --disableFastRender \
  --navigateToChanged \
  --buildDrafts \
  --buildFuture
```

**Development Flow:**

```mermaid
flowchart LR
    A[Edit Files] --> B[Hugo Watch]
    B --> C[Rebuild]
    C --> D[Browser Refresh]
    D --> E{Changes Good?}
    E -->|No| A
    E -->|Yes| F[Commit]
    F --> G[Push to GitHub]

    style B fill:#0EA5E9
```

### Deployment Workflow

**Complete Flow:**

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant Git as GitHub
    participant MB as Micro.blog
    participant CDN as Live Site

    Dev->>Dev: 1. Make changes
    Dev->>Dev: 2. Update plugin.json version
    Dev->>Dev: 3. Update head.html version
    Dev->>Git: 4. Commit & push

    Note over MB: Monitors plugin.json

    MB->>Git: 5. Detect version change
    MB->>Git: 6. Pull latest code
    Git-->>MB: 7. Return files
    MB->>MB: 8. Run Hugo build
    MB->>CDN: 9. Deploy static files

    Note over CDN: Site updated!
```

### Version Update Checklist

**Required Steps:**

1. **Update `plugin.json`:**
```json
{
  "version": "0.1.25"  // Increment
}
```

2. **Update `layouts/partials/head.html`:**
```html
<meta name="generator" content="Saunter 0.1.25">
```

3. **Update `theme.toml` (optional but recommended):**
```toml
version = "0.1.25"
```

4. **Update `CHANGELOG.md`:**
```markdown
## [0.1.25] - 2025-11-21
### Changed
- Description of changes
```

5. **Commit and push:**
```bash
git add plugin.json layouts/partials/head.html theme.toml CHANGELOG.md
git commit -m "Bump version to 0.1.25"
git push origin main
```

6. **Wait for Micro.blog to detect and pull**

### Build Process

```mermaid
graph TB
    subgraph "Input"
        A1[Markdown Files]
        A2[Templates]
        A3[Static Assets]
        A4[Data Files]
    end

    subgraph "Hugo Build"
        B1[Parse Content]
        B2[Apply Templates]
        B3[Process Assets]
        B4[Generate HTML]
    end

    subgraph "Output"
        C1[Static HTML]
        C2[CSS Files]
        C3[JavaScript Files]
        C4[Images]
    end

    A1 --> B1
    A2 --> B2
    A3 --> B3
    A4 --> B1

    B1 --> B4
    B2 --> B4
    B3 --> B4

    B4 --> C1
    B3 --> C2
    B3 --> C3
    B3 --> C4

    style B4 fill:#0EA5E9
```

### Troubleshooting

**Common Issues:**

```mermaid
flowchart TD
    A[Problem] --> B{What's Wrong?}
    B -->|Theme not updating| C[Check plugin.json version]
    B -->|Build failing| D[Check Hugo version]
    B -->|Images not showing| E[Check image URLs]
    B -->|Dark mode broken| F[Check JS console]

    C --> C1[Increment version number]
    C --> C2[Push to GitHub]
    C --> C3[Wait 5-10 minutes]

    D --> D1[Verify Hugo Extended 0.91+]
    D --> D2[Check build logs]

    E --> E1[Verify URLs are accessible]
    E --> E2[Check frontmatter spelling]

    F --> F1[Check browser console]
    F --> F2[Verify saunter.js loaded]
```

---

## Summary

### Key System Flows

**Content Publishing:**
```
Author → Micro.blog → Hugo Build → CDN → User
```

**Pinboard Integration:**
```
Pinboard → Middleware → Micro.blog API → Hugo → Site
```

**Reading List:**
```
Micro.blog Bookshelves → .Site.Data → Template → Display
```

**Theme Updates:**
```
Git Push → Version Change → Micro.blog Pull → Rebuild → Deploy
```

### Architecture Principles

1. **Decoupled:** Middleware operates independently
2. **Resilient:** Multiple fallbacks for data sources
3. **Progressive:** JavaScript enhances but not required
4. **Accessible:** ARIA labels, keyboard navigation, semantic HTML
5. **Performance:** Minimal CSS/JS, lazy loading, CDN delivery
6. **Maintainable:** Clear structure, well-documented, modular components

### Quick Reference

**File to Edit for:**
- Add menu item: `config.json`
- Modify homepage: `layouts/index.html`
- Change post layout: `layouts/post/single.html`
- Update styles: `static/css/main.css`
- Modify JavaScript: `static/js/saunter.js`
- Add shortcode: `layouts/shortcodes/`
- Change footer: `layouts/partials/site-footer.html`

**URLs to Know:**
- Homepage: `/`
- Search: `/search/`
- Links: `/links/`
- Reading: `/reading/`
- Watching: `/watching/`
- Category: `/categories/{name}/`
- Archives: `/{year}/`

---

## Additional Resources

- **GitHub Repository:** https://github.com/rocksoup/mbtheme
- **Hugo Documentation:** https://gohugo.io/documentation/
- **Micro.blog Help:** https://help.micro.blog/
- **Middleware Repo:** https://github.com/rocksoup/microintegrations

---

*This documentation generated on 2025-11-21 for Saunter v0.1.25*
