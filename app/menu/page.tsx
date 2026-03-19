"use client";

import { useRouter } from "next/navigation";
import AuthGate from "@/components/auth/AuthGate";
import { YOGA_STUDIOS } from "@/components/yoga/useYogaStudio";

export default function MenuPage() {
  const router = useRouter();

  return (
    <AuthGate>
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-4xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Choose a club</h1>
            <p className="text-zinc-600 dark:text-zinc-300 mt-1">Pick a studio in your area to view schedule and book.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {YOGA_STUDIOS.map((s) => (
              <button
                key={s.id}
                onClick={() => router.push(`/yoga/schedule?studio=${encodeURIComponent(s.id)}`)}
                className="text-left bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-zinc-900 dark:text-white font-bold truncate">{s.name}</div>
                    <div className="text-zinc-600 dark:text-zinc-300 text-sm mt-1">
                      {s.city} · {s.distance}
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 shrink-0">★ {s.rating}</div>
                </div>
                <div className="mt-4 inline-flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-xl text-sm font-semibold">
                  View schedule
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </AuthGate>
  );
}

