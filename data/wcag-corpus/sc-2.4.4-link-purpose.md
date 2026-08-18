---
id: wcag-2.4.4
title: "WCAG 2.2 SC 2.4.4 Link Purpose (In Context)"
sourceType: wcag-sc
url: https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-in-context.html
---

## Definition

The purpose of each link can be determined from the link text alone, or from the link text
together with its programmatically-determined context (the surrounding sentence, list item, or
table cell).

## Why it matters

Screen reader users frequently pull up a list of all links on a page to navigate quickly — out
of the surrounding paragraph context. A list full of "Click here" or "Read more" links is
useless in that view, even if the sentence around each one makes sense visually.

## Common failures

- Generic link text: "click here", "read more", "learn more", with no distinguishing context
  captured in the accessible name (axe-core rule: `link-name` catches empty links; vague text is
  a manual-review item).
- Multiple links on a page all reading exactly "Read more" with no way to tell them apart out of
  context.
- Icon-only links with no `aria-label`.

## Example fix

Replace `<a href="/updates/2026-08">Click here</a>` with `<a href="/updates/2026-08">Read the
August product update</a>`, or keep the short visible text and add context for assistive tech:
`<a href="/updates/2026-08">Click here<span class="sr-only"> to read the August product
update</span></a>`.
