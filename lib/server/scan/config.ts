import path from "path";

function boundedInt(value: string | undefined, fallback: number, min: number, max: number): number {
  const parsed = Number.parseInt(value || "", 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function boundedFloat(value: string | undefined, fallback: number, min: number, max: number): number {
  const parsed = Number.parseFloat(value || "");
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

export const scanConfig = {
  ollamaUrl: process.env.OLLAMA_URL || "http://localhost:11434",
  ollamaEnabled:
    process.env.SCAN_OLLAMA !== "0" &&
    process.env.SCAN_OLLAMA !== "false" &&
    process.env.OLLAMA_ENABLED !== "0" &&
    process.env.OLLAMA_ENABLED !== "false",
  ollamaTimeoutMs: boundedInt(process.env.SCAN_OLLAMA_TIMEOUT_MS, 5000, 1500, 120000),
  pdfRenderScale: boundedFloat(process.env.SCAN_PDF_SCALE, 1.55, 0.75, 3),
  pdfMaxPages: boundedInt(process.env.SCAN_MAX_PDF_PAGES, 14, 0, 50),
  maxFileSizeBytes: boundedInt(process.env.SCAN_MAX_FILE_SIZE_MB, 50, 1, 200) * 1024 * 1024,
  workerPath: path.join(
    process.cwd(),
    "node_modules",
    "tesseract.js",
    "src",
    "worker-script",
    "node",
    "index.js",
  ),
};
