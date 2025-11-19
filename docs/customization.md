# Customization Guide

This guide explains how to customize the Saunter theme to match your style and preferences.

## Understanding the Theme Structure

The Saunter theme follows Hugo's standard theme structure:

```
mbtheme/
├── layouts/           # Template files
│   ├── _default/     # Default templates (list, single, baseof)
│   ├── partials/     # Reusable components
│   └── shortcodes/   # Custom shortcodes
├── static/           # Static assets
│   ├── css/         # Stylesheets
│   └── js/          # JavaScript files
└── config.json       # Theme metadata
```

## Customizing Colors and Typography

### Method 1: Custom CSS (Recommended)

Create a `static/css/custom.css` file in your **site root** (not in the theme):

```css
/* Custom colors */
:root {
  --primary-color: #your-color;
  --background-color: #your-bg;
  --text-color: #your-text;
}

/* Dark mode overrides */
@media (prefers-color-scheme: dark) {
  :root {
    --primary-color: #your-dark-color;
    --background-color: #your-dark-bg;
    --text-color: #your-dark-text;
  }
}

/* Custom typography */
body {
  font-family: 'Your Font', sans-serif;
  font-size: 18px;
  line-height: 1.6;
}
```

Micro.blog will automatically include this file after the theme's CSS.

### Method 2: Override Theme CSS

If you need more control, copy `static/css/main.css` from the theme to your site's `static/css/` directory and modify it directly.

**Note:** This approach means you won't receive automatic CSS updates when the theme is updated.

## Customizing Layouts

### Overriding Templates

To customize a specific template without modifying the theme:

1. Create the same file path in your site's `layouts/` directory
2. Hugo will use your version instead of the theme's

**Example:** To customize the homepage:

```
your-site/
└── layouts/
    └── index.html    # Your custom homepage
```

### Common Layout Overrides

#### Custom Header

Copy `layouts/partials/header.html` to your site and modify:

```html
<header class="site-header">
  <div class="container">
    <h1>{{ .Site.Title }}</h1>
    <p>{{ .Site.Params.description }}</p>
    <!-- Add your custom header content here -->
  </div>
</header>
```

#### Custom Footer

Copy `layouts/partials/footer.html`:

```html
<footer class="site-footer">
  <div class="container">
    <p>&copy; {{ now.Year }} {{ .Site.Params.author.name }}</p>
    <!-- Add your custom footer content -->
  </div>
</footer>
```

#### Custom Post Layout

Copy `layouts/_default/single.html` to customize individual post pages.

## Adding Custom Partials

Create new partials in your site's `layouts/partials/` directory:

```html
<!-- layouts/partials/custom-widget.html -->
<div class="custom-widget">
  <h3>{{ .Title }}</h3>
  <p>{{ .Content }}</p>
</div>
```

Then include it in your templates:

```html
{{ partial "custom-widget.html" . }}
```

## Customizing the Newsletter Form

### Changing the Newsletter Copy

Update your site config:

```json
{
  "params": {
    "newsletter": {
      "title": "Your Custom Title",
      "copy": "Your custom subscription message.",
      "button": "Join Now"
    }
  }
}
```

### Styling the Newsletter Form

Add custom CSS:

```css
.newsletter-form {
  background: #f5f5f5;
  padding: 2rem;
  border-radius: 8px;
}

.newsletter-form input {
  border: 2px solid #333;
  padding: 12px;
}

.newsletter-form button {
  background: #your-color;
  color: white;
  padding: 12px 24px;
}
```

## Adding New Category Badges

Category badges are automatically generated from post categories. To customize their appearance:

```css
/* Category badge styles */
.category-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 14px;
  margin-right: 8px;
}

/* Specific category colors */
.category-design {
  background: #e3f2fd;
  color: #1565c0;
}

.category-photography {
  background: #f3e5f5;
  color: #7b1fa2;
}

/* Add more categories as needed */
```

## Customizing Dark Mode

### Adjusting Dark Mode Colors

