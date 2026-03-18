"use client";

import { useMemo } from "react";
import { useYogaBookings } from "@/components/yoga/useYogaBookings";

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

export default function YogaCalendarPage() {
  const { bookings, removeBooking } = useYogaBookings();

  // Match the demo "today" (March 16, 2026) so the UI is consistent.
  const start = useMemo(() => new Date(2026, 2, 16), []);
  const days = useMemo(() => Array.from({ length: 7 }).map((_, i) => new Date(2026, 2, 16 + i)), []);

  const byDay = useMemo(() => {
    const map = new Map<string, typeof bookings>();
    for (const b of bookings) {
      const d = toDate(b.month, b.day);
      // Only within next 7 days window
      const end = new Date(start);
      end.setDate(end.getDate() + 7);
      if (d < start || d >= end) continue;
      const key = fmt(d);
      map.set(key, [...(map.get(key) ?? []), b]);
    }
    return map;
  }, [bookings, start]);

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">My Calendar</h1>
          <p className="text-sm text-zinc-600 mt-1">Next 7 days — only your booked sessions.</p>
        </div>
        <div className="text-sm font-semibold bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-xl text-zinc-700">{bookings.length} total</div>
      </div>

      <div className="mt-5 space-y-3">
        {days.map((d) => {
          const key = fmt(d);
          const items = byDay.get(key) ?? [];
          return (
            <div key={key} className="border border-zinc-200 rounded-2xl overflow-hidden">
              <div className="px-4 py-3 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between">
                <div className="text-sm font-bold text-zinc-900">{key}</div>
                <div className="text-xs font-semibold text-zinc-600">{items.length} sessions</div>
              </div>
              <div className="divide-y divide-zinc-100">
                {items.map((b) => (
                  <div key={b.id} className="px-4 py-3 bg-white flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-zinc-900 truncate">
                        {b.time} · {b.name}
                      </div>
                      <div className="text-xs text-zinc-500 truncate">
                        {b.teacher ? `${b.teacher} · ` : ""}
                        {b.studioId} · Paid with {b.paidWith}
                      </div>
                    </div>
                    <button onClick={() => removeBooking(b.id)} className="text-sm font-semibold text-zinc-700 hover:text-zinc-900">
                      Remove
                    </button>
                  </div>
                ))}
                {items.length === 0 ? <div className="px-4 py-4 text-sm text-zinc-600 bg-white">No bookings.</div> : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
