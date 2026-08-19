---
title: Mock mode
description: Try or develop on a11y-copilot without spending on API calls.
---

Pass `--mock`, or set `A11Y_COPILOT_MOCK=true`, on any command that supports it.

Mock mode still runs the **real** scan and the **real** fix-validation simulation via the real MCP server — free, local, no network beyond the page being scanned. Only the Claude reasoning steps are replaced with deterministic templates built from the real scan data, always clearly labeled `[MOCK MODE]`.

## What stays real

- Playwright launching a browser and rendering the page
- axe-core scanning the rendered DOM
- The MCP server (`scan_page`, `get_dom_snapshot`, `simulate_fix_and_rescan`)
- The local RAG index lookup (embedding + cosine similarity)

## What gets swapped

Each Claude-calling agent has a mock counterpart with the same signature — the orchestrator can't tell the difference:

| Real agent | Mock counterpart | Behavior |
| --- | --- | --- |
| `planning.ts` | `planningMock.ts` | Whole page, standard WCAG tags — no reasoning needed. |
| `execution.ts` | `executionMock.ts` | Templated patches from a small `PATCH_TEMPLATES` table, keyed by axe-core rule id. |
| `validation.ts` | `validationMock.ts` | Calls the real `simulate_fix_and_rescan` tool directly; summarizes its real result. |

This is the same interface-driven swap covered in [Architecture](/reference/architecture/#mockreal-bundles) — `--mock` picks `mockAgents` over `realAgents` in one line of `cli.ts`.

## Limits

The mock Execution agent only knows fixes for a handful of common, unambiguous rules (`image-alt`, `label`, `color-contrast`, `button-name`, `link-name`). Values like alt text are obvious placeholders — it has no real understanding of page content, and says so.
