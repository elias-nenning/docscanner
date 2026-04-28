export interface ScanFieldValue {
  wert: string;
  konfidenz: number;
}

export interface ScanResultPayload {
  dokument_typ: string;
  felder: Record<string, ScanFieldValue>;
  ocr_konfidenz: number;
  rohtext: string;
  scan_id: string;
}

export type ScanMetrics = {
  pdfPages?: number;
  ocrMs: number;
  extractMs: number;
  totalMs: number;
};

export type ScanLogContext = {
  scanId: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
};
