## Title
Add dynamic on-site Style Guide page using real theme CSS/components

## Summary
Create an in-site dynamic style guide page that showcases typography, color tokens, UI components, and key site elements using the real Saunter CSS/JS. It should live at a routable URL (e.g., `/styleguide/`), render real theme components (nav, cards, badges, newsletter, footer, etc.), and stay maintainable (pull shared partials/variables instead of a static HTML snapshot).

## Context / Why
- `docs/SaunterStyleGuide.html` is a static prototype that diverges from the live theme.
- We want a single source of truth that reflects the production styles, components, and tokens for quick visual QA and design reference.
- Helps catch regressions in typography, color, spacing, and common components.

## Requirements
- Add a style guide page (suggest path `/styleguide/`) that:
  - Uses the actual site CSS and JS (no duplicated inline styles).
  - Showcases typography (headings, body, links, lists, blockquotes), color palette tokens, spacing scale, buttons/links, forms, badges, pagination, navigation/header, footer, and newsletter block.
  - Includes component previews drawn from existing partials where possible (e.g., header, post summary cards, badges, pagination, footer).
  - Shows light and dark mode examples using the theme toggle class so it stays accurate as variables change.
  - Includes a brief usage note and version stamp (theme version from `plugin.json` or head meta).
- Keep the guide minimal in content but rich in component coverage; avoid hard-coded styles.
- Ensure mobile responsiveness; no broken layout at small widths.
-- Design tokens / visual rules to document:
  - Color palette: `--color-text`, `--color-text-muted`, `--color-link`, `--color-link-visited`, `--color-bg`, `--color-border`, plus dark-mode swaps already defined in CSS.
  - Typography: heading/body stacks (Fraunces + Inter) and the scale already defined in CSS variables; note usage guidance for headings vs. body vs. metadata.
  - Spacing/radius: spacing tokens (`--space-4`, `--space-6`, `--space-8`, `--space-12`), border radius conventions (cards vs. pills), and shadow usage (light touch only where present, e.g., newsletter card).
  - UI primitives: buttons/links (underline defaults, hover/no underline), badges (emoji grayscale), pagination style (uppercase, letter spacing), icon style (stroke-only SVG).

## Acceptance Criteria
- Visiting `/styleguide/` loads a page styled with the live theme assets (same CSS/JS as the site).
- Page displays: typography samples, color tokens, spacing tokens, nav/header snippet, post summary card(s), badges, pagination, newsletter block, footer, and both light/dark previews.
- Components match current theme styling; updating theme CSS updates the style guide automatically (no inline overrides required).
- Page renders on mobile without layout issues; no 404s for assets.

## Technical Notes
- Use Hugo layouts (e.g., `layouts/styleguide/single.html` or `_default/single.html` with type `styleguide`) and reuse existing partials to avoid duplication.
- Drive tokens (colors, fonts, spacing) from CSS variables; if needed, read `:root` values or document them in the guide without hard-coding duplicates.
- Consider a small frontmatter page (`content/styleguide.md`) that uses the dedicated layout.
- Keep any guide-specific CSS minimal and namespaced to avoid bleeding into the main site.
