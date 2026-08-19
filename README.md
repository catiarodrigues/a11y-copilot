# a11y-copilot

[![CI](https://github.com/catiarodrigues/a11y-copilot/actions/workflows/ci.yml/badge.svg)](https://github.com/catiarodrigues/a11y-copilot/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/%40catiarodrigues%2Fa11y-copilot.svg)](https://www.npmjs.com/package/@catiarodrigues/a11y-copilot)

A CLI accessibility auditor built on a 3-agent pipeline (Planning → Execution → Validation).

It scans a rendered page, explains each violation grounded in real WCAG 2.2 / ARIA APG
guidance (via a local RAG index — no external vector DB), proposes a fix, and then
_validates_ that fix by simulating it against a cloned copy of the page's DOM and
re-scanning before reporting it as confirmed. It never modifies your live page or your
source files.

**Status:** early build, work in progress.

Full documentation — getting started, the command reference, mock mode, architecture, and
the MCP tool contracts — lives at **[a11y-copilot.catiarodrigues.dev](https://a11y-copilot.catiarodrigues.dev)**.
Source in [`docs/`](docs/) (Astro Starlight; `cd docs && npm install && npm run dev` to preview locally).

## Install

```bash
npm install -g @catiarodrigues/a11y-copilot
```

`postinstall` downloads a Chromium build for Playwright automatically — no separate setup
step. Then set up your API key (or skip straight to mock mode) as described in [Cost](#cost)
below, and run:

```bash
a11y-copilot audit <url>
```

## How it works

- **Scanning** — [axe-core](https://github.com/dequelabs/axe-core) driven through
  [Playwright](https://playwright.dev/), so it works against any rendered page regardless
  of framework.
- **MCP** — the scanner (`scan_page`, `get_dom_snapshot`, `simulate_fix_and_rescan`) is
  its own [Model Context Protocol](https://modelcontextprotocol.io) server, spoken to over
  stdio. Any MCP-aware client (not just this CLI) can use it.
- **RAG** — a small curated corpus of WCAG 2.2 success criteria and ARIA APG patterns
  (`data/wcag-corpus/`), embedded locally with a small open model
  (`@huggingface/transformers`, no API cost) and retrieved by cosine similarity. See
  `npm run build:rag`.
- **Agents** — Planning (structured output, decides scan scope), Execution (Tool Runner:
  scans, grounds each violation via RAG, proposes fixes), Validation (Tool Runner: tests
  each fix against a cloned, isolated copy of the page before it's ever called
  "confirmed"). A fix that fails validation goes back to Execution for a revised attempt,
  up to `--max-retries` times.

Note: axe-core only catches what's automatable. Some real WCAG failures (e.g. an input
relying on `placeholder` instead of a real `<label>`) don't trigger any axe rule, because
the browser's own accessible-name computation treats `placeholder` as a fallback name. An
LLM reading the markup directly can catch things like this that pure automated scanning
misses — a real advantage of the agent layer over axe-core alone.

## Cost

This tool is free and open-source. The AI inference it uses is not — you bring your own
`ANTHROPIC_API_KEY` (see `.env.example`), and a full `audit` run makes multiple Claude API
calls per violation found (more if a fix needs retries). Use `--max-violations` and
`--max-retries` to cap cost on large pages.

Want to try it or develop on it without spending anything? Pass `--mock` (or set
`A11Y_COPILOT_MOCK=true`) on any command that supports it. Mock mode still runs the real
scan and the real fix-validation simulation via the real MCP server (free, local, no
network beyond the page being scanned) — only the Claude reasoning steps are replaced with
deterministic templates built from the real scan data, clearly labeled `[MOCK MODE]`.

## Commands

```bash
# Raw axe-core scan, no AI -- debug utility
a11y-copilot scan <url> [--tags wcag2a,wcag2aa,...]

# Scan via the real MCP server, one agent explains the top violation (grounded via RAG)
a11y-copilot explain <url> [--mock]

# Full Planning -> Execution -> Validation pipeline
a11y-copilot audit <url> \
  [--mock] \
  [--focus <hint>] \
  [--tags wcag2a,wcag2aa,...] \
  [--max-violations <n>]   # default 5, per region \
  [--max-retries <n>]      # default 3, per fix \
  [--output terminal|json] # default terminal
```

## Development

To work on a11y-copilot itself, rather than just use it, clone the repo:

```bash
npm install
cp .env.example .env   # then fill in ANTHROPIC_API_KEY (or set A11Y_COPILOT_MOCK=true instead)
npm run build:rag      # builds data/embeddings.json from data/wcag-corpus/ (one-time, free)
npm run dev -- audit "file://$(pwd)/test/fixtures/missing-alt.html" --mock
npm test                # full suite runs free -- no API key needed; one integration
                         # test auto-skips unless ANTHROPIC_API_KEY is set
npm run build            # type-checks and compiles to dist/
npm run lint              # oxlint
npm run format:check       # oxfmt --check (or `format:write` to apply)
```

## License

MIT
