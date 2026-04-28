import type { ScanLogContext, ScanMetrics } from "@/lib/server/scan/types";

export function logScanInfo(event: string, context: ScanLogContext, extra?: Record<string, unknown>) {
  console.info(
    JSON.stringify({
      level: "info",
      event,
      at: new Date().toISOString(),
      ...context,
      ...extra,
    }),
  );
}

export function logScanSuccess(context: ScanLogContext, metrics: ScanMetrics, extra?: Record<string, unknown>) {
  logScanInfo("scan.success", context, { metrics, ...extra });
}

export function logScanFailure(context: ScanLogContext, error: unknown, extra?: Record<string, unknown>) {
  const message = error instanceof Error ? error.message : "Unbekannter Fehler";
  console.error(
    JSON.stringify({
      level: "error",
      event: "scan.failure",
      at: new Date().toISOString(),
      ...context,
      error: message,
      ...extra,
    }),
  );
}
