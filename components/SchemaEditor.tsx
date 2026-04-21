"use client";

import { useState } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { SchemaFeld } from "@/lib/types";

interface SchemaEditorProps {
  felder: SchemaFeld[];
  onFelderChange: (felder: SchemaFeld[]) => void;
  onScan: () => void;
  scanDisabled: boolean;
  loading: boolean;
}

export function SchemaEditor({
  felder,
  onFelderChange,
  onScan,
  scanDisabled,
  loading,
}: SchemaEditorProps) {
  const [neuesFeld, setNeuesFeld] = useState("");

  function toggleFeld(index: number) {
    const next = felder.map((f, i) =>
      i === index ? { ...f, aktiv: !f.aktiv } : f
    );
    onFelderChange(next);
  }

  function addCustom() {
    const trimmed = neuesFeld.trim();
    if (!trimmed) return;
    if (felder.some((f) => f.name.toLowerCase() === trimmed.toLowerCase()))
      return;
    onFelderChange([...felder, { name: trimmed, aktiv: true, custom: true }]);
    setNeuesFeld("");
  }

  function removeCustom(index: number) {
    onFelderChange(felder.filter((_, i) => i !== index));
  }

  const aktiveCount = felder.filter((f) => f.aktiv).length;

  return (
    <div className="space-y-5">
      <div>
        <h3 className="mb-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Fields to extract
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {felder
            .filter((f) => !f.custom)
            .map((feld) => {
              const idx = felder.indexOf(feld);
              return (
                <button
                  key={feld.name}
                  onClick={() => toggleFeld(idx)}
                  className={cn(
                    "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                    feld.aktiv
                      ? "border-foreground/15 bg-foreground/[0.07] text-foreground"
                      : "border-transparent bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  {feld.name}
                </button>
              );
            })}
        </div>
      </div>

      <div>
        <h3 className="mb-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Custom fields
        </h3>
        {felder.filter((f) => f.custom).length > 0 && (
          <div className="mb-2.5 flex flex-wrap gap-1.5">
            {felder
              .filter((f) => f.custom)
              .map((feld) => {
                const idx = felder.indexOf(feld);
                return (
                  <span
                    key={feld.name}
                    className="inline-flex items-center gap-1 rounded-md border border-foreground/15 bg-foreground/[0.07] px-2.5 py-1 text-xs font-medium"
                  >
                    {feld.name}
                    <button
                      onClick={() => removeCustom(idx)}
                      className="rounded-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                );
              })}
          </div>
        )}
        <div className="flex gap-2">
          <Input
            value={neuesFeld}
            onChange={(e) => setNeuesFeld(e.target.value)}
            placeholder="e.g. Kundennummer"
            className="h-8 text-xs"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustom();
              }
            }}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={addCustom}
            className="h-8 w-8 shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between border-t pt-4">
        <p className="text-xs text-muted-foreground tabular-nums">
          {aktiveCount} {aktiveCount === 1 ? "field" : "fields"} selected
        </p>
        <Button
          size="sm"
          disabled={scanDisabled || loading}
          onClick={onScan}
        >
          {loading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Extracting…
            </>
          ) : (
            "Extract data"
          )}
        </Button>
      </div>
    </div>
  );
}
