import { z } from "zod";

export const patchSchema = z.object({
  type: z.enum(["setAttribute", "removeAttribute", "setInnerText", "setStyleProperty", "replaceOuterHTML"]),
  attribute: z.string().optional(),
  value: z.string().optional(),
});
export type Patch = z.infer<typeof patchSchema>;
export type PatchType = Patch["type"];

export interface ViolationNode {
  target: string[];
  html: string;
  failureSummary?: string;
}

export interface Violation {
  id: string;
  impact: "minor" | "moderate" | "serious" | "critical" | null;
  description: string;
  help: string;
  helpUrl: string;
  tags: string[];
  nodes: ViolationNode[];
}

export interface ScanResult {
  url: string;
  timestamp: string;
  violations: Violation[];
  violationCount: number;
}
