---
id: wcag-2.4.7
title: "WCAG 2.2 SC 2.4.7 Focus Visible"
sourceType: wcag-sc
url: https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html
---

## Definition

Any keyboard-operable user interface has a mode of operation where the keyboard focus indicator
is visible — there is always some visual sign of which element currently has focus.

## Why it matters

Keyboard-only users navigate by Tab and need to see, at every moment, exactly which element is
focused. Without a visible indicator, keyboard navigation becomes a guessing game — users may
activate the wrong control or lose their place on the page entirely.

## Common failures

- Global CSS resets that include `*:focus { outline: none; }` with no replacement focus style.
- Custom components that override the browser's default focus ring without providing their own.
- Focus indicators with insufficient contrast against the background (overlaps with SC 1.4.11).

## Example fix

Never remove `outline` without replacing it. Instead of `button:focus { outline: none; }`, use
`button:focus-visible { outline: 2px solid #2563eb; outline-offset: 2px; }` — `:focus-visible`
also avoids showing the ring on mouse clicks where it isn't needed, satisfying both usability and
this criterion.
