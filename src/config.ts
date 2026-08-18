import { existsSync } from "node:fs";

if (existsSync(".env")) {
  process.loadEnvFile(".env");
}

export function isMockMode(): boolean {
  return process.env.A11Y_COPILOT_MOCK === "1" || process.env.A11Y_COPILOT_MOCK === "true";
}

export function requireApiKey(): void {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error(
      "ANTHROPIC_API_KEY is not set. Copy .env.example to .env and add your key " +
        "(https://console.anthropic.com/), or export it in your shell.",
    );
    process.exit(1);
  }
}
