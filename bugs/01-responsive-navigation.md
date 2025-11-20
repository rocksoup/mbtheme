## Title
Responsive navigation with hamburger menu on small viewports

## Summary
Replace the current always-visible horizontal navigation with a responsive version that shows menu links (`All`, `Journal`, `Links`, `Books`, `Movies`) inline on desktop and collapses to an accessible hamburger-style menu on small viewports.

## Context / Why
- Current nav links overflow on narrow screens and are hard to use on mobile.
- Screenshot reference shows the intended primary links: All, Journal, Links, Books, Movies.
- We also need to preserve the search and theme toggle controls that live in the header.

## Requirements
- Desktop/wide view: show inline horizontal navigation with the links `All`, `Journal`, `Links`, `Books`, `Movies`.
- Small viewports: collapse the navigation links behind a hamburger button.
  - Use a recognizable hamburger icon, ensure it is keyboard-focusable, and provide `aria-expanded` and `aria-controls`.
  - Menu should open/close via click or Enter/Space and close on Esc or outside click.
  - Keep search icon and theme toggle visible; if space is tight, they can sit beside the hamburger.
  - Trap focus inside the open menu and return focus to the trigger on close.
- Styling: smooth open/close animation; menu items are tap-friendly with sufficient spacing; respect existing typography and colors.
- No regression to existing `.Site.Menus.main` support—keep using configured menu items when present; fallback links should list the five links above.
- Ensure dark-mode styles match the rest of the header.

## Acceptance Criteria
- On desktop widths (e.g., ≥ 768px), the five links render inline in the header with current styling; search and theme toggle remain visible.
- On mobile widths (e.g., < 768px), the inline links are hidden by default and a hamburger button appears.
- Tapping/clicking the hamburger opens a dropdown/panel with the five links; Esc or outside click closes it.
- Keyboard users can tab through the open menu; focus is trapped while open and returns to the hamburger when closed.
- Search icon and theme toggle remain usable on mobile.
- No layout shift or overlap with the logo; header spacing remains consistent.

## Technical Notes
- Likely touchpoints: `layouts/partials/site-header.html`, `static/css/main.css`, `static/js/saunter.js`.
- Use data attributes/hooks for JS to avoid broad selectors.
- Keep inline SVG for the hamburger/close icons to match existing icon style.
- Add ARIA attributes (`aria-label`, `aria-expanded`, `aria-controls`) and manage focus per WAI-ARIA authoring practices for disclosure menus.
