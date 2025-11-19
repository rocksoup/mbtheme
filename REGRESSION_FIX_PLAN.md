# Regression Fix Plan - Saunter Theme

**Date:** 2025-11-19
**Version:** 0.1.7

## Overview

This document outlines four critical regressions identified after config.json changes and their solutions.

---

## Issue 1: Featured Images Below Post Content (CRITICAL)

### Problem
Featured images are rendering BELOW the post content instead of ABOVE on single post pages.

### Root Cause
Commit c0d3bf2 removed the featured image rendering logic entirely to prevent duplicate images. This removed ALL featured image display, breaking the intended layout.

### Solution
Restore the featured image detection and rendering logic, placing it BEFORE the content section.

**File:** `layouts/_default/single.html`

**Changes:**
- Add featured image detection logic for `featured_image`, `image`, and `images` params
- Render image BEFORE the `<div class="content">` section
- Use smart ordering: check `featured_image` first, fallback to `image`, then `images[0]`

---

## Issue 2: Category Badges Not Styled Correctly

### Problem
Category badges may not display with proper emoji styling and grayscale filter in all modes.

### Root Cause
Missing dark mode specific styling for category badges, potentially causing inconsistent rendering.

### Solution
Add dark mode specific CSS rules to ensure badges render consistently.

**File:** `static/css/main.css`

**Changes:**
- Add `body.saunter.dark-mode .category-badge` styles
- Explicitly set border-color and text color
- Ensure emoji grayscale filter applies in dark mode

---

## Issue 3: Newsletter Section Not Centered/Clean

### Problem
Newsletter subscription section lacks centered layout and clean minimal styling shown in prototype.

### Root Cause
Current CSS doesn't center the container or form elements, resulting in left-aligned appearance.

### Solution
Update newsletter CSS to center all elements with proper spacing and max-width constraints.

**File:** `static/css/main.css`

**Changes:**
- Add `text-align: center` to `.newsletter`
- Set `max-width: 600px` with `margin: 0 auto`
- Center form with `justify-content: center` and `max-width: 400px`
- Make copy text color muted (`color: var(--color-text-muted)`)
- Increase spacing for better visual hierarchy

---

## Issue 4: Footer Styling Needs Refinement

### Problem
Footer lacks proper styling for copyright text and link hover states.

### Root Cause
Missing CSS classes and refinements for footer elements.

### Solution
Add specific styling for copyright and footer links to match prototype design.

**File:** `static/css/main.css`

**Changes:**
- Add `.copyright` class with proper sizing, color, and margin
- Enhance `.footer-links a` with flex layout, gap, and hover transitions
- Add bottom padding to footer
- Ensure muted color scheme for footer elements

---

## Issue 5: Footer + Newsletter Content Mismatch (MAJOR)

### Problem
The live site footer still shows the legacy Micro.blog subscribe button, omits the “Made in Seattle” line, and does not surface the Colophon link—even though the local preview includes all three elements.

### Root Cause
The new footer components depend on structured configuration (`newsletter.action`, `city_tagline`, `colophonURL`, `mailchimp_honeypot`) that is undocumented and partially incompatible with the old single-string `city_tagline`.

### Solution
Document the required configuration, provide a working sample config, and update the footer partial so it gracefully accepts both the new object format and the legacy single string.

**Files:**
- `docs/configuration.md`
- `config.json`
- `layouts/partials/site-footer.html`

**Changes:**
- Add Mailchimp + footer configuration guidance with concrete JSON (matching the screenshot/local preview)
- Ship a sample `config.json` with the Mailchimp form, Seattle footer line, and Colophon URL enabled
- Update the footer partial to detect whether `city_tagline` is a string or map so existing installs do not break

---

## Implementation Checklist

- [x] Analyzed all 5 regression issues
- [x] Created REGRESSION_FIX_PLAN.md
- [x] Fixed featured image placement
- [x] Enhanced category badge styling
- [x] Fixed newsletter centering
- [x] Refined footer styling
- [x] Updated version to 0.1.7
- [x] Documented Mailchimp/footer configuration requirements
- [x] Added backwards-compatible footer rendering logic
- [ ] Committed and pushed changes
- [ ] Tested on live site

---

## Testing Requirements

### Featured Images
- [ ] Images appear ABOVE post content
- [ ] No duplicate images when image is in content
- [ ] Works with `featured_image`, `image`, and `images` params

### Category Badges
- [ ] Emoji icons display with grayscale filter
- [ ] Border and background styling correct
- [ ] Works in both light and dark modes

### Newsletter
- [ ] Section is horizontally centered
- [ ] Form is centered within section
- [ ] Proper spacing and max-width applied
- [ ] Clean, minimal appearance matches prototype

### Footer
- [ ] Copyright text properly styled and colored
- [ ] Footer links have proper hover states
- [ ] All elements centered
- [ ] Muted color scheme applied

---

## Version History

**0.1.7** - Fixed 4 critical regressions:
- Restored featured image placement above content
- Enhanced category badge dark mode styling
- Centered newsletter section with clean styling
- Refined footer styling with copyright and link enhancements
