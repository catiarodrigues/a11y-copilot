import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { retrieveGuidance } from "../rag/retrieve.js";
import type { ExecutionResult } from "./execution.js";
import type { Patch, ProposedFix, SimulateFixResult } from "./types.js";

interface ViolationNode {
  target: string[];
}
interface MockViolation {
  id: string;
  help: string;
  nodes: ViolationNode[];
}
interface ScanPayload {
  sessionId: string;
  violations: MockViolation[];
}

// Mock only knows how to template fixes for a handful of common, unambiguous
// axe-core rules -- it has no real understanding of page content, so values
// like alt text are obvious placeholders, clearly labeled as such.
const PATCH_TEMPLATES: Record<string, Patch> = {
  "image-alt": { type: "setAttribute", attribute: "alt", value: "[MOCK] Descriptive alt text" },
  label: { type: "setAttribute", attribute: "aria-label", value: "[MOCK] Field label" },
  "color-contrast": { type: "setStyleProperty", attribute: "color", value: "#595959" },
  "button-name": { type: "setAttribute", attribute: "aria-label", value: "[MOCK] Button label" },
  "link-name": { type: "setAttribute", attribute: "aria-label", value: "[MOCK] Link label" },
};

export async function proposeFixesForRegionMock(
  mcpClient: Client,
  url: string,
  region: string | undefined,
  priorityTags: string[],
  maxViolations: number,
): Promise<ExecutionResult> {
  const result = await mcpClient.callTool({
    name: "scan_page",
    arguments: { url, include: region ? [region] : undefined, tags: priorityTags },
  });
  const payload = result.structuredContent as unknown as ScanPayload;

  const proposedFixes: ProposedFix[] = [];
  for (const violation of payload.violations.slice(0, maxViolations)) {
    const template = PATCH_TEMPLATES[violation.id];
    const node = violation.nodes[0];
    if (!template || !node) continue;

    const [guidance] = await retrieveGuidance(`${violation.id}: ${violation.help}`, 1);
    proposedFixes.push({
      violationId: violation.id,
      selector: node.target[0],
      description: `[MOCK] Templated fix for ${violation.id}.`,
      citation: guidance ? `${guidance.title} — ${guidance.heading}` : "N/A",
      citationUrl: guidance?.url ?? "",
      patch: template,
    });
  }

  return { sessionId: payload.sessionId, proposedFixes };
}

/** Mock has no reasoning to fall back on, so a failed fix is deterministically resubmitted unchanged -- this exercises (and terminates) the retry loop without any API call. */
export async function reviseFixMock(
  _mcpClient: Client,
  _sessionId: string,
  previousFix: ProposedFix,
  _simulateResult: SimulateFixResult,
): Promise<ProposedFix> {
  return previousFix;
}
