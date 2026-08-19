import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { patchSchema } from "../../types.js";
import type { ProposedFix } from "../types.js";

/**
 * A "submit" tool: its real job isn't to perform an action, it's to force
 * Claude to hand back structured output instead of prose. `run()` records
 * the input into `sink` (a closure over the orchestrating code's array) so
 * we can read it back after the Tool Runner loop finishes, rather than
 * trying to parse it back out of the agent's final text response.
 */
export function createProposeFixTool(sink: ProposedFix[]) {
  return betaZodTool({
    name: "propose_fix",
    description:
      "Submit one proposed fix for a specific violation instance found by scan_page. Call this " +
      "once per violation you want to fix, after grounding your reasoning with retrieve_guidance.",
    inputSchema: z.object({
      violationId: z.string().describe("The axe-core rule id, e.g. image-alt."),
      selector: z
        .string()
        .describe("CSS selector matching the exact violating node, from the violation's target."),
      description: z
        .string()
        .describe("One sentence describing the fix and why it addresses the violation."),
      citation: z.string().describe("The WCAG/APG citation title returned by retrieve_guidance."),
      citationUrl: z.string().describe("The citation's URL, from retrieve_guidance."),
      patch: patchSchema,
    }),
    run: async (input) => {
      sink.push(input);
      return `Fix recorded for ${input.violationId} on ${input.selector}.`;
    },
  });
}
