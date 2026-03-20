import type { YogaBooking } from "@/components/yoga/useYogaBookings";
import type { BookingId, BookingLifecycle, DemandCurvePoint } from "@/lib/incentive-earnings-model";
import { classifySlotDesirability } from "@/lib/incentive-earnings-model";

function parseTimeToMinutes(time: string): number {
  const raw = time.trim().toUpperCase();
  const m = raw.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/);
  if (!m) return 9 * 60;
  let h = Number(m[1]);
  const min = Number(m[2]);
  const ampm = m[3];
  if (ampm === "PM" && h < 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  return h * 60 + min;
}

function parseDurMinutes(dur: string): number {
  const m = dur.match(/(\d+)\s*m/);
  if (m) return Math.min(180, Number(m[1]));
  return 60;
}

function isoDateFromYogaBooking(b: YogaBooking): string {
  return `${b.month}-${String(b.day).padStart(2, "0")}`;
}

export function yogaBookingToLifecycle(b: YogaBooking, fallbackCustomerId: string): BookingLifecycle {
  const date = isoDateFromYogaBooking(b);
  const d = new Date(`${date}T12:00:00`);
  const dayOfWeek = Number.isNaN(d.getTime()) ? 1 : d.getDay();
  const startMinutes = parseTimeToMinutes(b.time);
  const endMinutes = Math.min(1440, startMinutes + parseDurMinutes(b.dur));
  const slot = { startMinutes, endMinutes };

  const paidWithCredits = b.paidWith === "credits";
  return {
    id: b.id,
    studioId: b.studioId,
    customerId: b.customerId ?? fallbackCustomerId,
    slot,
    date,
    bookedAt: new Date(b.createdAt || Date.now()).toISOString(),
    attended: true,
    incentiveCreditEUR: paidWithCredits ? b.priceEUR : 0,
    grossListPriceEUR: b.priceEUR,
  };
}

export function demandCurveForYogaBooking(b: YogaBooking): DemandCurvePoint {
  const lifecycle = yogaBookingToLifecycle(b, "x");
  const d = new Date(`${lifecycle.date}T12:00:00`);
  const dayOfWeek = d.getDay();
  const desirability = classifySlotDesirability(lifecycle.slot, dayOfWeek);
  const baselineFillRate =
    desirability === "off_peak" ? 0.42 : desirability === "shoulder" ? 0.62 : 0.82;
  return {
    slot: lifecycle.slot,
    desirability,
    baselineFillRate,
  };
}

export function buildDemandMap(bookings: YogaBooking[]): Map<BookingId, DemandCurvePoint> {
  const m = new Map<BookingId, DemandCurvePoint>();
  for (const b of bookings) {
    m.set(b.id, demandCurveForYogaBooking(b));
  }
  return m;
}

export function yogaBookingsToLifecycles(bookings: YogaBooking[], fallbackCustomerId: string): BookingLifecycle[] {
  return bookings.map((b) => yogaBookingToLifecycle(b, fallbackCustomerId));
}

export function rollingPeriod(days: number): { from: string; to: string } {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);
  return { from: toIsoDate(from), to: toIsoDate(to) };
}

function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
