/**
 * Incentive attribution and studio-side earnings helpers.
 *
 * Models time-tiered demand, credit issuance, and contribution per customer so operators
 * can evaluate fill incentives against list revenue, without ad-hoc discounting.
 */

/** Wall-clock block inside a studio day (local time). */
export type TimeSlot = {
  startMinutes: number; // 0–1440
  endMinutes: number;
};

export type SlotDesirability = "peak" | "shoulder" | "off_peak";

/** How “hard” a slot is to fill; drives incentive size caps. */
export type DemandCurvePoint = {
  slot: TimeSlot;
  desirability: SlotDesirability;
  /** 0–1 typical utilization without incentives; lower ⇒ more room for credits. */
  baselineFillRate: number;
};

export type CustomerId = string;
export type StudioId = string;
export type BookingId = string;

export type BookingLifecycle = {
  id: BookingId;
  studioId: StudioId;
  customerId: CustomerId;
  slot: TimeSlot;
  /** Calendar date in studio timezone (YYYY-MM-DD). */
  date: string;
  bookedAt: string; // ISO
  cancelledAt?: string;
  attended: boolean;
  /** Credits or currency the customer applied against this booking. */
  incentiveCreditEUR: number;
  grossListPriceEUR: number;
};

export type CreditPolicy = {
  /** Max % of list price rebated as credits for off-peak. */
  maxOffPeakCreditShare: number;
  shoulderMultiplier: number;
  peakMultiplier: number;
  /** Penalize no-shows / late cancel in attribution. */
  lateCancelHours: number;
  noShowCreditClawbackEUR: number;
};

export type Period = { from: string; to: string }; // ISO dates

/** Per-customer roll-up for a studio in a window (“elaborate” slice for dashboards). */
export type CustomerPeriodEconomics = {
  customerId: CustomerId;
  period: Period;
  bookingsCount: number;
  attendedCount: number;
  cancelledCount: number;
  noShowCount: number;
  /** Sum of list price for attended + honourable cancels (policy-defined). */
  grossRevenueEUR: number;
  /** Credits issued to this customer in period (liability / promo cost). */
  creditsGrantedEUR: number;
  /** Net after credits and clawbacks (studio-centric view). */
  netContributionEUR: number;
  /** Weighted desirability mix; explains why incentives were used. */
  slotMix: Record<SlotDesirability, number>;
};

export type StudioPeriodSummary = {
  studioId: StudioId;
  period: Period;
  customers: CustomerPeriodEconomics[];
  /** Aggregate promo spend. */
  totalCreditsIssuedEUR: number;
  /** Simple “would this hour have been empty?” proxy: filled seats × price. */
  attributedRevenueFromIncentivesEUR: number;
};

const DEFAULT_POLICY: CreditPolicy = {
  maxOffPeakCreditShare: 0.35,
  shoulderMultiplier: 0.65,
  peakMultiplier: 0.12,
  lateCancelHours: 12,
  noShowCreditClawbackEUR: 5,
};

/**
 * Map a slot to peak / shoulder / off-peak. Replace with studio-specific calendars
 * (e.g. 7–9 peak, lunch shoulder, Fri evening peak).
 */
export function classifySlotDesirability(slot: TimeSlot, dayOfWeek: number): SlotDesirability {
  const start = slot.startMinutes;
  const lunch = start >= 11 * 60 && start <= 14 * 60;
  const earlyMorning = start < 8 * 60;
  const evening = start >= 17 * 60 && start <= 20 * 60;
  const weekend = dayOfWeek === 0 || dayOfWeek === 6;

  if (evening || (weekend && start >= 9 * 60 && start <= 12 * 60)) return "peak";
  if (lunch || earlyMorning) return "shoulder";
  return "off_peak";
}

/**
 * Suggested credit (EUR) for filling a slot: higher when baseline fill is low and slot is off-peak.
 * Studios cap this; FlowFill surfaces “recommended incentive” from demand curve.
 */
