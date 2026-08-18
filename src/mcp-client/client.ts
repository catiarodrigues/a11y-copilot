import path from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Decided by how THIS file is currently running, not by whether a compiled
 * server happens to exist on disk -- checking file existence would mean a
 * stale leftover dist/ from a previous build silently shadows live src/
 * edits during dev. Running compiled (dist/mcp-client/client.js, from `npm
 * run build` or npm-install): spawn the sibling compiled server directly
 * with node. Running via tsx from source (src/mcp-client/client.ts, dev):
 * spawn the TypeScript source through tsx instead.
 */
function resolveServerCommand(): { command: string; args: string[] } {
  const runningCompiled = __dirname.split(path.sep).includes("dist");
  const extension = runningCompiled ? "js" : "ts";
  const serverEntry = path.resolve(__dirname, `../mcp-server/index.${extension}`);

  return runningCompiled
    ? { command: process.execPath, args: [serverEntry] }
    : { command: "npx", args: ["tsx", serverEntry] };
}

export async function connectScannerClient(): Promise<Client> {
  const { command, args } = resolveServerCommand();
  const transport = new StdioClientTransport({ command, args });

  const client = new Client({ name: "a11y-copilot-client", version: "0.1.0" });
  await client.connect(transport);
  return client;
}
