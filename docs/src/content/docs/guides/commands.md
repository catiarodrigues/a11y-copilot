---
title: Commands
description: The three a11y-copilot commands and their flags.
---

## `scan`

Raw axe-core scan, no AI — a debug utility.

```bash
a11y-copilot scan <url> [--tags wcag2a,wcag2aa,wcag21aa,wcag22aa]
```

| Flag | Description |
| --- | --- |
| `--tags` | Comma-separated axe-core rule tags to check. |

## `explain`

Scans via the real MCP server and has one agent explain the top violation, grounded via RAG.

```bash
a11y-copilot explain <url> [--mock]
```

| Flag | Description |
| --- | --- |
| `--mock` | Skip the Claude API call; template the explanation from real scan data instead (free). |

## `audit`

The full Planning → Execution → Validation pipeline. See [Architecture](/reference/architecture/) for how the stages fit together.

```bash
a11y-copilot audit <url> \
  [--mock] \
  [--focus <hint>] \
  [--tags wcag2a,wcag2aa,...] \
  [--max-violations <n>] \
  [--max-retries <n>] \
  [--output terminal|json]
```

| Flag | Default | Description |
| --- | --- | --- |
| `--mock` | off | Use deterministic free agents instead of Claude API calls. |
| `--focus <hint>` | — | Scope hint for the Planning stage, e.g. a CSS selector or area name. |
| `--tags <tags>` | Planning's choice | Comma-separated axe-core rule tags — overrides the Planning agent's own choice. |
| `--max-violations <n>` | `5` | Max violations to propose fixes for, per region. |
| `--max-retries <n>` | `3` | Max validation retries per fix. |
| `--output <format>` | `terminal` | `terminal` or `json`. |

Cost scales with violations found and retries needed — a full run makes multiple Claude API calls per violation. Use `--max-violations` and `--max-retries` to cap cost on large pages.
