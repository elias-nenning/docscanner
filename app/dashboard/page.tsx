"use client";

import Link from "next/link";
import {
  BarChart3,
  Building2,
  Calendar,
  Coins,
  Gauge,
  Layers,
  Moon,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { OperatorStatTile } from "@/components/ds/operator-stat";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useOperatorDashboardData } from "@/hooks/use-operator-dashboard-data";
import { fillCreditEUR, fillCreditLabel } from "@/lib/fill-credit-tiers";
import { yogaApiModeLabel } from "@/lib/yoga-data-source";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const {
    live,
    apiMode,
    classes,
    studioPortfolio,
    focusStudioName,
    dataDate,
    loading: dashboardLoading,
    error: dashboardError,
  } = useOperatorDashboardData();

  function getIncentive(booked: number, capacity: number, sessionDate?: string) {
    const eur = fillCreditEUR(booked, capacity, sessionDate);
    if (eur <= 0) return null;
    const label = fillCreditLabel(booked, capacity, sessionDate);
    return {
      label: label ? `${label} credit` : `€${eur} fill credit`,
      variant: eur >= 6 ? ("secondary" as const) : ("outline" as const),
      eur,
    };
  }

  function getFillColor(booked: number, capacity: number) {
    const rate = booked / capacity;
    if (rate >= 0.9) return "bg-destructive";
    if (rate >= 0.6) return "bg-amber-500";
    return "bg-emerald-500";
  }

  const totalCapacity = classes.reduce((s, c) => s + c.capacity, 0);
  const totalBooked = classes.reduce((s, c) => s + c.booked, 0);
  const fillRate = totalCapacity > 0 ? Math.round((totalBooked / totalCapacity) * 100) : 0;
  const todayStr = dataDate ?? new Date().toISOString().slice(0, 10);
  const incentiveCount = classes.filter((c) => getIncentive(c.booked, c.capacity, todayStr)).length;
  const fillCreditExposureEUR = classes.reduce((sum, c) => {
    const inc = getIncentive(c.booked, c.capacity, todayStr);
    return sum + (inc ? inc.eur : 0);
  }, 0);
  const openSeats = Math.max(0, totalCapacity - totalBooked);
  const fullClasses = classes.filter((c) => c.booked >= c.capacity).length;
  const lightClasses = classes.filter((c) => c.capacity > 0 && c.booked / c.capacity < 0.5).length;
  const peakFillPct =
    classes.length > 0
      ? Math.max(...classes.map((c) => (c.capacity > 0 ? Math.round((c.booked / c.capacity) * 100) : 0)))
      : 0;

  const totalStudios = studioPortfolio.length;
  const totalClassesNetwork = studioPortfolio.reduce((s, x) => s + x.classesPerDay, 0);
  const totalCredits = studioPortfolio.reduce((s, x) => s + x.creditsOffered, 0);
  const avgNetworkFill = Math.round(
    studioPortfolio.reduce((s, x) => s + x.avgFill, 0) / Math.max(1, totalStudios),
  );
  const topStudio = [...studioPortfolio].sort((a, b) => b.avgFill - a.avgFill)[0];
  const quietStudio = [...studioPortfolio].sort((a, b) => a.avgFill - b.avgFill)[0];
  const studiosWithNudges = studioPortfolio.filter((s) => s.creditsOffered > 0).length;
  const avgClassesPerStudio =
    totalStudios > 0 ? Math.round(totalClassesNetwork / totalStudios) : 0;

  const studioMetrics = [
    {
      label: "Occupancy",
      value: `${fillRate}%`,
      hint: "Seats filled ÷ capacity · today",
      icon: Gauge,
      accent: "text-indigo-600 dark:text-indigo-400",
      stripe: "indigo" as const,
    },
    {
      label: "Classes",
      value: classes.length,
      hint: "On the schedule today",
      icon: Layers,
      accent: "text-emerald-600 dark:text-emerald-400",
      stripe: "emerald" as const,
    },
    {
      label: "Fill offers on",
      value: incentiveCount,
      hint: "Classes with fill incentive (€3–€8 by occupancy)",
      icon: Sparkles,
      accent: "text-amber-600 dark:text-amber-400",
      stripe: "indigo" as const,
    },
    {
      label: "Open seats",
      value: openSeats,
      hint: "Still bookable today",
      icon: Users,
      accent: "text-sky-600 dark:text-sky-400",
      stripe: "violet" as const,
    },
    {
      label: "Full classes",
      value: fullClasses,
      hint: "At capacity · waitlist risk",
      icon: Target,
      accent: "text-rose-600 dark:text-rose-400",
      stripe: "violet" as const,
    },
    {
      label: "Light classes",
      value: lightClasses,
      hint: "Under 50% full",
      icon: Moon,
      accent: "text-violet-600 dark:text-violet-400",
      stripe: "violet" as const,
    },
    {
      label: "Peak room fill",
      value: `${peakFillPct}%`,
      hint: "Highest single-class occupancy",
      icon: TrendingUp,
      accent: "text-emerald-700 dark:text-emerald-300",
      stripe: "emerald" as const,
    },
    {
      label: "Offer exposure",
      value: `€${fillCreditExposureEUR}`,
      hint: "Rough € if every nudge maxes out",
      icon: Coins,
      accent: "text-amber-700 dark:text-amber-300",
      stripe: "indigo" as const,
    },
  ];

  const networkMetrics = [
    {
      label: "Studios",
      value: totalStudios,
      hint: "Locations in network",
      icon: Building2,
      accent: "text-indigo-600 dark:text-indigo-400",
      stripe: "indigo" as const,
    },
    {
      label: "Class slots / day",
      value: totalClassesNetwork,
      hint: "Total scheduled capacity index",
      icon: Calendar,
      accent: "text-emerald-600 dark:text-emerald-400",
      stripe: "emerald" as const,
    },
    {
      label: "Avg fill",
      value: `${avgNetworkFill}%`,
      hint: "Across all studio averages",
      icon: BarChart3,
      accent: "text-sky-600 dark:text-sky-400",
      stripe: "violet" as const,
    },
    {
      label: "Nudge budget",
      value: `€${totalCredits}`,
      hint: "Combined fill-offer budget (index)",
      icon: Coins,
      accent: "text-amber-600 dark:text-amber-400",
      stripe: "indigo" as const,
    },
    {
      label: "Busiest studio",
      value: topStudio?.name ?? "—",
      hint: topStudio ? `${topStudio.avgFill}% avg fill` : "No data",
      icon: TrendingUp,
      accent: "text-emerald-700 dark:text-emerald-300",
      stripe: "emerald" as const,
    },
    {
      label: "Quietest studio",
      value: quietStudio?.name ?? "—",
      hint: quietStudio ? `${quietStudio.avgFill}% avg fill` : "No data",
      icon: TrendingDown,
      accent: "text-rose-600 dark:text-rose-400",
      stripe: "violet" as const,
    },
    {
      label: "Studios with nudges",
      value: studiosWithNudges,
      hint: "Running fill offers (index)",
      icon: Sparkles,
      accent: "text-violet-600 dark:text-violet-400",
      stripe: "violet" as const,
    },
    {
      label: "Classes / studio",
      value: avgClassesPerStudio,
      hint: "Average workload per location",
      icon: Layers,
      accent: "text-indigo-700 dark:text-indigo-300",
      stripe: "indigo" as const,
    },
  ];

  return (
    <div className="ff-panel overflow-hidden p-0 shadow-sm">
      <header className="ff-main-padding border-b border-border/80 bg-muted/20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="ff-eyebrow">Studio · {focusStudioName}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {live && dataDate ? dataDate : "Today"}
              {live ? " · live schedule" : ""}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={live ? "default" : "secondary"} className="font-normal">
              {yogaApiModeLabel(apiMode)}
            </Badge>
            {dashboardLoading ? (
              <Badge variant="outline" className="animate-pulse font-normal">
                Loading…
              </Badge>
            ) : null}
            <Button size="sm" variant="outline" className="rounded-lg" asChild>
              <Link href="/yoga/schedule">
                <Calendar className="size-3.5" aria-hidden />
                Schedule
              </Link>
            </Button>
            <Button size="sm" variant="ghost" className="rounded-lg" asChild>
              <Link href="/dashboard/directory">Studios</Link>
            </Button>
            <Button size="sm" variant="ghost" className="rounded-lg" asChild>
              <Link href="/dashboard/credits">Credits</Link>
            </Button>
          </div>
        </div>
        {dashboardError ? (
          <p className="mt-3 text-sm text-amber-800 dark:text-amber-200">{dashboardError} · showing sample grid</p>
        ) : null}
      </header>

      <div className="ff-main-padding">
        <Tabs defaultValue="studio" className="w-full">
          <TabsList className="mb-6 grid h-10 w-full max-w-md grid-cols-2 rounded-lg bg-muted/60 p-1">
            <TabsTrigger value="studio" className="rounded-md text-sm font-medium data-[state=active]:shadow-sm">
              One studio
            </TabsTrigger>
            <TabsTrigger value="platform" className="rounded-md text-sm font-medium data-[state=active]:shadow-sm">
              Network
            </TabsTrigger>
          </TabsList>

          <TabsContent value="studio" className="mt-0 space-y-6">
            <section aria-labelledby="studio-metrics-heading">
              <h2 id="studio-metrics-heading" className="ff-section-title ff-header-rule">
                Today&apos;s metrics
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {studioMetrics.map((stat) => (
                  <OperatorStatTile
                    key={stat.label}
                    label={stat.label}
                    value={stat.value}
                    hint={stat.hint}
                    icon={stat.icon}
                    stripe={stat.stripe}
                    valueClassName={stat.accent}
                    iconClassName={stat.accent}
                  />
                ))}
              </div>
            </section>

            <Card className="overflow-hidden rounded-xl border-border/70 shadow-none">
              <CardHeader className="border-b border-border/70 bg-muted/15 px-4 py-4 md:px-5">
                <CardTitle className="text-base font-semibold tracking-tight">Today&apos;s classes</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Booked vs capacity · fill offers mirror the member schedule
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      {["Time", "Class", "Teacher", "Booked", "Fill", "Offer"].map((h) => (
                        <TableHead
                          key={h}
                          className="h-11 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-xs"
                        >
                          {h}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classes.map((cls) => {
                      const incentive = getIncentive(cls.booked, cls.capacity, todayStr);
                      const rowFillRate = cls.capacity > 0 ? Math.round((cls.booked / cls.capacity) * 100) : 0;
                      return (
                        <TableRow key={cls.id}>
                          <TableCell className="font-mono text-xs text-muted-foreground">{cls.time}</TableCell>
                          <TableCell className="font-medium text-foreground">{cls.name}</TableCell>
                          <TableCell className="text-muted-foreground">{cls.instructor}</TableCell>
                          <TableCell className="tabular-nums text-muted-foreground">
                            {cls.booked}/{cls.capacity}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                                <div
                                  className={cn("h-full rounded-full", getFillColor(cls.booked, cls.capacity))}
                                  style={{ width: `${rowFillRate}%` }}
                                />
                              </div>
                              <span className="text-xs tabular-nums text-muted-foreground">{rowFillRate}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {incentive ? (
                              <Badge variant={incentive.variant} className="text-[10px] font-semibold">
                                {incentive.label}
                              </Badge>
                            ) : (
                              <span className="text-sm text-muted-foreground">—</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="platform" className="mt-0 space-y-6">
            <section aria-labelledby="network-metrics-heading">
              <h2 id="network-metrics-heading" className="ff-section-title ff-header-rule">
                Network metrics
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {networkMetrics.map((stat) => (
                  <OperatorStatTile
                    key={stat.label}
                    label={stat.label}
                    value={stat.value}
                    hint={stat.hint}
                    icon={stat.icon}
                    stripe={stat.stripe}
                    valueClassName={cn(stat.accent, stat.label === "Busiest studio" && "truncate text-lg")}
                    iconClassName={stat.accent}
                  />
                ))}
              </div>
            </section>

            <Card className="overflow-hidden rounded-xl border-border/70 shadow-none">
              <CardHeader className="border-b border-border/70 bg-muted/15 px-4 py-4 md:px-5">
                <CardTitle className="text-base font-semibold tracking-tight">Per-studio snapshot</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Rollup by location</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      {["Studio", "City", "Classes / day", "Fill", "Nudge €", "Status"].map((h) => (
                        <TableHead
                          key={h}
                          className="h-11 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-xs"
                        >
                          {h}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studioPortfolio.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.name}</TableCell>
                        <TableCell className="text-muted-foreground">{s.city}</TableCell>
                        <TableCell className="tabular-nums text-muted-foreground">{s.classesPerDay}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                              <div
                                className={cn(
                                  "h-full rounded-full",
                                  s.avgFill >= 80 ? "bg-emerald-500" : s.avgFill >= 65 ? "bg-amber-500" : "bg-rose-500",
                                )}
                                style={{ width: `${s.avgFill}%` }}
                              />
                            </div>
                            <span className="text-xs tabular-nums text-muted-foreground">{s.avgFill}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="tabular-nums text-muted-foreground">€{s.creditsOffered}</TableCell>
                        <TableCell>
                          <Badge variant={s.avgFill >= 75 ? "default" : "secondary"} className="text-[10px] font-semibold">
                            {s.avgFill >= 75 ? "Strong" : "Watch"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
