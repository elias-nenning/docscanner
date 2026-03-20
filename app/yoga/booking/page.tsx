"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth/useAuth";
import { backend } from "@/components/api/backend";
import { getYogaStudioById } from "@/components/yoga/useYogaStudio";
import { useYogaBookings } from "@/components/yoga/useYogaBookings";
import { useCreditsWallet } from "@/hooks/useCreditsWallet";
import { addLocalCreditSpend } from "@/hooks/useLocalWalletSpend";
import { StudioScaffold } from "@/components/ds/studio";
import { fillCreditEUR } from "@/lib/fill-credit-tiers";

type PaymentMethod = "credits" | "card" | "membership";

function BookingInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const { user } = useAuth();
  const { addBooking, refreshBookingsFromApi } = useYogaBookings();
  const { balanceEUR, refetch: refetchWallet } = useCreditsWallet();

  const studioId = sp.get("studio") || "prana";
  const studio = getYogaStudioById(studioId);

  const instanceRaw = sp.get("instance");
  const instanceIdNum = useMemo(() => {
    if (!instanceRaw || !/^\d+$/.test(instanceRaw)) return null;
    return Number(instanceRaw);
  }, [instanceRaw]);

  const month = sp.get("month") || "";
  const day = sp.get("day") || "";
  const time = sp.get("time") || "";
  const name = sp.get("name") || "Class";
  const teacher = sp.get("teacher") || "";
  const dur = sp.get("dur") || "";
  const priceParam = sp.get("price");

  const price = useMemo(() => {
    if (priceParam) {
      const n = Number(priceParam);
      if (!Number.isNaN(n) && n > 0) return Math.round(n);
    }
    return 20;
  }, [priceParam]);

  const [method, setMethod] = useState<PaymentMethod>("credits");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [fillCreditEur, setFillCreditEur] = useState<number | null>(null);

  const submitting = useRef(false);
  const navigateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (navigateTimer.current) clearTimeout(navigateTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!instanceIdNum) {
      setFillCreditEur(null);
      return;
    }
    backend
      .getClass(instanceIdNum)
      .then((c) => {
        const cap = c.capacity ?? 20;
        const booked = c.bookings_count ?? 0;
        const sessionDate = c.date ? `${c.date}T12:00:00` : undefined;
        setFillCreditEur(fillCreditEUR(booked, cap, sessionDate));
      })
      .catch(() => setFillCreditEur(null));
  }, [instanceIdNum]);

  const creditScopeKey = user?.id != null ? String(user.id) : "guest";
  const creditsBalance = balanceEUR;

  const canPayWithCredits = creditsBalance >= price;

  const dateLabel =
    month && day ? `${month}-${String(day).padStart(2, "0")}` : "-";

  async function confirm() {
    if (loading || success || submitting.current) return;
    if (method === "credits" && !instanceIdNum && !canPayWithCredits) return;

    submitting.current = true;
    setLoading(true);
    setErr(null);

    try {
      if (instanceIdNum != null && user?.id) {
        if (method === "credits" && !canPayWithCredits) {
          setErr("Not enough credits for this class.");
          return;
        }
        const booking = await backend.createBooking({
          user_id: user.id,
          instance_id: instanceIdNum,
          pay_with: method,
        });
        if (method === "credits") await refetchWallet();

        const dateStr = booking.class_date;
        const monthPart = dateStr.length >= 7 ? dateStr.slice(0, 7) : month || "1970-01";
        const dayPart =
          dateStr.length >= 10 ? Number(dateStr.slice(8, 10)) : day ? Number(day) : 1;

        addBooking({
          studioId: String(booking.studio_id ?? studioId),
          customerId: user?.id != null ? String(user.id) : undefined,
          month: monthPart,
          day: dayPart,
          time: booking.class_time ?? time,
          name: booking.class_type ?? name,
          teacher,
          dur,
          priceEUR: price,
          paidWith: method,
          serverInstanceId: instanceIdNum,
          serverBookingId: booking.id,
        });
        await refreshBookingsFromApi();
      } else {
        await new Promise((r) => setTimeout(r, 300));
        if (method === "credits") {
          if (!canPayWithCredits) {
            setErr("Not enough credits.");
            return;
          }
          addLocalCreditSpend(price, creditScopeKey);
        }

        const [y, m] = month ? month.split("-") : ["2026", "03"];
        const dayNum = day ? Number(day) : 16;

        addBooking({
          studioId,
          customerId: user?.id != null ? String(user.id) : undefined,
          month: month || `${y}-${m}`,
          day: dayNum,
          time,
          name,
          teacher,
          dur,
          priceEUR: price,
          paidWith: method,
        });
      }

      setSuccess(true);
      navigateTimer.current = setTimeout(() => {
        router.push("/yoga/my-calendar");
      }, 900);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Booking failed. Try again or pick another class.");
    } finally {
      setLoading(false);
      submitting.current = false;
    }
  }

  const payBlocked = method === "credits" && !canPayWithCredits;
  const confirmDisabled = loading || success || payBlocked;

  return (
    <StudioScaffold
      eyebrow="Checkout"
      title="Payment"
      description="Credits, card, or membership. Wallet updates on confirm."
      action={
        <button
          type="button"
          onClick={() => router.back()}
          className="text-xs font-semibold text-muted-foreground transition hover:text-foreground sm:text-sm"
        >
          ← Back
        </button>
      }
    >
      <div className="ff-panel mb-3 border-primary/15 bg-primary/5 px-3 py-2 text-xs text-foreground">
        <strong className="font-semibold">Fill credits:</strong> off-peak schedule tags still debit the wallet the same at checkout.
      </div>

      <div className="ff-panel p-4">
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-muted/40 p-3.5">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Session</div>
          <div className="mt-1 text-base font-bold text-foreground">{name}</div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            {dateLabel} · {time} {dur ? `· ${dur}` : ""}
          </div>
          {teacher ? <div className="mt-0.5 text-xs text-muted-foreground">{teacher}</div> : null}
          <div className="mt-0.5 text-xs text-muted-foreground">{studio?.name ?? studioId}</div>
          {instanceIdNum != null ? (
            <div className="mt-1.5 font-mono text-[10px] text-muted-foreground">#{instanceIdNum}</div>
          ) : null}

          <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
            <div className="text-xs text-muted-foreground">Price</div>
            <div className="text-base font-extrabold text-foreground">€{price}</div>
          </div>
          {fillCreditEur != null && fillCreditEur > 0 ? (
            <div className="mt-2 flex items-center justify-between rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1.5">
              <div className="text-[11px] font-medium text-emerald-800 dark:text-emerald-200">Fill credit (pay with credits)</div>
              <div className="text-sm font-bold text-emerald-700 dark:text-emerald-400">+€{fillCreditEur}</div>
            </div>
          ) : null}
        </div>

        <div className="rounded-xl border border-border bg-card p-3.5">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Payment</div>

          <div className="mt-2 space-y-1.5">
            <button
              type="button"
              onClick={() => setMethod("credits")}
              className={`w-full rounded-xl border px-3 py-2 text-left transition ${
                method === "credits"
                  ? "border-primary/50 bg-primary/10"
                  : "border-border hover:bg-muted/50"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-foreground">Credits</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    €{creditsBalance} in wallet · €{price} for this class
                  </div>
                </div>
                <div
                  className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                    canPayWithCredits
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200"
                      : "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100"
                  }`}
                >
                  {canPayWithCredits ? "OK" : "Not enough"}
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setMethod("card")}
              className={`w-full rounded-xl border px-3 py-2 text-left transition ${
                method === "card" ? "border-primary/50 bg-primary/10" : "border-border hover:bg-muted/50"
              }`}
            >
              <div className="text-sm font-semibold text-foreground">Card</div>
              <div className="mt-0.5 text-xs text-muted-foreground">Card on file via your payments provider.</div>
            </button>

            <button
              type="button"
              onClick={() => setMethod("membership")}
              className={`w-full rounded-xl border px-3 py-2 text-left transition ${
                method === "membership"
                  ? "border-primary/50 bg-primary/10"
                  : "border-border hover:bg-muted/50"
              }`}
            >
              <div className="text-sm font-semibold text-foreground">Membership</div>
              <div className="mt-0.5 text-xs text-muted-foreground">Covered by active membership.</div>
            </button>
          </div>

          {err ? (
            <div className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs text-destructive sm:text-sm">
              {err}
            </div>
          ) : null}

          <div className="mt-3">
            <button
              type="button"
              disabled={confirmDisabled}
              onClick={confirm}
              className={`w-full rounded-xl px-3 py-2 text-xs font-semibold transition sm:text-sm ${
                confirmDisabled ? "cursor-not-allowed bg-muted text-muted-foreground" : "bg-primary text-primary-foreground hover:opacity-90"
              }`}
            >
              {success ? "Booked!" : loading ? "Processing…" : "Confirm & book"}
            </button>
            {method === "credits" && !canPayWithCredits ? (
              <div className="mt-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100 sm:text-xs">
                Short by €{Math.max(0, price - creditsBalance)} —{" "}
                <Link href="/yoga/credits#buy-credits" className="font-semibold text-primary underline-offset-2 hover:underline">
                  buy credits
                </Link>
                , use card, or membership.
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <div className="mt-4 rounded-xl border border-border bg-muted/30 px-3 py-3 text-xs sm:text-sm">
        <p className="font-semibold text-foreground">After booking</p>
        <p className="mt-0.5 text-muted-foreground">
          Opens <strong className="text-foreground">My calendar</strong>. Desk shows the same economics for your team.
        </p>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-medium sm:text-xs">
          <Link href={`/yoga/schedule?studio=${encodeURIComponent(studioId)}`} className="text-primary underline-offset-4 hover:underline">
            ← Back to schedule
          </Link>
          <Link href="/yoga/my-calendar" className="text-primary underline-offset-4 hover:underline">
            My calendar
          </Link>
          <Link href="/dashboard" className="text-primary underline-offset-4 hover:underline">
            Desk overview
          </Link>
          <Link href="/yoga/credits" className="text-primary underline-offset-4 hover:underline">
            My wallet
          </Link>
        </div>
      </div>
      </div>
    </StudioScaffold>
  );
}

export default function YogaBookingPage() {
  return (
    <Suspense fallback={<div className="ff-panel p-8 text-sm text-muted-foreground">Loading…</div>}>
      <BookingInner />
    </Suspense>
  );
}
