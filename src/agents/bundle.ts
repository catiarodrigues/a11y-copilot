import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { proposeFixesForRegion, reviseFix, type ExecutionResult } from "./execution.js";
import { proposeFixesForRegionMock, reviseFixMock } from "./executionMock.js";
import { planScan } from "./planning.js";
import { planScanMock } from "./planningMock.js";
import type { ProposedFix, ScanPlan, SimulateFixResult } from "./types.js";
import { validateFix, type ValidationOutcome } from "./validation.js";
import { validateFixMock } from "./validationMock.js";

/**
 * The orchestrator only depends on this shape -- it has no idea whether it's
 * driving real Claude calls or free deterministic mocks. Swapping bundles is
 * the entire difference between `audit <url>` and `audit <url> --mock`.
 */
export interface AgentBundle {
  plan(url: string, scopeHint?: string): Promise<ScanPlan>;
  execute(
    mcpClient: Client,
    url: string,
    region: string | undefined,
    priorityTags: string[],
    maxViolations: number,
  ): Promise<ExecutionResult>;
  revise(
    mcpClient: Client,
    sessionId: string,
    previousFix: ProposedFix,
    simulateResult: SimulateFixResult,
  ): Promise<ProposedFix>;
  validate(mcpClient: Client, sessionId: string, fix: ProposedFix): Promise<ValidationOutcome>;
}

export const realAgents: AgentBundle = {
  plan: planScan,
  execute: proposeFixesForRegion,
  revise: reviseFix,
  validate: validateFix,
};

export const mockAgents: AgentBundle = {
  plan: planScanMock,
  execute: proposeFixesForRegionMock,
  revise: reviseFixMock,
  validate: validateFixMock,
};
