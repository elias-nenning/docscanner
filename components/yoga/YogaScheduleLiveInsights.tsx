"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRightIcon, CalendarDays } from "lucide-react";
import { useYogaBookings } from "@/components/yoga/useYogaBookings";
import { StudioIncentiveLivePanel } from "@/components/yoga/StudioIncentiveLivePanel";
import { getYogaStudioById } from "@/components/yoga/useYogaStudio";

function InsightsInner() {
  const sp = useSearchParams();
  const studioId = sp.get("studio") || "prana";
  const { bookings, hydrated } = useYogaBookings();

  const upcoming = [...bookings]
    .filter((b) => b.studioId === studioId)
    .sort((a, b) => {
      const da = `${a.month}-${String(a.day).padStart(2, "0")}`;
      const db = `${b.month}-${String(b.day).padStart(2, "0")}`;
      if (da !== db) return da.localeCompare(db);
      return a.time.localeCompare(b.time);
    })
    .slice(0, 6);

  const studio = getYogaStudioById(studioId);

  return (
    <div className="space-y-4 md:space-y-5">
      <StudioIncentiveLivePanel studioId={studioId} />

      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm dark:bg-card/85">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="size-5 text-indigo-600 dark:text-indigo-400" aria-hidden />
            <h3 className="text-base font-semibold text-foreground">
              Upcoming reservations · {studio?.name ?? studioId}
            </h3>
          </div>
          <Link
            href="/yoga/my-calendar"
            className="inline-flex items-center gap-1 text-sm font-medium text-foreground underline-offset-4 hover:underline"
          >
            Full calendar
            <ArrowRightIcon className="size-3.5" aria-hidden />
          </Link>
        </div>
        {!hydrated ? (
          <div className="mt-4 h-20 animate-pulse rounded-xl bg-muted" />
        ) : upcoming.length === 0 ? (
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            No reservations for this studio yet. Select a class above and complete checkout; confirmed bookings appear
            here and in the attribution panel without refreshing the page.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-border/70">
            {upcoming.map((b) => (
              <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0">
                <div className="min-w-0">
                  <div className="font-semibold text-foreground">{b.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {b.month}-{String(b.day).padStart(2, "0")} · {b.time} · {b.teacher || "Instructor TBD"}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                      b.paidWith === "credits"
                        ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-200"
                        : "bg-muted text-foreground dark:bg-muted/80"
                    }`}
                  >
                    {b.paidWith === "credits" ? `€${b.priceEUR} credits` : b.paidWith}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export function YogaScheduleLiveInsights() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4 md:space-y-5">
          <div className="h-40 animate-pulse rounded-2xl bg-muted" />
          <div className="h-32 animate-pulse rounded-2xl bg-muted" />
        </div>
      }
    >
      <InsightsInner />
    </Suspense>
  );
}
