---
id: apg-landmarks
title: "ARIA APG: Landmark Regions"
sourceType: apg-pattern
url: https://www.w3.org/WAI/ARIA/apg/practices/landmark-regions/
---

## Pattern

Landmark roles (`banner`, `navigation`, `main`, `complementary`, `contentinfo`, `search`, `form`,
`region`) mark the major structural sections of a page. HTML5 elements provide most of these
implicitly: `<header>` maps to `banner`, `<nav>` to `navigation`, `<main>` to `main`, `<footer>`
to `contentinfo`. Using the semantic HTML element is preferable to adding the ARIA role manually.

## Why it matters

Screen reader users frequently jump directly between landmarks (a dedicated navigation command
in most screen readers) to skip repeated content like navigation menus and get straight to the
main content — similar in spirit to a sighted user's F-pattern scan of a familiar page layout.
A page with no landmarks forces linear, top-to-bottom navigation through everything.

## Common failures

- A page with a single unstructured `<div id="app">` wrapping everything, no `<main>`, no `<nav>`.
- Multiple `<nav>` elements with no distinguishing `aria-label`, so a screen reader announces
  "navigation" twice with no way to tell them apart.
- Missing `<main>`, forcing screen reader users to tab or read through the entire header/nav
  before reaching page content on every single page.
