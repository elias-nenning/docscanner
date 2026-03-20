"use client";

import { cn } from "@/lib/utils";

type StudiosDataRibbonProps = {
  loading: boolean;
  error: string | null;
  source: "api" | "local";
  /** `dark` = light text on slate marketing pages */
  tone?: "default" | "dark";
  className?: string;
};

export function StudiosDataRibbon({ loading, error, source, tone = "default", className }: StudiosDataRibbonProps) {
  const isDark = tone === "dark";
  if (!loading && !error && source !== "api") return null;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] leading-snug",
        isDark ? "text-slate-400" : "text-muted-foreground",
        className,
      )}
    >
      {loading ? (
        <div
          className={cn(
            "h-1 min-w-[5rem] max-w-[10rem] flex-1 animate-pulse rounded-full",
            isDark ? "bg-slate-600" : "bg-muted",
          )}
          aria-hidden
        />
      ) : null}
      {source === "api" ? (
        <span
          className={cn(
            "inline-flex shrink-0 items-center rounded-md border px-1.5 py-0.5 font-semibold uppercase tracking-wide",
            isDark
              ? "border-emerald-500/35 bg-emerald-500/15 text-emerald-200"
              : "border-emerald-500/25 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200",
          )}
        >
          Live data
        </span>
      ) : null}
      {error ? (
        <span className={cn("font-medium", isDark ? "text-amber-300" : "text-amber-700 dark:text-amber-300")}>
          {error}
        </span>
      ) : null}
    </div>
  );
}
