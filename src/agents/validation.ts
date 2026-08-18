import Anthropic from "@anthropic-ai/sdk";
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { createSimulateFixAndRescanTool } from "./tools/simulateFixAndRescanTool.js";
import { createSubmitValidationResultTool } from "./tools/submitValidationResultTool.js";
import type { ProposedFix, SimulateFixResult, ValidationResult } from "./types.js";

const client = new Anthropic();

export interface ValidationOutcome {
  validation: ValidationResult;
  simulateResult: SimulateFixResult;
}

export async function validateFix(
  mcpClient: Client,
  sessionId: string,
  fix: ProposedFix,
): Promise<ValidationOutcome> {
  let simulateResult: SimulateFixResult | undefined;
  const notesSink: { notes: string }[] = [];

  const simulateFixAndRescan = createSimulateFixAndRescanTool(mcpClient, (result) => {
    simulateResult = result;
  });
  const submitValidationResult = createSubmitValidationResultTool(notesSink);

  await client.beta.messages.toolRunner({
    model: "claude-opus-5",
    max_tokens: 2048,
    tools: [simulateFixAndRescan, submitValidationResult],
    system:
      "You are the validation stage of an accessibility audit pipeline. Call " +
      "simulate_fix_and_rescan exactly once with the given fix to test it against a cloned copy " +
      "of the page, then call submit_validation_result exactly once with a brief summary of what " +
      "the simulation showed. You are not the source of truth on whether the fix worked -- the " +
      "simulation result is -- just summarize it clearly.",
    messages: [{ role: "user", content: JSON.stringify({ sessionId, fix }) }],
  });

  if (!simulateResult) {
    throw new Error("Validation agent never called simulate_fix_and_rescan");
  }

  return {
    simulateResult,
    validation: {
      resolved: simulateResult.resolved,
      notes: notesSink[0]?.notes ?? "(no summary produced)",
    },
  };
}
