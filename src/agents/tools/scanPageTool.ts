import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";

/**
 * A Tool Runner tool whose `run()` forwards to the real a11y-scanner MCP
 * server over stdio via the given client. The agent only ever sees an
 * ordinary tool named "scan_page" — it has no idea MCP is involved.
 *
 * `onResult` is a side channel for the orchestrating code: the agent's own
 * response text is not a reliable place to recover the sessionId, since the
 * model might not repeat it verbatim, so we capture it directly when the
 * tool actually runs.
 */
export function createScanPageTool(
  mcpClient: Client,
  onResult?: (payload: { sessionId: string; violations: unknown[] }) => void,
) {
  return betaZodTool({
    name: "scan_page",
    description:
      "Scans a URL for accessibility violations using axe-core in a real browser. " +
      "Returns a sessionId and the list of violations found.",
    inputSchema: z.object({
      url: z.string().url().describe("The page URL to scan."),
      include: z
        .array(z.string())
        .optional()
        .describe("CSS selectors to scope the scan to. Omit to scan the whole page."),
    }),
    run: async ({ url, include }) => {
      const result = await mcpClient.callTool({
        name: "scan_page",
        arguments: { url, include },
      });
      if (result.isError) {
        const text = Array.isArray(result.content)
          ? result.content.map((c) => ("text" in c ? c.text : "")).join("\n")
          : "scan_page failed";
        throw new Error(text);
      }
      const payload = result.structuredContent as { sessionId: string; violations: unknown[] };
      onResult?.(payload);
      return JSON.stringify(payload);
    },
  });
}
