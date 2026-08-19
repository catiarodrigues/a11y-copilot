import { z } from "zod";
import { patchSchema } from "../types.js";

export { patchSchema };

// This is a "raw shape" (plain object of zod fields), not a full z.object() —
// that's the input format @modelcontextprotocol/sdk's registerTool() expects.
export const scanPageInputShape = {
  url: z.string().url().describe("The page URL to scan (http/https)."),
  waitUntil: z
    .enum(["load", "domcontentloaded", "networkidle"])
    .optional()
    .describe("Playwright navigation wait condition. Defaults to networkidle."),
  tags: z
    .array(z.string())
    .optional()
    .describe("axe-core rule tags to check, e.g. wcag2a, wcag2aa, wcag21aa, wcag22aa."),
  include: z
    .array(z.string())
    .optional()
    .describe("CSS selectors to scope the scan to, e.g. from a Planning agent's priority regions."),
};

export const getDomSnapshotInputShape = {
  sessionId: z.string().describe("sessionId returned by a previous scan_page call."),
  selector: z.string().describe("CSS selector of the element to inspect."),
};

export const simulateFixAndRescanInputShape = {
  sessionId: z.string().describe("sessionId returned by a previous scan_page call."),
  selector: z.string().describe("CSS selector of the element the fix targets."),
  violationId: z.string().describe("The axe-core rule id being fixed, e.g. image-alt."),
  patch: patchSchema,
  rescanScope: z
    .enum(["element", "page"])
    .optional()
    .describe(
      "Scope of the post-patch rescan. 'element' (default) rescans only the patched subtree -- fast, " +
        "the right default for attribute-only patches. 'page' rescans the whole page -- use for " +
        "setStyleProperty patches, since a shared class or CSS variable can affect more than the target node.",
    ),
};
