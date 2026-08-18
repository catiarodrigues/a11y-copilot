import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { realAgents } from "../../src/agents/bundle.js";
import { runAudit } from "../../src/agents/orchestrator.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixtureUrl = `file://${path.resolve(__dirname, "../fixtures/missing-alt.html")}`;

// This is the one test in the suite that spends real money -- it's gated on
// ANTHROPIC_API_KEY actually being present so `npm test` never requires a
// key or a live network call by default. Run it explicitly with a key set
// to sanity-check the real (non-mock) pipeline end to end.
describe.skipIf(!process.env.ANTHROPIC_API_KEY)("runAudit with real agents (costs API usage)", () => {
  it("produces a report with at least one confirmed fix for the missing-alt fixture", async () => {
    const report = await runAudit(fixtureUrl, realAgents, { maxViolations: 1, maxRetries: 2 });

    expect(report.length).toBeGreaterThan(0);
    expect(report.some((entry) => entry.status === "confirmed")).toBe(true);
  }, 60000);
});
