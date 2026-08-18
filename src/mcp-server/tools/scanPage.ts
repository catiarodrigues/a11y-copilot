import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { runAxeScan } from "../../scan.js";
import { injectBaseTag } from "../../utils/htmlSnapshot.js";
import { saveSnapshot, withPage } from "../browserManager.js";
import { scanPageInputShape } from "../schemas.js";

export function registerScanPageTool(server: McpServer): void {
  server.registerTool(
    "scan_page",
    {
      description:
        "Loads a URL in a real browser via Playwright, injects axe-core, and returns accessibility " +
        "violations found on the rendered DOM. Returns a sessionId referencing a cached HTML snapshot " +
        "for use by get_dom_snapshot and (later) simulate_fix_and_rescan.",
      inputSchema: scanPageInputShape,
    },
    async ({ url, waitUntil, tags, include }) => {
      const { violations, html } = await withPage(async (page) => {
        await page.goto(url, { waitUntil: waitUntil ?? "networkidle" });
        const violations = await runAxeScan(page, { tags, include });
        const html = await page.content();
        return { violations, html };
      });

      const sessionId = saveSnapshot(url, injectBaseTag(html, url), violations);

      const payload = {
        sessionId,
        url,
        timestamp: new Date().toISOString(),
        violations,
        violationCount: violations.length,
      };

      return {
        content: [{ type: "text" as const, text: JSON.stringify(payload, null, 2) }],
        structuredContent: payload,
      };
    },
  );
}
