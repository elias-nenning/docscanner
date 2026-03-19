"use client";

import { useMemo, useState } from "react";
import Nav from "@/components/Nav";

export default function Dashboard() {
  const [view, setView] = useState<"studio" | "platform">("studio");

  const classes = [
    { id: 1, name: "Morning Flow Yoga", time: "07:00", instructor: "Anna", capacity: 20, booked: 14 },
    { id: 2, name: "Power Pilates", time: "09:00", instructor: "Marc", capacity: 16, booked: 16 },
    { id: 3, name: "Midday Stretch", time: "12:00", instructor: "Sara", capacity: 20, booked: 5 },
    { id: 4, name: "Core & Breathe", time: "13:30", instructor: "Anna", capacity: 18, booked: 7 },
    { id: 5, name: "Vinyasa Flow", time: "16:00", instructor: "Tom", capacity: 20, booked: 12 },
    { id: 6, name: "Peak Hour Yoga", time: "18:00", instructor: "Sara", capacity: 20, booked: 20 },
    { id: 7, name: "Evening Pilates", time: "19:30", instructor: "Marc", capacity: 16, booked: 15 },
    { id: 8, name: "Late Flow", time: "20:30", instructor: "Tom", capacity: 14, booked: 4 },
  ];

  function getIncentive(booked: number, capacity: number) {
    const rate = booked / capacity;
    if (rate < 0.4) return { label: "⭐ €5 credit", color: "bg-green-500/10 text-green-700 border border-green-500/20" };
    if (rate < 0.6) return { label: "⭐ €3 credit", color: "bg-amber-500/10 text-amber-700 border border-amber-500/20" };
    return null;
  }

  function getFillColor(booked: number, capacity: number) {
    const rate = booked / capacity;
    if (rate >= 0.9) return "bg-red-500";
    if (rate >= 0.6) return "bg-amber-500";
    return "bg-green-500";
  }

  const totalCapacity = classes.reduce((s, c) => s + c.capacity, 0);
  const totalBooked = classes.reduce((s, c) => s + c.booked, 0);
  const fillRate = Math.round((totalBooked / totalCapacity) * 100);
  const incentiveCount = classes.filter((c) => getIncentive(c.booked, c.capacity)).length;

  const studioPortfolio = useMemo(
    () => [
      { id: "zenith", name: "Zenith Yoga", city: "Berlin", classesPerDay: 8, avgFill: 78, creditsOffered: 14 },
      { id: "prana", name: "Prana Studio", city: "Berlin", classesPerDay: 6, avgFill: 66, creditsOffered: 9 },
      { id: "lotus", name: "Lotus House", city: "Berlin", classesPerDay: 5, avgFill: 71, creditsOffered: 7 },
      { id: "pulse", name: "Pulse Studio", city: "Berlin", classesPerDay: 7, avgFill: 74, creditsOffered: 10 },
    ],
    [],
  );

  const totalStudios = studioPortfolio.length;
  const totalClasses = studioPortfolio.reduce((s, x) => s + x.classesPerDay, 0);
  const totalCredits = studioPortfolio.reduce((s, x) => s + x.creditsOffered, 0);
  const avgNetworkFill = Math.round(studioPortfolio.reduce((s, x) => s + x.avgFill, 0) / totalStudios);
  const topStudio = [...studioPortfolio].sort((a, b) => b.avgFill - a.avgFill)[0];

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <Nav />
      <div className="p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">⚡ FlowFill Dashboard</h1>
            <p className="text-zinc-500 mt-1">
              {view === "studio" ? "Zenith Yoga Studio - Today's schedule and credit incentives" : "Network overview across all active studios"}
            </p>
          </div>

          <div className="mb-8 inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white p-1.5">
            <button
              onClick={() => setView("studio")}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                view === "studio" ? "bg-indigo-600 text-white" : "text-zinc-700 hover:bg-zinc-100"
              }`}
            >
              Studio View
            </button>
            <button
              onClick={() => setView("platform")}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                view === "platform" ? "bg-indigo-600 text-white" : "text-zinc-700 hover:bg-zinc-100"
              }`}
            >
              Platform Overview
            </button>
          </div>

          {view === "studio" ? (
            <>
              <div className="grid grid-cols-4 gap-4 mb-8">
                {[
                  { label: "Overall Fill Rate", value: `${fillRate}%`, color: "text-indigo-600" },
                  { label: "Classes Today", value: classes.length, color: "text-emerald-600" },
                  { label: "Active Incentives", value: incentiveCount, color: "text-amber-600" },
                  { label: "Empty Spots", value: totalCapacity - totalBooked, color: "text-rose-600" },
                ].map((stat, i) => (
                  <div key={i} className="bg-white border border-zinc-200 rounded-xl p-5">
                    <p className="text-zinc-500 text-sm mb-1">{stat.label}</p>
                    <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
                <div className="p-5 border-b border-zinc-200">
                  <h2 className="font-semibold text-lg">Class Schedule</h2>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-200">
                      {["Time", "Class", "Instructor", "Spots", "Fill Rate", "Incentive"].map((h) => (
                        <th key={h} className="text-left text-zinc-500 text-xs uppercase tracking-wider px-5 py-3">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {classes.map((cls, i) => {
                      const incentive = getIncentive(cls.booked, cls.capacity);
                      const rowFillRate = Math.round((cls.booked / cls.capacity) * 100);
                      return (
                        <tr key={cls.id} className={`border-b border-zinc-200/70 hover:bg-zinc-50 transition ${i === classes.length - 1 ? "border-0" : ""}`}>
                          <td className="px-5 py-4 font-mono text-zinc-600 text-sm">{cls.time}</td>
                          <td className="px-5 py-4 font-semibold">{cls.name}</td>
                          <td className="px-5 py-4 text-zinc-600">{cls.instructor}</td>
                          <td className="px-5 py-4 text-zinc-600">
                            {cls.booked}/{cls.capacity}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-zinc-200 rounded-full h-1.5">
                                <div className={`h-1.5 rounded-full ${getFillColor(cls.booked, cls.capacity)}`} style={{ width: `${rowFillRate}%` }} />
                              </div>
                              <span className="text-sm text-zinc-600">{rowFillRate}%</span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            {incentive ? <span className={`text-xs px-3 py-1 rounded-full font-semibold ${incentive.color}`}>{incentive.label}</span> : <span className="text-zinc-400">-</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-5 gap-4 mb-8">
                {[
                  { label: "Studios Offered", value: totalStudios, color: "text-indigo-600" },
                  { label: "Classes / Day", value: totalClasses, color: "text-emerald-600" },
                  { label: "Credits Offered", value: totalCredits, color: "text-amber-600" },
                  { label: "Avg Network Fill", value: `${avgNetworkFill}%`, color: "text-sky-600" },
                  { label: "Top Studio", value: topStudio?.name ?? "-", color: "text-rose-600" },
                ].map((stat, i) => (
                  <div key={i} className="bg-white border border-zinc-200 rounded-xl p-5">
                    <p className="text-zinc-500 text-sm mb-1">{stat.label}</p>
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
                <div className="p-5 border-b border-zinc-200">
                  <h2 className="font-semibold text-lg">Studio Performance Snapshot</h2>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-200">
                      {["Studio", "City", "Classes / Day", "Average Fill", "Credits Incentives", "Status"].map((h) => (
                        <th key={h} className="text-left text-zinc-500 text-xs uppercase tracking-wider px-5 py-3">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {studioPortfolio.map((s, i) => (
                      <tr key={s.id} className={`border-b border-zinc-200/70 hover:bg-zinc-50 transition ${i === studioPortfolio.length - 1 ? "border-0" : ""}`}>
                        <td className="px-5 py-4 font-semibold">{s.name}</td>
                        <td className="px-5 py-4 text-zinc-600">{s.city}</td>
                        <td className="px-5 py-4 text-zinc-600">{s.classesPerDay}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-zinc-200 rounded-full h-1.5">
                              <div className={`h-1.5 rounded-full ${s.avgFill >= 80 ? "bg-emerald-500" : s.avgFill >= 65 ? "bg-amber-500" : "bg-rose-500"}`} style={{ width: `${s.avgFill}%` }} />
                            </div>
                            <span className="text-sm text-zinc-600">{s.avgFill}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-zinc-600">{s.creditsOffered}</td>
                        <td className="px-5 py-4">
                          <span
                            className={`text-xs px-3 py-1 rounded-full font-semibold ${
                              s.avgFill >= 75
                                ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-700 border border-amber-500/20"
                            }`}
                          >
                            {s.avgFill >= 75 ? "Healthy" : "Needs Attention"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
