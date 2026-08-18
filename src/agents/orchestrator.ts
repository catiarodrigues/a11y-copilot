import { connectScannerClient } from "../mcp-client/client.js";
import type { AgentBundle } from "./bundle.js";
import type { ProposedFix, ReportEntry, SimulateFixResult, ValidationResult } from "./types.js";

export interface AuditOptions {
  scopeHint?: string;
  maxViolations?: number;
  maxRetries?: number;
  /** Overrides the Planning agent's chosen priorityTags, e.g. from a CLI --tags flag. */
  tagsOverride?: string[];
}

/**
 * Planning -> for each region -> Execution proposes fixes -> for each fix,
 * Validation retries until resolved or maxRetries is hit. The loop's
 * termination condition is simulateResult.resolved with no new violations
 * introduced -- ground truth from real axe-core data, not an LLM's opinion.
 */
export async function runAudit(
  url: string,
  agents: AgentBundle,
  options: AuditOptions = {},
): Promise<ReportEntry[]> {
  const maxViolations = options.maxViolations ?? 5;
  const maxRetries = options.maxRetries ?? 3;

  const mcpClient = await connectScannerClient();
  try {
    const scanPlan = await agents.plan(url, options.scopeHint);
    const priorityTags = options.tagsOverride ?? scanPlan.priorityTags;
    const regions: Array<string | undefined> = scanPlan.regions.length > 0 ? scanPlan.regions : [undefined];

    const report: ReportEntry[] = [];

    for (const region of regions) {
      const { sessionId, proposedFixes } = await agents.execute(
        mcpClient,
        url,
        region,
        priorityTags,
        maxViolations,
      );

      for (const initialFix of proposedFixes) {
        let currentFix: ProposedFix = initialFix;
        let attempt = 0;
        let validation: ValidationResult | undefined;
        let simulateResult: SimulateFixResult | undefined;

        while (attempt < maxRetries) {
          const outcome = await agents.validate(mcpClient, sessionId, currentFix);
          validation = outcome.validation;
          simulateResult = outcome.simulateResult;
          attempt++;

          const succeeded = validation.resolved && simulateResult.newViolationsIntroduced.length === 0;
          if (succeeded || attempt >= maxRetries) {
            break;
          }

          currentFix = await agents.revise(mcpClient, sessionId, currentFix, simulateResult);
        }

        const confirmed =
          !!validation?.resolved && (simulateResult?.newViolationsIntroduced.length ?? 1) === 0;

        report.push({
          violationId: currentFix.violationId,
          selector: currentFix.selector,
          description: currentFix.description,
          citation: currentFix.citation,
          citationUrl: currentFix.citationUrl,
          patch: currentFix.patch,
          status: confirmed ? "confirmed" : "suggested-unverified",
          attempts: attempt,
          notes: validation?.notes ?? "(validation did not run)",
        });
      }
    }

    return report;
  } finally {
    await mcpClient.close();
  }
}
