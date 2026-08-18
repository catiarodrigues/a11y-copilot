import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerGetDomSnapshotTool } from "./tools/getDomSnapshot.js";
import { registerScanPageTool } from "./tools/scanPage.js";
import { registerSimulateFixAndRescanTool } from "./tools/simulateFixAndRescan.js";

export function createServer(): McpServer {
  const server = new McpServer({ name: "a11y-scanner", version: "0.1.0" });
  registerScanPageTool(server);
  registerGetDomSnapshotTool(server);
  registerSimulateFixAndRescanTool(server);
  return server;
}
