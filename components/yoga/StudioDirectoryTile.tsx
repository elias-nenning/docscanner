"use client";

import { MapPin, Star } from "lucide-react";
import type { StudioSearchRow } from "@/lib/search-content";
import { cn } from "@/lib/utils";

type StudioDirectoryTileProps = {
  studio: StudioSearchRow;
  active?: boolean;
  /** `menu` = directory/marketing page (compact, no tag chips). */
  layout: "home" | "search" | "menu";
  onSelect: () => void;
};

export function StudioDirectoryTile({ studio, active, layout, onSelect }: StudioDirectoryTileProps) {
  const isSearch = layout === "search";
  const isMenu = layout === "menu";
  const showTags = !isMenu;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "ff-panel rounded-xl p-3.5 text-left transition",
        active ? "border-primary/40 bg-primary/5 ring-2 ring-primary/20" : "hover:border-border hover:bg-muted/30",
        (isSearch || isMenu) && "hover:border-primary/25",
      )}
    >
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-foreground">{studio.name}</div>
          <div
            className={cn(
              "mt-0.5 flex items-center gap-1 text-xs text-muted-foreground",
              isSearch && "tabular-nums",
            )}
          >
            {isSearch ? <MapPin className="size-3 shrink-0 opacity-70" aria-hidden /> : null}
            <span className="truncate">
              {studio.city}
              {studio.distance && studio.distance !== "-" ? ` · ${studio.distance}` : ""}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1 text-xs font-medium tabular-nums text-muted-foreground">
          <Star className="size-3.5 fill-amber-400 text-amber-500" aria-hidden />
          {studio.rating}
        </div>
      </div>
      <p className={cn("mt-2 text-xs leading-snug text-muted-foreground", isSearch ? "" : "line-clamp-3")}>
        {studio.blurb}
      </p>
      {showTags ? (
        <div className="mt-2.5 flex flex-wrap gap-1">
          {(isSearch ? studio.tags : studio.tags.slice(0, 3)).map((t) => (
            <span
              key={t}
              className={cn(
                "rounded-md border px-2 py-0.5 text-[11px] font-medium",
                isSearch ? "border-border bg-muted/30 text-foreground/80" : "border-border text-muted-foreground",
              )}
            >
              {t}
            </span>
          ))}
        </div>
      ) : null}
      {isSearch ? (
        <span className="mt-2.5 inline-block text-xs font-semibold text-primary sm:text-sm">Schedule →</span>
      ) : null}
      {isMenu ? (
        <span className="mt-2.5 inline-flex items-center rounded-lg bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground shadow-sm">
          Schedule
        </span>
      ) : null}
    </button>
  );
}
