"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppShell, ShellActionButton } from "@/components/AppShell";
import { PageIntro } from "@/components/PageIntro";
import { ScanProgress } from "@/components/ScanProgress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { addToHistory } from "@/lib/history";
import { geocode } from "@/lib/geocode";
import { saveScanSession } from "@/lib/scan-session";
import { ALL_SCAN_FIELDS, type ScanResult } from "@/lib/types";

type Stage = "loading" | "scanning" | "error";

export default function QuickScanPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("loading");
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const fileRef = useRef<File | null>(null);

  const runScan = useCallback(
    async (file: File) => {
      setStage("scanning");
      setError("");
      const fd = new FormData();
      fd.append("file", file);
      fd.append("schema", JSON.stringify(ALL_SCAN_FIELDS));
      const scanRes = await fetch("/api/scan", { method: "POST", body: fd });
      const json = await scanRes.json();
      if (!scanRes.ok) throw new Error(json.error || `HTTP ${scanRes.status}`);

      const scanResult = json as ScanResult;
      const filledCount = Object.values(scanResult.felder).filter((v) =>
        v.wert?.trim(),
      ).length;

      const addressKeys = [
        "Aussteller",
        "Empfänger",
        "Adresse",
        "Absender",
        "Firma",
        "Standort",
      ];
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
        fieldCount: filledCount,
        confidence: Math.round(scanResult.ocr_konfidenz * 100),
        location,
      });

      saveScanSession({
        documents: [
          {
            scanId: typeof json.scan_id === "string" ? json.scan_id : crypto.randomUUID(),
            status: "success",
            result: scanResult,
            fileName: file.name,
            fileType: file.type,
            scannedAt: new Date().toISOString(),
            retryable: true,
          },
        ],
      });

      router.replace("/ergebnis");
    },
    [router],
  );

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
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
        if (cancelled) return;
        fileRef.current = file;
        setFileName(name);

        await runScan(file);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Unknown error");
        setStage("error");
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [token, runScan]);

  async function handleRescan() {
    if (!fileRef.current) return;
    try {
      await runScan(fileRef.current);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setStage("error");
    }
  }

  return (
    <AppShell
      title="ScanDesk"
      subtitle={fileName || "Quick Scan"}
      onTitleClick={() => router.push("/")}
      backHref="/"
      backLabel="Start"
      maxWidthClassName="max-w-5xl"
      action={
        <ShellActionButton variant="outline" onClick={() => router.push("/")}>
          <Sparkles className="h-3.5 w-3.5" />
          Neuer Scan
        </ShellActionButton>
      }
    >
      <PageIntro
        eyebrow="Quick Upload"
        title="Datei wird direkt aus dem Finder verarbeitet"
        description="Die Datei wird geladen, einmal vollstaendig gescannt und danach automatisch in die strukturierte Ergebnistabelle uebernommen."
      />

      <div className="mx-auto max-w-4xl">
          {(stage === "loading" || stage === "scanning") && (
            <ScanProgress active batch={{ current: 1, total: 1 }} />
          )}

          {stage === "error" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="mx-auto max-w-xl border-destructive/30 bg-destructive/5">
                <CardHeader>
                  <CardTitle className="text-base">Scan fehlgeschlagen</CardTitle>
                  <CardDescription>
                    Die Datei konnte nicht vollstaendig verarbeitet werden.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                <p className="mt-1 text-xs text-muted-foreground">{error}</p>
                  <div className="flex gap-2">
                    {fileRef.current && (
                      <Button size="sm" onClick={handleRescan}>
                        Erneut versuchen
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => router.push("/")}>
                      Zur Startseite
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
      </div>
    </AppShell>
  );
}
