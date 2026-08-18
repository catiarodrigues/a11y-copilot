import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import type { ProposedFix, SimulateFixResult } from "./types.js";
import type { ValidationOutcome } from "./validation.js";

export async function validateFixMock(
  mcpClient: Client,
  sessionId: string,
  fix: ProposedFix,
): Promise<ValidationOutcome> {
  const result = await mcpClient.callTool({
    name: "simulate_fix_and_rescan",
    arguments: {
      sessionId,
      selector: fix.selector,
      violationId: fix.violationId,
      patch: fix.patch,
    },
  });
  const simulateResult = result.structuredContent as unknown as SimulateFixResult;

  return {
    simulateResult,
    validation: {
      resolved: simulateResult.resolved,
      notes: simulateResult.resolved
        ? "[MOCK MODE] simulate_fix_and_rescan confirmed the violation is gone."
        : `[MOCK MODE] simulate_fix_and_rescan still found ${simulateResult.afterCount} instance(s) of ${fix.violationId}.`,
    },
  };
}
