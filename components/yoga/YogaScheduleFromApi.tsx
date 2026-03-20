"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { backend, type BackendClassInstance, type BackendStudio } from "@/components/api/backend";
import { StudioPanel } from "@/components/ds/studio";
import { fillCreditLabel } from "@/lib/fill-credit-tiers";
import { formatScheduleDayHeader } from "@/lib/format-schedule-date";
import { cn } from "@/lib/utils";

function bookingHref(studioId: number, row: BackendClassInstance) {
  const [y, m, d] = row.date.split("-");
  const month = `${y}-${m}`;
  const params = new URLSearchParams({
    studio: String(studioId),
    instance: String(row.id),
    month,
    day: String(Number(d)),
    time: row.time ?? "",
    name: row.class_type ?? "Class",
    teacher: row.instructor ?? "",
    dur: "",
    price: String(row.price_eur ?? 20),
  });
  return `/yoga/booking?${params.toString()}`;
}

export default function YogaScheduleFromApi({ studioId }: { studioId: number }) {
  const [studio, setStudio] = useState<BackendStudio | null>(null);
  const [classes, setClasses] = useState<BackendClassInstance[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setErr(null);
    setClasses(null);
    setStudio(null);

    Promise.all([backend.getStudio(studioId), backend.listClasses({ studio_id: studioId })])
      .then(([st, cls]) => {
        if (cancelled) return;
        setStudio(st);
        const open = cls.filter((c) => String(c.status).toLowerCase() !== "cancelled");
        open.sort((a, b) => {
          const da = a.date.localeCompare(b.date);
          if (da !== 0) return da;
          return (a.time ?? "").localeCompare(b.time ?? "");
        });
        setClasses(open);
      })
      .catch((e) => {
        if (cancelled) return;
        setErr(e instanceof Error ? e.message : "Failed to load schedule");
        setClasses([]);
        setStudio(null);
      });

    return () => {
      cancelled = true;
    };
  }, [studioId]);

  const grouped = useMemo(() => {
    if (!classes?.length) return [];
    const m = new Map<string, BackendClassInstance[]>();
    for (const c of classes) {
      const list = m.get(c.date) ?? [];
      list.push(c);
      m.set(c.date, list);
    }
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [classes]);

  const loading = !err && classes === null;

  return (
    <div className="space-y-3 px-3 pb-3 pt-2 sm:px-4 sm:pb-4">
      {!loading && !err && classes != null && classes.length > 0 ? (
        <p className="text-[11px] text-muted-foreground">
          <span className="font-medium text-foreground">{studio?.name ?? `Studio ${studioId}`}</span>
          <span className="mx-1.5 text-border">·</span>
          {classes.length} session{classes.length === 1 ? "" : "s"} · {grouped.length} day{grouped.length === 1 ? "" : "s"}
        </p>
      ) : null}

      {err ? (
        <StudioPanel className="border-destructive/30 bg-destructive/5 px-3 py-2.5 text-xs text-destructive">{err}</StudioPanel>
      ) : null}

      {loading ? (
        <div className="space-y-2" aria-busy>
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-muted/60" />
          ))}
        </div>
      ) : null}

      {!loading && !err && classes?.length === 0 ? (
        <StudioPanel className="px-3 py-6 text-center text-xs text-muted-foreground">
          No sessions in range for this studio. Try another day or location.
        </StudioPanel>
      ) : null}

      <div className="space-y-4">
        {grouped.map(([date, rows]) => (
          <div key={date} className="space-y-2">
            <div className="flex items-baseline justify-between gap-2 px-0.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {formatScheduleDayHeader(date)}
              </h3>
              <span className="font-mono text-[10px] text-muted-foreground/80">{date}</span>
            </div>
            <StudioPanel className="divide-y divide-border p-0">
              {rows.map((row) => {
                const cap = row.capacity ?? 0;
                const booked = row.bookings_count ?? 0;
                const full = cap > 0 && booked >= cap;
                const spots = cap > 0 ? Math.max(0, cap - booked) : null;
                const sessionDate = row.date ? `${row.date}T12:00:00` : undefined;
                const tier = !full && cap > 0 ? fillCreditLabel(booked, cap, sessionDate) : null;
                const pct = cap > 0 ? Math.min(100, Math.round((booked / cap) * 100)) : 0;

                return (
                  <div
                    key={row.id}
                    className="flex flex-col gap-3 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                  >
                    <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-[4.5rem_1fr] sm:items-center">
                      <div className="font-mono text-xs font-semibold tabular-nums text-muted-foreground">{row.time ?? "-"}</div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-foreground">{row.class_type ?? "Class"}</div>
                        <div className="mt-0.5 truncate text-[11px] text-muted-foreground">{row.instructor ?? "Instructor TBD"}</div>
                        {cap > 0 ? (
                          <div className="mt-1.5 flex max-w-[12rem] items-center gap-2">
                            <div className="h-1 flex-1 rounded-full bg-muted">
                              <div className="h-1 rounded-full bg-primary/70" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-[10px] tabular-nums text-muted-foreground">{pct}%</span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                        <span className="font-semibold tabular-nums text-foreground">€{row.price_eur ?? 20}</span>
                        {spots != null ? (
                          <span className="rounded-md bg-muted/80 px-1.5 py-0.5 tabular-nums text-foreground/90">
                            {spots} left
                          </span>
                        ) : null}
                        {tier ? (
                          <span className="rounded-md border border-amber-500/25 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800 dark:text-amber-200">
                            {tier}
                          </span>
                        ) : null}
                      </div>
                      {full ? (
                        <span className="rounded-lg border border-destructive/25 bg-destructive/10 px-2.5 py-1 text-[11px] font-semibold text-destructive">
                          Full
                        </span>
                      ) : (
                        <Link
                          href={bookingHref(studioId, row)}
                          className={cn(
                            "inline-flex justify-center rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground",
                            "transition hover:opacity-90",
                          )}
                        >
                          Book
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </StudioPanel>
          </div>
        ))}
      </div>
    </div>
  );
}
