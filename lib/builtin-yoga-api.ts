import type {
  BackendBooking,
  BackendClassInstance,
  BackendCreditBalance,
  BackendCreditTxn,
  BackendStudio,
  BackendUser,
} from "@/components/api/backend";
import { getStudiosForSearch } from "@/lib/search-content";
import { getClassesForWeekday, type CalEvent, type YogaEventType } from "@/lib/yoga-weekly-schedule";

export const BUILTIN_STUDIOS: BackendStudio[] = getStudiosForSearch().map((s, i) => ({
  id: i + 1,
  name: s.name,
  style: s.tags[0] ?? "Yoga",
  address: `${s.city}, Germany`,
  description: s.blurb,
  price_per_class_eur: 16,
  default_capacity: 18,
  rating: s.rating,
}));

function localISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseTimeTo24h(t: string): string {
  const raw = t.trim();
  const m = raw.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!m) return "09:00";
  let h = Number(m[1]);
  const min = m[2];
  const ap = m[3]?.toUpperCase();
  if (ap === "PM" && h < 12) h += 12;
  if (ap === "AM" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${min}`;
}

function priceForType(type: YogaEventType): number {
  const map: Partial<Record<YogaEventType, number>> = {
    sound: 18,
    power: 16,
    yin: 14,
    vinyasa: 15,
    meditation: 12,
    prenatal: 17,
    breath: 13,
    reset: 14,
  };
  return map[type] ?? 14;
}

function stableInstanceId(studioId: number, iso: string, time24: string, name: string): number {
  const s = `${studioId}|${iso}|${time24}|${name}`;
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  const u = h >>> 0;
  return (u % 900_000_000) + 1_000_000;
}

function buildInstance(studioId: number, iso: string, dow: number, ev: CalEvent, idx: number): BackendClassInstance {
  const capacity = ev.spots != null ? Math.max(ev.spots + 8, 16) : 20;
  const bookedRaw =
    ev.spots != null ? Math.max(0, capacity - ev.spots) : Math.round(capacity * 0.62);
  const booked = Math.min(capacity, bookedRaw);
  const time24 = parseTimeTo24h(ev.time);
  const id = stableInstanceId(studioId, iso, time24, ev.name);
  const pct = Math.round((booked / capacity) * 100);
  return {
    id,
    studio_id: studioId,
    date: iso,
    day_of_week: dow,
    time: time24,
    class_type: ev.name,
    instructor: ev.teacher,
    capacity,
    bookings_count: booked,
    waitlist_count: 0,
    occupancy_rate: pct,
    price_eur: priceForType(ev.type),
    status: "scheduled",
  };
}

let _classCache: BackendClassInstance[] | null = null;

export function allBuiltinClasses(): BackendClassInstance[] {
  if (_classCache) return _classCache;
  const out: BackendClassInstance[] = [];
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  for (let d = 0; d < 14; d++) {
    const dt = new Date(start);
    dt.setDate(start.getDate() + d);
    const iso = localISODate(dt);
    const dow = dt.getDay();
    const templates = getClassesForWeekday(dow);
    for (const studio of BUILTIN_STUDIOS) {
      let idx = 0;
      for (const ev of templates) {
        idx += 1;
        out.push(buildInstance(studio.id, iso, dow, ev, idx));
      }
    }
  }
  _classCache = out;
  return out;
}

export function filterBuiltinClasses(params: {
  studio_id?: number;
  date?: string;
  class_type?: string;
}): BackendClassInstance[] {
  let list = allBuiltinClasses();
  if (params.studio_id != null) {
    list = list.filter((c) => c.studio_id === params.studio_id);
  }
  if (params.date) {
    list = list.filter((c) => c.date === params.date);
  }
  if (params.class_type?.trim()) {
    const needle = params.class_type.trim().toLowerCase();
    list = list.filter((c) => String(c.class_type).toLowerCase().includes(needle));
  }
  return list;
}

export function getBuiltinStudio(id: number): BackendStudio | null {
  return BUILTIN_STUDIOS.find((s) => s.id === id) ?? null;
}

export function getBuiltinClassById(id: number): BackendClassInstance | null {
  return allBuiltinClasses().find((c) => c.id === id) ?? null;
}

export function stableUserIdFromEmail(email: string): number {
  const normalized = email.trim().toLowerCase();
  let h = 0;
  for (let i = 0; i < normalized.length; i++) h = (Math.imul(31, h) + normalized.charCodeAt(i)) | 0;
  const u = h >>> 0;
  return (u % 2_000_000_000) + 1;
}

export function builtinUserFromEmail(email: string): BackendUser {
  const normalized = email.trim().toLowerCase();
  const id = stableUserIdFromEmail(normalized);
  const local = normalized.split("@")[0]?.replace(/[._-]/g, " ").trim() || "Member";
  return {
    id,
    name: local.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") || "Member",
    email: normalized,
    role: "customer",
    credits_balance: 24 + (id % 40),
    studio_id: null,
    membership_type: "monthly",
    joined_date: new Date().toISOString().slice(0, 10),
  };
}

export function builtinUserFromPost(body: { name: string; email: string; role?: string }): BackendUser {
  const u = builtinUserFromEmail(body.email);
  return {
    ...u,
    name: body.name?.trim() || u.name,
    role: body.role?.trim() || "customer",
  };
}

export function builtinUserById(id: number): BackendUser {
  return {
    id,
    name: `Member ${id}`,
    email: `member${id}@flowfill.demo`,
    role: "customer",
    credits_balance: 24 + (id % 40),
    studio_id: null,
    membership_type: "monthly",
    joined_date: new Date().toISOString().slice(0, 10),
  };
}

/** In-memory debits for this Node process (built-in API only). Makes GET credits reflect new bookings. */
type RuntimeCreditDebit = { amount: number; instanceId: number; bookingId: number; createdAt: string };
const runtimeCreditDebits = new Map<number, RuntimeCreditDebit[]>();

/** Pack purchases (built-in API only) — positive wallet credits, same process lifetime as debits. */
type RuntimeCreditPurchase = { amount: number; label: string; createdAt: string; txnId: number };
const runtimeCreditPurchases = new Map<number, RuntimeCreditPurchase[]>();
let nextPurchaseTxnId = 1;

export function recordBuiltinBookingCreditDebit(
  userId: number,
  debit: Pick<RuntimeCreditDebit, "amount" | "instanceId" | "bookingId">,
) {
  const list = runtimeCreditDebits.get(userId) ?? [];
  list.push({
    amount: Math.round(debit.amount),
    instanceId: debit.instanceId,
    bookingId: debit.bookingId,
    createdAt: new Date().toISOString().slice(0, 10),
  });
  runtimeCreditDebits.set(userId, list);
}

export function recordBuiltinCreditPurchase(userId: number, walletCreditEUR: number, packLabel: string) {
  const amount = Math.max(0, Math.round(walletCreditEUR));
  if (amount <= 0) return;
  const list = runtimeCreditPurchases.get(userId) ?? [];
  const txnId = 8_000_000 + nextPurchaseTxnId++;
  list.push({
    amount,
    label: packLabel.trim() || "Credit pack",
    createdAt: new Date().toISOString().slice(0, 10),
    txnId,
  });
  runtimeCreditPurchases.set(userId, list);
}

function runtimePurchasesForUser(userId: number): RuntimeCreditPurchase[] {
  return runtimeCreditPurchases.get(userId) ?? [];
}

function runtimeDebitsForUser(userId: number): RuntimeCreditDebit[] {
  return runtimeCreditDebits.get(userId) ?? [];
}

export function builtinBooking(userId: number, inst: BackendClassInstance): BackendBooking {
  return {
    id: (Math.abs((userId * 7919 + inst.id) % 900_000_000) + 1_000) as number,
    user_id: userId,
    instance_id: inst.id,
    studio_id: inst.studio_id,
    class_type: inst.class_type,
    class_date: inst.date,
    class_time: inst.time ?? undefined,
    day_of_week: inst.day_of_week,
    status: "confirmed",
    attended: false,
    credits_used: Math.round(inst.price_eur ?? 14),
    price_paid_eur: inst.price_eur ?? null,
    booked_at: new Date().toISOString(),
  };
}

/** Illustrative ledger lines — types align with `docs/CREDIT_DATA_AND_METRICS.md` (stored value vs fill / expiry). */
export function builtinCredits(userId: number): BackendCreditBalance {
  const k = userId % 11;
  const packPurchase = 48 + k;
  const redeemA = -(11 + (k % 5));
  const redeemB = -(9 + ((k * 3) % 4));
  const fillBonus = 5; // promo / fill program crediting wallet
  const expiry = k >= 6 ? -2 - (k % 3) : 0;

  const rows: BackendCreditTxn[] = [
    {
      id: userId * 100 + 1,
      user_id: userId,
      type: "pack_purchase",
      amount: packPurchase,
      reason: "Stored-value · 10-class pack",
      created_at: "2026-02-02",
    },
    {
      id: userId * 100 + 2,
      user_id: userId,
      type: "redemption",
      amount: redeemA,
      reason: "Booking redemption · vinyasa",
      created_at: "2026-02-18",
    },
    {
      id: userId * 100 + 3,
      user_id: userId,
      type: "redemption",
      amount: redeemB,
      reason: "Booking redemption · yin",
      created_at: "2026-03-04",
    },
    {
      id: userId * 100 + 4,
      user_id: userId,
      type: "fill_credit",
      amount: fillBonus,
      reason: "Off-peak fill incentive (wallet grant)",
      created_at: "2026-03-08",
    },
  ];

  if (expiry < 0) {
    rows.push({
      id: userId * 100 + 5,
      user_id: userId,
      type: "expiry",
      amount: expiry,
      reason: "Pack value expiry (posted policy)",
      created_at: "2026-03-12",
    });
  }

  const baseBalance = rows.reduce((s, t) => s + t.amount, 0);
  const runtime = runtimeDebitsForUser(userId);
  const runtimeSum = runtime.reduce((s, d) => s + d.amount, 0);

  const purchases = runtimePurchasesForUser(userId);
  const purchaseSum = purchases.reduce((s, p) => s + p.amount, 0);

  const purchaseTxns: BackendCreditTxn[] = purchases.map((p) => ({
    id: p.txnId,
    user_id: userId,
    type: "pack_purchase",
    amount: p.amount,
    reason: `Pack purchase · ${p.label}`,
    created_at: p.createdAt,
  }));

  const runtimeTxns: BackendCreditTxn[] = runtime.map((d, i) => ({
    id: userId * 50_000 + i + 1,
    user_id: userId,
    type: "redemption",
    amount: -d.amount,
    reason: `Class booking · #${d.bookingId}`,
    source_instance_id: d.instanceId,
    created_at: d.createdAt,
  }));

  const transactions = [...purchaseTxns, ...runtimeTxns, ...[...rows].sort((a, b) => b.created_at.localeCompare(a.created_at))].sort(
    (a, b) => b.created_at.localeCompare(a.created_at),
  );
  const balance = Math.max(0, baseBalance - runtimeSum + purchaseSum);

  return {
    user_id: userId,
    balance,
    transactions,
  };
}
