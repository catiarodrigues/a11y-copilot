import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import type { ScanPlan } from "./types.js";

const client = new Anthropic();

const ScanPlanSchema = z.object({
  regions: z
    .array(z.string())
    .describe("CSS selectors to scope scans to. Empty array means scan the whole page."),
  priorityTags: z
    .array(z.string())
    .describe(
      "axe-core rule tags to prioritize, e.g. wcag2a, wcag2aa, wcag21aa, wcag22aa, cat.forms, cat.text-alternatives.",
    ),
  notes: z.string().describe("Brief rationale for the chosen scope and priorities."),
});

/**
 * Planning has no tools and never sees the page -- it only reasons over the
 * URL and an optional user-provided focus hint, and produces a scan plan
 * (scope + priority tags) as structured output. This is the whole pipeline's
 * cheapest step by design.
 */
export async function planScan(url: string, scopeHint?: string): Promise<ScanPlan> {
  const response = await client.beta.messages.parse({
    model: "claude-opus-5",
    max_tokens: 1024,
    system:
      "You are the planning stage of an accessibility audit pipeline. You have not seen the " +
      "page yet -- you only know its URL and an optional user-provided focus hint. Decide scan " +
      "scope (CSS selectors as 'regions', or an empty array to scan the whole page) and which " +
      "axe-core rule tag categories to prioritize. When no focus hint is given, prefer an empty " +
      "regions array (whole page) and the standard tags wcag2a, wcag2aa, wcag21aa, wcag22aa.",
    messages: [
      {
        role: "user",
        content: scopeHint
          ? `Plan an accessibility scan for ${url}. Focus area: ${scopeHint}.`
          : `Plan an accessibility scan for ${url}. No specific focus area was given.`,
      },
    ],
    output_format: betaZodOutputFormat(ScanPlanSchema),
  });

  if (!response.parsed_output) {
    throw new Error("Planning agent failed to produce a structured scan plan");
  }
  return response.parsed_output;
}
