export type GuidanceSourceType = "wcag-sc" | "apg-pattern";

export interface GuidanceChunk {
  id: string;
  sourceFile: string;
  title: string;
  heading: string;
  sourceType: GuidanceSourceType;
  url: string;
  text: string;
}

export interface EmbeddedChunk extends GuidanceChunk {
  embedding: number[];
}

export interface RetrievedGuidance extends GuidanceChunk {
  score: number;
}
