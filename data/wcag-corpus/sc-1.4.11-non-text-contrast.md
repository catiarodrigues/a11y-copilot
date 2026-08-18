---
id: wcag-1.4.11
title: "WCAG 2.2 SC 1.4.11 Non-text Contrast"
sourceType: wcag-sc
url: https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html
---

## Definition

Visual information required to identify user interface components and states, and graphical
objects required to understand content, has a contrast ratio of at least 3:1 against adjacent
colors. This covers things SC 1.4.3 doesn't: button borders, form field outlines, focus
indicators, icons, and chart lines — not text.

## Why it matters

A user with low vision can read high-contrast text just fine but still miss a button entirely
if its border blends into the page background, or miss which tab is currently selected if the
active-state indicator is a subtle color shift. Interactive elements need to be visually
identifiable as interactive.

## Common failures

- Ghost buttons (outline-only, no fill) with a border color too close to the background.
- Custom checkboxes/radio buttons styled with low-contrast borders.
- Focus rings removed or replaced with a barely-visible color change.
- Icon-only controls whose icon color has insufficient contrast against its background.

## Example fix

A button border of `#e0e0e0` on a white card background is roughly 1.2:1 — fails. Changing the
border to `#767676` reaches about 4.5:1, well past the 3:1 minimum for non-text elements.
