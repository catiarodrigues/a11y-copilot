import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";

/**
 * Deliberately does NOT ask the agent for a `resolved` boolean. Whether a
 * fix resolved the violation is ground truth from simulate_fix_and_rescan's
 * own structured result (real axe-core data) -- the orchestrator reads that
 * directly rather than trusting an LLM's opinion on it. This tool only
 * captures the agent's human-readable summary of what happened.
 */
export function createSubmitValidationResultTool(sink: { notes: string }[]) {
  return betaZodTool({
    name: "submit_validation_result",
    description:
      "Submit a brief, human-readable summary of the validation outcome after calling " +
      "simulate_fix_and_rescan. Call this exactly once, after you've seen the simulation result.",
    inputSchema: z.object({
      notes: z
        .string()
        .describe("One or two sentences summarizing what the simulation showed and why."),
    }),
    run: async (input) => {
      sink.push(input);
      return "Validation summary recorded.";
    },
  });
}
