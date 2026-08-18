---
id: apg-link
title: "ARIA APG: Link Pattern"
sourceType: apg-pattern
url: https://www.w3.org/WAI/ARIA/apg/patterns/link/
---

## Pattern

A link navigates the user to a new resource or location — a different page, a different part of
the current page, or a downloadable file. The native `<a href="...">` element handles focus,
keyboard activation (Enter), and role announcement automatically, and should be used for any
navigating action, reserving `<button>` for actions that don't navigate.

## Accessible name requirements

A link's accessible name must describe its destination or purpose on its own — see WCAG SC
2.4.4. An `<a>` with only an icon inside and no text needs an `aria-label`
(`<a href="/cart" aria-label="View shopping cart"><svg .../></a>`), otherwise it announces as an
unlabeled link, which axe-core flags under the `link-name` rule.

## Common failures

- `<a>` with no `href` attribute used purely for styling — this removes it from the keyboard tab
  order and strips its link semantics, silently breaking the pattern.
- `<a href="#">` or `<a href="javascript:void(0)">` used to trigger JavaScript instead of
  navigating — should be a `<button>` instead.
- Icon-only links (social icons, cart icons) with no accessible name at all.
