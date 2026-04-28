"use client";

import { AlertTriangle, CheckCircle2, FileText, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  getDocumentQualityLabel,
  getFilledFieldCount,
  getTotalFieldCount,
} from "@/lib/result-utils";
import type { ScanDocumentItem } from "@/lib/scan-session";

function statusMeta(item: ScanDocumentItem) {
  if (item.status === "failed") {
    return {
      label: "Fehlgeschlagen",
      icon: XCircle,
      className: "border-destructive/30 bg-destructive/10 text-destructive",
    };
  }

  if (!item.result) {
    return {
      label: "Ohne Ergebnis",
      icon: AlertTriangle,
      className: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    };
  }

  return {
    label: getDocumentQualityLabel(item.result),
    icon: CheckCircle2,
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  };
}

export function BatchDocumentSidebar({
  documents,
  activeIndex,
  onSelect,
}: {
  documents: ScanDocumentItem[];
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  return (
    <aside className="rounded-2xl border border-border/70 bg-card/80 p-3 shadow-sm backdrop-blur-sm">
      <div className="mb-3 flex items-center justify-between gap-3 px-1">
        <div>
          <p className="text-sm font-semibold tracking-tight">Dokumente</p>
          <p className="text-xs text-muted-foreground">
            {documents.length} Dateien im aktuellen Scanlauf
          </p>
        </div>
        <Badge variant="secondary" className="rounded-md">
          Batch
        </Badge>
      </div>

      <div className="space-y-2">
        {documents.map((item, index) => {
          const meta = statusMeta(item);
          const StatusIcon = meta.icon;
          const filledCount = item.result ? getFilledFieldCount(item.result) : 0;
          const totalCount = item.result ? getTotalFieldCount(item.result) : 0;

          return (
            <button
              key={`${item.fileName}-${item.scannedAt}-${index}`}
              type="button"
              onClick={() => onSelect(index)}
              className={cn(
                "w-full rounded-xl border p-3 text-left transition-all hover:border-foreground/20 hover:bg-muted/30",
                activeIndex === index
                  ? "border-primary/40 bg-primary/5 shadow-sm"
                  : "border-border/60 bg-background/70",
              )}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-sm font-medium">{item.fileName}</p>
                    <span className="text-[11px] text-muted-foreground">{index + 1}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                        meta.className,
                      )}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {meta.label}
                    </span>
                    {item.result ? (
                      <span className="text-[11px] text-muted-foreground">
                        {filledCount}/{totalCount} Felder
                      </span>
                    ) : null}
                  </div>
                  {item.error ? (
                    <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                      {item.error}
                    </p>
                  ) : null}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
