"use client";

import { useState } from "react";
import {
  Copy,
  Check,
  Download,
  ChevronDown,
  ChevronUp,
  FileText,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { exportToXlsx } from "@/lib/export-xlsx";
import type { ScanResult } from "@/lib/types";

interface ResultsTableProps {
  result: ScanResult;
}

export function ResultsTable({ result }: ResultsTableProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showRawText, setShowRawText] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  const entries = Object.entries(result.felder);
  const confidence = Math.round(result.ocr_konfidenz * 100);

  function copyValue(key: string, value: string) {
    navigator.clipboard.writeText(value).then(() => {
      setCopiedField(key);
      setTimeout(() => setCopiedField(null), 1200);
    });
  }

  function copyAll() {
    const text = entries.map(([k, v]) => `${k}: ${v.wert}`).join("\n");
    navigator.clipboard.writeText(text).then(() => {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 1200);
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Badge variant="secondary" className="text-xs">
            {result.dokument_typ}
          </Badge>
          <span className="text-[11px] text-muted-foreground tabular-nums">
            {confidence}% OCR confidence
          </span>
          <span className="text-[11px] text-muted-foreground">
            · {entries.length} fields found
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" onClick={copyAll}>
            {copiedAll ? (
              <Check className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {copiedAll ? "Copied" : "Copy all"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportToXlsx(result.felder)}
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
        </div>
      </div>

      {/* Data table */}
      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground w-[180px]">
                Field
              </th>
              <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Value
              </th>
              <th className="px-4 py-2.5 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground w-[80px]">
                Conf.
              </th>
              <th className="w-[40px]" />
            </tr>
          </thead>
          <tbody>
            {entries.map(([name, feld], i) => {
              const conf = Math.round(feld.konfidenz * 100);
              const level =
                conf >= 80 ? "high" : conf >= 50 ? "mid" : "low";
              return (
                <motion.tr
                  key={name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="group border-b last:border-b-0 hover:bg-accent/30 transition-colors"
                >
                  <td className="px-4 py-2.5 font-medium text-muted-foreground">
                    {name}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-[13px]">
                    {feld.wert || (
                      <span className="text-muted-foreground/50">–</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <span
                      className={cn(
                        "text-xs font-medium tabular-nums",
                        level === "high" && "text-emerald-500",
                        level === "mid" && "text-amber-500",
                        level === "low" && "text-red-400",
                      )}
                    >
                      {conf}%
                    </span>
                  </td>
                  <td className="px-2 py-2.5">
                    <button
                      onClick={() => copyValue(name, feld.wert)}
                      className="rounded p-1 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground transition-all"
                    >
                      {copiedField === name ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Raw text toggle */}
      {result.rohtext && (
        <div>
          <button
            onClick={() => setShowRawText(!showRawText)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <FileText className="h-3.5 w-3.5" />
            Raw OCR text
            {showRawText ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </button>
          {showRawText && (
            <motion.pre
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-2 overflow-auto rounded-lg border bg-card p-4 text-xs leading-relaxed text-muted-foreground font-mono max-h-[300px]"
            >
              {result.rohtext}
            </motion.pre>
          )}
        </div>
      )}
    </motion.div>
  );
}
