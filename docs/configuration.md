# Configuration Guide

This guide covers all configuration options for the Saunter theme.

## Basic Configuration

### Site Metadata

Add these parameters to your Micro.blog site configuration (`config.json` or `hugo.toml`):

```json
{
  "title": "Your Site Title",
  "description": "A brief description of your site",
  "author": {
    "name": "Your Name",
    "url": "https://yoursite.com"
  }
}
```

### Theme-Specific Parameters

```json
{
  "params": {
    "description": "Your site tagline or description",
    "city_tagline": {
      "text": "Made with ❤️ in",
      "location": "Seattle, Washington",
      "url": "/location/"
    },
    "show_categories": true,
    "dark_mode": "auto",
    "author_name": "Your Name",
    "colophonURL": "/colophon/"
  }
}
```

#### Available Parameters

- `description` (string) – Site description shown in the header
- `city_tagline` (string or object) – Footer location line. Use a simple string (`"Seattle, WA"`) for text-only output or provide an object with `text`, `location`, and `url` keys to match the “Made with ❤️ in Seattle, Washington” preview.
- `show_categories` (boolean) – Enable/disable category badges on posts
- `dark_mode` (string) – Options: `"auto"`, `"light"`, `"dark"`
- `author_name` (string) – Explicit author name for footer copyright (falls back to site title)
- `colophonURL` (string) – Relative URL used for the “Colophon” footer link

## Newsletter Integration

The Saunter theme includes a newsletter signup form in the footer. You have two options:

### Option 1: Native Micro.blog Newsletter (Recommended)

Use Micro.blog's built-in newsletter functionality:

```json
{
  "params": {
    "newsletter": {
      "enabled": true,
      "title": "Subscribe to get updates in your inbox",
      "copy": "",
      "action": "https://micro.blog/users/follow",
      "method": "post",
      "placeholder": "you@email.com",
      "button": "Subscribe"
    }
  }
}
```

> Leave out the `copy` key (or set it to an empty string) if you want to hide the subtitle entirely.

**How to enable:**
1. In Micro.blog dashboard, go to **Posts → Design → Newsletter**
2. Enable the newsletter feature
3. Configure sending schedule and intro text
4. Add the configuration above to your site

**Benefits:**
- Zero third-party dependencies
- Handles storage, double opt-in, and unsubscribes automatically
- Content parity with blog posts
- Simple maintenance

**Limitations:**
- Limited email template customization
- Basic analytics
- No subscriber segmentation

### Option 2: Mailchimp RSS Campaign

Use Mailchimp with an RSS-triggered campaign:

```json
{
  "params": {
    "newsletter": {
      "enabled": true,
      "title": "Subscribe to get updates in your inbox",
      "copy": "",
      "action": "https://yourlist.mailchimp.com/subscribe/post",
      "method": "post",
      "placeholder": "you@email.com",
      "button": "Subscribe"
    }
  }
}
```

Leave the `copy` key empty (or remove it) to match the clean prototype footer.

Add the hidden honeypot input Mailchimp provides as `mailchimp_honeypot`:

```json
{
  "params": {
    "mailchimp_honeypot": "b_abc123_def456"
  }
}
```

This keeps the embedded form identical to the working local preview and helps block spambots that submit the extra hidden field.

**How to set up:**
1. Create a Mailchimp account and audience
2. Set up an RSS-triggered campaign pointing to your Micro.blog feed
3. Get the embedded form action URL from Mailchimp
4. Add the configuration above with your Mailchimp URL

**Benefits:**
- Custom email design and branding
- Advanced analytics (opens, clicks, devices)
- Subscriber segmentation
- Integration with other marketing tools

**Considerations:**
- More complex setup
- Potential cost depending on subscriber count
- RSS polling may introduce slight delays
- Requires GDPR compliance text

### Disabling Newsletter

To remove the newsletter form entirely:

```json
{
  "params": {
    "newsletter": {
      "enabled": false
    }
  }
}
```

## Footer Enhancements

To match the local preview footer (Seattle note, Colophon link, updated copyright), configure the following:

