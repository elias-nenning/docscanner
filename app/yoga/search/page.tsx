"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { backend, type BackendStudio } from "@/components/api/backend";

export default function YogaSearchPage() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [studios, setStudios] = useState<BackendStudio[] | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);

  useMemo(() => {
    let cancelled = false;
    backend
      .listStudios()
      .then((s) => {
        if (cancelled) return;
        setStudios(s);
      })
      .catch((e) => {
        if (cancelled) return;
        setLoadErr(e instanceof Error ? e.message : "Failed to load studios");
        setStudios([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    const list = studios ?? [];
    if (!query) return list;
    return list.filter((s) => {
      const hay = `${s.name} ${s.style ?? ""} ${s.address ?? ""} ${s.rating ?? ""}`.toLowerCase();
      return hay.includes(query);
    });
  }, [q, studios]);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Search</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-1">Search clubs near you and jump into their schedule.</p>
        </div>
      </div>

      <div className="mt-5">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by club name, style, address…"
          className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
        />
        <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          {studios === null ? "Loading…" : `${results.length} result${results.length === 1 ? "" : "s"}`}
        </div>
      </div>

      <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((s) => (
          <button
            key={s.id}
            onClick={() => router.push(`/yoga/schedule?studio=${encodeURIComponent(String(s.id))}`)}
            className="text-left bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-zinc-900 dark:text-white font-bold truncate">{s.name}</div>
                {s.address ? <div className="text-zinc-600 dark:text-zinc-300 text-sm mt-1 truncate">{s.address}</div> : null}
              </div>
              {s.rating != null ? <div className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 shrink-0">★ {s.rating}</div> : null}
            </div>
            <div className="mt-4 inline-flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-xl text-sm font-semibold">
              View schedule
            </div>
          </button>
        ))}
      </div>

      {loadErr ? (
        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
          {loadErr}
        </div>
      ) : null}

      {studios !== null && results.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-5 text-sm text-zinc-600 dark:text-zinc-300">
          No clubs matched “{q.trim()}”. Try a different keyword (e.g. “Berlin”, “Prana”, “0.8”).
        </div>
      ) : null}
    </div>
  );
}
