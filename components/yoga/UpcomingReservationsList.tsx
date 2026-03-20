"use client";

import { useMemo } from "react";
import Link from "next/link";
import { CalendarPlus, MapPin, Sparkles } from "lucide-react";
import { StudioPanel } from "@/components/ds/studio";
import { useYogaBookings } from "@/components/yoga/useYogaBookings";
import { getYogaStudioById } from "@/components/yoga/useYogaStudio";

/** List of saved reservations (same source as week grid). */
export function UpcomingReservationsList() {
  const { bookings, removeBooking } = useYogaBookings();

  const items = useMemo(
    () =>
      bookings.map((b) => ({
        id: b.id,
        date: `${b.month}-${String(b.day).padStart(2, "0")}`,
        title: b.name,
        time: b.time,
        teacher: b.teacher,
        studioId: b.studioId,
        studioName: getYogaStudioById(b.studioId)?.name ?? b.studioId,
        paid: b.paidWith,
        price: b.priceEUR,
      })),
    [bookings],
  );

  const nextLabel = items[0]?.date ?? null;

  return (
      <div className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">All bookings</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Same sessions as the week grid · cancel or jump to the schedule.
            </p>
          </div>
          {nextLabel ? (
            <span className="ff-panel w-fit rounded-lg px-2 py-1 text-[10px] font-semibold text-muted-foreground">
              Next · {nextLabel}
            </span>
          ) : null}
        </div>

      {items.length > 0 ? (
        <div className="mb-1 grid gap-2 sm:grid-cols-3">
          <StudioPanel className="p-3">
            <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Held</div>
            <div className="mt-0.5 text-xl font-bold text-foreground">{items.length}</div>
            <p className="mt-0.5 text-[11px] text-muted-foreground">reservations</p>
          </StudioPanel>
          <StudioPanel className="p-3">
            <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Studios</div>
            <div className="mt-0.5 text-xl font-bold text-foreground">
              {new Set(items.map((i) => i.studioId)).size}
            </div>
            <p className="mt-0.5 text-[11px] text-muted-foreground">locations</p>
          </StudioPanel>
          <StudioPanel className="p-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Wallet mix</div>
            <div className="mt-0.5 flex flex-wrap gap-1 text-[11px] font-medium text-foreground">
              {[...new Set(items.map((i) => i.paid))].join(" · ") || "-"}
            </div>
            <p className="mt-0.5 text-[11px] text-muted-foreground">methods</p>
          </StudioPanel>
        </div>
      ) : null}

      <StudioPanel className="p-0">
        <div className="divide-y divide-border overflow-hidden rounded-xl border border-border">
          {items.map((it) => (
            <div key={it.id} className="flex flex-col gap-2 bg-card px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-muted-foreground">{it.date}</div>
                <div className="truncate text-sm font-semibold text-foreground">{it.title}</div>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                  <span>{it.time}</span>
                  {it.teacher ? <span>· {it.teacher}</span> : null}
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3 shrink-0" aria-hidden />
                    {it.studioName}
                  </span>
                </div>
                <div className="mt-1.5 inline-flex rounded-full border border-border px-2 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">
                  {it.paid} · €{it.price}
                </div>
              </div>
              <div className="flex shrink-0 gap-1.5">
                <Link
                  href={`/yoga/schedule?studio=${encodeURIComponent(it.studioId)}`}
                  className="rounded-md border border-border px-2.5 py-1.5 text-[11px] font-semibold text-primary hover:bg-muted"
                >
                  Grid
                </Link>
                <button
                  type="button"
                  onClick={() => removeBooking(it.id)}
                  className="rounded-md px-2.5 py-1.5 text-[11px] font-semibold text-muted-foreground hover:text-destructive"
                >
                  Cancel
                </button>
              </div>
            </div>
          ))}
          {items.length === 0 ? (
            <div className="bg-muted/30 px-4 py-8 text-center">
              <div className="mx-auto flex size-10 items-center justify-center rounded-lg border border-border bg-background text-primary">
                <CalendarPlus className="size-5" aria-hidden />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-foreground">No bookings yet</h3>
              <p className="mx-auto mt-1.5 max-w-md text-xs text-muted-foreground">
                Add a class from the schedule; it appears here and on the week view.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                <Link
                  href="/yoga/schedule"
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                >
                  <Sparkles className="size-3.5" aria-hidden />
                  Schedule
                </Link>
                <Link href="/dashboard/directory" className="inline-flex rounded-full border border-border px-3 py-1.5 text-xs font-semibold">
                  Studio directory
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </StudioPanel>
    </div>
  );
}
