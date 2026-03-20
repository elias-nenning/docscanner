"use client";

import { useEffect, useState } from "react";
import { backend, isBackendConfigured } from "@/components/api/backend";
import {
  buildPortfolioFromApi,
  classInstanceToDashboardRow,
  localISODate,
  type DashboardClassRow,
  type DashboardPortfolioRow,
} from "@/lib/operator-dashboard-from-api";
import { yogaApiModeFromLive, type YogaApiMode } from "@/lib/yoga-data-source";
import { parseCityFromAddress } from "@/lib/studios-from-api";

const FALLBACK_CLASSES: DashboardClassRow[] = [
  { id: 1, name: "Morning Flow Yoga", time: "07:00", instructor: "Anna", capacity: 20, booked: 14 },
  { id: 2, name: "Power Pilates", time: "09:00", instructor: "Marc", capacity: 16, booked: 16 },
  { id: 3, name: "Midday Stretch", time: "12:00", instructor: "Sara", capacity: 20, booked: 5 },
  { id: 4, name: "Core & Breathe", time: "13:30", instructor: "Anna", capacity: 18, booked: 7 },
  { id: 5, name: "Vinyasa Flow", time: "16:00", instructor: "Tom", capacity: 20, booked: 12 },
  { id: 6, name: "Peak Hour Yoga", time: "18:00", instructor: "Sara", capacity: 20, booked: 20 },
  { id: 7, name: "Evening Pilates", time: "19:30", instructor: "Marc", capacity: 16, booked: 15 },
  { id: 8, name: "Late Flow", time: "20:30", instructor: "Tom", capacity: 14, booked: 4 },
];

const FALLBACK_PORTFOLIO: DashboardPortfolioRow[] = [
  { id: "zenith", name: "Zenith Yoga", city: "Berlin", classesPerDay: 8, avgFill: 78, creditsOffered: 14 },
  { id: "prana", name: "Prana Studio", city: "Berlin", classesPerDay: 6, avgFill: 66, creditsOffered: 9 },
  { id: "lotus", name: "Lotus House", city: "Berlin", classesPerDay: 5, avgFill: 71, creditsOffered: 7 },
  { id: "pulse", name: "Pulse Studio", city: "Berlin", classesPerDay: 7, avgFill: 74, creditsOffered: 10 },
];

export function useOperatorDashboardData() {
  const [live, setLive] = useState(false);
  const [classes, setClasses] = useState<DashboardClassRow[]>(FALLBACK_CLASSES);
  const [studioPortfolio, setStudioPortfolio] = useState<DashboardPortfolioRow[]>(FALLBACK_PORTFOLIO);
  const [focusStudioName, setFocusStudioName] = useState("Zenith Yoga");
  const [dataDate, setDataDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(() => isBackendConfigured());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isBackendConfigured()) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    const today = localISODate();

    (async () => {
      try {
        const [studios, allClasses] = await Promise.all([
          backend.listStudios(),
          backend.listClasses({ date: today }),
        ]);
        if (cancelled) return;

        if (!studios.length) {
          setLive(false);
          setClasses(FALLBACK_CLASSES);
          setStudioPortfolio(FALLBACK_PORTFOLIO);
          setFocusStudioName("Zenith Yoga");
          setDataDate(null);
          setError(null);
          return;
        }

        const envId = process.env.NEXT_PUBLIC_OPERATOR_STUDIO_ID?.trim();
        const preferredId =
          envId && /^\d+$/.test(envId) ? Number(envId) : studios[0].id;
        const focusStudio = studios.find((s) => s.id === preferredId) ?? studios[0];

        const open = (allClasses ?? []).filter((c) => String(c.status).toLowerCase() !== "cancelled");
        const forFocus = open.filter((c) => c.studio_id === focusStudio.id);
        const mappedClasses = forFocus.length ? forFocus.map(classInstanceToDashboardRow) : FALLBACK_CLASSES;

        const portfolio = buildPortfolioFromApi(studios, open, parseCityFromAddress);

        setClasses(mappedClasses);
        setStudioPortfolio(portfolio);
        setFocusStudioName(focusStudio.name);
        setDataDate(today);
        setLive(true);
        setError(null);
      } catch (e) {
        if (cancelled) return;
        setLive(false);
        setClasses(FALLBACK_CLASSES);
        setStudioPortfolio(FALLBACK_PORTFOLIO);
        setFocusStudioName("Zenith Yoga");
        setDataDate(null);
        setError(e instanceof Error ? e.message : "Dashboard API error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const apiMode: YogaApiMode = yogaApiModeFromLive(live);

  return {
    live,
    apiMode,
    classes,
    studioPortfolio,
    focusStudioName,
    dataDate,
    loading,
    error,
  };
}
