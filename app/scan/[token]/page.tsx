"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ResultsTable } from "@/components/ResultsTable";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, FileText, RotateCcw } from "lucide-react";
import { addToHistory } from "@/lib/history";
import { geocode } from "@/lib/geocode";
import { ALL_SCAN_FIELDS, type ScanResult } from "@/lib/types";

type Stage = "loading" | "scanning" | "done" | "error";

export default function QuickScanPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("loading");
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState("");
  const fileRef = useRef<File | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    async function run() {
      try {
        // Fetch the uploaded file
        const res = await fetch(`/api/quick-upload/${token}`);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "File not found");
        }

        const name = decodeURIComponent(
          res.headers.get("X-File-Name") || "document",
        );
        const type = res.headers.get("X-File-Type") || "application/pdf";
        const blob = await res.blob();
        const file = new File([blob], name, { type });
        fileRef.current = file;
        setFileName(name);

        // Auto-scan
        setStage("scanning");
        const fd = new FormData();
        fd.append("file", file);
        fd.append("schema", JSON.stringify(ALL_SCAN_FIELDS));
        const scanRes = await fetch("/api/scan", {
          method: "POST",
          body: fd,
        });
        const json = await scanRes.json();
        if (!scanRes.ok) throw new Error(json.error || `HTTP ${scanRes.status}`);

        const scanResult = json as ScanResult;
        const filledFields: Record<
          string,
          { wert: string; konfidenz: number }
        > = {};
        for (const [key, val] of Object.entries(scanResult.felder)) {
          if (val.wert) filledFields[key] = val;
        }
        scanResult.felder = filledFields;
        setResult(scanResult);
        setStage("done");

        // Save to history + geocode
        const addressKeys = [
          "Aussteller",
          "Empfänger",
          "Adresse",
          "Absender",
          "Firma",
          "Standort",
        ];
        let location:
          | { lat: number; lng: number; address: string }
          | undefined;
        for (const key of addressKeys) {
          const field = scanResult.felder[key];
          if (field?.wert) {
            const geo = await geocode(field.wert);
            if (geo) {
              location = {
                lat: geo.lat,
                lng: geo.lng,
                address: field.wert,
              };
              break;
            }
          }
        }
        addToHistory({
          fileName: name,
          fileType: type,
          fileSize: file.size,
          documentType: scanResult.dokument_typ,
          fieldCount: Object.keys(filledFields).length,
          confidence: Math.round(scanResult.ocr_konfidenz * 100),
          location,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        setStage("error");
      }
    }

    run();
  }, [token]);

  async function handleRescan() {
    if (!fileRef.current) return;
    setStage("scanning");
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", fileRef.current);
      fd.append("schema", JSON.stringify(ALL_SCAN_FIELDS));
      const res = await fetch("/api/scan", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      const scanResult = json as ScanResult;
      const filledFields: Record<
        string,
        { wert: string; konfidenz: number }
      > = {};
      for (const [key, val] of Object.entries(scanResult.felder)) {
        if (val.wert) filledFields[key] = val;
      }
      scanResult.felder = filledFields;
      setResult(scanResult);
      setStage("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setStage("error");
    }
  }

  return (
    <div className="flex h-screen flex-col">
      <header className="flex h-12 shrink-0 items-center border-b px-4 lg:px-6">
        <button
          onClick={() => router.push("/")}
          className="text-sm font-semibold tracking-tight hover:opacity-70 transition-opacity"
        >
          ScanDesk
        </button>
        {fileName && (
          <>
            <span className="mx-2.5 text-border">/</span>
            <span className="truncate text-sm text-muted-foreground max-w-[300px]">
              {fileName}
            </span>
          </>
        )}
        <div className="ml-auto flex items-center gap-2">
          {stage === "done" && (
            <Button variant="ghost" size="sm" onClick={handleRescan} className="text-xs">
              <RotateCcw className="h-3.5 w-3.5" />
              Re-scan
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/")}
            className="text-xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Home
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl p-4 lg:p-6">
          {(stage === "loading" || stage === "scanning") && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 gap-4"
            >
              <div className="relative">
                <FileText className="h-10 w-10 text-muted-foreground" />
                <Loader2 className="absolute -right-2 -bottom-2 h-5 w-5 animate-spin text-primary" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">
                  {stage === "loading"
                    ? "Loading document…"
                    : "Scanning document…"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {stage === "loading"
                    ? "Fetching file from Finder"
                    : "OCR and data extraction in progress"}
                </p>
              </div>
            </motion.div>
          )}

          {stage === "error" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 gap-4"
            >
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 max-w-md w-full">
                <p className="text-sm font-medium">Scan failed</p>
                <p className="mt-1 text-xs text-muted-foreground">{error}</p>
              </div>
              <div className="flex gap-2">
                {fileRef.current && (
                  <Button size="sm" onClick={handleRescan}>
                    Try again
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/")}
                >
                  Go home
                </Button>
              </div>
            </motion.div>
          )}

          {stage === "done" && result && <ResultsTable result={result} />}
        </div>
      </div>
    </div>
  );
}
