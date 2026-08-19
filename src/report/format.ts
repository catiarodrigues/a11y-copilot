import chalk from "chalk";
import type { ReportEntry } from "../agents/types.js";

export function formatReport(url: string, entries: ReportEntry[]): string {
  if (entries.length === 0) {
    return chalk.green(`No fixable violations found (or proposed) for ${url}.`);
  }

  const lines: string[] = [chalk.bold(`a11y-copilot report — ${url}`), ""];

  for (const entry of entries) {
    const badge =
      entry.status === "confirmed"
        ? chalk.bgGreen.black(" CONFIRMED ")
        : chalk.bgYellow.black(" UNVERIFIED ");

    lines.push(`${badge} ${chalk.bold(entry.violationId)}  ${chalk.dim(entry.selector)}`);
    lines.push(`  ${entry.description}`);
    lines.push(
      `  ${chalk.dim("Citation:")} ${entry.citation}${entry.citationUrl ? ` (${entry.citationUrl})` : ""}`,
    );
    lines.push(
      `  ${chalk.dim("Patch:")} ${entry.patch.type}${entry.patch.attribute ? ` ${entry.patch.attribute}` : ""}=${JSON.stringify(entry.patch.value ?? "")}`,
    );
    lines.push(
      `  ${chalk.dim("Validation:")} ${entry.notes} ${chalk.dim(`(${entry.attempts} attempt${entry.attempts === 1 ? "" : "s"})`)}`,
    );
    lines.push("");
  }

  const confirmed = entries.filter((e) => e.status === "confirmed").length;
  lines.push(chalk.dim(`${confirmed}/${entries.length} fixes confirmed by simulation.`));

  return lines.join("\n");
}
