/**
 * Dynamic fill-credit calculation based on class occupancy and time proximity.
 *
 * - Lower fill = higher incentive. Max €10 per session.
 * - Sooner sessions (today/tomorrow) = higher credits to fill last-minute.
 * - Sessions a week out = minimal credits (€2 or none).
 */

export const MAX_FILL_CREDIT_EUR = 10;
export const DEFAULT_CLASS_PRICE_EUR = 20;

export type FillCreditTier = {
  eur: number;
  label: string;
  fillRateMin: number;
  fillRateMax: number;
};

/** Occupancy-based base tiers (before time multiplier). Max output capped at €10. */
export const FILL_CREDIT_TIERS: FillCreditTier[] = [
  { eur: 10, label: "€10 fill", fillRateMin: 0, fillRateMax: 0.2 },
  { eur: 8, label: "€8 fill", fillRateMin: 0.2, fillRateMax: 0.3 },
  { eur: 6, label: "€6 fill", fillRateMin: 0.3, fillRateMax: 0.4 },
  { eur: 5, label: "€5 fill", fillRateMin: 0.4, fillRateMax: 0.5 },
  { eur: 4, label: "€4 fill", fillRateMin: 0.5, fillRateMax: 0.6 },
  // 60%+ = no fill incentive
];

/**
 * Time-proximity multiplier: sooner = higher credits.
 * - Today / within hours: 1.0 (full)
 * - Tomorrow: 0.95
 * - 2 days: 0.85
 * - 3–4 days: 0.7
 * - 5–7 days: 0.5
 * - 8+ days: 0.3 (minimal)
 */
export function timeProximityMultiplier(daysUntil: number): number {
  if (daysUntil < 0) return 0;
  if (daysUntil === 0) return 1;
  if (daysUntil === 1) return 0.95;
  if (daysUntil === 2) return 0.85;
  if (daysUntil <= 4) return 0.7;
  if (daysUntil <= 7) return 0.5;
  return 0.3;
}

/**
 * Base fill credit from occupancy only (no time factor).
 */
export function fillCreditBaseEUR(booked: number, capacity: number): number {
  if (capacity <= 0) return 0;
  const rate = booked / capacity;
  for (const tier of FILL_CREDIT_TIERS) {
    if (rate >= tier.fillRateMin && rate < tier.fillRateMax) return tier.eur;
  }
  return 0;
}

/**
 * Full fill credit: occupancy × time proximity, capped at MAX_FILL_CREDIT_EUR.
 * @param nowOverride - For demo/calendar: use this as "today" instead of real time.
 */
export function fillCreditEUR(
  booked: number,
  capacity: number,
  sessionDate?: Date | string,
  nowOverride?: Date,
): number {
  const base = fillCreditBaseEUR(booked, capacity);
  if (base <= 0) return 0;
  if (!sessionDate) return Math.min(MAX_FILL_CREDIT_EUR, base);
  const session = typeof sessionDate === "string" ? new Date(sessionDate) : sessionDate;
  const now = nowOverride ?? new Date();
  const daysUntil = Math.floor(
    (session.getTime() - now.getTime()) / (24 * 60 * 60 * 1000),
  );
  const mult = timeProximityMultiplier(daysUntil);
  return Math.min(MAX_FILL_CREDIT_EUR, Math.round(base * mult));
}

/**
 * Display label for fill credit badge.
 */
export function fillCreditLabel(
  booked: number,
  capacity: number,
  sessionDate?: Date | string,
  nowOverride?: Date,
): string | null {
  const eur = fillCreditEUR(booked, capacity, sessionDate, nowOverride);
  return eur > 0 ? `€${eur} fill` : null;
}

export function isFillIncentiveSlot(booked: number, capacity: number): boolean {
  return fillCreditBaseEUR(booked, capacity) > 0;
}

export function fillCreditAmounts(): number[] {
  return [...new Set(FILL_CREDIT_TIERS.map((t) => t.eur))].sort((a, b) => b - a);
}
