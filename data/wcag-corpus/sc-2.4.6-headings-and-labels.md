---
id: wcag-2.4.6
title: "WCAG 2.2 SC 2.4.6 Headings and Labels"
sourceType: wcag-sc
url: https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels.html
---

## Definition

Headings and labels describe topic or purpose. This doesn't just mean a heading/label must
exist (see 1.3.1 and 3.3.2) — it must actually be descriptive, and heading levels should nest
in a logical order (an `<h2>` shouldn't jump straight to `<h4>`).

## Why it matters

Screen reader users often scan a page by jumping between headings the same way sighted users
scan by skimming visually. A heading that says "Section" or "More Info" instead of "Pricing
Plans" gives no information in that scan. Skipped heading levels also break the mental outline
users build of the page structure.

## Common failures

- Headings with vague or repeated text ("Overview" used for five different sections).
- Heading level skips: `<h1>` followed directly by `<h3>`.
- Form labels that just say "Input" or repeat the field's data type instead of its purpose.

## Example fix

Rename a heading from `<h2>Details</h2>` to `<h2>Shipping Details</h2>`, and fix a level skip by
changing a stray `<h4>` that follows an `<h2>` directly to `<h3>`.
