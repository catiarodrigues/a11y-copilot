import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import type { AgentBundle } from "../../src/agents/bundle.js";
import { runAudit } from "../../src/agents/orchestrator.js";
import { validateFixMock } from "../../src/agents/validationMock.js";
import type { ProposedFix } from "../../src/agents/types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixtureUrl = `file://${path.resolve(__dirname, "../fixtures/missing-alt.html")}`;

const wrongFix: ProposedFix = {
  violationId: "image-alt",
  selector: "img",
  description: "deliberately wrong fix for the retry-loop test",
  citation: "n/a",
  citationUrl: "",
  // Setting an unrelated attribute never resolves image-alt -- proves the
  // loop actually retries against real simulate_fix_and_rescan data, and
  // terminates at maxRetries instead of looping forever.
  patch: { type: "setAttribute", attribute: "data-note", value: "never fixes it" },
};

/**
 * A stub bundle: real plan/validate (grounded in the real MCP scan), but
 * execution/revision always propose the same broken fix -- simulating an
 * agent that can't solve it. execute() must use the mcpClient the
 * orchestrator hands it (not a separately-opened connection) since each MCP
 * server subprocess has its own in-memory snapshot cache -- a sessionId
 * from one process is meaningless to another.
 */
const stubBundle: AgentBundle = {
  plan: async () => ({ regions: [], priorityTags: [], notes: "stub" }),
  execute: async (mcpClient, url) => {
    const scanResult = await mcpClient.callTool({ name: "scan_page", arguments: { url } });
    const { sessionId } = scanResult.structuredContent as { sessionId: string };
    return { sessionId, proposedFixes: [wrongFix] };
  },
  revise: async (_mcpClient, _sessionId, previousFix) => previousFix,
  validate: validateFixMock,
};

describe("runAudit retry loop", () => {
  it("stops at maxRetries and reports suggested-unverified when a fix never resolves", async () => {
    const report = await runAudit(fixtureUrl, stubBundle, { maxRetries: 3 });

    expect(report).toHaveLength(1);
    expect(report[0].status).toBe("suggested-unverified");
    expect(report[0].attempts).toBe(3);
  }, 30000);
});
