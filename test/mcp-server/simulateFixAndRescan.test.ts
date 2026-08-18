import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, describe, expect, it } from "vitest";
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { connectScannerClient } from "../../src/mcp-client/client.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixtureUrl = `file://${path.resolve(__dirname, "../fixtures/missing-alt.html")}`;

interface ScanPayload {
  sessionId: string;
  violations: Array<{ id: string; nodes: Array<{ target: string[] }> }>;
}

interface SimulatePayload {
  resolved: boolean;
  beforeCount: number;
  afterCount: number;
  remainingTargets: string[];
  newViolationsIntroduced: string[];
}

describe("simulate_fix_and_rescan MCP tool", () => {
  let client: Client;

  it("confirms a real fix resolves the violation in a cloned page, never touching the original", async () => {
    client = await connectScannerClient();

    const scanResult = await client.callTool({ name: "scan_page", arguments: { url: fixtureUrl } });
    const scanPayload = scanResult.structuredContent as unknown as ScanPayload;
    const target = scanPayload.violations.find((v) => v.id === "image-alt")?.nodes[0].target[0];
    expect(target).toBeTruthy();

    const goodFix = await client.callTool({
      name: "simulate_fix_and_rescan",
      arguments: {
        sessionId: scanPayload.sessionId,
        selector: target,
        violationId: "image-alt",
        patch: { type: "setAttribute", attribute: "alt", value: "Our team" },
      },
    });
    const goodPayload = goodFix.structuredContent as unknown as SimulatePayload;
    expect(goodPayload.resolved).toBe(true);
    expect(goodPayload.afterCount).toBe(0);
    expect(goodPayload.newViolationsIntroduced).toEqual([]);

    // A second, independent scan_page against the same fixture should still
    // show the original violation -- proving the simulation never touched
    // the real page.
    const rescanOriginal = await client.callTool({ name: "scan_page", arguments: { url: fixtureUrl } });
    const rescanPayload = rescanOriginal.structuredContent as unknown as ScanPayload;
    expect(rescanPayload.violations.some((v) => v.id === "image-alt")).toBe(true);
  }, 30000);

  it("reports an ineffective fix as not resolved", async () => {
    const scanResult = await client.callTool({ name: "scan_page", arguments: { url: fixtureUrl } });
    const scanPayload = scanResult.structuredContent as unknown as ScanPayload;
    const target = scanPayload.violations.find((v) => v.id === "image-alt")?.nodes[0].target[0];

    const badFix = await client.callTool({
      name: "simulate_fix_and_rescan",
      arguments: {
        sessionId: scanPayload.sessionId,
        selector: target,
        violationId: "image-alt",
        // Setting an unrelated attribute does nothing for image-alt.
        patch: { type: "setAttribute", attribute: "data-note", value: "irrelevant" },
      },
    });
    const badPayload = badFix.structuredContent as unknown as SimulatePayload;
    expect(badPayload.resolved).toBe(false);
    expect(badPayload.afterCount).toBeGreaterThan(0);
  }, 30000);

  afterAll(async () => {
    await client?.close();
  });
});
