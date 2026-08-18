import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { explainOneViolationMock } from "../../src/agents/mockExplainOne.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixtureUrl = `file://${path.resolve(__dirname, "../fixtures/missing-alt.html")}`;

describe("explainOneViolationMock", () => {
  it("templates a real violation without calling the Claude API", async () => {
    const explanation = await explainOneViolationMock(fixtureUrl);

    expect(explanation).toContain("MOCK MODE");
    expect(explanation).toContain("image-alt");
  }, 30000);
});
