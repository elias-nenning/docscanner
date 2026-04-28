"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Layers3, ShieldCheck, TimerReset } from "lucide-react";
import { AppShell, ShellActionButton } from "@/components/AppShell";
import { PageIntro } from "@/components/PageIntro";
import { DropZone } from "@/components/DropZone";
import { RecentDocuments } from "@/components/RecentDocuments";
import { ScanProgress } from "@/components/ScanProgress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { addToHistory } from "@/lib/history";
import { geocode } from "@/lib/geocode";
import { saveScanSession, type ScanDocumentItem } from "@/lib/scan-session";
import { ALL_SCAN_FIELDS, type ScanResult } from "@/lib/types";

const DocumentMap = dynamic(() => import("@/components/DocumentMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] rounded-lg border bg-card animate-pulse" />
  ),
});

export default function HomePage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [batchProgress, setBatchProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);

  const handleFilesChange = useCallback((next: File[]) => {
    setFiles(next);
    if (next.length === 0) {
      setError(null);
    }
  }, []);

  async function handleScan() {
    if (files.length === 0) return;
    setLoading(true);
    setError(null);
    setBatchProgress({ current: 1, total: files.length });
    const documents: ScanDocumentItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setBatchProgress({ current: i + 1, total: files.length });
      try {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("schema", JSON.stringify(ALL_SCAN_FIELDS));
        const res = await fetch("/api/scan", { method: "POST", body: fd });
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.error || `HTTP ${res.status}`);
        }
        const scanResult = json as ScanResult;
        const scanId =
          typeof json.scan_id === "string" ? json.scan_id : crypto.randomUUID();

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

        documents.push({
          scanId,
          status: "success",
          result: scanResult,
          fileName: file.name,
          fileType: file.type,
          scannedAt: new Date().toISOString(),
          retryable: true,
        });
      } catch (err) {
        documents.push({
          scanId: crypto.randomUUID(),
          status: "failed",
          fileName: file.name,
          fileType: file.type,
          scannedAt: new Date().toISOString(),
          error: err instanceof Error ? err.message : "Unbekannter Fehler",
          retryable: true,
        });
      }
    }

    try {
      saveScanSession({ documents });
      await new Promise((r) => setTimeout(r, 380));
      router.push("/ergebnis");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
    } finally {
      setLoading(false);
      setBatchProgress(null);
    }
  }

  function handleReset() {
    setFiles([]);
    setError(null);
  }

  const hasFiles = files.length > 0;

  return (
    <AppShell
      title="ScanDesk"
      subtitle={
        hasFiles
          ? files.length === 1
            ? files[0].name
            : `${files.length} Dokumente im Scanlauf`
          : "Intelligente OCR fuer Dokumente und Stapel-Scans"
      }
      onTitleClick={hasFiles ? handleReset : undefined}
      action={
        hasFiles ? (
          <ShellActionButton variant="ghost" onClick={handleReset}>
            Neuer Scan
          </ShellActionButton>
        ) : null
      }
      maxWidthClassName="max-w-7xl"
    >
      <div className="overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {!hasFiles ? (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="overflow-y-auto"
            >
              <PageIntro
                eyebrow="Dokumentenplattform"
                title="Dokumente schnell erfassen und sauber auswerten"
                description="Lade einen einzelnen Beleg oder gleich einen ganzen Stapel hoch. ScanDesk liest jede Datei separat, extrahiert die wichtigsten Felder und zeigt die Auswertung uebersichtlich auf einer eigenen Ergebnisseite."
              />

              <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
                <Card className="overflow-hidden border-border/70 bg-card/80 shadow-lg backdrop-blur-sm">
                  <CardHeader className="border-b border-border/60">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <Badge variant="secondary" className="mb-3 rounded-md">
                          Upload
                        </Badge>
                        <CardTitle>Dateien fuer den Scan vorbereiten</CardTitle>
                        <CardDescription className="mt-2 max-w-2xl">
                          PDF, JPG, PNG, WEBP oder TIFF hochladen. Mehrere Dokumente
                          werden nacheinander verarbeitet, damit OCR und Feldzuordnung
                          stabil bleiben.
                        </CardDescription>
                      </div>
                      <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
                        <div className="rounded-lg border bg-background px-3 py-2">
                          <div className="flex items-center gap-2 font-medium text-foreground">
                            <Layers3 className="h-3.5 w-3.5" />
                            Stapel
                          </div>
                          <p className="mt-1">Bis zu 25 Dateien pro Durchlauf</p>
                        </div>
                        <div className="rounded-lg border bg-background px-3 py-2">
                          <div className="flex items-center gap-2 font-medium text-foreground">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Felder
                          </div>
                          <p className="mt-1">Mehr als 20 Datenpunkte je Dokument</p>
                        </div>
                        <div className="rounded-lg border bg-background px-3 py-2">
                          <div className="flex items-center gap-2 font-medium text-foreground">
                            <TimerReset className="h-3.5 w-3.5" />
                            Ablauf
                          </div>
                          <p className="mt-1">Direkte Weiterleitung zur Ergebnistabelle</p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <DropZone files={[]} onFilesChange={handleFilesChange} />
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  <RecentDocuments />
                  <Card className="border-border/70 bg-card/80 backdrop-blur-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Dokumentherkunft</CardTitle>
                      <CardDescription>
                        Letzte erkannte Standorte aus deinen Scans.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <DocumentMap />
                    </CardContent>
                  </Card>
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
              className="overflow-y-auto"
            >
              <PageIntro
                eyebrow="Scanlauf"
                title="Bereit fuer die Auswertung"
                description="Pruefe deine Auswahl, starte den OCR-Lauf und beobachte den Fortschritt. Jede Datei wird separat verarbeitet und danach in einer strukturierten Ergebnissicht zusammengefasst."
              />

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-[360px_1fr]">
                <div className="space-y-4">
                  <Card className="border-border/70 bg-card/80 backdrop-blur-sm">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-base">Aktueller Stapel</CardTitle>
                      <CardDescription>
                        {files.length === 1
                          ? "Ein Dokument ist bereit fuer den Scan."
                          : `${files.length} Dokumente werden nacheinander gescannt.`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="h-64 lg:h-80">
                      <DropZone files={files} onFilesChange={handleFilesChange} />
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
                            {files.length === 1
                              ? "Dokument wird gescannt…"
                              : `${files.length} Dokumente werden gescannt…`}
                          </>
                        ) : files.length === 1 ? (
                          "Dokument scannen"
                        ) : (
                          `${files.length} Dokumente scannen`
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <div className="min-w-0 space-y-4">
                  <Card className="border-border/70 bg-card/80 backdrop-blur-sm">
                    <CardHeader className="pb-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <CardTitle className="text-base">Status</CardTitle>
                          <CardDescription>
                            Fortschritt, Hinweise und Ergebnisuebergabe.
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className="rounded-md">
                          {loading
                            ? "OCR aktiv"
                            : files.length === 1
                              ? "1 Dokument bereit"
                              : `${files.length} Dokumente bereit`}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                    <AnimatePresence mode="wait">
                      {loading && (
                        <motion.div
                          key="progress"
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ScanProgress
                            active
                            batch={
                              batchProgress && batchProgress.total > 1
                                ? batchProgress
                                : undefined
                            }
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {!loading && error && (
                      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                        <p className="text-sm font-medium">Scan fehlgeschlagen</p>
                        <p className="mt-1 text-xs text-muted-foreground">{error}</p>
                      </div>
                    )}

                    {!loading && !error && (
                      <div className="grid gap-3 sm:grid-cols-3">
                        <div className="rounded-xl border bg-background p-4">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                            Verarbeitung
                          </p>
                          <p className="mt-2 text-sm font-medium">OCR pro Dokument</p>
                          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                            Jede Datei wird separat gelesen und strukturiert extrahiert.
                          </p>
                        </div>
                        <div className="rounded-xl border bg-background p-4">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                            Ausgabe
                          </p>
                          <p className="mt-2 text-sm font-medium">Vollstaendige Tabellen</p>
                          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                            Auch leere oder unsichere Felder bleiben sichtbar.
                          </p>
                        </div>
                        <div className="rounded-xl border bg-background p-4">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                            Navigation
                          </p>
                          <p className="mt-2 text-sm font-medium">Dokumentliste im Ergebnis</p>
                          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                            Bei Stapeln wechselst du direkt zwischen allen Auswertungen.
                          </p>
                        </div>
                      </div>
                    )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}
