"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getYogaStudioById } from "@/components/yoga/useYogaStudio";

type EventType = "vinyasa" | "yin" | "power" | "meditation" | "sound" | "prenatal" | "breath" | "reset";
type CalEvent = { time: string; name: string; type: EventType; dur: string; teacher: string; spots: number | null };

const T: Record<EventType, { bg: string; border: string; text: string; label: string }> = {
  vinyasa: { bg: "#fef9ec", border: "#fde68a", text: "#854d0e", label: "Vinyasa" },
  yin: { bg: "#f5f3ff", border: "#ddd6fe", text: "#5b21b6", label: "Yin Yoga" },
  power: { bg: "#f0fdf4", border: "#bbf7d0", text: "#166534", label: "Power" },
  meditation: { bg: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8", label: "Meditation" },
  sound: { bg: "#eef2ff", border: "#c7d2fe", text: "#4338ca", label: "Sound Bath" },
  prenatal: { bg: "#fdf2f8", border: "#f5d0e8", text: "#9d174d", label: "Prenatal" },
  breath: { bg: "#f0fdfa", border: "#99f6e4", text: "#115e59", label: "Breathwork" },
  reset: { bg: "#f8fafc", border: "#e2e8f0", text: "#475569", label: "Reset" },
};

// Demo schedule (matches calendar demo)
const EVENTS: Record<number, CalEvent[]> = {
  2: [
    { time: "7:00 AM", name: "Vinyasa Flow", type: "vinyasa", dur: "45m", teacher: "Maya Chen", spots: 4 },
    { time: "12:00 PM", name: "Breathwork", type: "breath", dur: "30m", teacher: "Tom Wu", spots: 10 },
  ],
  7: [
    { time: "10:00 AM", name: "Sound Bath", type: "sound", dur: "75m", teacher: "Leo Santos", spots: 14 },
    { time: "4:00 PM", name: "Restorative Yin", type: "yin", dur: "90m", teacher: "James Rivera", spots: 9 },
  ],
  12: [
    { time: "6:30 AM", name: "Power Core", type: "power", dur: "45m", teacher: "Sarah Kim", spots: 7 },
    { time: "8:00 PM", name: "Yin Yoga", type: "yin", dur: "60m", teacher: "James Rivera", spots: 4 },
  ],
  16: [
    { time: "7:00 AM", name: "Morning Vinyasa", type: "vinyasa", dur: "45m", teacher: "Maya Chen", spots: 3 },
    { time: "12:00 PM", name: "Midday Reset", type: "reset", dur: "30m", teacher: "Various", spots: null },
    { time: "6:00 PM", name: "Evening Flow", type: "vinyasa", dur: "60m", teacher: "Maya Chen", spots: 0 },
    { time: "8:30 PM", name: "Yoga Nidra", type: "yin", dur: "45m", teacher: "James Rivera", spots: 12 },
  ],
  21: [
    { time: "8:00 AM", name: "Vinyasa Flow", type: "vinyasa", dur: "45m", teacher: "Maya Chen", spots: 6 },
    { time: "10:00 AM", name: "Sound Bath", type: "sound", dur: "75m", teacher: "Leo Santos", spots: 11 },
  ],
  24: [
    { time: "7:00 AM", name: "Breathwork", type: "breath", dur: "30m", teacher: "Tom Wu", spots: 8 },
    { time: "8:00 PM", name: "Yin Yoga", type: "yin", dur: "60m", teacher: "James Rivera", spots: 6 },
  ],
};

export default function YogaTodayPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const studioId = sp.get("studio") || "prana";
  const studio = useMemo(() => getYogaStudioById(studioId), [studioId]);

  // Keep "today" consistent with our demo month (March 2026).
  const todayDay = useMemo(() => {
    const d = new Date();
    return d.getDate();
  }, []);

  const events = useMemo(() => EVENTS[todayDay] ?? [], [todayDay]);

  function book(ev: CalEvent) {
    const params = new URLSearchParams();
    params.set("studio", studioId);
    params.set("month", "2026-03");
    params.set("day", String(todayDay));
    params.set("time", ev.time);
    params.set("name", ev.name);
    params.set("teacher", ev.teacher);
    params.set("dur", ev.dur);
    router.push(`/yoga/booking?${params.toString()}`);
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Today&apos;s Classes</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-1">
            {studio ? (
              <>
                {studio.name} · {studio.city}
              </>
            ) : (
              "Classes happening today."
            )}
          </p>
        </div>
        <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
          {new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
        </div>
      </div>

      <div className="mt-5 grid lg:grid-cols-2 gap-4">
        {events.map((ev) => {
          const ts = T[ev.type];
          const isFull = ev.spots === 0;
          return (
            <div key={`${ev.time}-${ev.name}`} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-zinc-900 dark:text-white font-bold truncate">{ev.name}</div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-300 mt-1">
                    {ev.time} · {ev.dur} · {ev.teacher}
                  </div>
                </div>
                <span
                  className="text-[10px] font-bold uppercase px-2 py-1 rounded-full border"
                  style={{ background: ts.bg, borderColor: ts.border, color: ts.text }}
                >
                  {ts.label}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between gap-4">
                <div>
                  {ev.spots === null ? (
                    <span className="text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-1 rounded-full">Open</span>
                  ) : isFull ? (
                    <span className="text-xs font-semibold bg-red-50 border border-red-200 text-red-700 px-2.5 py-1 rounded-full">Full</span>
                  ) : (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full border" style={{ background: ts.bg, borderColor: ts.border, color: ts.text }}>
                      {ev.spots} spots left
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  disabled={isFull}
                  onClick={() => book(ev)}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    isFull ? "bg-zinc-200 text-zinc-500 cursor-not-allowed dark:bg-zinc-800 dark:text-zinc-400" : "bg-indigo-600 hover:bg-indigo-700 text-white"
                  }`}
                >
                  Book
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {events.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-5 text-sm text-zinc-600 dark:text-zinc-300">
          No classes scheduled for today in this demo.
        </div>
      ) : null}
    </div>
  );
}
