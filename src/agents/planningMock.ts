import type { ScanPlan } from "./types.js";

const DEFAULT_TAGS = ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"];

export async function planScanMock(url: string, scopeHint?: string): Promise<ScanPlan> {
  return {
    regions: scopeHint ? [scopeHint] : [],
    priorityTags: DEFAULT_TAGS,
    notes: scopeHint
      ? `[MOCK MODE] Scoping the scan to "${scopeHint}" as requested.`
      : "[MOCK MODE] No focus hint given -- scanning the whole page with standard WCAG tags.",
  };
}
