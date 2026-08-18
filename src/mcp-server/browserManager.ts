import { randomUUID } from "node:crypto";
import { chromium, type Browser, type Page } from "playwright";
import type { Violation } from "../types.js";

const SNAPSHOT_TTL_MS = 30 * 60 * 1000;

interface Snapshot {
  url: string;
  html: string;
  /** The violation set from the original scan_page call -- the "before" baseline that simulate_fix_and_rescan diffs against. */
  violations: Violation[];
  createdAt: number;
}

let browserPromise: Promise<Browser> | null = null;
const snapshots = new Map<string, Snapshot>();

function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = chromium.launch();
  }
  return browserPromise;
}

/** Runs fn against a fresh, isolated page (its own browser context), then tears the context down. */
export async function withPage<T>(fn: (page: Page) => Promise<T>): Promise<T> {
  const browser = await getBrowser();
  const context = await browser.newContext();
  try {
    const page = await context.newPage();
    return await fn(page);
  } finally {
    await context.close();
  }
}

function evictExpired(): void {
  const now = Date.now();
  for (const [id, snapshot] of snapshots) {
    if (now - snapshot.createdAt > SNAPSHOT_TTL_MS) {
      snapshots.delete(id);
    }
  }
}

export function saveSnapshot(url: string, html: string, violations: Violation[]): string {
  evictExpired();
  const sessionId = randomUUID();
  snapshots.set(sessionId, { url, html, violations, createdAt: Date.now() });
  return sessionId;
}

export function getSnapshot(sessionId: string): Snapshot | undefined {
  evictExpired();
  return snapshots.get(sessionId);
}

export async function closeBrowser(): Promise<void> {
  if (browserPromise) {
    const browser = await browserPromise;
    await browser.close();
    browserPromise = null;
  }
}
