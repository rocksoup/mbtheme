# Changelog

All notable changes to the Saunter theme will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

**IMPORTANT:** The `version` field in `plugin.json` MUST be incremented with each release. Micro.blog uses this field to detect and pull theme updates from the main branch. Also update the version in the `<meta name="generator">` tag in `layouts/partials/head.html` to verify updates in the live site's HTML source.

## [0.1.21] - 2025-11-21

### Fixed
- Fixed duplicate image rendering in post summaries when image is already embedded in content
- Post summary partial now checks if featured image is already in content before rendering, matching the logic in single page template

## [0.1.20] - 2025-11-21

### Fixed
- Reading page now falls back to local `data/bookshelves.json` when Micro.blog API is unavailable
- Watching page now falls back to `data/watched.enriched.json` or `data/watched.json` when no "Watched:" posts exist
- Made templates backwards compatible with both API data structures and local data file formats
- Fixed regression where reading and watching pages returned empty values when middleware/API data was unavailable
- Templates now support both `image`/`cover_url` fields for book covers and `authors[]`/`author` fields for authors

## [0.1.19] - 2025-11-20

### Removed
- Deleted the `examples/demo-site/` folder from the repo to keep the theme package lean (demo content/builds should live outside the theme).

## [0.1.18] - 2025-11-20

### Changed
- Watching page now renders from enriched data (`data/watched.enriched.json`) via a reusable grid partial, matching the reading grid style.
- Documented expected data feeds for watching/reading in the README.

### Removed
- Checked-in `examples/demo-site/public/` build output to keep the repo clean (build artifacts should not be versioned).

## [0.1.5] - 2025-11-19

### Fixed
- Replaced HTML comment with `<meta name="generator">` tag for version tracking (Micro.blog strips HTML comments)
- Version now visible in page source as `<meta name="generator" content="Saunter 0.1.5">`

### Changed
- Updated deployment documentation to reflect plugin.json and meta tag version updates

## [0.1.4] - 2025-11-19

### Fixed
- Reverted test CSS (hot pink background) back to normal color

## [0.1.3] - 2025-11-19

### Fixed
- **CRITICAL FIX:** Removed `config.json` from theme repository - this file was preventing Micro.blog from detecting updates
- Micro.blog themes should only use `theme.toml` and `plugin.json` for metadata
- Theme updates now work correctly when `plugin.json` version is incremented

### Added
- `theme.toml` file with theme metadata and Hugo version requirements
- `plugin.json` file for Micro.blog theme plugin settings

### Documentation
- Updated deployment documentation to use `plugin.json` instead of `config.json`

## [0.1.1] - 2025-11-19

### Documentation
- Added "Deploying Updates" section to README

### Removed
- GitHub releases workflow (attempted to use version-based updates on main branch)

## [0.1.0] - 2025-11-18

### Added
- **Editorial card layout** for all post types (micro, full-length, link posts)
- **Dark mode support** with automatic theme switching based on system preferences
- **Manual theme toggle** with localStorage persistence
- **Category badge system** with emoji-based visual tags
- **Newsletter signup integration** with configurable form fields
  - Support for both Micro.blog native newsletter and Mailchimp
- **Search functionality** integration with Micro.blog Search plugin
- **Location page template** for city/location-specific pages (e.g., `/seattle`)
- **Responsive design** optimized for desktop, tablet, and mobile devices
- **Pinboard integration support** for bookmark-of/link posts
- **Custom CSS variables** for easy color and spacing customization
- **Comprehensive documentation** including:
  - Configuration guide
  - Customization guide
  - Development guide
- **Example demo site** with sample content

### Design Features
- Clean typography with hierarchical heading styles
- Full-width article cards with optional featured images
- Grayscale category badges for content organization
- City tagline in footer (e.g., "Made with ❤️ in Seattle, Washington")
- Accessible color contrast in both light and dark modes
- Smooth transitions between light and dark themes

### Technical Features
- Hugo Extended compatible (v0.100+)
- Micro.blog hosted site compatible
- Minimal JavaScript footprint (theme toggle only)
- No external dependencies
- Valid HTML5 and semantic markup
- Optimized CSS with modern features

### Templates
- `layouts/_default/baseof.html` - Base template structure
- `layouts/_default/list.html` - Archive and section pages
- `layouts/_default/single.html` - Individual post view
- `layouts/_default/taxonomy.html` - Category/tag detail pages
- `layouts/_default/terms.html` - Category/tag index
- `layouts/index.html` - Homepage timeline
- `layouts/location/single.html` - Custom location page template
- `layouts/partials/category-badge.html` - Category badge component
- `layouts/partials/head.html` - HTML head section
- `layouts/partials/newsletter.html` - Newsletter signup form
- `layouts/partials/post-summary.html` - Post card/summary component
- `layouts/partials/site-footer.html` - Site footer
- `layouts/partials/site-header.html` - Site header with navigation

### Configuration Options
- `description` - Site tagline
- `city_tagline` - Optional city/location display
- `show_categories` - Enable/disable category badges
- `dark_mode` - Dark mode behavior (auto, light, dark)
- `newsletter.*` - Newsletter form configuration
  - `enabled` - Toggle newsletter form
  - `title` - Form heading
  - `copy` - Subscription message
  - `action` - Form submission endpoint
  - `method` - HTTP method
  - `placeholder` - Email input placeholder
  - `button` - Submit button text
- `social.*` - Social media links

### Browser Support
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- iOS Safari
- Chrome Mobile

## [Unreleased]

### Planned Features
- Theme screenshots for README
- Additional category badge icons
- More color scheme variants
- Accessibility improvements (WCAG 2.1 AA compliance)
- Additional layout options
- More example sites

---

[0.1.0]: https://github.com/rocksoup/mbtheme/releases/tag/v0.1.0
[Unreleased]: https://github.com/rocksoup/mbtheme/compare/v0.1.0...HEAD
