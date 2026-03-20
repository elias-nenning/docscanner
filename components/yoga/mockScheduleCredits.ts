import type { YogaBooking } from "@/components/yoga/yogaBookingTypes";

export type MockCreditProfile = {
  displayName: string;
  balanceEUR: number;
  monthlyAllowanceEUR: number;
  usedThisMonthEUR: number;
  pendingCashbackEUR: number;
  memberTier: string;
  nextReward: string;
};

export const MOCK_CREDIT_PROFILE: MockCreditProfile = {
  displayName: "Alex Rivera",
  balanceEUR: 24,
  monthlyAllowanceEUR: 40,
  usedThisMonthEUR: 14,
  pendingCashbackEUR: 3,
  memberTier: "FlowFill Plus",
  nextReward: "Book 2 more classes this month → +€5 bonus credits",
};

type Template = Omit<YogaBooking, "id" | "month" | "day" | "createdAt"> & {
  /** 0 = Monday … 6 = Sunday (matches week grid) */
  offsetFromWeekStart: number;
};

const TEMPLATES: Template[] = [
  {
    offsetFromWeekStart: 0,
    studioId: "prana",
    time: "7:00 AM",
    name: "Morning Vinyasa",
    teacher: "Maya Chen",
    dur: "45m",
    priceEUR: 14,
    paidWith: "credits",
  },
  {
    offsetFromWeekStart: 0,
    studioId: "lotus",
    time: "6:30 PM",
    name: "Yin Restore",
    teacher: "James Rivera",
    dur: "60m",
    priceEUR: 16,
    paidWith: "credits",
  },
  {
    offsetFromWeekStart: 2,
    studioId: "zenith",
    time: "12:00 PM",
    name: "Power Lunch Flow",
    teacher: "Sarah Kim",
    dur: "45m",
    priceEUR: 16,
    paidWith: "membership",
  },
  {
    offsetFromWeekStart: 4,
    studioId: "pulse",
    time: "8:00 AM",
    name: "Athletic Vinyasa",
    teacher: "Leo Santos",
    dur: "60m",
    priceEUR: 18,
    paidWith: "credits",
  },
  {
    offsetFromWeekStart: 4,
    studioId: "prana",
    time: "5:30 PM",
    name: "Breath & Stretch",
    teacher: "Tom Wu",
    dur: "30m",
    priceEUR: 12,
    paidWith: "credits",
  },
  {
    offsetFromWeekStart: 5,
    studioId: "soma",
    time: "10:30 AM",
    name: "Weekend Reset",
    teacher: "Nina Kovács",
    dur: "75m",
    priceEUR: 18,
    paidWith: "card",
  },
];

/** Recurring network schedule (merged with the member’s own bookings in My calendar). */
export function mockBookingsForWeek(weekStartMonday: Date): YogaBooking[] {
  const y = weekStartMonday.getFullYear();
  const m = weekStartMonday.getMonth();
  const startD = weekStartMonday.getDate();

  return TEMPLATES.map((t, i) => {
    const d = new Date(y, m, startD + t.offsetFromWeekStart);
    const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const day = d.getDate();
    return {
      id: `mock-${month}-${day}-${i}`,
      studioId: t.studioId,
      month,
      day,
      time: t.time,
      name: t.name,
      teacher: t.teacher,
      dur: t.dur,
      priceEUR: t.priceEUR,
      paidWith: t.paidWith,
      createdAt: 0,
    };
  });
}

export function isMockBooking(id: string) {
  return id.startsWith("mock-");
}
