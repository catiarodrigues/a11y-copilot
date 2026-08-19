import { chromium, type Page } from "playwright";
import { AxeBuilder } from "@axe-core/playwright";
import type { ScanResult, Violation } from "./types.js";

const DEFAULT_TAGS = ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"];

export interface ScanOptions {
  tags?: string[];
  include?: string[];
  waitUntil?: "load" | "domcontentloaded" | "networkidle";
}

/** Runs axe-core against an already-loaded page. Does not own the page's lifecycle. */
export async function runAxeScan(
  page: Page,
  options: Pick<ScanOptions, "tags" | "include"> = {},
): Promise<Violation[]> {
  let builder = new AxeBuilder({ page }).withTags(options.tags ?? DEFAULT_TAGS);
  for (const selector of options.include ?? []) {
    builder = builder.include(selector);
  }

  const results = await builder.analyze();

  return results.violations.map((v) => ({
    id: v.id,
    impact: (v.impact as Violation["impact"]) ?? null,
    description: v.description,
    help: v.help,
    helpUrl: v.helpUrl,
    tags: v.tags,
    nodes: v.nodes.map((n) => ({
      target: n.target.map(String),
      html: n.html,
      failureSummary: n.failureSummary ?? undefined,
    })),
  }));
}

/** Launches a throwaway browser, scans a URL once, and closes everything. Used by the plain CLI scan (no MCP/session tracking). */
export async function scanUrl(url: string, options: ScanOptions = {}): Promise<ScanResult> {
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(url, { waitUntil: options.waitUntil ?? "networkidle" });

    const violations = await runAxeScan(page, options);

    return {
      url,
      timestamp: new Date().toISOString(),
      violations,
      violationCount: violations.length,
    };
  } finally {
    await browser.close();
  }
}
