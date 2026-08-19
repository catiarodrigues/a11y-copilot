---
title: Getting started
description: Install a11y-copilot, set up RAG and your API key, and run your first audit.
---

## Install

```bash
npm install
```

`postinstall` runs `playwright install chromium` automatically — it needs a real browser to render pages against.

## Configure

Copy the example env file and add your key, or opt into mock mode instead:

```bash
cp .env.example .env
```

```
# .env
ANTHROPIC_API_KEY=      # required unless using --mock
A11Y_COPILOT_MOCK=      # set to "true" to skip Claude API calls everywhere
```

Get a key at [console.anthropic.com](https://console.anthropic.com/). No key? See [Mock mode](/mock-mode/) — it costs nothing and still runs the real scanner and the real fix-validation simulation.

## Build the RAG index

One-time, free — embeds the WCAG/ARIA corpus in `data/wcag-corpus/` into `data/embeddings.json` locally, no API call:

```bash
npm run build:rag
```

## Run your first audit

```bash
npm run dev -- audit "file://$(pwd)/test/fixtures/missing-alt.html" --mock
```

Drop `--mock` (with `ANTHROPIC_API_KEY` set) to run it against the real Claude API. See [Commands](/commands/) for the full flag reference.

## Run the test suite

```bash
npm test
```

Runs free — no API key needed. One integration test in `test/agents/orchestrator.integration.test.ts` auto-skips unless `ANTHROPIC_API_KEY` is set.

## Lint and format

```bash
npm run lint          # oxlint
npm run format:check  # oxfmt --check
npm run format:write   # oxfmt -- applies fixes
```

Both `lint` and `format:check` run in CI on every push, and stay silent on a clean pass.
