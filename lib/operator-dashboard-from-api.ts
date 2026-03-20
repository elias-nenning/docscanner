import type { BackendClassInstance, BackendStudio } from "@/components/api/backend";
import { fillCreditEUR } from "@/lib/fill-credit-tiers";

export type DashboardClassRow = {
  id: number;
  name: string;
  time: string;
  instructor: string;
  capacity: number;
  booked: number;
};

export type DashboardPortfolioRow = {
  id: string;
  name: string;
  city: string;
  classesPerDay: number;
  avgFill: number;
  creditsOffered: number;
};

export function localISODate(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function inferBooked(c: BackendClassInstance, capacity: number): number {
  if (c.bookings_count != null) return Math.min(Math.max(0, c.bookings_count), capacity);
  if (c.occupancy_rate == null || capacity <= 0) return 0;
  const occ = c.occupancy_rate;
  const frac = occ <= 1 && occ >= 0 ? occ : occ / 100;
  return Math.min(capacity, Math.round(frac * capacity));
}

/** Whether this slot qualifies for any fill incentive (uses central tiers). */
export { isFillIncentiveSlot as isIncentiveSlot } from "@/lib/fill-credit-tiers";

export function classInstanceToDashboardRow(c: BackendClassInstance): DashboardClassRow {
  const capacity = Math.max(1, c.capacity ?? 20);
  const booked = inferBooked(c, capacity);
  const timeRaw = (c.time ?? "09:00").trim();
  const time = timeRaw.length >= 5 ? timeRaw.slice(0, 5) : timeRaw;
  return {
    id: c.id,
    name: c.class_type?.trim() || "Class",
    time,
    instructor: c.instructor?.trim() || "-",
    capacity,
    booked: Math.min(booked, capacity),
  };
}

export function buildPortfolioFromApi(
  studios: BackendStudio[],
  classes: BackendClassInstance[],
  cityFromAddress: (a?: string | null) => string,
): DashboardPortfolioRow[] {
  const open = classes.filter((c) => String(c.status).toLowerCase() !== "cancelled");
  return studios.map((st) => {
    const sc = open.filter((c) => c.studio_id === st.id);
    const rows = sc.map(classInstanceToDashboardRow);
    const classesPerDay = rows.length;
    const fills = rows.map((r) => (r.capacity > 0 ? r.booked / r.capacity : 0));
    const avgFill = fills.length ? Math.round((fills.reduce((a, b) => a + b, 0) / fills.length) * 100) : 0;
    let creditsOffered = 0;
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const c = sc[i];
      const sessionDate = c?.date ? `${c.date}T12:00:00` : undefined;
      creditsOffered += fillCreditEUR(r.booked, r.capacity, sessionDate);
    }
    return {
      id: String(st.id),
      name: st.name,
      city: cityFromAddress(st.address),
      classesPerDay,
      avgFill,
      creditsOffered,
    };
  });
}
