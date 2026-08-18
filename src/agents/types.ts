export type PatchType = "setAttribute" | "removeAttribute" | "setInnerText" | "setStyleProperty" | "replaceOuterHTML";

export interface Patch {
  type: PatchType;
  attribute?: string;
  value?: string;
}

export interface ScanPlan {
  /** CSS selectors to scope scans to; empty array means scan the whole page. */
  regions: string[];
  /** axe-core rule tags to prioritize, e.g. wcag2a, wcag2aa, wcag21aa, wcag22aa. */
  priorityTags: string[];
  notes: string;
}

export interface ProposedFix {
  violationId: string;
  selector: string;
  description: string;
  citation: string;
  citationUrl: string;
  patch: Patch;
}

export interface SimulateFixResult {
  resolved: boolean;
  beforeCount: number;
  afterCount: number;
  remainingTargets: string[];
  newViolationsIntroduced: string[];
}

export interface ValidationResult {
  resolved: boolean;
  notes: string;
}

export type ReportStatus = "confirmed" | "suggested-unverified";

export interface ReportEntry {
  violationId: string;
  selector: string;
  description: string;
  citation: string;
  citationUrl: string;
  patch: Patch;
  status: ReportStatus;
  attempts: number;
  notes: string;
}
