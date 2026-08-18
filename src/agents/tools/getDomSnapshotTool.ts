import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";

/** Bridges the Tool Runner's "get_dom_snapshot" tool call to the real MCP server via mcpClient. */
export function createGetDomSnapshotTool(mcpClient: Client) {
  return betaZodTool({
    name: "get_dom_snapshot",
    description:
      "Returns the outerHTML for a specific element (by CSS selector) from a page previously " +
      "scanned with scan_page, for closer inspection before proposing a fix.",
    inputSchema: z.object({
      sessionId: z.string(),
      selector: z.string(),
    }),
    run: async ({ sessionId, selector }) => {
      const result = await mcpClient.callTool({
        name: "get_dom_snapshot",
        arguments: { sessionId, selector },
      });
      if (result.isError) {
        throw new Error("get_dom_snapshot failed");
      }
      return JSON.stringify(result.structuredContent);
    },
  });
}
