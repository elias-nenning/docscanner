"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type EventType = "vinyasa" | "yin" | "power" | "meditation" | "sound" | "prenatal" | "breath" | "reset";
type CalEvent = { time: string; name: string; type: EventType; dur: string; teacher: string; spots: number | null };

const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// March 2026 starts on Sunday.
const WEEKS: Array<Array<{ d: number; cur: boolean }>> = [
  [{ d: 1, cur: true }, { d: 2, cur: true }, { d: 3, cur: true }, { d: 4, cur: true }, { d: 5, cur: true }, { d: 6, cur: true }, { d: 7, cur: true }],
  [{ d: 8, cur: true }, { d: 9, cur: true }, { d: 10, cur: true }, { d: 11, cur: true }, { d: 12, cur: true }, { d: 13, cur: true }, { d: 14, cur: true }],
  [{ d: 15, cur: true }, { d: 16, cur: true }, { d: 17, cur: true }, { d: 18, cur: true }, { d: 19, cur: true }, { d: 20, cur: true }, { d: 21, cur: true }],
  [{ d: 22, cur: true }, { d: 23, cur: true }, { d: 24, cur: true }, { d: 25, cur: true }, { d: 26, cur: true }, { d: 27, cur: true }, { d: 28, cur: true }],
  [{ d: 29, cur: true }, { d: 30, cur: true }, { d: 31, cur: true }, { d: 1, cur: false }, { d: 2, cur: false }, { d: 3, cur: false }, { d: 4, cur: false }],
];

