## Title
Refresh Mailchimp email template for newsletter updates

## Summary
The subscription confirmation/newsletter emails sent via Mailchimp look rough. We need to redesign the Mailchimp template (layout, typography, colors, spacing, CTAs) to match the Saunter brand and deliver a clean, readable update email. Example of the current email: https://us6.campaign-archive.com/?e=8e17e344b1&u=589e7750b96d9baf18b9a88b0&id=efe3f08502

## Context / Why
- Current Mailchimp email styling is not aligned with the site’s visual language.
- Consistent branding increases trust and readability, and reduces unsubscribes.
- The site newsletter signup is being improved; the email output should match.

## Requirements
- Redesign the Mailchimp template (body content + footer) to match Saunter brand:
  - Typography consistent with site (fallbacks available in email-safe fonts).
  - Color palette aligned with site accents, neutral backgrounds, legible contrast.
  - Clear hierarchy: title, intro, body, links/CTAs, footer.
  - Respect email client constraints (no heavy CSS; inline styles as needed).
- Include a primary CTA/link styled as a button.
- Ensure images (if any) scale for mobile and don’t overflow.
- Add proper text spacing (line-height, padding/margins) for readability.
- Footer: include required Mailchimp unsubscribe/address content; keep it visually tidy.
- Test on mobile and desktop email previews in Mailchimp.

## Acceptance Criteria
- New Mailchimp template renders cleanly in Mailchimp preview and common clients (Gmail, Apple Mail).
- Typography and colors align with Saunter branding while remaining email-safe (e.g., fallback to system sans/serif as needed).
- CTA button visible and tappable on mobile; links clearly styled.
- No layout breakage for long text or missing images.
- Footer includes required compliance content and looks consistent with the rest of the email.

## Technical Notes
- Work in Mailchimp’s template editor; favor inline styles and table-based layout for reliability.
- Use brand colors in a minimal palette: primary accent (link/button), neutral background, muted text for metadata.
- Keep CSS minimal and embedded/inline (avoid external CSS).
- Update template name/version in Mailchimp and document the chosen template for reuse.
