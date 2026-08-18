import { describe, expect, it } from "vitest";
import { retrieveGuidance } from "../../src/rag/retrieve.js";

describe("retrieveGuidance", () => {
  it("surfaces the non-text-content WCAG chunk for an alt-text query", async () => {
    const results = await retrieveGuidance("image missing alt attribute", 3);

    expect(results.length).toBe(3);
    expect(results[0].id.startsWith("wcag-1.1.1")).toBe(true);
    expect(results[0].score).toBeGreaterThan(0.4);
    // Results should be sorted by descending score.
    expect(results[0].score).toBeGreaterThanOrEqual(results[1].score);
    expect(results[1].score).toBeGreaterThanOrEqual(results[2].score);
  }, 30000);

  it("surfaces the disclosure/accordion pattern for an aria-expanded query", async () => {
    const results = await retrieveGuidance("accordion toggle button missing aria-expanded state", 3);

    expect(results.some((r) => r.id.startsWith("apg-disclosure-accordion"))).toBe(true);
  }, 30000);
});
