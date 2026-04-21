"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { DropZone } from "@/components/DropZone";
import { ResultsTable } from "@/components/ResultsTable";
import { RecentDocuments } from "@/components/RecentDocuments";
import { Button } from "@/components/ui/button";
import { addToHistory } from "@/lib/history";
import { geocode } from "@/lib/geocode";
import { Loader2 } from "lucide-react";
import { ALL_SCAN_FIELDS, type ScanResult } from "@/lib/types";

const DocumentMap = dynamic(() => import("@/components/DocumentMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] rounded-lg border bg-card animate-pulse" />
  ),
});

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback((newFile: File | null) => {
    setFile(newFile);
    if (!newFile) {
      setResult(null);
      setError(null);
    }
  }, []);

  async function handleScan() {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("schema", JSON.stringify(ALL_SCAN_FIELDS));
      const res = await fetch("/api/scan", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      const scanResult = json as ScanResult;

      // Filter out empty fields for cleaner display
      const filledFields: Record<string, { wert: string; konfidenz: number }> = {};
      for (const [key, val] of Object.entries(scanResult.felder)) {
        if (val.wert) filledFields[key] = val;
      }
      scanResult.felder = filledFields;
      setResult(scanResult);

      const addressKeys = ["Aussteller", "Empfänger", "Adresse", "Absender", "Firma", "Standort"];
      let location: { lat: number; lng: number; address: string } | undefined;
      for (const key of addressKeys) {
        const field = scanResult.felder[key];
        if (field?.wert) {
          const geo = await geocode(field.wert);
          if (geo) {
            location = { lat: geo.lat, lng: geo.lng, address: field.wert };
            break;
          }
        }
      }

      addToHistory({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        documentType: scanResult.dokument_typ,
        fieldCount: Object.keys(filledFields).length,
        confidence: Math.round(scanResult.ocr_konfidenz * 100),
        location,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setFile(null);
    setResult(null);
    setError(null);
  }

  const hasFile = !!file;

  return (
    <div className="flex h-screen flex-col">
      <header className="flex h-12 shrink-0 items-center border-b px-4 lg:px-6">
        <button
          onClick={hasFile ? handleReset : undefined}
          className="text-sm font-semibold tracking-tight hover:opacity-70 transition-opacity"
        >
          ScanDesk
        </button>
        {file && (
          <>
            <span className="mx-2.5 text-border">/</span>
            <span className="truncate text-sm text-muted-foreground max-w-[240px]">
              {file.name}
            </span>
          </>
        )}
        <div className="ml-auto">
          {file && (
            <Button variant="ghost" size="sm" onClick={handleReset} className="text-xs">
              New scan
            </Button>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {!hasFile ? (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="h-full overflow-y-auto"
            >
              <div className="mx-auto max-w-4xl p-6 lg:p-8 space-y-6">
                <div>
                  <h1 className="text-lg font-semibold tracking-tight">New scan</h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Upload a document to extract all important information automatically.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_300px]">
                  <DropZone file={null} onFileChange={handleFileChange} />
                  <RecentDocuments />
                </div>
                <div>
                  <h2 className="mb-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Document origins
                  </h2>
                  <DocumentMap />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="workspace"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="h-full overflow-y-auto"
            >
              <div className="mx-auto max-w-5xl p-4 lg:p-6 space-y-5">
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-[340px_1fr]">
                  {/* Left: preview + scan button */}
                  <div className="space-y-4">
                    <div className="h-64 lg:h-80">
                      <DropZone file={file} onFileChange={handleFileChange} />
                    </div>
                    <Button
                      className="w-full"
                      size="lg"
                      disabled={loading}
                      onClick={handleScan}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Scanning document…
                        </>
                      ) : result ? (
                        "Re-scan document"
                      ) : (
                        "Scan document"
                      )}
                    </Button>
                  </div>

                  {/* Right: results */}
                  <div className="min-w-0">
                    {loading && (
                      <div className="flex items-center gap-3 rounded-lg border bg-card p-6">
                        <Loader2 className="h-5 w-5 shrink-0 animate-spin text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Reading document…</p>
                          <p className="text-xs text-muted-foreground">
                            OCR and data extraction in progress
                          </p>
                        </div>
                      </div>
                    )}

                    {error && (
                      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                        <p className="text-sm font-medium">Extraction failed</p>
                        <p className="mt-1 text-xs text-muted-foreground">{error}</p>
                      </div>
                    )}

                    {result && <ResultsTable result={result} />}

                    {!loading && !error && !result && (
                      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
                        <p className="text-sm text-muted-foreground">
                          Click &quot;Scan document&quot; to extract data
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
