---
title: MCP tools
description: Full input/output contracts for the a11y-scanner MCP server's three tools.
---

The `a11y-scanner` MCP server (`src/mcp-server/`) is spoken to over stdio and exposes three tools. Any MCP-aware client can connect to it — start it directly with:

```bash
node dist/mcp-server/index.js
# or, from source:
npx tsx src/mcp-server/index.ts
```

## `scan_page`

Loads a URL in a real browser via Playwright, injects axe-core, and returns accessibility violations found on the rendered DOM. Returns a `sessionId` referencing a cached HTML snapshot, used by the other two tools.

**Input**

| Field | Type | Description |
| --- | --- | --- |
| `url` | `string` (required) | The page URL to scan (http/https). |
| `waitUntil` | `"load" \| "domcontentloaded" \| "networkidle"` (optional) | Playwright navigation wait condition. Defaults to `networkidle`. |
| `tags` | `string[]` (optional) | axe-core rule tags to check, e.g. `wcag2a`, `wcag2aa`, `wcag21aa`, `wcag22aa`. |
| `include` | `string[]` (optional) | CSS selectors to scope the scan to. |

**Output**

```ts
{
  sessionId: string;
  url: string;
  timestamp: string;
  violations: Violation[];
  violationCount: number;
}
```

Where each `Violation` has `id`, `impact` (`"minor" | "moderate" | "serious" | "critical" | null`), `description`, `help`, `helpUrl`, `tags: string[]`, and `nodes: { target: string[], html: string, failureSummary?: string }[]`.

## `get_dom_snapshot`

Returns the `outerHTML` for a specific element from a page previously scanned with `scan_page`, for closer inspection before proposing a fix.

**Input**

| Field | Type | Description |
| --- | --- | --- |
| `sessionId` | `string` (required) | `sessionId` returned by a previous `scan_page` call. |
| `selector` | `string` (required) | CSS selector of the element to inspect. |

**Output**

```ts
{ sessionId: string; selector: string; outerHtml: string | null }
```

`outerHtml` is `null` if nothing matched the selector in the cached snapshot.

## `simulate_fix_and_rescan`

Applies a proposed DOM patch to a cloned copy of a previously-scanned page — from the cached snapshot, **never** the live URL — in a fresh isolated browser context, then reruns axe-core to confirm the target violation is actually resolved and no new violations were introduced.

**Input**

| Field | Type | Description |
| --- | --- | --- |
| `sessionId` | `string` (required) | `sessionId` returned by a previous `scan_page` call. |
| `selector` | `string` (required) | CSS selector of the element the fix targets. |
| `violationId` | `string` (required) | The axe-core rule id being fixed, e.g. `image-alt`. |
| `patch` | `Patch` (required) | See [Patch types](#patch-types) below. |
| `rescanScope` | `"element" \| "page"` (optional) | Scope of the post-patch rescan. `"element"` (default) rescans only the patched subtree — fast, the right default for attribute-only patches. `"page"` rescans the whole page — use for `setStyleProperty` patches, since a shared class or CSS variable can affect more than the target node. |

**Output**

```ts
{
  resolved: boolean;
  beforeCount: number;
  afterCount: number;
  remainingTargets: string[];
  newViolationsIntroduced: string[];
}
```

### Patch types

Defined once as `patchSchema` in `src/types.ts` and shared across the MCP server, the agent-side tool wrappers, and the report format:

```ts
{
  type: "setAttribute" | "removeAttribute" | "setInnerText" | "setStyleProperty" | "replaceOuterHTML";
  attribute?: string; // attribute name, or CSS property name for setStyleProperty
  value?: string;     // attribute value, style value, inner text, or full outerHTML
}
```

| `type` | Uses `attribute` | Uses `value` |
| --- | --- | --- |
| `setAttribute` | ✓ (name) | ✓ (value) |
| `removeAttribute` | ✓ (name) | — |
| `setInnerText` | — | ✓ (text) |
| `setStyleProperty` | ✓ (CSS property) | ✓ (CSS value) |
| `replaceOuterHTML` | — | ✓ (full outerHTML) |
