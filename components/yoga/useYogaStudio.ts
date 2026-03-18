"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

const STORAGE_KEY = "flowfill.yoga.activeStudioId";

export type YogaStudio = {
  id: string;
  name: string;
  city: string;
  distance: string;
  rating: number;
};

export const YOGA_STUDIOS: YogaStudio[] = [
  { id: "prana", name: "Prana", city: "Berlin", distance: "0.8km", rating: 4.8 },
  { id: "zenith", name: "Zenith", city: "Berlin", distance: "1.7km", rating: 4.6 },
  { id: "lotus", name: "Lotus House", city: "Berlin", distance: "2.5km", rating: 4.7 },
  { id: "pulse", name: "Pulse Studio", city: "Berlin", distance: "3.1km", rating: 4.5 },
];

export function getYogaStudioById(id: string | null | undefined): YogaStudio | null {
  if (!id) return null;
  return YOGA_STUDIOS.find((s) => s.id === id) ?? null;
}

export function useYogaStudio() {
  const searchParams = useSearchParams();
  const studioFromUrl = searchParams.get("studio");

  const [studioId, setStudioId] = useState<string>("prana");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) setStudioId(stored);
  }, []);

  useEffect(() => {
    if (!studioFromUrl) return;
    const match = getYogaStudioById(studioFromUrl);
    if (!match) return;
    setStudioId(match.id);
    try {
      window.localStorage.setItem(STORAGE_KEY, match.id);
    } catch {
      // ignore
    }
  }, [studioFromUrl]);

  const studio = useMemo(() => getYogaStudioById(studioId) ?? YOGA_STUDIOS[0], [studioId]);

  function setActiveStudio(nextId: string) {
    const match = getYogaStudioById(nextId);
    if (!match) return;
    setStudioId(match.id);
    try {
      window.localStorage.setItem(STORAGE_KEY, match.id);
    } catch {
      // ignore
    }
  }

  return { studioId, studio, setActiveStudio };
}