export function recommendedCreditEUR(
  listPriceEUR: number,
  curve: DemandCurvePoint,
  policy: CreditPolicy = DEFAULT_POLICY
): number {
  const base =
    listPriceEUR *
    policy.maxOffPeakCreditShare *
    Math.max(0, 1 - curve.baselineFillRate);

  if (curve.desirability === "off_peak") return Math.round(base * 10) / 10;
  if (curve.desirability === "shoulder")
    return Math.round(base * policy.shoulderMultiplier * 10) / 10;
  return Math.round(base * policy.peakMultiplier * 10) / 10;
}

function lifecycleBucket(l: BookingLifecycle, policy: CreditPolicy): "attended" | "cancel_ok" | "cancel_late" | "noshow" {
  if (l.attended) return "attended";
  if (!l.cancelledAt) return "noshow";
  const hours =
    (new Date(l.cancelledAt).getTime() - new Date(l.bookedAt).getTime()) / 3_600_000;
  return hours >= policy.lateCancelHours ? "cancel_late" : "cancel_ok";
}

/**
 * Build studio-facing economics for one customer over `bookings` in `period`.
 * Cancels/no-shows adjust net contribution; credits are treated as studio promo cost.
 */
export function customerPeriodEconomics(
  customerId: CustomerId,
  bookings: BookingLifecycle[],
  period: Period,
  demandByBookingId: Map<BookingId, DemandCurvePoint>,
  policy: CreditPolicy = DEFAULT_POLICY
): CustomerPeriodEconomics {
  const inWindow = bookings.filter((b) => b.customerId === customerId && b.date >= period.from && b.date <= period.to);

  let grossRevenueEUR = 0;
  let creditsGrantedEUR = 0;
  let cancelledCount = 0;
  let attendedCount = 0;
  let noShowCount = 0;
  const slotMix: Record<SlotDesirability, number> = { peak: 0, shoulder: 0, off_peak: 0 };

  for (const b of inWindow) {
    const bucket = lifecycleBucket(b, policy);
    const curve = demandByBookingId.get(b.id) ?? {
      slot: b.slot,
      desirability: "shoulder",
      baselineFillRate: 0.65,
    };
    slotMix[curve.desirability] += 1;

    creditsGrantedEUR += b.incentiveCreditEUR;

    if (bucket === "attended") {
      attendedCount += 1;
      grossRevenueEUR += b.grossListPriceEUR;
    } else if (bucket === "cancel_ok") {
      cancelledCount += 1;
    } else if (bucket === "cancel_late") {
      cancelledCount += 1;
      grossRevenueEUR += b.grossListPriceEUR * 0.25;
    } else {
      noShowCount += 1;
    }
  }

  const clawback = noShowCount * policy.noShowCreditClawbackEUR;
  const netContributionEUR = grossRevenueEUR - creditsGrantedEUR - clawback;

  return {
    customerId,
    period,
    bookingsCount: inWindow.length,
    attendedCount,
    cancelledCount,
    noShowCount,
    grossRevenueEUR: round2(grossRevenueEUR),
    creditsGrantedEUR: round2(creditsGrantedEUR),
    netContributionEUR: round2(netContributionEUR),
    slotMix,
  };
}

export function studioPeriodSummary(
  studioId: StudioId,
  allBookings: BookingLifecycle[],
  period: Period,
  demandByBookingId: Map<BookingId, DemandCurvePoint>,
  policy?: CreditPolicy
): StudioPeriodSummary {
  const bookings = allBookings.filter((b) => b.studioId === studioId);
  const customerIds = [...new Set(bookings.map((b) => b.customerId))];
  const customers = customerIds.map((id) => customerPeriodEconomics(id, bookings, period, demandByBookingId, policy));

  const totalCreditsIssuedEUR = round2(customers.reduce((s, c) => s + c.creditsGrantedEUR, 0));

  const attributedRevenueFromIncentivesEUR = round2(
    bookings
      .filter((b) => b.date >= period.from && b.date <= period.to && b.incentiveCreditEUR > 0 && b.attended)
      .reduce((s, b) => s + b.grossListPriceEUR, 0)
  );

  return {
    studioId,
    period,
    customers,
    totalCreditsIssuedEUR,
    attributedRevenueFromIncentivesEUR,
  };
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
