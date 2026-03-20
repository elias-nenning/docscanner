"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPinIcon, SearchIcon } from "lucide-react";
import { YOGA_STUDIOS, useYogaStudio, type YogaStudio } from "@/components/yoga/useYogaStudio";
import { cn } from "@/lib/utils";

function studioHaystack(s: YogaStudio) {
  return `${s.name} ${s.city} ${s.distance} ${s.rating}`.toLowerCase();
}

export function StudioHeaderSearch({ className }: { className?: string }) {
  const router = useRouter();
  const { setActiveStudio } = useYogaStudio();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return YOGA_STUDIOS;
    return YOGA_STUDIOS.filter((s) => studioHaystack(s).includes(q));
  }, [query]);

  useEffect(() => {
    setHighlight(0);
  }, [query, open]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  function pick(studio: YogaStudio) {
    setActiveStudio(studio.id);
    router.push(`/yoga/schedule?studio=${encodeURIComponent(studio.id)}`);
    setQuery("");
    setOpen(false);
    inputRef.current?.blur();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter") && document.activeElement === inputRef.current) {
      setOpen(true);
      return;
    }
    if (!open) return;
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      inputRef.current?.blur();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((i) => Math.min(i + 1, Math.max(0, results.length - 1)));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((i) => Math.max(i - 1, 0));
    }
    if (e.key === "Enter" && results[highlight]) {
      e.preventDefault();
      pick(results[highlight]);
    }
  }

  return (
    <div ref={rootRef} className={cn("relative w-full", className)}>
      <div
        className={cn(
          "flex h-8 items-center gap-1.5 rounded-full border bg-background/90 px-2.5 shadow-sm backdrop-blur-sm transition-colors",
          "border-border/80 focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/25",
          open && "border-ring/40 ring-2 ring-ring/20"
        )}
      >
        <SearchIcon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
        <input
          ref={inputRef}
          type="search"
          autoComplete="off"
          spellCheck={false}
          placeholder="Search studios..."
          aria-expanded={open}
          aria-controls="studio-search-results"
          aria-activedescendant={open && results[highlight] ? `studio-opt-${results[highlight].id}` : undefined}
          className="min-w-0 flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />
      </div>

      {open ? (
        <div
          id="studio-search-results"
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-[min(320px,50vh)] overflow-auto rounded-xl border border-border bg-popover py-1 shadow-lg"
        >
          {results.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">No studios match your search.</p>
          ) : (
            results.map((s, i) => (
              <button
                key={s.id}
                type="button"
                role="option"
                id={`studio-opt-${s.id}`}
                aria-selected={i === highlight}
                className={cn(
                  "flex w-full items-start gap-3 px-3 py-2.5 text-left text-sm transition-colors",
                  i === highlight ? "bg-muted" : "hover:bg-muted/70"
                )}
                onMouseEnter={() => setHighlight(i)}
                onClick={() => pick(s)}
              >
                <MapPinIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-popover-foreground">{s.name}</span>
                  <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                    {s.city} · {s.distance} · ★ {s.rating}
                  </span>
                </span>
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