const T: Record<EventType, { bg: string; border: string; text: string; dot: string; label: string }> = {
  vinyasa: { bg: "#fef9ec", border: "#fde68a", text: "#854d0e", dot: "#f59e0b", label: "Vinyasa" },
  yin: { bg: "#f5f3ff", border: "#ddd6fe", text: "#5b21b6", dot: "#8b5cf6", label: "Yin Yoga" },
  power: { bg: "#f0fdf4", border: "#bbf7d0", text: "#166534", dot: "#22c55e", label: "Power" },
  meditation: { bg: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8", dot: "#3b82f6", label: "Meditation" },
  sound: { bg: "#eef2ff", border: "#c7d2fe", text: "#4338ca", dot: "#6366f1", label: "Sound Bath" },
  prenatal: { bg: "#fdf2f8", border: "#f5d0e8", text: "#9d174d", dot: "#ec4899", label: "Prenatal" },
  breath: { bg: "#f0fdfa", border: "#99f6e4", text: "#115e59", dot: "#14b8a6", label: "Breathwork" },
  reset: { bg: "#f8fafc", border: "#e2e8f0", text: "#475569", dot: "#94a3b8", label: "Reset" },
};

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

export default function YogaCalendarDemo({ embedded = false }: { embedded?: boolean }) {
  const router = useRouter();
  const sp = useSearchParams();
  const studioId = sp.get("studio") || "prana";

  const [selectedDay, setSelectedDay] = useState(16);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const dayName = DAY_NAMES[(selectedDay - 1) % 7];
  const selectedEvents = useMemo(() => EVENTS[selectedDay] ?? [], [selectedDay]);
  const selectedEvent = useMemo(() => {
    if (!selectedKey) return selectedEvents[0] ?? null;
    const [, d, time, name] = selectedKey.split("-");
    const dayNum = Number(d);
    const list = EVENTS[dayNum] ?? [];
    return list.find((ev) => ev.time === time && ev.name === name) ?? selectedEvents[0] ?? null;
  }, [selectedKey, selectedEvents]);

  function book(ev: CalEvent) {
    const params = new URLSearchParams();
    params.set("studio", studioId);
    params.set("month", "2026-03");
    params.set("day", String(selectedDay));
    params.set("time", ev.time);
    params.set("name", ev.name);
    params.set("teacher", ev.teacher);
    params.set("dur", ev.dur);
    router.push(`/yoga/booking?${params.toString()}`);
  }

  return (
    <div className={`w-full ${embedded ? "" : "min-h-[calc(100vh-200px)]"} bg-gradient-to-b from-indigo-500/10 to-transparent`}>
      <div className="p-4 lg:p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-lg font-extrabold text-zinc-900 tracking-tight">March 2026</div>
            <div className="text-xs text-zinc-600">Studio schedule</div>
          </div>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-xl text-sm font-semibold" onClick={() => setSelectedDay(16)}>
            Today
          </button>
        </div>

        <div className="flex gap-4 items-start">
          <div className="flex-1 min-w-0 bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="grid grid-cols-7 border-b border-zinc-200">
              {DAY_SHORT.map((d) => (
                <div key={d} className="py-3 text-center text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
                  {d}
                </div>
              ))}
            </div>
            <div className="divide-y divide-zinc-200">
              {WEEKS.map((week, wi) => (
                <div key={wi} className="grid grid-cols-7">
                  {week.map((cell, di) => {
                    const isToday = cell.cur && cell.d === 16;
                    const isSelectedDay = cell.cur && cell.d === selectedDay;
                    const evts = cell.cur ? EVENTS[cell.d] ?? [] : [];
                    const visible = evts.slice(0, 2);
                    const more = evts.length - visible.length;
                    return (
                      <div
                        key={`${wi}-${di}`}
                        className={`h-[120px] border-r border-zinc-200 last:border-r-0 p-2 cursor-${cell.cur ? "pointer" : "default"} ${
                          isToday ? "bg-indigo-50" : isSelectedDay ? "bg-zinc-50" : ""
                        }`}
                        onClick={() => cell.cur && setSelectedDay(cell.d)}
                      >
                        <div className="flex justify-end">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              isToday ? "bg-indigo-600 text-white" : cell.cur ? "text-zinc-700" : "text-zinc-300"
                            }`}
                          >
                            {cell.d}
                          </div>
                        </div>
                        <div className="mt-1 flex flex-col gap-1">
                          {visible.map((ev) => {
                            const ts = T[ev.type];
                            const key = `cur-${cell.d}-${ev.time}-${ev.name}`;
                            return (
                              <button
                                key={key}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedDay(cell.d);
                                  setSelectedKey(key);
                                }}
                                className="text-left rounded-lg px-2 py-1 border text-[10px] font-semibold truncate"
                                style={{
                                  background: ts.bg,
                                  borderColor: ts.border,
                                  color: ts.text,
                                }}
                              >
                                {ev.time.replace(":00", "").replace(" AM", "am").replace(" PM", "pm")} {ev.name}
                              </button>
                            );
                          })}
                          {more > 0 ? <div className="text-[10px] text-zinc-500 font-semibold pl-1">+{more} more</div> : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <div className="w-[320px] shrink-0">
            <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm">
              <div className="text-[10px] font-bold tracking-wider uppercase text-zinc-500">
                {selectedDay === 16 ? "Today" : "March"} · {dayName}
              </div>
              <div className="text-4xl font-extrabold text-zinc-900 mt-1">{selectedDay}</div>
              <div className="text-sm text-zinc-600 mt-1">{selectedEvents.length ? `${selectedEvents.length} classes scheduled` : "No classes"}</div>
            </div>

            <div className="mt-3 flex flex-col gap-2">
              {selectedEvents.map((ev, i) => {
                const ts = T[ev.type];
                const isFull = ev.spots === 0;
                const key = `cur-${selectedDay}-${ev.time}-${ev.name}`;
                const selected = selectedKey ? selectedKey === key : i === 0;
                return (
                  <div key={key} className={`bg-white border rounded-2xl p-4 shadow-sm ${selected ? "border-indigo-200" : "border-zinc-200"}`} onClick={() => setSelectedKey(key)}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-bold text-zinc-900 truncate">{ev.name}</div>
                        <div className="text-sm text-zinc-600 mt-1">
                          {ev.time} · {ev.dur}
                        </div>
                        <div className="text-sm text-zinc-600">{ev.teacher}</div>
                      </div>
                      <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-full border" style={{ background: ts.bg, borderColor: ts.border, color: ts.text }}>
                        {ts.label}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3">
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
                        onClick={(e) => {
                          e.stopPropagation();
                          book(ev);
                        }}
                        className={`px-3 py-2 rounded-xl text-sm font-semibold border transition ${
                          isFull ? "bg-zinc-100 text-zinc-400 border-zinc-200 cursor-not-allowed" : "bg-white hover:bg-zinc-50 text-zinc-900 border-zinc-200"
                        }`}
                      >
                        Book
                      </button>
                    </div>
                  </div>
                );
              })}

              {selectedEvents.length === 0 ? (
                <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-sm text-zinc-600">No sessions for this day.</div>
              ) : null}
            </div>

            {/* Book-now pop-up */}
            {selectedEvent ? (
              <div className="mt-3 bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-sm font-bold text-zinc-900 truncate">{selectedEvent.name}</div>
                  <div className="text-xs text-zinc-600 truncate">
                    {selectedEvent.time} · {selectedEvent.teacher}
                  </div>
                </div>
                <button
                  type="button"
                  disabled={selectedEvent.spots === 0}
                  onClick={() => book(selectedEvent)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                    selectedEvent.spots === 0 ? "bg-white border border-zinc-200 text-zinc-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 text-white"
                  }`}
                >
                  Book now
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

