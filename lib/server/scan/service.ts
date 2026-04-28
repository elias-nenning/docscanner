import { randomUUID } from "crypto";
import { scanConfig } from "@/lib/server/scan/config";
import { extractFields, normalizeOcrForExtraction, detectDocumentType, sanitizeLlmFields, tryOllamaExtract } from "@/lib/server/scan/extract";
import { logScanFailure, logScanInfo, logScanSuccess } from "@/lib/server/scan/logging";
import { ocrFile } from "@/lib/server/scan/ocr";
import type { ScanLogContext, ScanMetrics, ScanResultPayload } from "@/lib/server/scan/types";

export async function runScan(params: {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
  fileSize: number;
  schema: string[];
}): Promise<ScanResultPayload> {
  const scanId = randomUUID();
  const startedAt = Date.now();
  const context: ScanLogContext = {
    scanId,
    fileName: params.fileName,
    mimeType: params.mimeType,
    fileSize: params.fileSize,
  };

  if (params.fileSize > scanConfig.maxFileSizeBytes) {
    throw new Error("Datei ist zu gross fuer den Scan.");
  }

  logScanInfo("scan.started", context, { schemaFields: params.schema.length });

  try {
    const ocrStartedAt = Date.now();
    const { text: ocrText, confidence: ocrConfidence, pageCount } = await ocrFile(
      params.buffer,
      params.mimeType,
    );
    const ocrMs = Date.now() - ocrStartedAt;

    if (!ocrText.trim()) {
      throw new Error("Kein Text erkannt. Bitte stelle sicher, dass das Dokument lesbar ist.");
    }

    const extractStartedAt = Date.now();
    const textForExtraction = normalizeOcrForExtraction(ocrText);
    const llmResult = scanConfig.ollamaEnabled
      ? await tryOllamaExtract(textForExtraction, params.schema)
      : null;

    const felder = llmResult?.felder
      ? sanitizeLlmFields(params.schema, llmResult.felder)
      : extractFields(textForExtraction, params.schema);
    const dokumentTyp =
      typeof llmResult?.dokument_typ === "string"
        ? llmResult.dokument_typ
        : detectDocumentType(textForExtraction);

    const extractMs = Date.now() - extractStartedAt;
    const metrics: ScanMetrics = {
      pdfPages: pageCount,
      ocrMs,
      extractMs,
      totalMs: Date.now() - startedAt,
    };

    logScanSuccess(context, metrics, { dokumentTyp });

    return {
      scan_id: scanId,
      dokument_typ: dokumentTyp,
      felder,
      ocr_konfidenz: ocrConfidence,
      rohtext: ocrText,
    };
  } catch (error) {
    logScanFailure(context, error, { totalMs: Date.now() - startedAt });
    throw error;
  }
}
