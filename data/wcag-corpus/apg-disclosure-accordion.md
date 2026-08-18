---
id: apg-disclosure-accordion
title: "ARIA APG: Disclosure (Show/Hide) and Accordion Pattern"
sourceType: apg-pattern
url: https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/
---

## Pattern

A disclosure is a button that shows or hides a section of content (an FAQ answer, a "show more"
panel). An accordion is a set of disclosures where opening one may (optionally) close the others.
The trigger must be a real `<button>` with `aria-expanded` reflecting current state
(`"true"`/`"false"`) and, ideally, `aria-controls` pointing to the id of the content it toggles.

## Why aria-expanded matters

Without `aria-expanded`, a screen reader user has no way to know whether activating the trigger
will reveal or hide content, or whether it's currently open. Sighted users infer this from a
chevron icon rotating or content visibly appearing — that visual-only signal doesn't reach
non-visual users unless it's also exposed through the state attribute.

## Common failures

- Show/hide triggers built as `<div>`/`<span>` with a click handler, no `role="button"`, no
  keyboard support (overlaps with the general Button pattern).
- Missing or stale `aria-expanded` — present in markup but never updated when the panel's open
  state actually changes (axe-core rule: `aria-valid-attr-value` if the value becomes invalid).
- Accordion panels that are visually hidden with CSS but remain in the tab order, so keyboard
  users tab into invisible, collapsed content.
