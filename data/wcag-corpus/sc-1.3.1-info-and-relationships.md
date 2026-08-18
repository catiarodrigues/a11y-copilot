---
id: wcag-1.3.1
title: "WCAG 2.2 SC 1.3.1 Info and Relationships"
sourceType: wcag-sc
url: https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html
---

## Definition

Information, structure, and relationships conveyed through presentation (visual layout, styling)
can be programmatically determined or are available in text. Headings must be marked up as
headings, lists as lists, table headers associated with data cells, and form inputs associated
with their labels — not just made to look that way with CSS.

## Why it matters

Screen readers and other assistive technology build their understanding of a page from the
underlying markup, not the visual layout. A "heading" that is really just bold, larger text has
no structural meaning to a screen reader — users navigating by heading can't find it. A table
without `<th>` header cells can't be understood row-by-row by someone who can't see the grid.

## Common failures

- Visually styled headings that use `<div>` or `<span>` instead of `<h1>`–`<h6>`.
- Tables built with `<div>` layouts instead of `<table>`, `<tr>`, `<th>`, `<td>`.
- Form inputs with a nearby `<label>` that is not programmatically linked via `for`/`id`.
- Lists of items marked up as plain paragraphs instead of `<ul>`/`<ol>`/`<li>`.

## Example fix

Replace `<div class="heading">Pricing</div>` with `<h2>Pricing</h2>`. Link a label with
`<label for="email">Email</label><input id="email" type="email">` instead of relying on visual
proximity alone.
