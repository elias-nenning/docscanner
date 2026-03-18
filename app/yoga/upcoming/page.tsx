"use client";

import { useMemo } from "react";
import { useYogaBookings } from "@/components/yoga/useYogaBookings";

export default function YogaUpcomingPage() {
  const { bookings, removeBooking } = useYogaBookings();

  const items = useMemo(() => {
    return bookings.map((b) => ({
      id: b.id,
      date: `${b.month}-${String(b.day).padStart(2, "0")}`,
      title: b.name,
      meta: `${b.time}${b.teacher ? ` · ${b.teacher}` : ""} · ${b.studioId}`,
    }));
  }, [bookings]);

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Upcoming</h1>
          <p className="text-sm text-zinc-600 mt-1">Your scheduled classes.</p>
        </div>
      </div>

      <div className="mt-4 border border-zinc-200 rounded-2xl overflow-hidden divide-y divide-zinc-100">
        {items.map((it) => (
          <div key={it.id} className="px-4 py-3 bg-white flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="text-xs font-semibold text-zinc-500">{it.date}</div>
              <div className="text-sm font-semibold text-zinc-900 truncate">{it.title}</div>
              <div className="text-xs text-zinc-500 truncate">{it.meta}</div>
            </div>
            <button onClick={() => removeBooking(it.id)} className="text-sm font-semibold text-zinc-700 hover:text-zinc-900">
              Cancel
            </button>
          </div>
        ))}
        {items.length === 0 ? <div className="px-4 py-6 text-sm text-zinc-600 bg-zinc-50">No upcoming classes.</div> : null}
      </div>
    </div>
  );
}
