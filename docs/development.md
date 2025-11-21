# Local Development and Testing

This guide explains how to test the Saunter theme locally using Hugo before deploying to Micro.blog.

## Prerequisites

- **Hugo Extended** installed via Homebrew
  ```bash
  brew install hugo
  ```
  Confirm installation with `hugo version` – it should say "extended"
- A local copy of your Micro.blog site export (or sample content)

## Setting Up Local Testing

### 1. Create a Test Site

Create a new Hugo site to test the theme:

```bash
mkdir my-test-site
cd my-test-site
hugo new site . --force
```

### 2. Install the Saunter Theme

Clone or copy the Saunter theme into the themes directory:

```bash
git clone https://github.com/rocksoup/mbtheme.git themes/saunter
```

Or if you're developing the theme locally:

```bash
ln -s /path/to/mbtheme themes/saunter
```

### 3. Configure Your Test Site

Create a `config.toml` (or `config.json`) with basic Saunter configuration:

```toml
baseURL = "http://localhost:1313/"
languageCode = "en-us"
title = "My Test Site"
theme = "saunter"

[params]
  description = "Testing the Saunter theme"
  author = "Your Name"

[params.newsletter]
  enabled = true
  title = "Subscribe to the newsletter"
  copy = "Updates on new posts and prototypes."
  action = "https://micro.blog/users/follow"
  method = "post"
  placeholder = "you@email.com"
  button = "Subscribe"
```

### 4. Add Sample Content

Create some test posts:

```bash
hugo new posts/my-first-post.md
hugo new posts/short-micro-post.md
```

Edit the posts in `content/posts/` to add content.

## Running the Development Server

From your test site directory:

```bash
hugo server --disableFastRender
```

Key flags:
- `--disableFastRender` – prevents stale content when editing templates or data
- `--buildDrafts` or `-D` – includes draft posts in the preview

Then open <http://localhost:1313>

## Iterating on the Theme

- Edit files under `themes/saunter/layouts/` and refresh the browser
- Hugo hot-reloads layouts, partials, CSS, and JS automatically
- To test specific features (newsletter, search, category badges), update your `config.toml` accordingly

## Testing with Actual Micro.blog Content

If you have a Micro.blog export:

1. Export your Micro.blog site (Design → Export)
2. Extract the ZIP to a directory (e.g., `my-microblog-export/`)
3. Point Hugo at the export content:

```toml
contentDir = "my-microblog-export/content"
dataDir = "my-microblog-export/data"
staticDir = "my-microblog-export/static"
```

This lets you preview the theme with real posts, photos, and Pinboard bookmarks.

## Troubleshooting

| Issue | Fix |
| --- | --- |
| Hugo can't find content | Ensure `content/` directory exists and contains Markdown files |
| Layouts not applying | Verify theme is set correctly in config: `theme = "saunter"` |
| Fonts/CSS missing | Check that `themes/saunter/static/css/main.css` exists |
| Newsletter form not rendering | Verify `[params.newsletter]` is configured in your config file |
| Search not working | Install the Micro.blog Search plugin when deploying to production |
| Watching/Reading pages empty | See "Working with Titleless Posts" section below |

### Working with Titleless Posts

One common issue when developing features that filter posts by prefix (like "Watched:", "Reading:", etc.) is that Micro.blog supports titleless posts. These microblog-style posts have an empty `.Title` field with content starting directly in the body.

**Problem:** Your filter checks `.Title` for "Watched:" but titleless posts have the prefix in `.Content` or `.Summary` instead.

**Solution:** Check multiple sources in order:

```go
{{ range .Site.Pages }}
  {{ if eq .Kind "page" }}
    {{ $title := .Title | default "" | trim " \t\r\n" }}
    {{ $summary := .Summary | default "" }}

    {{/* Check both title and summary */}}
    {{ if or (hasPrefix $title "Watched:") (hasPrefix $summary "Watched:") }}
      {{/* Found a watched post */}}
    {{ end }}
  {{ end }}
{{ end }}
```

**Key Points:**
1. Use `.Site.Pages` not `.Site.RegularPages` (RegularPages may exclude certain post types)
2. Filter by `.Kind == "page"` to get actual content pages
3. For title extraction from titleless posts, use `.Summary | plainify`
4. Apply `default ""` BEFORE `plainify` to avoid null issues

**Example - Extracting title from titleless post:**
```go
{{ $rawTitle := .Title | default "" | trim " \t\r\n" }}
{{ if not $rawTitle }}
  {{/* Extract from summary for titleless posts */}}
  {{ $summary := .Summary | default "" }}
  {{ $plainSummary := $summary | plainify }}
  {{ $firstLine := index (split $plainSummary "\n") 0 | default "" | trim " \t\r\n" }}
  {{ $rawTitle = $firstLine }}
{{ end }}
{{ $cleanTitle := $rawTitle | replaceRE "^Watched:\\s*" "" | replaceRE "🍿.*$" "" | trim " \t\r\n" }}
```

See the [SYSTEM_DOCUMENTATION.md](SYSTEM_DOCUMENTATION.md#working-with-titleless-posts) for a comprehensive guide.

### Debugging Template Issues

Add debug output to your templates to understand what Hugo sees:

```go
<div style="padding:1rem;background:#f0f0f0;margin:1rem 0;">
  <strong>Debug Info:</strong><br>
  Total pages: {{ len .Site.Pages }}<br>

  <details>
    <summary>First 5 pages (click to expand)</summary>
    {{ range first 5 .Site.Pages }}
      {{ if eq .Kind "page" }}
        <div style="margin:0.5rem 0;padding:0.5rem;background:white;">
          <strong>Title:</strong> "{{ .Title }}"<br>
          <strong>Summary:</strong> "{{ .Summary | plainify | truncate 80 }}"<br>
          <strong>URL:</strong> {{ .RelPermalink }}
        </div>
      {{ end }}
    {{ end }}
  </details>
</div>
```

**Remember to remove debug code before deploying to production!**

## Building for Production

To test the production build locally:

```bash
hugo --minify
```

This creates a `public/` directory with the static site.

## Deploying to Micro.blog

Once you're satisfied with local testing:

1. Commit your theme changes to the repository
2. In Micro.blog → Design → Edit Custom Theme
3. Point to your theme repository URL
4. Micro.blog will automatically pull the theme and apply it

The theme will be available immediately on your Micro.blog site.
