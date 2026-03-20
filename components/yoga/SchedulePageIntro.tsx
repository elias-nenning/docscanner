"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getYogaStudioById } from "@/components/yoga/useYogaStudio";
import { fillCreditAmounts } from "@/lib/fill-credit-tiers";

function ScheduleIntroInner() {
  const sp = useSearchParams();
  const studioId = sp.get("studio") || "prana";
  const studio = getYogaStudioById(studioId);

  return (
    <div className="ff-panel mb-3 flex flex-col gap-2 p-3 md:flex-row md:items-center md:justify-between md:gap-4">
      <div className="min-w-0">
        <p className="ff-eyebrow text-foreground/80">Schedule</p>
        <h2 className="ff-page-title mt-0.5">
          {studio ? (
            <>
              {studio.name}
              <span className="font-normal text-muted-foreground"> · {studio.city}</span>
            </>
          ) : (
            "Classes & incentives"
          )}
        </h2>
        <p className="ff-page-desc mt-1 max-w-2xl">
          Classes cost €20. Fill credits (up to €10) depend on occupancy and how soon the session is — tomorrow or today earns more than next week.
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2 md:justify-end">
        {fillCreditAmounts().map((eur) => (
          <span
            key={eur}
            className={
              eur >= 6
                ? "rounded-md border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-200"
                : "rounded-md border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-900 dark:text-amber-100"
            }
          >
            €{eur}
          </span>
        ))}
        <nav className="flex flex-wrap gap-x-2 text-[11px] font-medium" aria-label="Related">
                <Link href="/dashboard/directory" className="text-primary hover:underline">
                  Studios
                </Link>
                <Link href="/dashboard" className="text-primary hover:underline">
                  Desk
                </Link>
                <Link href="/dashboard/credits" className="text-primary hover:underline">
                  Credits (sample)
                </Link>
              </nav>
      </div>
    </div>
  );
}

export function SchedulePageIntro() {
  return (
    <Suspense fallback={<div className="ff-panel mb-3 h-14 animate-pulse" aria-hidden />}>
      <ScheduleIntroInner />
    </Suspense>
  );
}
