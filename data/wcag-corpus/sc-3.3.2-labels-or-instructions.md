---
id: wcag-3.3.2
title: "WCAG 2.2 SC 3.3.2 Labels or Instructions"
sourceType: wcag-sc
url: https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html
---

## Definition

Labels or instructions are provided when content requires user input — every form field needs a
label, and any required format (date pattern, password rules) needs to be communicated before
or alongside the field, not only after a failed submission.

## Why it matters

Without a programmatically-associated label, a screen reader user tabbing into a field hears
nothing about what it's for — placeholder text alone doesn't count, because it disappears once
the user starts typing and isn't reliably exposed to assistive tech the same way a real label is.

## Common failures

- Inputs relying solely on `placeholder` for identification, with no `<label>` (axe-core rule:
  `label`).
- Icon-only search boxes or filters with no accessible name.
- Required-field or format instructions shown only visually (e.g., a red asterisk with no text
  equivalent).

## Example fix

Replace `<input type="email" placeholder="Email address">` with a proper label: `<label
for="email">Email address</label><input id="email" type="email">`. If a visual-only label is a
hard design constraint, use a visually-hidden label instead of skipping it: `<label for="email"
class="sr-only">Email address</label>`.
