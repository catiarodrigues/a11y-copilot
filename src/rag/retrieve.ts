import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { embedQuery } from "./embeddings.js";
import type { EmbeddedChunk, RetrievedGuidance } from "./types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EMBEDDINGS_PATH = path.resolve(__dirname, "../../data/embeddings.json");

let indexPromise: Promise<EmbeddedChunk[]> | null = null;

function loadIndex(): Promise<EmbeddedChunk[]> {
  if (!indexPromise) {
    indexPromise = Promise.resolve(
      JSON.parse(readFileSync(EMBEDDINGS_PATH, "utf-8")) as EmbeddedChunk[],
    );
  }
  return indexPromise;
}

/** Vectors are already L2-normalized (see embeddings.ts), so dot product == cosine similarity. */
function dotProduct(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += a[i] * b[i];
  }
  return sum;
}

export async function retrieveGuidance(query: string, k = 3): Promise<RetrievedGuidance[]> {
  const [index, queryVector] = await Promise.all([loadIndex(), embedQuery(query)]);

  return index
    .map(({ embedding, ...chunk }) => ({ ...chunk, score: dotProduct(embedding, queryVector) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}
