"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FeldAnzeigeProps {
  label: string;
  wert: string;
  konfidenz?: number;
  onSave?: (next: string) => void;
}

export function FeldAnzeige({
  label,
  wert,
  konfidenz,
  onSave,
}: FeldAnzeigeProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(wert);
  const [copied, setCopied] = useState(false);

  const confidence =
    typeof konfidenz === "number" ? Math.round(konfidenz * 100) : null;
  const level =
    confidence !== null
      ? confidence >= 80
        ? "high"
        : confidence >= 60
          ? "mid"
          : "low"
      : null;

  function handleCopy() {
    navigator.clipboard.writeText(value || wert).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="group rounded-lg border bg-card p-3 transition-colors hover:bg-accent/30">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="opacity-0 group-hover:opacity-100 transition-opacity rounded p-0.5 text-muted-foreground hover:text-foreground"
            title="Copy value"
          >
            {copied ? (
              <Check className="h-3 w-3 text-emerald-500" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </button>
          {confidence !== null && (
            <span
              className={cn(
                "text-[11px] font-medium tabular-nums",
                level === "high" && "text-emerald-500",
                level === "mid" && "text-amber-500",
                level === "low" && "text-red-400"
              )}
            >
              {confidence}%
            </span>
          )}
        </div>
      </div>

      {editing ? (
        <Input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => {
            onSave?.(value);
            setEditing(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onSave?.(value);
              setEditing(false);
            }
            if (e.key === "Escape") {
              setValue(wert);
              setEditing(false);
            }
          }}
          className="mt-1.5 h-7 text-sm"
        />
      ) : (
        <p
          className="mt-1 text-sm cursor-text"
          onClick={() => setEditing(true)}
        >
          {value || "–"}
        </p>
      )}

      {confidence !== null && (
        <div className="mt-2.5 h-px w-full rounded-full bg-border overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${confidence}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={cn(
              "h-full rounded-full",
              level === "high" && "bg-emerald-500/60",
              level === "mid" && "bg-amber-500/60",
              level === "low" && "bg-red-500/60"
            )}
          />
        </div>
      )}
    </div>
  );
}
