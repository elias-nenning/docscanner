import type { YogaBooking } from "@/components/yoga/yogaBookingTypes";

export const STORAGE_KEY = "flowfill.yoga.bookings.v1";

export function safeParse(raw: string | null): YogaBooking[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as YogaBooking[];
  } catch {
    return [];
  }
}
