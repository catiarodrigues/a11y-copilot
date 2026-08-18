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
