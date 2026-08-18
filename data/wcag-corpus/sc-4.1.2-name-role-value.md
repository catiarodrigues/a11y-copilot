---
id: wcag-4.1.2
title: "WCAG 2.2 SC 4.1.2 Name, Role, Value"
sourceType: wcag-sc
url: https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html
---

## Definition

For all user interface components, the name and role can be programmatically determined, states
and properties can be set by the user can be programmatically set, and notification of changes
is available to assistive technology. In practice: every interactive element needs an accessible
name, a correct role, and correctly exposed state (checked, expanded, selected, disabled).

## Why it matters

This is the catch-all criterion for custom widgets. A screen reader announces an element as
"button", "checkbox", "expanded" etc. based on its role and ARIA state — if a `<div>` styled as
a checkbox has no `role="checkbox"` and no `aria-checked`, it announces as nothing more than
generic text, and the user has no idea it's interactive or what state it's in.

## Common failures

- Custom dropdowns/comboboxes missing `role`, `aria-expanded`, or `aria-haspopup`.
- Toggle switches or custom checkboxes with no `aria-checked`, so state changes are invisible to
  assistive tech (axe-core rule: `aria-*` role/state mismatches, e.g. `button-name`,
  `aria-valid-attr-value`).
- Elements with an ARIA role that don't support the ARIA attributes being used on them.

## Example fix

For a custom toggle: `<button role="switch" aria-checked="false" aria-label="Enable
notifications">`. Update `aria-checked` in the same code path that changes the visual toggle
state — the two must never drift apart.
