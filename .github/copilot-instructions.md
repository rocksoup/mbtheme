<!-- Copilot instructions for contributors and AI coding agents -->
# Copilot / AI Agent Instructions — Saunter Theme

This file contains concise, actionable guidance for AI coding agents working on the `mbtheme` (Saunter) Hugo theme.

1. Purpose
- The repository is a Hugo/Micro.blog theme named *Saunter* (see `README.md`). Primary use-cases: Micro.blog hosted themes and local Hugo testing.

2. Big-picture architecture
- Templates live in `layouts/` — base templates in `layouts/_default/` (`baseof.html`, `single.html`, `list.html`).
- Reusable pieces are in `layouts/partials/` (e.g. `site-header.html`, `newsletter.html`, `category-badge.html`).
- Static assets are in `static/` (`css/main.css`, `js/saunter.js`).
- Theme defaults and parameters are in `config.json` (not site config). Key keys: `params`, `microblog`, and `params.newsletter`.

3. How to run and test locally (explicit commands)
- Prerequisite: Hugo Extended installed (`brew install hugo`). Confirm with `hugo version` (must say "extended").
- Create a test site and link the theme (from `docs/development.md`):
  - `hugo new site my-test-site && cd my-test-site`
  - `ln -s /path/to/mbtheme themes/saunter` (or `git clone` into `themes/saunter`).
  - `hugo server --disableFastRender -D` and open `http://localhost:1313`.
- For production-like build: `hugo --minify`.

4. Project-specific conventions and patterns
- Config/params: site-level overrides go in the site `config.json`/`config.toml`. The theme expects `params.*` keys (see root `config.json` for examples).
- Newsletter: controlled via `params.newsletter.enabled`. The theme supplies a built-in Micro.blog newsletter form (default action `https://micro.blog/users/follow`).
- Search: The theme integrates Micro.blog Search plugin. The search partial is `layouts/partials/search.html` and usage example: `{{ partial "search.html" . }}`.
- Location pages: custom template at `layouts/location/single.html` — content type `location` is used by examples.
- Category badges: categories are taken from frontmatter (`categories:`) and rendered via `partials/category-badge.html`.

5. Editing guidance for agents (what files to change for common tasks)
- Change site header/footer or global structure: edit `layouts/_default/baseof.html` and appropriate partials in `layouts/partials/`.
- Modify post layout: edit `layouts/_default/single.html` and `layouts/_default/list.html`.
- Update styles or theme JS: edit `static/css/main.css` and `static/js/saunter.js` respectively.
- Add examples or demo content: `examples/demo-site/` contains a sample `config.json` and `content/` for reference.

6. Integration points & external dependencies
- Micro.blog: primary hosting target — theme expects Micro.blog features (Search plugin, Newsletter integration).
- Pinboard and other microblogging integrations: the theme is Pinboard-aware but does not embed external client libraries.

7. Testing and iteration notes for agents
- Hot-reload: Hugo automatically reloads templates, CSS, and JS while running `hugo server`.
- When editing templates that seem stale, run `hugo server --disableFastRender` to avoid cached render artifacts.
- No automated test suite in repo; rely on local preview and the `examples/demo-site` for integration checks.

8. Commit / PR conventions (brief)
- Keep changes scoped to templates/partials/static assets unless adding a new feature.
- Update `CHANGELOG.md` when releasing notable changes.

9. Examples (copyable snippets)
- Toggle newsletter off in site config (site `config.json`):
  ```json
  { "params": { "newsletter": { "enabled": false } } }
  ```
- Run local server with drafts and stable template rendering:
  ```bash
  hugo server --disableFastRender -D
  ```

10. Where to look for more context
- `README.md` — overview and quick start
- `docs/development.md` — local dev, examples, troubleshooting
- `docs/configuration.md` — all theme params and usage
- `layouts/` and `static/` — concrete implementation to reference

If anything here is unclear or you want more depth on build/deploy hooks, tell me which area to expand (local dev, newsletter, search, or templating examples). — Thanks!
