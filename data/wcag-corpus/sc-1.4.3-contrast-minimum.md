---
id: wcag-1.4.3
title: "WCAG 2.2 SC 1.4.3 Contrast (Minimum)"
sourceType: wcag-sc
url: https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
---

## Definition

The visual presentation of text and images of text has a contrast ratio of at least 4.5:1
against its background. Large-scale text (18pt+, or 14pt+ bold) needs only 3:1. This is a
Level AA success criterion, the most commonly targeted conformance level for public sites.

## Why it matters

Low-contrast text is difficult or impossible to read for users with low vision, color vision
deficiencies, or anyone using a screen in bright sunlight. Light gray text on a white background
is a frequent offender — it often looks intentionally subtle to a designer but is genuinely
unreadable to a meaningful fraction of users.

## Common failures

- Placeholder or "muted" text styled with a contrast ratio below 4.5:1 (axe-core rule:
  `color-contrast`).
- Text placed over a background image or gradient without ensuring contrast across the whole
  image.
- Disabled-looking form fields where the text is real content, not actually disabled.

## Example fix

`#cccccc` text on `#ffffff` background has a contrast ratio of about 1.6:1 — far below the
4.5:1 minimum. Darkening the text to `#595959` reaches roughly 7:1, comfortably passing. Always
verify the actual computed ratio; don't estimate by eye.
