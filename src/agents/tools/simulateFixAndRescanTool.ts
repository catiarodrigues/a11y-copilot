import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import type { SimulateFixResult } from "../types.js";

const patchSchema = z.object({
  type: z.enum(["setAttribute", "removeAttribute", "setInnerText", "setStyleProperty", "replaceOuterHTML"]),
  attribute: z.string().optional(),
  value: z.string().optional(),
});

/** Bridges to the real simulate_fix_and_rescan MCP tool; captures the structured result via onResult. */
export function createSimulateFixAndRescanTool(
  mcpClient: Client,
  onResult?: (result: SimulateFixResult) => void,
) {
  return betaZodTool({
    name: "simulate_fix_and_rescan",
    description:
      "Applies a proposed DOM patch to a cloned copy of the page in an isolated browser context " +
      "and reruns axe-core to confirm whether the target violation is actually resolved.",
    inputSchema: z.object({
      sessionId: z.string(),
      selector: z.string(),
      violationId: z.string(),
      patch: patchSchema,
      rescanScope: z.enum(["element", "page"]).optional(),
    }),
    run: async (args) => {
      const result = await mcpClient.callTool({ name: "simulate_fix_and_rescan", arguments: args });
      if (result.isError) {
        const text = Array.isArray(result.content)
          ? result.content.map((c) => ("text" in c ? c.text : "")).join("\n")
          : "simulate_fix_and_rescan failed";
        throw new Error(text);
      }
      const payload = result.structuredContent as unknown as SimulateFixResult;
      onResult?.(payload);
      return JSON.stringify(payload);
    },
  });
}
