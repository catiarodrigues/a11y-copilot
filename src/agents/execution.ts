import Anthropic from "@anthropic-ai/sdk";
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { retrieveGuidanceTool } from "../rag/tool.js";
import { createGetDomSnapshotTool } from "./tools/getDomSnapshotTool.js";
import { createProposeFixTool } from "./tools/proposeFixTool.js";
import { createScanPageTool } from "./tools/scanPageTool.js";
import type { ProposedFix, SimulateFixResult } from "./types.js";

const client = new Anthropic();

export interface ExecutionResult {
  sessionId: string;
  proposedFixes: ProposedFix[];
}

/**
 * Scans the given URL (optionally scoped to a region) and proposes one fix
 * per violation found, up to maxViolations. Needs the full Tool Runner loop
 * -- unlike Planning, this genuinely involves open-ended, multi-step tool use.
 */
export async function proposeFixesForRegion(
  mcpClient: Client,
  url: string,
  region: string | undefined,
  priorityTags: string[],
  maxViolations: number,
): Promise<ExecutionResult> {
  const proposedFixes: ProposedFix[] = [];
  let sessionId: string | undefined;

  const scanPage = createScanPageTool(mcpClient, (payload) => {
    sessionId = payload.sessionId;
  });
  const getDomSnapshot = createGetDomSnapshotTool(mcpClient);
  const proposeFix = createProposeFixTool(proposedFixes);

  await client.beta.messages.toolRunner({
    model: "claude-opus-5",
    max_tokens: 8192,
    tools: [scanPage, getDomSnapshot, retrieveGuidanceTool, proposeFix],
    system:
      "You are the execution stage of an accessibility audit pipeline. Call scan_page once for " +
      `the given URL${region ? ` (pass include: ["${region}"] to scope the scan)` : ""}, prioritizing ` +
      `these axe-core tags: ${priorityTags.join(", ")}. For up to ${maxViolations} of the most ` +
      "important violations found, call retrieve_guidance to ground your understanding in real " +
      "WCAG/ARIA text, optionally call get_dom_snapshot for more markup context, then call " +
      "propose_fix exactly once per violation with a concrete patch. Use the violation's own " +
      "target selector for propose_fix's selector -- it must match a real element from the scan " +
      "result. Prefer minimal, targeted patches (setAttribute for missing alt/aria-label, " +
      "setStyleProperty for contrast fixes, etc). Do not propose more than one fix per violation.",
    messages: [{ role: "user", content: `Scan and propose fixes for: ${url}` }],
  });

  if (!sessionId) {
    throw new Error("Execution agent never called scan_page -- no session to validate fixes against");
  }

  return { sessionId, proposedFixes };
}

/** Retry path: given a fix that failed validation, propose a different patch for the same violation. */
export async function reviseFix(
  mcpClient: Client,
  sessionId: string,
  previousFix: ProposedFix,
  simulateResult: SimulateFixResult,
): Promise<ProposedFix> {
  const revised: ProposedFix[] = [];
  const getDomSnapshot = createGetDomSnapshotTool(mcpClient);
  const proposeFix = createProposeFixTool(revised);

  await client.beta.messages.toolRunner({
    model: "claude-opus-5",
    max_tokens: 4096,
    tools: [getDomSnapshot, retrieveGuidanceTool, proposeFix],
    system:
      "You are the execution stage of an accessibility audit pipeline, revising a fix that failed " +
      "validation. A sessionId for the already-scanned page is provided -- call get_dom_snapshot if " +
      "you need to see the current markup again. Propose a different, better patch for the SAME " +
      "violation and selector by calling propose_fix exactly once.",
    messages: [
      {
        role: "user",
        content: JSON.stringify({
          sessionId,
          previousFix,
          simulationResult: simulateResult,
          instruction:
            "The previous patch did not resolve the violation (see simulationResult). Propose a revised patch.",
        }),
      },
    ],
  });

  if (revised.length === 0) {
    throw new Error("Execution agent failed to propose a revised fix");
  }
  return revised[0];
}
