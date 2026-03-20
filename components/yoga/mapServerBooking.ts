import type { BackendBooking } from "@/components/api/backend";
import type { YogaBooking } from "@/components/yoga/yogaBookingTypes";

/** Map API booking row → calendar / upcoming list shape. */
export function backendBookingToYoga(b: BackendBooking): YogaBooking {
  const [y, m, d] = b.class_date.split("-").map(Number);
  const month = `${y}-${String(m).padStart(2, "0")}`;
  const day = d || 1;
  const time = b.class_time?.trim() || "-";
  const priceEUR = Math.round(b.price_paid_eur ?? b.credits_used ?? 0);
  const paidWith: YogaBooking["paidWith"] =
    b.credits_used > 0 ? "credits" : b.price_paid_eur != null && b.price_paid_eur > 0 ? "card" : "membership";

  return {
    id: `srv-${b.id}`,
    studioId: String(b.studio_id),
    customerId: String(b.user_id),
    month,
    day,
    time,
    name: b.class_type?.trim() || "Class",
    teacher: "",
    dur: "",
    priceEUR,
    paidWith,
    createdAt: Date.parse(b.booked_at) || Date.now(),
    serverInstanceId: b.instance_id,
    serverBookingId: b.id,
  };
}

/**
 * Prefer server list; keep demo rows without `serverBookingId`.
 * Keep local rows with `serverBookingId` until the API shows them (handles create → list lag).
 */
export function mergeLocalAndServerBookings(local: YogaBooking[], serverList: BackendBooking[]): YogaBooking[] {
  const active = serverList.filter((x) => x.status !== "cancelled");
  const fromServer = active.map(backendBookingToYoga);
  const serverIds = new Set(fromServer.map((s) => s.serverBookingId).filter(Boolean));
  const out: YogaBooking[] = [...fromServer];
  for (const l of local) {
    if (!l.serverBookingId) {
      out.push(l);
      continue;
    }
    if (!serverIds.has(l.serverBookingId)) {
      out.push(l);
    }
  }
  return out.sort((a, b) => {
    if (a.month !== b.month) return a.month.localeCompare(b.month);
    if (a.day !== b.day) return a.day - b.day;
    return a.time.localeCompare(b.time);
  });
}
