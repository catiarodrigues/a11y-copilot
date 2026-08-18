---
id: wcag-4.1.3
title: "WCAG 2.2 SC 4.1.3 Status Messages"
sourceType: wcag-sc
url: https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html
---

## Definition

Status messages can be programmatically determined through role or properties such that they
can be presented to the user by assistive technologies without receiving focus. This covers
things like "3 items added to cart", form validation errors, and search result counts that
appear without a page reload.

## Why it matters

Sighted users notice a toast notification or an inline "Saved!" message appear on screen.
Screen reader users get no such visual cue — if the message isn't wired into a live region, it
is announced never, because focus never moves to it and the DOM change alone doesn't trigger
speech.

## Common failures

- Dynamically inserted success/error messages with no `role="status"`, `role="alert"`, or
  `aria-live` attribute.
- Client-side form validation errors that appear visually but aren't announced.
- Loading spinners or "results updated" messages with no live region.

## Example fix

Wrap a status message container with `<div role="status" aria-live="polite">3 items added to
cart</div>` for non-urgent updates, or `role="alert"` (implicitly `aria-live="assertive"`) for
errors that need immediate attention. The container should exist in the DOM before the message
text is inserted into it.
