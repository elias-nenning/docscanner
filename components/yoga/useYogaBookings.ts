"use client";

import { useEffect, useMemo, useState } from "react";

export type YogaBooking = {
  id: string;
  studioId: string;
  month: string; // YYYY-MM
  day: number; // 1-31
  time: string;
  name: string;
  teacher: string;
  dur: string;
  priceEUR: number;
  paidWith: "credits" | "card" | "membership";
  createdAt: number;
};

const STORAGE_KEY = "flowfill.yoga.bookings.v1";

function safeParse(raw: string | null): YogaBooking[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as YogaBooking[];
  } catch {
    return [];
  }
}

export function useYogaBookings() {
  const [bookings, setBookings] = useState<YogaBooking[]>(() => {
    if (typeof window === "undefined") return [];
    return safeParse(window.localStorage.getItem(STORAGE_KEY));
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
    } catch {
      // ignore
    }
  }, [bookings]);

  const sorted = useMemo(() => {
    return [...bookings].sort((a, b) => {
      if (a.month !== b.month) return a.month.localeCompare(b.month);
      if (a.day !== b.day) return a.day - b.day;
      return a.time.localeCompare(b.time);
    });
  }, [bookings]);

  function addBooking(b: Omit<YogaBooking, "id" | "createdAt">) {
    const id = `${b.studioId}-${b.month}-${b.day}-${b.time}-${b.name}`.replace(/\s+/g, "_");
    setBookings((prev) => {
      if (prev.some((x) => x.id === id)) return prev;
      return [{ ...b, id, createdAt: Date.now() }, ...prev];
    });
    return id;
  }

  function removeBooking(id: string) {
    setBookings((prev) => prev.filter((b) => b.id !== id));
  }

  return { bookings: sorted, addBooking, removeBooking };
}

