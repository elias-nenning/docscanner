"use client";

import { Suspense, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useYogaStudio } from "@/components/yoga/useYogaStudio";

function YogaHomeContent() {
  const studios = useMemo(
    () => [
      { id: "prana", name: "Prana", city: "Berlin", distance: "0.8km", rating: 4.8, tags: ["Vinyasa", "Yin", "Breath"] },
      { id: "zenith", name: "Zenith", city: "Berlin", distance: "1.7km", rating: 4.6, tags: ["Power", "Mobility"] },
      { id: "lotus", name: "Lotus House", city: "Berlin", distance: "2.5km", rating: 4.7, tags: ["Sound", "Yin"] },
      { id: "pulse", name: "Pulse Studio", city: "Berlin", distance: "3.1km", rating: 4.5, tags: ["Flow", "Strength"] },
    ],
    [],
  );
  const router = useRouter();
  const { studioId, setActiveStudio } = useYogaStudio();

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Welcome</h1>
          <p className="text-sm text-zinc-600 mt-1">Choose a yoga studio in your area.</p>
        </div>
        <div className="text-xs font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 px-3 py-1 rounded-full">Studios</div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
        {studios.map((s) => {
          const active = s.id === studioId;
          return (
            <button
              key={s.id}
              onClick={() => {
                setActiveStudio(s.id);
                router.push(`/yoga/schedule?studio=${encodeURIComponent(s.id)}`);
              }}
              className={`text-left border rounded-2xl p-5 transition ${
                active ? "border-indigo-300 bg-indigo-50" : "border-zinc-200 bg-white hover:bg-zinc-50"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-zinc-900 font-bold truncate">{s.name}</div>
                  <div className="text-zinc-600 text-sm mt-1">
                    {s.city} · {s.distance}
                  </div>
                </div>
                <div className="text-sm font-semibold text-zinc-700 shrink-0">★ {s.rating}</div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {s.tags.map((t) => (
                  <span key={t} className="text-xs font-semibold bg-white border border-zinc-200 text-zinc-700 px-2.5 py-1 rounded-full">
                    {t}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function YogaHomePage() {
  return (
    <Suspense fallback={<div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm animate-pulse h-64" />}>
      <YogaHomeContent />
    </Suspense>
  );
}
