import { embedQuery } from "./embeddings.js";

// Downloads/loads the embedding model once, sequentially, before the test
// suite starts. Without this, a cold cache (fresh `npm ci`, no model
// downloaded yet) plus vitest's parallel test files race to download the
// same ONNX file at once and corrupt it -- exactly what a fresh CI runner
// looks like every time.
embedQuery("warm the embedding model cache")
  .then(() => {
    console.log("Embedding model cache warmed.");
  })
  .catch((error) => {
    console.error("Failed to warm embedding model cache:", error);
    process.exit(1);
  });