Override the dark mode CSS variables:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #1a1a1a;
    --text-primary: #e0e0e0;
    --accent-color: #your-accent;
  }
}
```

### Disabling Dark Mode Toggle

If you want to remove the dark mode toggle:

1. Copy `layouts/partials/header.html` to your site
2. Remove the theme toggle button HTML
3. Set dark mode to a fixed value in config:

```json
{
  "params": {
    "dark_mode": "light"
  }
}
```

## Adding Custom JavaScript

Create `static/js/custom.js` in your site:

```javascript
// Your custom JavaScript
document.addEventListener('DOMContentLoaded', function() {
  // Custom functionality here
});
```

### Example: Custom Analytics

```javascript
// Add your analytics code
(function() {
  // Google Analytics, Plausible, etc.
})();
```

## Customizing the Search Page

### Custom Search Results Display

The search functionality uses the Micro.blog Search plugin. To customize the search results appearance:

```css
#list_results {
  padding: 2rem;
  background: #f9f9f9;
  border-radius: 8px;
}

#list_results a {
  color: #your-link-color;
  text-decoration: none;
  display: block;
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

#list_results a:hover {
  background: #f0f0f0;
}
```

### Custom Search Input

```css
.search-input {
  width: 100%;
  padding: 12px 20px;
  font-size: 16px;
  border: 2px solid #ddd;
  border-radius: 8px;
}

.search-input:focus {
  outline: none;
  border-color: #your-accent-color;
}
```

## Responsive Design Customization

### Mobile-Specific Styles

```css
@media (max-width: 768px) {
  /* Mobile overrides */
  .site-header h1 {
    font-size: 24px;
  }

  .newsletter-form {
    padding: 1rem;
  }
}
```

### Tablet Styles

```css
@media (min-width: 769px) and (max-width: 1024px) {
  /* Tablet-specific styles */
}
```

## Advanced Customization

### Custom Shortcodes

Create custom shortcodes in `layouts/shortcodes/`:

```html
<!-- layouts/shortcodes/callout.html -->
<div class="callout callout-{{ .Get 0 }}">
  {{ .Inner }}
</div>
```

Use in your posts:

```markdown
{{< callout info >}}
This is an info callout!
{{< /callout >}}
```

### Custom Taxonomies

Add custom taxonomies beyond categories and tags:

```json
{
  "taxonomies": {
    "category": "categories",
    "tag": "tags",
    "series": "series"
  }
}
```

### Custom Menus

Add custom navigation links:

```json
{
  "menu": {
    "main": [
      {"name": "Home", "url": "/"},
      {"name": "About", "url": "/about"},
      {"name": "Projects", "url": "/projects"},
      {"name": "Custom Link", "url": "/custom"}
    ]
  }
}
```

## Best Practices

### 1. Don't Modify Theme Files Directly

Always customize by:
- Creating files in your site's directories
- Using custom CSS in `static/css/custom.css`
- Overriding specific templates as needed

This ensures you can update the theme without losing customizations.

### 2. Test Across Devices

Always test your customizations on:
- Desktop browsers
- Mobile devices
- Tablet devices
- Both light and dark modes

### 3. Keep It Minimal

Add only the customizations you need. Excessive custom CSS and JavaScript can slow down your site.

### 4. Document Your Changes

Keep notes about what you've customized and why, especially if you're making complex changes.

## Getting Help

If you need help with customization:

1. Check the [configuration guide](configuration.md) for built-in options
2. Review Hugo's [template documentation](https://gohugo.io/templates/)
3. Visit the [Micro.blog community](https://micro.blog/help)
4. File an issue on the [theme repository](https://github.com/rocksoup/mbtheme)

## Examples

### Example 1: Custom Color Scheme

```css
/* Blue theme */
:root {
  --primary: #2563eb;
  --secondary: #3b82f6;
  --accent: #60a5fa;
}

.category-badge {
  background: var(--primary);
  color: white;
}
```

### Example 2: Custom Fonts

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

body {
  font-family: 'Inter', sans-serif;
}

h1, h2, h3, h4, h5, h6 {
  font-family: 'Inter', sans-serif;
  font-weight: 700;
}
```

### Example 3: Custom Homepage Hero

```html
<!-- layouts/index.html -->
{{ define "main" }}
<section class="hero">
  <h1>Welcome to {{ .Site.Title }}</h1>
  <p>{{ .Site.Params.description }}</p>
</section>

{{ range first 10 .Site.RegularPages }}
  {{ .Render "summary" }}
{{ end }}
{{ end }}
```

With these customization options, you can make the Saunter theme truly your own while maintaining the ability to receive theme updates.
