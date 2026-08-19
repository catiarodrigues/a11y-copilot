---
title: Architecture
description: The 3-agent pipeline, and why validation trusts the simulator over the model.
---

## The pipeline

```
Planning ──▶ Execution ──▶ Validation
             (per region)   │    ▲
                             ▼    │
                       revise on failure
                       (≤ --max-retries)
```

`runAudit()` in `src/agents/orchestrator.ts` is the whole system:

1. **Planning** reasons over the URL and an optional `--focus` hint — no tools, no page seen yet — and returns a `ScanPlan`: which CSS regions to scope to, and which axe-core rule tags to prioritize. It's the pipeline's cheapest step, by design.
2. For each region, **Execution** calls `scan_page`, grounds each violation via `retrieve_guidance` (RAG), and proposes one concrete patch per violation via `propose_fix`.
3. For each proposed fix, **Validation** calls `simulate_fix_and_rescan` against a cloned, isolated copy of the page and summarizes the result.
4. If the fix didn't resolve the violation (or introduced new ones), Execution's `reviseFix()` proposes a different patch for the same violation, up to `--max-retries` times.

## Ground truth, not opinion

The loop's termination condition is `simulateResult.resolved` with no `newViolationsIntroduced` — real axe-core data from re-scanning the patched page. The Validation agent's own `submit_validation_result` tool deliberately does **not** ask for a `resolved` boolean; it only captures a human-readable summary. Whether a fix worked is decided by the simulator, never by the model's word.

A fix that runs out of retries is still reported — as `status: "suggested-unverified"` rather than `"confirmed"` — so nothing is silently dropped.

## Mock/real bundles

`AgentBundle` (`src/agents/bundle.ts`) is a 4-function interface — `plan`, `execute`, `revise`, `validate` — implemented twice:

- `realAgents` — real Claude API calls throughout.
- `mockAgents` — deterministic, free, still exercising the real MCP server and simulator.

`runAudit()` depends only on the interface, so `--mock` swaps the whole reasoning layer without the orchestrator, the tests, or the report formatter knowing or caring. See [Mock mode](/guides/mock-mode/) for the full breakdown.

## Why the scanner is its own MCP server

`src/mcp-server/` isn't just an implementation detail — it's a standalone [Model Context Protocol](https://modelcontextprotocol.io) server, spoken to over stdio, exposing `scan_page`, `get_dom_snapshot`, and `simulate_fix_and_rescan`. Any MCP-aware client can drive the same scanner, not just this CLI. See the [MCP tools](/reference/mcp-tools/) reference for the full contract.

Retrieval (`retrieve_guidance`) is *not* an MCP tool — it's a pure, in-process, side-effect-free function (local embedding model + in-memory cosine search), unlike `scan_page`, which wraps a real stateful browser resource. Not every tool needs to be an MCP tool.
