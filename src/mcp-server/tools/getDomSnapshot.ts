import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getSnapshot, withPage } from "../browserManager.js";
import { getDomSnapshotInputShape } from "../schemas.js";

export function registerGetDomSnapshotTool(server: McpServer): void {
  server.registerTool(
    "get_dom_snapshot",
    {
      description:
        "Returns the outerHTML for a specific element (by CSS selector) from a page previously " +
        "scanned with scan_page, so the agent can inspect exact markup before proposing a fix.",
      inputSchema: getDomSnapshotInputShape,
    },
    async ({ sessionId, selector }) => {
      const snapshot = getSnapshot(sessionId);
      if (!snapshot) {
        return {
          content: [
            {
              type: "text" as const,
              text: `No snapshot found for sessionId "${sessionId}". Call scan_page first.`,
            },
          ],
          isError: true,
        };
      }

      const outerHtml = await withPage(async (page) => {
        await page.setContent(snapshot.html, { waitUntil: "domcontentloaded" });
        return page
          .locator(selector)
          .first()
          .evaluate((el) => el.outerHTML)
          .catch(() => null);
      });

      const payload = { sessionId, selector, outerHtml };

      return {
        content: [{ type: "text" as const, text: JSON.stringify(payload, null, 2) }],
        structuredContent: payload,
      };
    },
  );
}
