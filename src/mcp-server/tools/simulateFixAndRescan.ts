import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { runAxeScan } from "../../scan.js";
import { getSnapshot, withPage } from "../browserManager.js";
import { simulateFixAndRescanInputShape } from "../schemas.js";

type PatchType = "setAttribute" | "removeAttribute" | "setInnerText" | "setStyleProperty" | "replaceOuterHTML";

interface Patch {
  type: PatchType;
  attribute?: string;
  value?: string;
}

/** Runs inside the browser via page.evaluate -- has no access to outer Node scope. */
function applyPatchInBrowser(args: { selector: string; patch: Patch }): void {
  const { selector, patch } = args;
  const el = document.querySelector(selector);
  if (!el) {
    throw new Error(`simulate_fix_and_rescan: no element matched selector "${selector}"`);
  }

  switch (patch.type) {
    case "setAttribute":
      el.setAttribute(patch.attribute ?? "", patch.value ?? "");
      break;
    case "removeAttribute":
      el.removeAttribute(patch.attribute ?? "");
      break;
    case "setInnerText":
      (el as HTMLElement).innerText = patch.value ?? "";
      break;
    case "setStyleProperty":
      (el as HTMLElement).style.setProperty(patch.attribute ?? "", patch.value ?? "");
      break;
    case "replaceOuterHTML":
      el.outerHTML = patch.value ?? "";
      break;
  }
}

export function registerSimulateFixAndRescanTool(server: McpServer): void {
  server.registerTool(
    "simulate_fix_and_rescan",
    {
      description:
        "Applies a proposed DOM patch to a cloned copy of a previously-scanned page (from a cached " +
        "snapshot -- never the live URL, never the user's real files) in a fresh isolated browser " +
        "context, then reruns axe-core to confirm the target violation is actually resolved and no " +
        "new violations were introduced.",
      inputSchema: simulateFixAndRescanInputShape,
    },
    async ({ sessionId, selector, violationId, patch, rescanScope }) => {
      const snapshot = getSnapshot(sessionId);
      if (!snapshot) {
        return {
          content: [
            {
              type: "text" as const,
              text: `No snapshot found for sessionId "${sessionId}". Call scan_page first.`,
            },
          ],
          isError: true,
        };
      }

      // withPage gives us a fresh, isolated browser context (never the one
      // scan_page used, never shared with other concurrent simulations) and
      // tears it down when we're done -- that isolation is what guarantees
      // we never touch the live page or leak state between simulated fixes.
      const result = await withPage(async (page) => {
        await page.setContent(snapshot.html, { waitUntil: "networkidle" });

        try {
          await page.evaluate(applyPatchInBrowser, { selector, patch });
        } catch (error) {
          return {
            ok: false as const,
            error: `Failed to apply patch: ${error instanceof Error ? error.message : String(error)}`,
          };
        }

        const afterViolations = await runAxeScan(page, {
          include: rescanScope === "page" ? undefined : [selector],
        });

        const beforeIds = new Set(snapshot.violations.map((v) => v.id));
        const beforeCount = snapshot.violations.find((v) => v.id === violationId)?.nodes.length ?? 0;

        const afterMatch = afterViolations.find((v) => v.id === violationId);
        const afterCount = afterMatch?.nodes.length ?? 0;
        const resolved = afterCount === 0;

        const newViolationsIntroduced = afterViolations
          .filter((v) => v.id !== violationId && !beforeIds.has(v.id))
          .map((v) => v.id);

        return {
          ok: true as const,
          resolved,
          beforeCount,
          afterCount,
          remainingTargets: afterMatch?.nodes.map((n) => n.target.join(" ")) ?? [],
          newViolationsIntroduced,
        };
      });

      if (!result.ok) {
        return {
          content: [{ type: "text" as const, text: result.error }],
          isError: true,
        };
      }

      const { ok: _ok, ...payload } = result;
      return {
        content: [{ type: "text" as const, text: JSON.stringify(payload, null, 2) }],
        structuredContent: payload,
      };
    },
  );
}
