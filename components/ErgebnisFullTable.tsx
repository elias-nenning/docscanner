"use client";

import { useMemo, useState } from "react";
import {
  Copy,
  Check,
  Download,
  ChevronDown,
  ChevronUp,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { exportToXlsx } from "@/lib/export-xlsx";
import { getDocumentQualityLabel } from "@/lib/result-utils";
import type { ScanResult } from "@/lib/types";

type Row = { name: string; wert: string; konfidenz: number; filled: boolean };

function buildRows(result: ScanResult): Row[] {
  const rows = Object.entries(result.felder).map(([name, f]) => ({
    name,
    wert: f.wert,
    konfidenz: f.konfidenz,
    filled: Boolean(f.wert?.trim()),
  }));
  const filled = rows.filter((r) => r.filled).sort((a, b) => b.konfidenz - a.konfidenz);
  const empty = rows.filter((r) => !r.filled).sort((a, b) => a.name.localeCompare(b.name));
  return [...filled, ...empty];
}

function exportNameFromFileName(fileName: string): string {
  const base = fileName.replace(/\.[^.]+$/, "").trim() || "scan-ergebnis";
  return base.replace(/[^\p{L}\p{N}\-_.\s]/gu, "_").replace(/\s+/g, " ").trim().slice(0, 80) || "scan-ergebnis";
}

export function ErgebnisFullTable({
  result,
  exportBaseName,
}: {
  result: ScanResult;
  /** Dateiname für Excel-Export (ohne Endung) */
  exportBaseName?: string;
}) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  const rows = useMemo(() => buildRows(result), [result]);
  const filledCount = rows.filter((r) => r.filled).length;
  const ocrPct = Math.round(result.ocr_konfidenz * 100);
  const qualityLabel = getDocumentQualityLabel(result);

  function copyValue(key: string, value: string) {
    navigator.clipboard.writeText(value).then(() => {
      setCopiedField(key);
      setTimeout(() => setCopiedField(null), 1200);
    });
  }

  function copyAll() {
    const text = rows.map((r) => `${r.name}: ${r.wert || "—"}`).join("\n");
    navigator.clipboard.writeText(text).then(() => {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 1200);
    });
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border/70 bg-card/80 p-4 backdrop-blur-sm">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Dokumenttyp
          </p>
          <p className="mt-1 text-lg font-semibold tracking-tight">{result.dokument_typ}</p>
        </div>
        <div className="rounded-xl border border-border/70 bg-card/80 p-4 backdrop-blur-sm">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            OCR-Vertrauen
          </p>
          <p className="mt-1 text-lg font-semibold tabular-nums tracking-tight">{ocrPct}%</p>
        </div>
        <div className="rounded-xl border border-border/70 bg-card/80 p-4 backdrop-blur-sm">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Felder mit Inhalt
          </p>
          <p className="mt-1 text-lg font-semibold tabular-nums tracking-tight">
            {filledCount}
            <span className="text-sm font-normal text-muted-foreground">
              {" "}
              / {rows.length}
            </span>
          </p>
        </div>
        <div className="rounded-xl border border-border/70 bg-card/80 p-4 backdrop-blur-sm">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Pruefstatus
          </p>
          <p className="mt-1 text-lg font-semibold tracking-tight">{qualityLabel}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-md">
            Vollständige Auswertung
          </Badge>
          <span className="text-xs text-muted-foreground">
            Alle {rows.length} Felder · leere mit „—“
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={copyAll}>
            {copiedAll ? (
              <Check className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {copiedAll ? "Kopiert" : "Alles kopieren"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              exportToXlsx(
                result.felder,
                exportBaseName
                  ? exportNameFromFileName(exportBaseName)
                  : "scan-ergebnis",
              )
            }
          >
            <Download className="h-3.5 w-3.5" />
            Excel
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold tracking-tight">Extraktionen im Detail</h3>
          <p className="text-xs text-muted-foreground">
            Unsichere Felder sind farblich hervorgehoben und koennen direkt kopiert oder exportiert werden.
          </p>
        </div>

      <div className="overflow-hidden rounded-xl border border-border/80 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="w-12 px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  #
                </th>
                <th className="px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Feld
                </th>
                <th className="px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Wert
                </th>
                <th className="w-28 px-3 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Feld-Score
                </th>
                <th className="w-24 px-3 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="w-12 px-2 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const conf = Math.round(row.konfidenz * 100);
                const level =
                  !row.filled ? "empty" : conf >= 80 ? "high" : conf >= 45 ? "mid" : "low";
                return (
                  <tr
                    key={row.name}
                    className={cn(
                      "group border-b border-border/40 last:border-b-0",
                      row.filled ? "bg-transparent" : "bg-muted/10",
                    )}
                  >
                    <td className="px-3 py-3 tabular-nums text-muted-foreground">{i + 1}</td>
                    <td className="px-3 py-3 font-medium text-foreground">{row.name}</td>
                    <td className="max-w-md px-3 py-3">
                      <span
                        className={cn(
                          "whitespace-pre-wrap break-words leading-relaxed",
                          row.filled ? "text-foreground" : "text-muted-foreground/50",
                        )}
                      >
                        {row.filled ? row.wert : "—"}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <span
                        className={cn(
                          "text-xs font-medium tabular-nums",
                          level === "empty" && "text-muted-foreground/40",
                          level === "high" && "text-emerald-500",
                          level === "mid" && "text-amber-500",
                          level === "low" && "text-red-400/90",
                        )}
                      >
                        {row.filled ? `${conf}%` : "—"}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span
                        className={cn(
                          "inline-flex rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                          !row.filled
                            ? "bg-muted text-muted-foreground"
                            : conf >= 80
                              ? "bg-emerald-500/15 text-emerald-400"
                              : conf >= 45
                                ? "bg-amber-500/15 text-amber-500"
                                : "bg-destructive/15 text-destructive",
                        )}
                      >
                        {row.filled ? (conf >= 80 ? "Sicher" : conf >= 45 ? "Pruefen" : "Unsicher") : "Leer"}
                      </span>
                    </td>
                    <td className="px-2 py-3">
                      <button
                        type="button"
                        onClick={() => row.wert && copyValue(row.name, row.wert)}
                        disabled={!row.wert}
                        className="rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-secondary hover:text-foreground group-hover:opacity-100 disabled:opacity-0"
                      >
                        {copiedField === row.name ? (
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      </div>

      {result.rohtext ? (
        <div>
          <button
            type="button"
            onClick={() => setShowRaw(!showRaw)}
            className="flex items-center gap-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <FileText className="h-4 w-4" />
            Rohtext (OCR)
            {showRaw ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
          {showRaw ? (
            <div className="overflow-hidden">
              <pre className="mt-3 max-h-[min(420px,50vh)] overflow-auto rounded-xl border border-border/60 bg-muted/20 p-4 text-xs leading-relaxed text-muted-foreground">
                {result.rohtext}
              </pre>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
