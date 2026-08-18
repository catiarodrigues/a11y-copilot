---
id: apg-alert-live-region
title: "ARIA APG: Alert and Live Region Pattern"
sourceType: apg-pattern
url: https://www.w3.org/WAI/ARIA/apg/patterns/alert/
---

## Pattern

The `alert` role identifies content that is time-sensitive and important enough to interrupt the
user immediately — errors, expired sessions, critical warnings. It behaves as an implicit
`aria-live="assertive"` region: assistive technology announces it as soon as it appears, without
waiting for the user to be idle. For less urgent updates, use `role="status"`
(`aria-live="polite"`) instead, which waits for a natural pause.

## Rules of use

- The alert content should already exist and simply be revealed, or the region should exist
  empty in the DOM before content is inserted — assistive technology needs the live region
  registered before the change happens to reliably announce it.
- Don't overuse `role="alert"` — reserve it for genuinely urgent, blocking information. Overuse
  trains users to ignore interruptions, similar to alert fatigue.
- Alerts do not receive keyboard focus automatically; if the user needs to act on the alert (e.g.
  fix a form field), consider also moving focus to the relevant control.

## Common failures

- Toast/snackbar notifications inserted via JavaScript with no `role` or `aria-live` at all —
  visually present, silently absent for screen reader users.
- Using `role="alert"` for routine, non-urgent confirmations ("Preferences saved") that should
  use the gentler `role="status"` instead.