```json
{
  "params": {
    "city_tagline": {
      "text": "Made with ❤️ in",
      "location": "Seattle, Washington",
      "url": "/location/"
    },
    "colophonURL": "/colophon/",
    "author_name": "Saunter"
  }
}
```

- `city_tagline` accepts either the object shown above (for linked text) or a simple string (`"Seattle, WA"`) if you only need the location label.
- `colophonURL` should point to an existing page on your site; it's optional, but the footer link only appears when provided.
- `author_name` lets you control the copyright text without changing the site title.

## Search Functionality

The Saunter theme supports Micro.blog's built-in Search plugin.

### Enabling Search

1. In Micro.blog dashboard, click **Design** (Theme)
2. Go to the **Plug-ins** section
3. Click **Find Plug-ins** and search for "Search Page"
4. Click **Install** on the Search Page plugin
5. Ensure the plugin is **Enabled**

The plugin automatically adds a "Search" link to your navigation menu.

### Search Page Customization

Create a custom search page by adding `content/search.md`:

```markdown
---
title: "Search"
---

Search through all posts on this site.
```

### Embedding Search Elsewhere

Use the search partial in any template:

```html
{{ partial "search.html" . }}
```

For example, add it to your sidebar or header.

### Styling the Search UI

Customize the search appearance with CSS:

```css
.field {
    width: 100%;
    height: 34px;
    border: 2px solid #eee;
    padding-left: 10px;
    margin: 20px 0;
    border-radius: 11px;
}

#list_results {
    padding: 2rem;
    border-radius: 11px;
    box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px,
                rgba(60, 64, 67, 0.15) 0px 1px 3px 1px;
}
```

### What Gets Indexed

The Search plugin indexes:
- ✅ All published blog posts (including short microposts)
- ✅ Post titles and content

Not included:
- ❌ Replies or comments
- ❌ Static pages (About, Contact, etc.)

## Category Badges

The Saunter theme displays category badges on posts. Categories are automatically detected from your post frontmatter.

### Adding Categories to Posts

In your post frontmatter:

```yaml
---
title: "My Post"
categories:
  - design
  - photography
---
```

### Customizing Category Display

Control category display in your config:

```json
{
  "params": {
    "show_categories": true
  }
}
```

Set to `false` to hide category badges.

### Category Badge Styling

Categories use predefined colors. You can customize these in your custom CSS by overriding the category badge styles.

## Dark Mode

The Saunter theme includes automatic dark mode support.

### Dark Mode Options

```json
{
  "params": {
    "dark_mode": "auto"
  }
}
```

Options:
- `"auto"` – Follows system preferences (default)
- `"light"` – Always light mode
- `"dark"` – Always dark mode

Users can toggle dark mode using the theme switcher in the header.

## Custom Pages

### Creating a Location/City Page

The Saunter theme includes support for a custom location page (like `/seattle`).

Create `content/seattle.md`:

```yaml
---
title: "Seattle"
type: "page"
---

Content about your city or location...
```

### About Page

Create `content/about.md`:

```yaml
---
title: "About"
---

Your about page content...
```

## Advanced Configuration

### Custom CSS

Add custom styles by creating `static/css/custom.css` in your site (not the theme).

Micro.blog will automatically include it after the theme's CSS.

### Custom JavaScript

Add custom scripts by creating `static/js/custom.js`.

### Social Links

Configure social media links:

```json
{
  "params": {
    "social": {
      "twitter": "yourusername",
      "github": "yourusername",
      "email": "you@example.com"
    }
  }
}
```

## Troubleshooting

### Newsletter form not appearing
- Check that `params.newsletter.enabled` is set to `true`
- Verify the configuration syntax is correct

### Search not working
- Ensure the Search Page plugin is installed and enabled in Micro.blog
- Verify you're on a Micro.blog hosted site (search requires the plugin)

### Categories not showing
- Check that `params.show_categories` is `true`
- Verify posts have categories in their frontmatter

### Dark mode not working
- Check browser console for JavaScript errors
- Verify theme files are properly loaded
- Try clearing browser cache

## Need Help?

- Check the [Micro.blog help documentation](https://help.micro.blog/)
- Visit the [Micro.blog community forum](https://micro.blog/help)
- File an issue on the [theme repository](https://github.com/rocksoup/mbtheme)
