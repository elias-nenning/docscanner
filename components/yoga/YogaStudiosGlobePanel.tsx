"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowRightIcon, Globe2Icon, MapPinIcon } from "lucide-react";
import { backend, isBackendConfigured, type BackendStudio } from "@/components/api/backend";
import { YOGA_STUDIOS } from "@/components/yoga/useYogaStudio";
import { studioWithCoordinates, type StudioWithCoords } from "@/lib/studioCoordinates";
import { markerIdForStudio, StudiosGlobe } from "@/components/studios-globe";

function fallbackStudios(): BackendStudio[] {
  return YOGA_STUDIOS.map((s, i) => ({
    id: -(i + 1),
    name: s.name,
    address: s.city,
    rating: s.rating,
    style: "Yoga",
  }));
}

function scheduleHref(s: BackendStudio) {
  if (s.id < 0) {
    const demo = YOGA_STUDIOS[-s.id - 1];
    return demo ? `/yoga/schedule?studio=${encodeURIComponent(demo.id)}` : "/yoga/schedule";
  }
  return `/yoga/schedule?studio=${encodeURIComponent(String(s.id))}`;
}

type YogaStudiosGlobePanelProps = {
  studioId: string;
  setActiveStudio: (id: string) => void;
};

export function YogaStudiosGlobePanel({ studioId, setActiveStudio }: YogaStudiosGlobePanelProps) {
  const router = useRouter();
  const [studios, setStudios] = useState<BackendStudio[]>([]);
  const [status, setStatus] = useState<"loading" | "api" | "fallback">("loading");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isBackendConfigured()) {
      setStudios(fallbackStudios());
      setStatus("fallback");
      return;
    }

    let cancelled = false;
    backend
      .listStudios()
      .then((list) => {
        if (cancelled) return;
        if (!list.length) {
          setStudios(fallbackStudios());
          setStatus("fallback");
          return;
        }
        setStudios(list);
        setStatus("api");
      })
      .catch(() => {
        if (cancelled) return;
        setErrorMsg("API unreachable");
        setStudios(fallbackStudios());
        setStatus("fallback");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const withCoords: StudioWithCoords[] = useMemo(() => studios.map(studioWithCoordinates), [studios]);

  function beforeNavigate(s: BackendStudio) {
    if (s.id < 0) {
      const demo = YOGA_STUDIOS[-s.id - 1];
      if (demo) setActiveStudio(demo.id);
      return;
    }
    setActiveStudio(String(s.id));
  }

  return (
    <section className="border-t border-zinc-200/70 dark:border-zinc-800 pt-8 mt-2" aria-label="Studios map">
      <div className="flex flex-wrap items-baseline justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            <Globe2Icon className="size-3.5" />
            Map
          </div>
          <h2 className="mt-1 text-base font-bold text-zinc-900 dark:text-white">Studios worldwide</h2>
        </div>
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 tabular-nums">
          {status === "loading" ? "…" : `${withCoords.length} studios`}
        </span>
      </div>

      {status === "loading" ? (
        <p className="text-sm text-zinc-500 mb-4">Loading studios…</p>
      ) : null}
      {status === "fallback" && errorMsg ? (
        <p className="text-xs text-amber-800 dark:text-amber-200 mb-4">
          {errorMsg}. Pilot studio list shown. Set <code className="font-mono text-[11px]">NEXT_PUBLIC_YOGA_BACKEND_URL</code> for live
          data.
        </p>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,280px),1fr] gap-6 lg:gap-8 lg:items-end">
        <div className="relative flex justify-center lg:justify-start lg:self-end">
          <div className="relative w-full flex justify-center lg:justify-start">
            <StudiosGlobe studios={withCoords} maxSize={276} minSize={220} className="shrink-0" />
            <ul className="pointer-events-none absolute inset-0 hidden xl:block" aria-hidden>
              {withCoords.map((s) => {
                const id = markerIdForStudio(s.id);
                return (
                  <li
                    key={s.id}
                    className="pointer-events-none absolute rounded-md border border-border bg-card/95 px-2 py-1 text-[10px] font-semibold text-foreground shadow-sm backdrop-blur-sm dark:bg-card/80"
                    style={
                      {
                        bottom: "anchor(top)",
                        left: "anchor(center)",
                        translate: "-50% 0",
                        marginBottom: 6,
                        opacity: `var(--cobe-visible-${id}, 0)`,
                        positionAnchor: `--cobe-${id}`,
                      } as React.CSSProperties
                    }
                  >
                    {s.name}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="flex min-h-0 flex-col gap-3 lg:pb-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            <MapPinIcon className="size-3.5" />
            Open a schedule
          </div>
          <ul className="flex max-h-[min(340px,45vh)] flex-col gap-2 overflow-y-auto pr-1 -mr-1">
            {withCoords.map((s) => {
              const href = scheduleHref(s);
              const active =
                (s.id < 0 && YOGA_STUDIOS[-s.id - 1]?.id === studioId) || String(s.id) === studioId;
              return (
                <li key={s.id}>
                  <Link
                    href={href}
                    onClick={() => beforeNavigate(s)}
                    className={`group flex items-start justify-between gap-3 rounded-xl border px-3 py-2.5 transition ${
                      active
                        ? "border-indigo-400/60 bg-indigo-500/[0.08] dark:border-indigo-500/35 dark:bg-indigo-500/10"
                        : "border-zinc-200/80 dark:border-zinc-800 bg-transparent hover:bg-zinc-100/80 dark:hover:bg-zinc-900/50"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-zinc-900 dark:text-white truncate">{s.name}</div>
                      {s.address ? (
                        <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 truncate">{s.address}</div>
                      ) : null}
                      {s.rating != null ? (
                        <div className="text-[11px] font-medium text-indigo-700 dark:text-indigo-300 mt-1">
                          ★ {s.rating.toFixed(1)}
                        </div>
                      ) : null}
                    </div>
                    <ArrowRightIcon className="mt-1 size-4 shrink-0 text-zinc-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition" />
                  </Link>
                </li>
              );
            })}
          </ul>
          <button
            type="button"
            onClick={() => router.push("/yoga/home")}
            className="text-left text-sm font-semibold text-indigo-700 dark:text-indigo-300 hover:underline"
          >
            Pick your studio →
          </button>
        </div>
      </div>
    </section>
  );
}
