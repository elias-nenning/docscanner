"use client";

import { useState } from "react";
import { Loader2, Download, Copy, Check, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FeldAnzeige } from "@/components/FeldAnzeige";
import { exportToXlsx } from "@/lib/export-xlsx";
import type { ScanResult } from "@/lib/types";

interface ErgebnisPanelProps {
  result: ScanResult | null;
  loading: boolean;
  error: string | null;
}

export function ErgebnisPanel({ result, loading, error }: ErgebnisPanelProps) {
  const [copied, setCopied] = useState(false);

  function handleCopyText() {
    if (!result?.volltext) return;
    navigator.clipboard.writeText(result.volltext).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  if (loading) {
    return (
      <div className="flex items-center gap-3 rounded-lg border bg-card p-4">
        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">Extracting data…</p>
          <p className="text-[11px] text-muted-foreground">
            Reading document with OCR and AI
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
        <AlertCircle className="h-4 w-4 shrink-0 text-destructive mt-0.5" />
        <div>
          <p className="text-sm font-medium">Extraction failed</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const felderEntries = Object.entries(result.felder);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{result.dokument_typ}</Badge>
            <span className="text-[11px] text-muted-foreground tabular-nums">
              {Math.round(result.ocr_konfidenz * 100)}% confidence
            </span>
          </div>
          {result.kurzbeschreibung && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {result.kurzbeschreibung}
            </p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => exportToXlsx(result.felder)}
          className="shrink-0"
        >
          <Download className="h-3.5 w-3.5" />
          Export
        </Button>
      </div>

      <Tabs defaultValue="fields" className="w-full">
        <TabsList>
          <TabsTrigger value="fields">
            Extracted ({felderEntries.length})
          </TabsTrigger>
          <TabsTrigger value="text">Raw text</TabsTrigger>
        </TabsList>

        <TabsContent value="fields" className="space-y-1.5">
          {felderEntries.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No fields extracted.
            </p>
          ) : (
            felderEntries.map(([name, feld], i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.2 }}
              >
                <FeldAnzeige
                  label={name}
                  wert={feld.wert}
                  konfidenz={feld.konfidenz}
                />
              </motion.div>
            ))
          )}
        </TabsContent>

        <TabsContent value="text">
          <div className="relative rounded-lg border bg-card">
            <div className="absolute right-2 top-2 z-10">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleCopyText}
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
            <pre className="overflow-auto p-4 pr-10 text-xs leading-relaxed text-muted-foreground font-mono max-h-[400px]">
              {result.volltext || "No text extracted."}
            </pre>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
