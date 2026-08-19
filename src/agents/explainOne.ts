import Anthropic from "@anthropic-ai/sdk";
import { connectScannerClient } from "../mcp-client/client.js";
import { retrieveGuidanceTool } from "../rag/tool.js";
import { createScanPageTool } from "./tools/scanPageTool.js";

const client = new Anthropic();

/**
 * M2/M3 milestone: a single agent that scans a page via our MCP server,
 * grounds its explanation in real WCAG/ARIA guidance via local RAG, and
 * explains one violation in prose with a citation. Proves the full
 * round-trip: Tool Runner -> our tools -> MCP client -> MCP server ->
 * Playwright/axe-core -> RAG retrieval -> Claude's grounded explanation.
 */
export async function explainOneViolation(url: string): Promise<string> {
  const mcpClient = await connectScannerClient();
  try {
    const scanPage = createScanPageTool(mcpClient);

    const finalMessage = await client.beta.messages.toolRunner({
      model: "claude-opus-5",
      max_tokens: 4096,
      tools: [scanPage, retrieveGuidanceTool],
      system:
        "You are an accessibility auditor. Scan the given URL with scan_page, then pick " +
        "the single most important violation. Call retrieve_guidance with a short query " +
        "describing that violation to ground your explanation in real WCAG/ARIA guidance " +
        "-- do not rely on memory for the criterion text. Then explain in 2-4 sentences " +
        "what the violation is, why it matters for real users, and roughly how a developer " +
        "would fix it, citing the specific WCAG success criterion or ARIA pattern by name. " +
        "Plain prose, no markdown headers. If there are no violations, say so.",
      messages: [{ role: "user", content: `Scan this page and explain one violation: ${url}` }],
    });

    const textBlock = finalMessage.content.find((block) => block.type === "text");
    return textBlock && "text" in textBlock ? textBlock.text : "(no explanation produced)";
  } finally {
    await mcpClient.close();
  }
}
