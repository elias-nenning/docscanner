"use client";

import { AlertTriangle, CheckCircle2, FileWarning, FileX2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  getDocumentQuality,
  getDocumentQualityDescription,
  getDocumentQualityLabel,
  getFilledFieldCount,
  getTotalFieldCount,
} from "@/lib/result-utils";
import type { ScanDocumentItem } from "@/lib/scan-session";

const statusClasses = {
  success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  review: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
  failed: "bg-destructive/10 text-destructive border-destructive/30",
  empty: "bg-muted text-muted-foreground border-border/60",
} as const;

export function DocumentResultSummary({ item }: { item: ScanDocumentItem }) {
  if (item.status === "failed" || !item.result) {
    return (
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-start">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Badge className={cn("rounded-md border", statusClasses.failed)}>
                Fehlgeschlagen
              </Badge>
            </div>
            <h2 className="text-lg font-semibold tracking-tight">{item.fileName}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {item.error || "Dieses Dokument konnte nicht verarbeitet werden."}
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-background/70">
            <FileX2 className="h-6 w-6 text-destructive" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const filled = getFilledFieldCount(item.result);
  const total = getTotalFieldCount(item.result);
  const quality = getDocumentQuality(item.result);
  const qualityLabel = getDocumentQualityLabel(item.result);
  const ocrPct = Math.round(item.result.ocr_konfidenz * 100);
  const qualityClass =
    quality === "strong"
      ? statusClasses.success
      : quality === "review"
        ? statusClasses.review
        : quality === "weak"
          ? statusClasses.failed
          : statusClasses.empty;
  const Icon =
    quality === "strong"
      ? CheckCircle2
      : quality === "review"
        ? AlertTriangle
        : FileWarning;

  return (
    <Card className="border-border/70 bg-card/80 shadow-sm backdrop-blur-sm">
      <CardContent className="grid gap-5 p-5 lg:grid-cols-[1fr_280px]">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge className={cn("rounded-md border", qualityClass)}>{qualityLabel}</Badge>
            <Badge variant="secondary" className="rounded-md">
              {item.result.dokument_typ}
            </Badge>
          </div>
          <h2 className="text-lg font-semibold tracking-tight">{item.fileName}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {getDocumentQualityDescription(item.result)}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          <div className="rounded-xl border bg-background/70 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              OCR-Vertrauen
            </p>
            <p className="mt-2 text-xl font-semibold tabular-nums">{ocrPct}%</p>
          </div>
          <div className="rounded-xl border bg-background/70 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Felder mit Inhalt
            </p>
            <p className="mt-2 text-xl font-semibold tabular-nums">
              {filled}
              <span className="text-sm font-normal text-muted-foreground"> / {total}</span>
            </p>
          </div>
          <div className="rounded-xl border bg-background/70 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Ergebnisstatus
            </p>
            <div className="mt-2 flex items-center gap-2">
              <Icon className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium">{qualityLabel}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
