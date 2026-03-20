export type YogaBooking = {
  id: string;
  studioId: string;
  /** FlowFill user id when booking while signed in; drives per-customer economics in the live model */
  customerId?: string;
  month: string; // YYYY-MM
  day: number; // 1-31
  time: string;
  name: string;
  teacher: string;
  dur: string;
  priceEUR: number;
  paidWith: "credits" | "card" | "membership";
  createdAt: number;
  serverInstanceId?: number;
  serverBookingId?: number;
};
