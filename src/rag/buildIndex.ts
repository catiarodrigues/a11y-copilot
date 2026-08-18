import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { embedTexts } from "./embeddings.js";
import type { EmbeddedChunk, GuidanceChunk, GuidanceSourceType } from "./types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CORPUS_DIR = path.resolve(__dirname, "../../data/wcag-corpus");
const OUTPUT_PATH = path.resolve(__dirname, "../../data/embeddings.json");

interface Frontmatter {
  id: string;
  title: string;
  sourceType: GuidanceSourceType;
  url: string;
}

/** Minimal frontmatter parser -- flat key: value pairs only, no nested YAML. */
function parseFrontmatter(raw: string): { frontmatter: Frontmatter; body: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    throw new Error("Corpus file is missing a --- frontmatter block");
  }
  const [, fmBlock, body] = match;

  const frontmatter = {} as Record<string, string>;
  for (const line of fmBlock.split("\n")) {
    const lineMatch = line.match(/^(\w+):\s*(.*)$/);
    if (!lineMatch) continue;
    const [, key, rawValue] = lineMatch;
    frontmatter[key] = rawValue.trim().replace(/^"(.*)"$/, "$1");
  }

  return { frontmatter: frontmatter as unknown as Frontmatter, body: body.trim() };
}

/** Splits the doc body into chunks at each ## heading. */
function chunkByHeading(body: string): Array<{ heading: string; text: string }> {
  const chunks: Array<{ heading: string; text: string }> = [];
  let currentHeading = "";
  let currentLines: string[] = [];

  const flush = () => {
    if (currentHeading && currentLines.length > 0) {
      chunks.push({ heading: currentHeading, text: currentLines.join("\n").trim() });
    }
  };

  for (const line of body.split("\n")) {
    const headingMatch = line.match(/^##\s+(.*)$/);
    if (headingMatch) {
      flush();
      currentHeading = headingMatch[1].trim();
      currentLines = [line];
    } else {
      currentLines.push(line);
    }
  }
  flush();

  return chunks;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  const files = readdirSync(CORPUS_DIR).filter((f) => f.endsWith(".md"));
  const chunks: GuidanceChunk[] = [];

  for (const file of files) {
    const raw = readFileSync(path.join(CORPUS_DIR, file), "utf-8");
    const { frontmatter, body } = parseFrontmatter(raw);

    for (const section of chunkByHeading(body)) {
      chunks.push({
        id: `${frontmatter.id}#${slugify(section.heading)}`,
        sourceFile: file,
        title: frontmatter.title,
        heading: section.heading,
        sourceType: frontmatter.sourceType,
        url: frontmatter.url,
        // Prefix with title + heading so the embedding captures topical
        // context even for short chunks.
        text: `${frontmatter.title} — ${section.heading}\n${section.text}`,
      });
    }
  }

  console.log(`Embedding ${chunks.length} chunks from ${files.length} documents...`);
  const embeddings = await embedTexts(chunks.map((c) => c.text));

  const embedded: EmbeddedChunk[] = chunks.map((chunk, i) => ({
    ...chunk,
    embedding: embeddings[i],
  }));

  writeFileSync(OUTPUT_PATH, JSON.stringify(embedded, null, 2));
  console.log(`Wrote ${embedded.length} embedded chunks to ${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error("Failed to build RAG index:", error);
  process.exit(1);
});
