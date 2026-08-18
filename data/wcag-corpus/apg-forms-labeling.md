---
id: apg-forms-labeling
title: "ARIA APG: Accessible Form Labeling"
sourceType: apg-pattern
url: https://www.w3.org/WAI/tutorials/forms/labels/
---

## Pattern

Every form control needs an accessible name. The preferred method is a native `<label>`
programmatically associated via `for`/`id`, or by wrapping the input: `<label>Email <input
type="email"></label>`. When a visible label isn't feasible, `aria-label` or `aria-labelledby`
can supply the accessible name instead, but a visible label is always preferred for users with
cognitive disabilities and for voice-control users who need to see the label to say it.

## When to use aria-labelledby vs aria-label

Use `aria-labelledby` when there's existing visible text elsewhere on the page that should serve
as the label (e.g., a table's caption labeling all its filter inputs). Use `aria-label` when no
visible text exists and adding one is not desired — for example, a lone icon-only search input
where the magnifying-glass icon is the only visual cue.

## Common failures

- Placeholder-only inputs (placeholder is not a substitute for a label).
- `<label>` present but not linked to any input (mismatched or missing `for`/`id`).
- Grouped inputs like radio buttons with no `<fieldset>`/`<legend>` to convey the group's overall
  question.
