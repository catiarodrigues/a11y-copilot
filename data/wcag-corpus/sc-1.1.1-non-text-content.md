---
id: wcag-1.1.1
title: "WCAG 2.2 SC 1.1.1 Non-text Content"
sourceType: wcag-sc
url: https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html
---

## Definition

All non-text content presented to the user has a text alternative that serves the equivalent
purpose. This applies to images, icons, buttons that use images, charts, and other visual
content that conveys information. Decorative images that add no information should be marked
so assistive technology skips them, typically with an empty `alt=""` or `role="presentation"`.

## Why it matters

Screen reader users cannot see images. Without a text alternative, an `<img>` becomes either
silent (skipped entirely) or announced only by its filename, which is rarely meaningful. For
functional images (an icon-only button, a logo that links home), missing alt text can make a
control impossible to identify or operate non-visually.

## Common failures

- `<img>` with no `alt` attribute at all (axe-core rule: `image-alt`).
- Meaningless alt text like `alt="image123.jpg"` or `alt="icon"`.
- Icon-only buttons or links with no accessible name (no `aria-label`, no visually hidden text).
- Decorative images given a description when they should be silent (`alt=""`).

## Example fix

For an informative image: `<img src="team.jpg" alt="Our five-person engineering team standing
outside the office">`. For a purely decorative image: `<img src="divider.png" alt="">`. For an
icon-only button: `<button aria-label="Close dialog"><svg aria-hidden="true">...</svg></button>`.
