"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import YogaCalendarDemo from "@/components/YogaCalendarDemo";
import YogaScheduleFromApi from "@/components/yoga/YogaScheduleFromApi";
import { studioQueryToApiId } from "@/lib/yoga-studios";

function ScheduleInner() {
  const sp = useSearchParams();
  const numericId = studioQueryToApiId(sp.get("studio"));

  if (numericId != null) {
    return <YogaScheduleFromApi studioId={numericId} />;
  }

  return <YogaCalendarDemo embedded />;
}

export default function YogaScheduleSwitcher() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-zinc-500 text-center">Loading schedule…</div>}>
      <ScheduleInner />
    </Suspense>
  );
}
