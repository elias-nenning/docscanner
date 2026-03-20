"use client";

import { useMemo, type ComponentType } from "react";
import { Activity, Coins, TrendingUp, Users } from "lucide-react";
import { useAuth } from "@/components/auth/useAuth";
import { useYogaBookings } from "@/components/yoga/useYogaBookings";
import { getYogaStudioById } from "@/components/yoga/useYogaStudio";
import {
  buildDemandMap,
  demandCurveForYogaBooking,
  rollingPeriod,
  yogaBookingsToLifecycles,
} from "@/lib/bookingLifecycleFromYoga";
import { studioPeriodSummary } from "@/lib/incentive-earnings-model";
import { cn } from "@/lib/utils";

function bookingInPeriod(month: string, day: number, period: { from: string; to: string }) {
  const iso = `${month}-${String(day).padStart(2, "0")}`;
  return iso >= period.from && iso <= period.to;
}

type Props = {
  studioId: string;
  className?: string;
};

export function StudioIncentiveLivePanel({ studioId, className }: Props) {
  const { bookings, hydrated } = useYogaBookings();
  const { user, hydrated: authHydrated } = useAuth();

  const customerKey = user?.id != null ? String(user.id) : "session-anonymous";

  const period = useMemo(() => {
    const relevant = bookings.filter((b) => b.studioId === studioId);
    if (!relevant.length) return rollingPeriod(30);
    const dates = relevant
      .map((b) => `${b.month}-${String(b.day).padStart(2, "0")}`)
      .sort();
    return { from: dates[0]!, to: dates[dates.length - 1]! };
  }, [bookings, studioId]);

  const studioBookings = useMemo(() => {
    return bookings.filter(
      (b) => b.studioId === studioId && bookingInPeriod(b.month, b.day, period)
    );
  }, [bookings, studioId, period]);

  const summary = useMemo(() => {
    const demand = buildDemandMap(studioBookings);
    const lifecycles = yogaBookingsToLifecycles(studioBookings, customerKey);
    return studioPeriodSummary(studioId, lifecycles, period, demand);
  }, [studioBookings, studioId, period, customerKey]);

  const studio = getYogaStudioById(studioId);

  const netAcrossCustomers = useMemo(
    () => summary.customers.reduce((s, c) => s + c.netContributionEUR, 0),
    [summary.customers]
  );

  const offPeakCount = useMemo(() => {
    return studioBookings.reduce((n, b) => {
      if (demandCurveForYogaBooking(b).desirability === "off_peak") return n + 1;
      return n;
    }, 0);
  }, [studioBookings]);

  const creditBookings = studioBookings.filter((b) => b.paidWith === "credits").length;

  if (!hydrated || !authHydrated) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-border bg-muted/30 p-6",
          className
        )}
      >
        <div className="h-24 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  return (
    <section
      className={cn(
        "rounded-2xl border border-border bg-gradient-to-b from-muted/40 to-card p-5 shadow-sm dark:from-card/40 dark:to-card/70",
        className
      )}
      aria-labelledby="live-incentive-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <span className="size-1.5 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_0_1px_rgba(16,185,129,0.35)]" />
            Incentive attribution
          </p>
          <h2 id="live-incentive-heading" className="mt-1 text-lg font-semibold tracking-tight text-foreground">
            {studio?.name ?? studioId}
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Rolling window <span className="tabular-nums">{period.from}</span>{" "}
            to <span className="tabular-nums">{period.to}</span>. Estimates credit-attributed list revenue, promotional
            liability, and net contribution using slot tiers (peak / shoulder / off-peak). Figures update when new
            bookings are recorded in this session.
          </p>
        </div>
        <div className="rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium tabular-nums text-foreground">
          {studioBookings.length} booking{studioBookings.length === 1 ? "" : "s"}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric
          icon={TrendingUp}
          label="Credit-paid revenue"
          value={`€${summary.attributedRevenueFromIncentivesEUR.toFixed(0)}`}
          hint="Gross list price, credit checkouts"
        />
        <Metric
          icon={Coins}
          label="Credits recognized"
          value={`€${summary.totalCreditsIssuedEUR.toFixed(0)}`}
          hint="Promotional liability (model)"
        />
        <Metric
          icon={Activity}
          label="Net contribution"
          value={`€${netAcrossCustomers.toFixed(0)}`}
          hint="After credits and policy clawbacks"
        />
        <Metric
          icon={Users}
          label="Off-peak share"
          value={
            studioBookings.length
              ? `${Math.round((offPeakCount / studioBookings.length) * 100)}%`
              : "-"
          }
          hint={`${offPeakCount} / ${studioBookings.length} in lower-demand hours`}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span className="rounded-md border border-border bg-card/80 px-2.5 py-1 font-medium dark:bg-card/60">
          Credit settlements: {creditBookings}
        </span>
        <span className="rounded-md border border-border bg-card/80 px-2.5 py-1 font-medium dark:bg-card/60">
          Distinct customers: {summary.customers.length}
        </span>
      </div>

      {studioBookings.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-border bg-muted/25 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
          No bookings recorded for this studio in the current window. Complete a booking from the schedule above to
          populate attribution metrics.
        </p>
      ) : null}
    </section>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 dark:bg-card/80">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-3.5 shrink-0 opacity-80" />
        <span className="text-[10px] font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <div className="mt-1.5 text-xl font-semibold tabular-nums tracking-tight text-foreground">{value}</div>
      <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{hint}</p>
    </div>
  );
}
