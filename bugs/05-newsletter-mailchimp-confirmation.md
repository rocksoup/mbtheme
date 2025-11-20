## Title
Newsletter form should submit to Mailchimp and show “Thank you for subscribing” confirmation

## Summary
Replicate the working Mailchimp signup flow from the adjacent business blog: when users enter their email and click Subscribe, the form should post to Mailchimp and, upon success, show an inline confirmation message (“Thank you for subscribing.”) without dumping users to a generic Mailchimp page. It should work on desktop and mobile, and degrade gracefully on errors.

## Context / Why
- Current personal blog newsletter form may not give inline confirmation or may rely on default Mailchimp flow.
- The business blog (adjacent repo) already has a working Mailchimp UX we want to mirror for consistency and trust.
- Clear confirmation improves user confidence and reduces drop-off.

## Requirements
- Form posts to Mailchimp using the configured `params.newsletter.action` (or equivalent) with required fields (email, honeypot).
- On successful submit, replace the form UI with a friendly confirmation message: “Thank you for subscribing.”
- Keep the Mailchimp honeypot/anti-spam field functional.
- Handle errors gracefully (show an inline error state/message if submission fails).
- Preserve existing styling, responsive behavior, and dark mode; minor adjustments allowed to fit confirmation state.
- No page redirect on success; stays on-page.

## Acceptance Criteria
- Entering a valid email and clicking Subscribe posts to Mailchimp and shows “Thank you for subscribing.” inline, without leaving the page.
- Invalid email prevents submit and shows an inline validation hint.
- Errors from Mailchimp (e.g., network, invalid list) show a non-disruptive inline error message; form remains usable.
- Honeypot field remains included and hidden.
- Works on mobile and desktop; matches or closely mirrors the business blog’s UX.

## Technical Notes
- Likely touchpoints: `layouts/partials/newsletter.html`, `static/js/saunter.js`, `static/css/main.css`.
- Inspect the adjacent business blog repo for the working Mailchimp implementation (submission method, success handling, any fetch/XHR vs. form target+iframe).
- If using AJAX/fetch: prevent default submit, POST to Mailchimp endpoint, handle success/error, and toggle UI state; otherwise, consider a hidden iframe to avoid navigation.
- Keep accessibility: proper `label`/`for`, `aria-live` region for success/error messages, focus management on state change.
- Maintain existing theme params (`newsletter.action`, `newsletter.method`, `mailchimp_honeypot`) and avoid breaking current config format.
