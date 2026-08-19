#!/usr/bin/env node
import { Command } from "commander";
import { isMockMode, requireApiKey } from "./config.js";
import { scanUrl } from "./scan.js";
import { explainOneViolation } from "./agents/explainOne.js";
import { explainOneViolationMock } from "./agents/mockExplainOne.js";
import { mockAgents, realAgents } from "./agents/bundle.js";
import { runAudit } from "./agents/orchestrator.js";
import { formatReport } from "./report/format.js";

const program = new Command();

program.name("a11y-copilot").description("AI-assisted accessibility auditor");

program
  .command("scan <url>")
  .description("Raw axe-core scan, no AI (debug utility)")
  .option(
    "--tags <tags>",
    "Comma-separated axe-core rule tags, e.g. wcag2a,wcag2aa,wcag21aa,wcag22aa",
  )
  .action(async (url: string, opts: { tags?: string }) => {
    const result = await scanUrl(url, { tags: opts.tags?.split(",").map((t) => t.trim()) });
    console.log(JSON.stringify(result, null, 2));
  });

program
  .command("explain <url>")
  .description("Scan via the MCP server and have one agent explain the top violation")
  .option(
    "--mock",
    "Skip the Claude API call; template the explanation from real scan data instead (free)",
  )
  .action(async (url: string, opts: { mock?: boolean }) => {
    if (opts.mock || isMockMode()) {
      console.log(await explainOneViolationMock(url));
      return;
    }
    requireApiKey();
    const explanation = await explainOneViolation(url);
    console.log(explanation);
  });

program
  .command("audit <url>")
  .description("Full Planning -> Execution -> Validation pipeline")
  .option("--mock", "Use deterministic free agents instead of Claude API calls")
  .option("--focus <hint>", "Scope hint for the Planning stage, e.g. a CSS selector or area name")
  .option(
    "--tags <tags>",
    "Comma-separated axe-core rule tags, overrides the Planning agent's choice",
  )
  .option(
    "--max-violations <n>",
    "Max violations to propose fixes for per region",
    (v) => parseInt(v, 10),
    5,
  )
  .option("--max-retries <n>", "Max validation retries per fix", (v) => parseInt(v, 10), 3)
  .option("--output <format>", "Report format: terminal or json", "terminal")
  .action(
    async (
      url: string,
      opts: {
        mock?: boolean;
        focus?: string;
        tags?: string;
        maxViolations: number;
        maxRetries: number;
        output: string;
      },
    ) => {
      if (opts.output !== "terminal" && opts.output !== "json") {
        console.error(`Unknown --output "${opts.output}" -- expected "terminal" or "json".`);
        process.exit(1);
      }

      const useMock = opts.mock || isMockMode();
      if (!useMock) {
        requireApiKey();
      }

      const report = await runAudit(url, useMock ? mockAgents : realAgents, {
        scopeHint: opts.focus,
        tagsOverride: opts.tags?.split(",").map((t) => t.trim()),
        maxViolations: opts.maxViolations,
        maxRetries: opts.maxRetries,
      });

      console.log(
        opts.output === "json" ? JSON.stringify(report, null, 2) : formatReport(url, report),
      );
    },
  );

program.parseAsync();
