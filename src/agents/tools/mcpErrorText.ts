/** Extracts human-readable text from an errored MCP callTool() result's content array, falling back to a generic message. */
export function mcpErrorText(content: unknown, fallback: string): string {
  return Array.isArray(content)
    ? content.map((c) => (c && typeof c === "object" && "text" in c ? (c as { text: string }).text : "")).join("\n")
    : fallback;
}
