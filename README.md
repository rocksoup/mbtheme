# Saunter

An editorial-style Hugo theme for Micro.blog with built-in support for Pinboard integration, dark mode, and newsletter signup.

<!-- TODO: Add screenshot -->
<!-- ![Saunter Theme Screenshot](screenshot.png) -->

## Features

- **Editorial Card Layout** – Each post rendered as a full article with clean typography
- **Dark Mode Support** – Automatic theme switching based on system preferences with manual toggle
- **Category Badges** – Visual organization with emoji-based category tags
- **Built-in Search** – Integrates with Micro.blog's Search plugin
- **Newsletter Integration** – Configurable signup form for building your audience
- **Responsive Design** – Looks great on desktop, tablet, and mobile
- **Pinboard-Aware** – Designed to work seamlessly with Pinboard bookmark sync
- **Location Pages** – Optional city/location page template (e.g., `/seattle`)

## Installation

### For Micro.blog Hosted Sites

1. Go to your Micro.blog dashboard
2. Navigate to **Design → Edit Custom Theme**
3. Click **Clone Theme** and enter this repository URL:
   ```
   https://github.com/rocksoup/mbtheme
   ```
4. Micro.blog will automatically pull the theme and apply it to your site

The theme will be live immediately. Any updates you push to the repository will be pulled automatically by Micro.blog.

### For Custom Hosting

If you're self-hosting with Hugo:

```bash
cd your-site
git clone https://github.com/rocksoup/mbtheme.git themes/saunter
```

Then set the theme in your `config.toml`:

```toml
theme = "saunter"
```

## Quick Start

### Basic Configuration

Add these parameters to your site's `config.json`:

```json
{
  "params": {
    "description": "Your site tagline",
    "city_tagline": {
      "text": "Made with ❤️ in",
      "location": "Your City, State",
      "url": "/location/"
    },
    "colophonURL": "/colophon/",
    "mailchimp_honeypot": "b_abc123_def456",
    "newsletter": {
      "enabled": true,
      "action": "https://micro.blog/users/follow",
      "method": "post",
      "placeholder": "you@email.com",
      "button": "Subscribe"
    }
  }
}
```

> Tip: `city_tagline` also accepts a simple string if you only need plain text, and the optional `mailchimp_honeypot` value should match the hidden field name Mailchimp generates for your audience.

### Adding the Search Plugin

1. In Micro.blog, go to **Design → Plug-ins**
2. Click **Find Plug-ins**
3. Search for "Search Page" and click **Install**
4. Enable the plugin

The search page will automatically be added to your navigation.

## Documentation

- **[Configuration Guide](docs/configuration.md)** – Complete guide to all theme options
- **[Customization Guide](docs/customization.md)** – How to customize colors, fonts, and layouts
- **[Development Guide](docs/development.md)** – Local testing and theme development

## Data Feeds (automation)

- Watching page expects `data/watched.enriched.json` (or `data/watched.json`) with a `movies` array containing `title`, `watched_date`, optional `year`/`notes`, `poster_url`, and `placeholder` (true when no art).
- Reading page reads `data/bookshelves.json` or the `data/bookshelves/` folder with `currentlyreading`, `wanttoread`, and `finishedreading` arrays; prefer enriched `cover_url` values and fall back to placeholders.
- For local demos, drop sample files into `examples/demo-site/data/` (a sample `watched.enriched.json` is included).

## Demo Site

The `examples/demo-site/` folder has been removed from the repo to keep the theme lean. Run your own demo site in a separate checkout or a scratch directory if needed.***

## Theme Structure

```
mbtheme/
├── config.json               # Theme metadata and default params
├── layouts/
│   ├── _default/
│   │   ├── baseof.html       # Base template with header/footer
│   │   ├── list.html         # Archive and section pages
│   │   ├── single.html       # Individual post view
│   │   ├── taxonomy.html     # Category/tag detail pages
│   │   └── terms.html        # Category/tag index
│   ├── index.html            # Homepage timeline
│   ├── location/
│   │   └── single.html       # Custom location page template
│   └── partials/
│       ├── category-badge.html
│       ├── head.html
│       ├── newsletter.html
│       ├── post-summary.html
│       ├── site-footer.html
│       └── site-header.html
└── static/
    ├── css/main.css          # Theme styles
    └── js/saunter.js         # Theme toggle and utilities
```

## Customization Examples

### Custom Colors

Create `static/css/custom.css` in your site:

```css
:root {
  --primary-color: #your-color;
  --background-color: #your-bg;
}
```

### Disable Newsletter

```json
{
  "params": {
    "newsletter": {
      "enabled": false
    }
  }
}
```

### Custom City Page

Create `content/seattle.md`:

```yaml
---
title: "Seattle"
type: "location"
---

Your content about your city...
```

## Development

To test the theme locally:

```bash
# Clone the theme
git clone https://github.com/rocksoup/mbtheme.git

# Create a test site
hugo new site test-site
cd test-site
ln -s /path/to/mbtheme themes/saunter

# Run Hugo
hugo server
```

See the [Development Guide](docs/development.md) for more details.

### Deploying Updates

**IMPORTANT:** When pushing bug fixes or updates to the theme, you MUST increment the version number for Micro.blog to detect and pull the changes.

```bash
# 1. Make your changes to the theme files
# 2. Update the version in TWO places:
#    - plugin.json (e.g., "0.1.4" → "0.1.5")
#    - layouts/partials/head.html meta tag (e.g., "Saunter 0.1.4" → "Saunter 0.1.5")
# 3. Commit and push to main
git add .
git commit -m "fix: your bug fix description"
git push
```

Micro.blog monitors the `version` field in `plugin.json` to detect updates. Without incrementing this version, Micro.blog will not pull your latest changes from the main branch. The meta tag in head.html allows you to verify the version in the live site's HTML source.

**Version Numbering:**
- Patch versions (0.1.x) - Bug fixes and minor changes
- Minor versions (0.x.0) - New features
- Major versions (x.0.0) - Breaking changes

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Requirements

- Micro.blog hosted site or Hugo Extended 0.100+
- Optional: Micro.blog Search plugin for search functionality

## Credits

- **Design Inspiration:** Wonky Editorial prototype
- **Author:** [Jared Stoneberg](https://github.com/rocksoup)
- **License:** MIT

## Support

- 📖 [Documentation](docs/)
- 🐛 [Issue Tracker](https://github.com/rocksoup/mbtheme/issues)
- 💬 [Micro.blog Community](https://micro.blog/help)

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and updates.

## License

MIT License - see [LICENSE](LICENSE) for details.

---

Made with ❤️ for the Micro.blog community
