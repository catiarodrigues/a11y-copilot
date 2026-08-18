---
id: wcag-2.1.1
title: "WCAG 2.2 SC 2.1.1 Keyboard"
sourceType: wcag-sc
url: https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html
---

## Definition

All functionality of the content is operable through a keyboard interface, without requiring
specific timings for individual keystrokes, unless the underlying function requires input that
depends on the path of the user's movement (like freehand drawing).

## Why it matters

Many users cannot use a mouse: users with motor disabilities, screen reader users (who navigate
primarily by keyboard), and power users who simply prefer it. If a control only responds to
`onclick` via mouse/touch and never fires on Enter/Space when focused, it is entirely
unreachable for these users.

## Common failures

- Custom controls built from `<div>` or `<span>` with a click handler but no `tabindex` and no
  keyboard event handling.
- Dropdown menus or modals that open on hover/click but cannot be opened, navigated, or closed
  with a keyboard.
- Keyboard traps: a widget (often a modal or embedded date picker) that focus enters but cannot
  exit via Tab or Escape.

## Example fix

Prefer a native `<button onclick="...">` over a styled `<div onclick="...">` — buttons get
keyboard behavior for free. If a custom widget is unavoidable, add `tabindex="0"`, a `role`, and
explicit `keydown` handling for Enter/Space (and Escape to close, for dismissible widgets).
