import type { ScanResult } from "@/lib/types";

export const SCAN_SESSION_KEY = "scandesk_session_v1";
let memorySessionCache: ScanSessionPayload | null = null;

export type ScanDocumentItem = {
  scanId: string;
  status: "success" | "failed";
  result?: ScanResult;
  fileName: string;
  fileType: string;
  scannedAt: string;
  error?: string;
  retryable?: boolean;
};

/** Batch session: one or more scanned documents */
export type ScanSessionPayload = {
  documents: ScanDocumentItem[];
};

function isValidDocumentItem(x: unknown): x is ScanDocumentItem {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.scanId === "string" &&
    (o.status === "success" || o.status === "failed") &&
    typeof o.fileName === "string" &&
    typeof o.fileType === "string" &&
    typeof o.scannedAt === "string" &&
    (o.result == null ||
      (typeof o.result === "object" &&
        typeof (o.result as ScanResult).rohtext === "string" &&
        typeof (o.result as ScanResult).felder === "object")) &&
    (o.error == null || typeof o.error === "string") &&
    (o.retryable == null || typeof o.retryable === "boolean")
  );
}

export function saveScanSession(payload: ScanSessionPayload): void {
  if (typeof window === "undefined") return;
  memorySessionCache = payload;
  try {
    const persist = () => {
      try {
        sessionStorage.setItem(SCAN_SESSION_KEY, JSON.stringify(payload));
      } catch {
        /* quota / private mode */
      }
    };

    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(() => persist(), { timeout: 1200 });
    } else {
      window.setTimeout(persist, 0);
    }
  } catch {
    /* ignore */
  }
}

export function loadScanSession(): ScanSessionPayload | null {
  if (typeof window === "undefined") return null;
  if (memorySessionCache) return memorySessionCache;
  try {
    const raw = sessionStorage.getItem(SCAN_SESSION_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as unknown;

    if (data && typeof data === "object" && "documents" in data) {
      const docs = (data as { documents: unknown }).documents;
      if (!Array.isArray(docs) || docs.length === 0) return null;
      const ok = docs.every(isValidDocumentItem);
      if (!ok) return null;
      const payload = { documents: docs };
      memorySessionCache = payload;
      return payload;
    }

    /* Legacy: single object with result + fileName */
    const legacy = data as {
      result?: ScanResult;
      fileName?: string;
      fileType?: string;
      scannedAt?: string;
    };
    if (
      legacy?.result?.felder &&
      typeof legacy.result.rohtext === "string" &&
      typeof legacy.fileName === "string"
    ) {
      const payload: ScanSessionPayload = {
        documents: [
          {
            scanId: crypto.randomUUID(),
            status: "success",
            result: legacy.result,
            fileName: legacy.fileName,
            fileType: legacy.fileType || "application/octet-stream",
            scannedAt: legacy.scannedAt || new Date().toISOString(),
            retryable: false,
          },
        ],
      };
      memorySessionCache = payload;
      return payload;
    }

    return null;
  } catch {
    return null;
  }
}

export function clearScanSession(): void {
  if (typeof window === "undefined") return;
  memorySessionCache = null;
  try {
    sessionStorage.removeItem(SCAN_SESSION_KEY);
  } catch {
    /* ignore */
  }
}
