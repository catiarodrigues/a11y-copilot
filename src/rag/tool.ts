import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { retrieveGuidance } from "./retrieve.js";

/**
 * A native (non-MCP) Tool Runner tool -- retrieval is a pure, in-process,
 * side-effect-free function (local embedding model + in-memory cosine
 * search), unlike scan_page which wraps a real stateful browser resource
 * and belongs behind MCP. Not every tool needs to be an MCP tool.
 */
export const retrieveGuidanceTool = betaZodTool({
  name: "retrieve_guidance",
  description:
    "Given a short query describing an accessibility issue, retrieves the most relevant " +
    "WCAG 2.2 success criteria / ARIA APG guidance via local embedding similarity search. " +
    "Use this to ground any explanation or fix suggestion in real, citable guidance instead " +
    "of relying on memory.",
  inputSchema: z.object({
    query: z
      .string()
      .describe("Short description of the accessibility issue, e.g. 'image missing alt text'."),
    k: z
      .number()
      .int()
      .min(1)
      .max(10)
      .optional()
      .describe("Number of results to return (default 3)."),
  }),
  run: async ({ query, k }) => {
    const results = await retrieveGuidance(query, k ?? 3);
    return JSON.stringify(
      results.map((r) => ({
        title: r.title,
        heading: r.heading,
        url: r.url,
        text: r.text,
        score: Number(r.score.toFixed(3)),
      })),
    );
  },
});
