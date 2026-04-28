"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { AppShell, ShellActionButton } from "@/components/AppShell";
import { PageIntro } from "@/components/PageIntro";
import { BatchDocumentSidebar } from "@/components/BatchDocumentSidebar";
import { DocumentResultSummary } from "@/components/DocumentResultSummary";
import { Card, CardContent } from "@/components/ui/card";
import { ErgebnisFullTable } from "@/components/ErgebnisFullTable";
import {
  loadScanSession,
  clearScanSession,
  type ScanSessionPayload,
} from "@/lib/scan-session";

export default function ErgebnisPage() {
  const router = useRouter();
  const [payload, setPayload] = useState<ScanSessionPayload | null>(null);
  const [ready, setReady] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const data = loadScanSession();
    if (!data) {
      router.replace("/");
      return;
    }
    setPayload(data);
    setActiveIndex(0);
    setReady(true);
  }, [router]);

  function handleNewScan() {
    clearScanSession();
    router.push("/");
  }

  if (!ready || !payload) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Lade Ergebnis...
      </div>
    );
  }

  const docs = payload.documents;
  const activeItem = docs[Math.min(activeIndex, docs.length - 1)];
  const headerTitle =
    docs.length === 1 ? docs[0].fileName : `${docs.length} Dokumente`;
  const successCount = docs.filter((item) => item.status === "success" && item.result).length;
  const failedCount = docs.filter((item) => item.status === "failed").length;

  return (
    <AppShell
      title="ScanDesk"
      subtitle={headerTitle}
      backHref="/"
      backLabel="Start"
      onBackClick={() => clearScanSession()}
      maxWidthClassName="max-w-7xl"
      action={
        <ShellActionButton onClick={handleNewScan}>
            <Sparkles className="h-3.5 w-3.5" />
            Neuer Scan
        </ShellActionButton>
      }
    >
      <PageIntro
        eyebrow="Auswertung"
        title="Ergebnisse auf einen Blick pruefen"
        description={
          docs.length > 1
            ? "Der Batch wurde dokumentweise verarbeitet. Wechsle links zwischen allen Dateien und pruefe pro Dokument Qualitaet, Vollstaendigkeit und Rohtext."
            : "Die Auswertung fasst Dokumenttyp, OCR-Qualitaet und alle extrahierten Felder in einer strukturierten Ansicht zusammen."
        }
      />

      <Card className="mb-6 border-border/70 bg-card/80 shadow-sm backdrop-blur-sm">
        <CardContent className="grid gap-4 p-5 md:grid-cols-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Scanlauf
            </p>
            <p className="mt-2 text-lg font-semibold">{docs.length} Dokumente</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Erfolgreich verarbeitet
            </p>
            <p className="mt-2 text-lg font-semibold">{successCount}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Mit Fehlern
            </p>
            <p className="mt-2 text-lg font-semibold">{failedCount}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        {docs.length > 1 ? (
          <BatchDocumentSidebar
            documents={docs}
            activeIndex={activeIndex}
            onSelect={setActiveIndex}
          />
        ) : (
          <div className="hidden xl:block" />
        )}

        <div className="space-y-6">
          <DocumentResultSummary item={activeItem} />

          {activeItem.result ? (
            <ErgebnisFullTable
              result={activeItem.result}
              exportBaseName={activeItem.fileName}
            />
          ) : (
            <Card className="border-border/70 bg-card/80 shadow-sm backdrop-blur-sm">
              <CardContent className="p-6 text-sm text-muted-foreground">
                Fuer dieses Dokument liegt kein auswertbares Ergebnis vor.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppShell>
  );
}
