"use client";

import { useState, useEffect } from "react";
import { FileText, Image as ImageIcon, Clock, X } from "lucide-react";
import {
  getHistory,
  clearHistory,
  timeAgo,
  type ScanHistoryEntry,
} from "@/lib/history";
import { cn } from "@/lib/utils";

function EntryRow({ entry }: { entry: ScanHistoryEntry }) {
  const isPdf = entry.fileType === "application/pdf";

  return (
    <div className="flex items-start gap-3 px-3 py-2.5">
      <div
        className={cn(
          "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
          isPdf ? "bg-red-500/10" : "bg-blue-500/10"
        )}
      >
        {isPdf ? (
          <FileText className="h-3.5 w-3.5 text-red-400" />
        ) : (
          <ImageIcon className="h-3.5 w-3.5 text-blue-400" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate text-sm leading-tight">{entry.fileName}</p>
          <span className="shrink-0 text-[11px] text-muted-foreground">
            {timeAgo(entry.scannedAt)}
          </span>
        </div>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          {entry.documentType} · {entry.fieldCount}{" "}
          {entry.fieldCount === 1 ? "field" : "fields"} · {entry.confidence}%
        </p>
      </div>
    </div>
  );
}

export function RecentDocuments() {
  const [history, setHistory] = useState<ScanHistoryEntry[]>([]);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  function handleClear() {
    clearHistory();
    setHistory([]);
  }

  if (history.length === 0) {
    return (
      <div className="flex h-[240px] flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center">
        <Clock className="mb-3 h-5 w-5 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">No scans yet</p>
        <p className="mt-1 text-xs text-muted-foreground/50">
          Your history will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border bg-card">
      <div className="flex shrink-0 items-center justify-between border-b px-3 py-2">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Recent scans
        </span>
        <button
          onClick={handleClear}
          className="rounded p-0.5 text-[11px] text-muted-foreground/60 hover:text-foreground transition-colors"
          title="Clear history"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="divide-y overflow-y-auto" style={{ maxHeight: "320px" }}>
        {history.map((entry) => (
          <EntryRow key={entry.id} entry={entry} />
        ))}
      </div>
      <div className="shrink-0 border-t px-3 py-2">
        <p className="text-[11px] text-muted-foreground/50 tabular-nums">
          {history.length} {history.length === 1 ? "document" : "documents"}{" "}
          scanned
        </p>
      </div>
    </div>
  );
}
