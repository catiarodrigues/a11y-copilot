import { connectScannerClient } from "../mcp-client/client.js";
import { retrieveGuidance } from "../rag/retrieve.js";
import type { Violation } from "../types.js";

interface ScanPagePayload {
  violations: Violation[];
  violationCount: number;
}

/**
 * Free stand-in for explainOne.ts's real agent. Still performs a real
 * scan_page call over the real MCP server (no API cost, no network beyond
 * the page being scanned) but replaces the Claude explanation with a
 * deterministic template built from the actual violation data, so the rest
 * of the pipeline can be developed/tested without spending on API calls.
 */
export async function explainOneViolationMock(url: string): Promise<string> {
  const mcpClient = await connectScannerClient();
  try {
    const result = await mcpClient.callTool({ name: "scan_page", arguments: { url } });
    if (result.isError) {
      throw new Error("scan_page failed in mock mode");
    }

    const payload = result.structuredContent as unknown as ScanPagePayload;

    if (payload.violationCount === 0) {
      return "[MOCK MODE] No violations found on this page.";
    }

    const v = payload.violations[0];
    const [topGuidance] = await retrieveGuidance(`${v.id}: ${v.help}. ${v.description}`, 1);

    return [
      "[MOCK MODE - templated from real scan data, not a Claude response]",
      "",
      `Violation: ${v.id} (impact: ${v.impact ?? "unknown"})`,
      `${v.help}. ${v.description}`,
      `axe-core reference: ${v.helpUrl}`,
      "",
      `Grounded via local RAG (real retrieval, no API call) -- closest match: ` +
        `${topGuidance.title} — ${topGuidance.heading} (score ${topGuidance.score.toFixed(2)})`,
      `${topGuidance.url}`,
      "",
      "This canned summary stands in for the agent's explanation so the pipeline can be " +
        "built and tested without spending on API calls. Run `explain <url>` without " +
        "--mock (with ANTHROPIC_API_KEY set) to see a real Claude explanation instead.",
    ].join("\n");
  } finally {
    await mcpClient.close();
  }
}
