---
id: apg-button
title: "ARIA APG: Button Pattern"
sourceType: apg-pattern
url: https://www.w3.org/WAI/ARIA/apg/patterns/button/
---

## Pattern

A button triggers an action (submit, open, toggle) rather than navigating to a new resource
(that's a link's job). The native `<button>` element is preferred — it is automatically
focusable, keyboard-operable (Enter and Space both activate it), and announced with the correct
role, all for free.

## When a custom button is unavoidable

If a non-button element must act as a button (rare — usually a sign to reconsider the markup),
it needs: `role="button"`, `tabindex="0"` to be reachable by keyboard, and manual `keydown`
handling so both Enter and Space activate it (native buttons handle both automatically, and the
two keys have historically different default behaviors that custom implementations often get
only half right).

## Common failures

- `<div onclick="...">` or `<span onclick="...">` used as a clickable button with no `role`, no
  `tabindex`, no keyboard handler — invisible and inert to keyboard/screen reader users
  (axe-core rule: `button-name` for buttons lacking an accessible name).
- A `<button>` with only an icon inside and no `aria-label`, announced as just "button" with no
  indication of what it does.
- Using `<a href="#">` to trigger JavaScript actions instead of a real button — announced and
  behaves as a link, misleading users about what will happen.
