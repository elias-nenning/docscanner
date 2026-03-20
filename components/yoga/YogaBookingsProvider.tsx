"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { backend, isBackendConfigured } from "@/components/api/backend";
import { useAuth } from "@/components/auth/useAuth";
import { mergeLocalAndServerBookings } from "@/components/yoga/mapServerBooking";
import type { YogaBooking } from "@/components/yoga/yogaBookingTypes";
import { STORAGE_KEY, safeParse } from "@/components/yoga/yogaBookingStorage";

type Ctx = {
  bookings: YogaBooking[];
  hydrated: boolean;
  addBooking: (b: Omit<YogaBooking, "id" | "createdAt">) => string;
  removeBooking: (id: string) => void;
  /** Re-fetch `/bookings/user/:id` and merge with local storage (after server create/cancel). */
  refreshBookingsFromApi: () => Promise<void>;
};

const BookingsContext = createContext<Ctx | null>(null);

export function YogaBookingsProvider({ children }: { children: ReactNode }) {
  const { user, hydrated: authHydrated } = useAuth();
  const [bookings, setBookings] = useState<YogaBooking[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setBookings(safeParse(typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || !authHydrated) return;
    const local = safeParse(typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null);
    if (!user?.id || !isBackendConfigured()) {
      setBookings(local);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const server = await backend.listUserBookings(user.id);
        if (cancelled) return;
        setBookings(mergeLocalAndServerBookings(local, server));
      } catch {
        if (!cancelled) setBookings(local);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hydrated, authHydrated, user?.id]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
    } catch {
      // ignore
    }
  }, [bookings, hydrated]);

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== STORAGE_KEY || e.newValue == null) return;
      setBookings(safeParse(e.newValue));
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const addBooking = useCallback((b: Omit<YogaBooking, "id" | "createdAt">) => {
    const dedupeKey =
      b.serverBookingId != null
        ? `srv-${b.serverBookingId}`
        : `${b.studioId}-${b.month}-${b.day}-${b.time}-${b.name}`.replace(/\s+/g, "_");
    setBookings((prev) => {
      if (
        prev.some(
          (x) => x.id === dedupeKey || (b.serverBookingId != null && x.serverBookingId === b.serverBookingId)
        )
      ) {
        return prev;
      }
      return [{ ...b, id: dedupeKey, createdAt: Date.now() }, ...prev];
    });
    return dedupeKey;
  }, []);

  const removeBooking = useCallback((id: string) => {
    setBookings((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const refreshBookingsFromApi = useCallback(async () => {
    if (!user?.id || !isBackendConfigured()) return;
    const local = safeParse(typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null);
    try {
      const server = await backend.listUserBookings(user.id);
      setBookings(mergeLocalAndServerBookings(local, server));
    } catch {
      // keep current state
    }
  }, [user?.id]);

  const sorted = useMemo(() => {
    return [...bookings].sort((a, b) => {
      if (a.month !== b.month) return a.month.localeCompare(b.month);
      if (a.day !== b.day) return a.day - b.day;
      return a.time.localeCompare(b.time);
    });
  }, [bookings]);

  const value = useMemo(
    () => ({
      bookings: sorted,
      hydrated,
      addBooking,
      removeBooking,
      refreshBookingsFromApi,
    }),
    [sorted, hydrated, addBooking, removeBooking, refreshBookingsFromApi]
  );

  return <BookingsContext.Provider value={value}>{children}</BookingsContext.Provider>;
}

export function useYogaBookings(): Ctx {
  const ctx = useContext(BookingsContext);
  if (!ctx) {
    throw new Error("useYogaBookings must be used within YogaBookingsProvider");
  }
  return ctx;
}
