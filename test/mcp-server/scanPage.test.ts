import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, describe, expect, it } from "vitest";
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { connectScannerClient } from "../../src/mcp-client/client.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixtureUrl = `file://${path.resolve(__dirname, "../fixtures/missing-alt.html")}`;

describe("scan_page MCP tool", () => {
  let client: Client;

  it("reports the missing image-alt violation over the MCP round-trip", async () => {
    client = await connectScannerClient();

    const result = await client.callTool({
      name: "scan_page",
      arguments: { url: fixtureUrl },
    });

    expect(result.isError).toBeFalsy();
    const payload = result.structuredContent as {
      sessionId: string;
      violations: Array<{ id: string }>;
      violationCount: number;
    };

    expect(payload.sessionId).toBeTruthy();
    expect(payload.violationCount).toBeGreaterThan(0);
    expect(payload.violations.some((v) => v.id === "image-alt")).toBe(true);
  }, 30000);

  afterAll(async () => {
    await client?.close();
  });
});
