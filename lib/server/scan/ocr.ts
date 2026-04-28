import { randomUUID } from "crypto";
import { unlinkSync, writeFileSync } from "fs";
import os from "os";
import path from "path";
import { scanConfig } from "@/lib/server/scan/config";

async function bufferToTempFile(buffer: Buffer, ext: string): Promise<string> {
  const tmpPath = path.join(os.tmpdir(), `scandesk-${randomUUID()}.${ext}`);
  writeFileSync(tmpPath, buffer);
  return tmpPath;
}

export async function pdfToImages(
  pdfBuffer: Buffer,
  opts: { scale: number; maxPages: number },
): Promise<Buffer[]> {
  const { pdf } = await import("pdf-to-img");
  const images: Buffer[] = [];
  const doc = await pdf(pdfBuffer, { scale: opts.scale });
  let count = 0;
  for await (const page of doc) {
    images.push(Buffer.from(page));
    count++;
    if (opts.maxPages > 0 && count >= opts.maxPages) break;
  }
  return images;
}

export async function ocrPageImages(
  pageImages: Buffer[],
): Promise<{ text: string; confidence: number }> {
  if (pageImages.length === 0) return { text: "", confidence: 0 };

  const Tesseract = await import("tesseract.js");
  const tmpFiles: string[] = [];
  try {
    const worker = await Tesseract.createWorker("deu+eng", undefined, {
      workerPath: scanConfig.workerPath,
      logger: () => {},
    });

    try {
      await worker.setParameters({
        tessedit_pageseg_mode: Tesseract.PSM.SINGLE_COLUMN,
        preserve_interword_spaces: "1",
      });
    } catch {
      /* ältere Builds: Parameter optional */
    }

    let allText = "";
    let totalConfidence = 0;

    try {
      for (const imageBuffer of pageImages) {
        const tmpFile = await bufferToTempFile(imageBuffer, "png");
        tmpFiles.push(tmpFile);
        const { data } = await worker.recognize(tmpFile);
        allText += `${data.text}\n`;
        totalConfidence += data.confidence / 100;
      }
    } finally {
      await worker.terminate();
    }

    return {
      text: allText.trim(),
      confidence: totalConfidence / pageImages.length,
    };
  } finally {
    for (const file of tmpFiles) {
      try {
        unlinkSync(file);
      } catch {
        /* ignore */
      }
    }
  }
}

export async function ocrFile(
  buffer: Buffer,
  mimeType: string,
): Promise<{ text: string; confidence: number; pageCount?: number }> {
  if (mimeType === "application/pdf") {
    const pages = await pdfToImages(buffer, {
      scale: scanConfig.pdfRenderScale,
      maxPages: scanConfig.pdfMaxPages,
    });
    if (pages.length === 0) throw new Error("PDF enthaelt keine Seiten.");
    const result = await ocrPageImages(pages);
    return { ...result, pageCount: pages.length };
  }

  const result = await ocrPageImages([buffer]);
  return { ...result, pageCount: 1 };
}
