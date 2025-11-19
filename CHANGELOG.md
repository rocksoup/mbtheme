# Changelog

All notable changes to the Saunter theme will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
