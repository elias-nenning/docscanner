"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useYogaBookings } from "@/components/yoga/useYogaBookings";
import type { YogaBooking } from "@/components/yoga/useYogaBookings";

function toDate(month: string, day: number) {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, day);
}

function fmt(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function parseHour(time: string) {
  const raw = time.trim().toUpperCase();
  const m = raw.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/);
  if (!m) return 9;
  let h = Number(m[1]);
  const min = Number(m[2]);
  const ampm = m[3];
  if (ampm === "PM" && h < 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  return h + min / 60;
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "Y";
  return `${parts[0][0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
}

function styleChip(name: string) {
  const n = name.toLowerCase();
  if (n.includes("yin")) return "bg-violet-50 border-violet-200 text-violet-700";
  if (n.includes("sound")) return "bg-indigo-50 border-indigo-200 text-indigo-700";
  if (n.includes("power")) return "bg-emerald-50 border-emerald-200 text-emerald-700";
  if (n.includes("breath")) return "bg-teal-50 border-teal-200 text-teal-700";
  return "bg-amber-50 border-amber-200 text-amber-700";
}

export default function YogaCalendarPage() {
  const { bookings, removeBooking } = useYogaBookings();
  const [weekStart, setWeekStart] = useState<Date>(() => new Date(2026, 2, 16));
  const [selected, setSelected] = useState<YogaBooking | null>(null);
  const hours = useMemo(() => Array.from({ length: 17 }).map((_, i) => 6 + i), []);
  const rowHeight = 64; // px

  const days = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      return d;
    });
  }, [weekStart]);

  const byDay = useMemo(() => {
    const map = new Map<string, typeof bookings>();
    const start = new Date(weekStart);
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 7);
    for (const b of bookings) {
      const d = toDate(b.month, b.day);
      if (d < start || d >= end) continue;
      const key = fmt(d);
      map.set(key, [...(map.get(key) ?? []), b]);
    }
    return map;
  }, [bookings, weekStart]);

  const visibleCount = useMemo(() => {
    return days.reduce((acc, d) => acc + (byDay.get(fmt(d))?.length ?? 0), 0);
  }, [days, byDay]);

  const rangeLabel = `${days[0]?.toLocaleDateString(undefined, { month: "short", day: "numeric" })} - ${days[6]?.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;

  function shiftWeek(offset: number) {
    setWeekStart((prev) => {
      const d = new Date(prev);
      d.setDate(prev.getDate() + offset * 7);
      return d;
    });
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">My Calendar</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-1">Week view with real timetable layout.</p>
        </div>
        <div className="text-sm font-semibold bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 rounded-xl text-zinc-700 dark:text-zinc-200">
          {bookings.length} total
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button onClick={() => shiftWeek(-1)} className="h-9 w-9 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200">
            {"<"}
          </button>
          <button onClick={() => setWeekStart(new Date(2026, 2, 16))} className="rounded-xl border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800">
            This week
          </button>
          <button onClick={() => shiftWeek(1)} className="h-9 w-9 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200">
            {">"}
          </button>
          <div className="ml-2 text-sm font-semibold text-zinc-700 dark:text-zinc-200">{rangeLabel}</div>
        </div>
        <div className="text-xs font-semibold bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full">
          {visibleCount} sessions this week
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <div className="min-w-[1100px] bg-white dark:bg-zinc-900">
          <div className="sticky top-0 z-20 grid grid-cols-[86px_repeat(7,minmax(0,1fr))] border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/95 dark:bg-zinc-950/95 backdrop-blur">
            <div className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Time</div>
            {days.map((d) => {
              const key = fmt(d);
              const count = byDay.get(key)?.length ?? 0;
              return (
                <div key={`head-${key}`} className="px-3 py-3 border-l border-zinc-200 dark:border-zinc-800">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    {d.toLocaleDateString(undefined, { weekday: "short" })}
                  </div>
                  <div className="text-sm font-bold text-zinc-900 dark:text-white mt-0.5">{d.toLocaleDateString(undefined, { month: "2-digit", day: "2-digit" })}</div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-300 mt-0.5">{count} sessions</div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-[86px_repeat(7,minmax(0,1fr))]">
            <div className="border-r border-zinc-200 dark:border-zinc-800">
              {hours.map((h) => (
                <div key={`h-${h}`} className="h-16 px-3 border-b border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400 flex items-start pt-1.5">
                  {String(h).padStart(2, "0")}:00
                </div>
              ))}
            </div>

            {days.map((d) => {
              const key = fmt(d);
              const items = byDay.get(key) ?? [];
              return (
                <div key={`col-${key}`} className="relative border-r border-zinc-200 dark:border-zinc-800 last:border-r-0" style={{ height: rowHeight * hours.length }}>
                  {hours.map((h) => (
                    <div key={`line-${key}-${h}`} className="h-16 border-b border-zinc-100 dark:border-zinc-800" />
                  ))}

                  {items.map((b) => {
                    const hour = parseHour(b.time);
                    const top = Math.max(0, (hour - 6) * rowHeight + 4);
                    const chip = styleChip(b.name);
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setSelected(b)}
                        className="absolute left-1.5 right-1.5 rounded-xl border bg-white dark:bg-zinc-900 shadow-sm p-2 text-left hover:shadow-md transition"
                        style={{ top, minHeight: 58 }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-[11px] font-bold text-zinc-900 dark:text-white truncate">{b.time}</div>
                            <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">{b.name}</div>
                          </div>
                          <span className={`text-[10px] font-semibold border px-2 py-0.5 rounded-full ${chip}`}>{b.paidWith}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {visibleCount === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 p-8 text-center">
          <div className="text-4xl mb-2">🗓️</div>
          <div className="text-base font-bold text-zinc-900 dark:text-white">No classes booked this week</div>
          <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-1">Book a class and it will appear in this calendar grid.</p>
          <Link href="/yoga/schedule" className="inline-flex mt-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl">
            Browse schedule
          </Link>
        </div>
      ) : null}

      {selected ? (
        <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px] flex justify-end">
          <div className="w-full max-w-md h-full bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 p-5 overflow-auto">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Session details</div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white mt-1">{selected.name}</h2>
              </div>
              <button onClick={() => setSelected(null)} className="h-8 w-8 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800">
                ×
              </button>
            </div>

            <div className="mt-5 space-y-3">
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3">
                <div className="text-xs text-zinc-500 dark:text-zinc-400">Date & time</div>
                <div className="text-sm font-semibold text-zinc-900 dark:text-white mt-1">
                  {selected.month}-{String(selected.day).padStart(2, "0")} · {selected.time} · {selected.dur}
                </div>
              </div>
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center">{initials(selected.teacher || "Yoga")}</div>
                <div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">Instructor</div>
                  <div className="text-sm font-semibold text-zinc-900 dark:text-white">{selected.teacher || "TBD"}</div>
                </div>
              </div>
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3">
                <div className="text-xs text-zinc-500 dark:text-zinc-400">Studio</div>
                <div className="text-sm font-semibold text-zinc-900 dark:text-white mt-1">{selected.studioId}</div>
              </div>
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3">
                <div className="text-xs text-zinc-500 dark:text-zinc-400">Payment</div>
                <div className="text-sm font-semibold text-zinc-900 dark:text-white mt-1 capitalize">
                  {selected.paidWith} · EUR {selected.priceEUR}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => {
                  removeBooking(selected.id);
                  setSelected(null);
                }}
                className="w-full rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 px-4 py-2.5 text-sm font-semibold transition"
              >
                Cancel booking
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
