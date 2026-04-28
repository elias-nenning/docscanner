"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, FileSearch, ScanLine, Table2 } from "lucide-react";

const STEPS = [
  { label: "Datei wird gelesen", icon: FileSearch },
  { label: "OCR – Text erkennen", icon: ScanLine },
  { label: "Felder zuordnen", icon: Table2 },
] as const;

export function ScanProgress({
  active,
  batch,
}: {
  active: boolean;
  /** Mehrfach-Scan: aktuelles Dokument (1-basiert) und Gesamtanzahl */
  batch?: { current: number; total: number };
}) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!active) {
      setIdx(0);
      return;
    }
    const t = setInterval(() => {
      setIdx((i) => (i + 1) % STEPS.length);
    }, 1100);
    return () => clearInterval(t);
  }, [active]);

  if (!active) return null;

  const StepIcon = STEPS[idx].icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ type: "spring", damping: 28, stiffness: 320 }}
      className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-b from-card to-card/40 p-8 shadow-lg"
    >
      <motion.div
        className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-primary/20"
        initial={{ scaleX: 0, originX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="relative">
          <motion.div
            className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border/60 bg-background/80"
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </motion.div>
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card shadow-md"
          >
            <StepIcon className="h-4 w-4 text-foreground" />
          </motion.div>
        </div>
        <div className="space-y-2">
          <AnimatePresence mode="wait">
            <motion.p
              key={idx}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="text-base font-medium tracking-tight"
            >
              {STEPS[idx].label}
            </motion.p>
          </AnimatePresence>
          <p className="text-xs text-muted-foreground">
            {batch && batch.total > 1 ? (
              <>
                Dokument {batch.current} von {batch.total} – danach die nächste Auswertung.
              </>
            ) : (
              <>Einen Moment – danach öffnet sich die vollständige Ergebnistabelle.</>
            )}
          </p>
        </div>
        <div className="flex gap-1.5">
          {STEPS.map((_, i) => (
            <motion.span
              key={i}
              className="h-1.5 rounded-full bg-muted"
              animate={{
                width: i === idx ? 24 : 6,
                backgroundColor: i === idx ? "hsl(var(--foreground) / 0.35)" : "hsl(var(--muted))",
              }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
