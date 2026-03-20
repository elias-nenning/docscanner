import Link from "next/link";
import { ChevronDown, Coins, Percent, UserRound, Users } from "lucide-react";
import { OperatorStatTile } from "@/components/ds/operator-stat";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const customers = [
  {
    id: 1,
    name: "Sofia Müller",
    email: "sofia@email.com",
    credits: 14,
    bookings: 8,
    attended: 6,
    lastClass: "Midday Stretch",
    segment: "Regular",
    since: "Aug 2025",
  },
  {
    id: 2,
    name: "Jonas Weber",
    email: "jonas@email.com",
    credits: 22,
    bookings: 12,
    attended: 11,
    lastClass: "Late Flow",
    segment: "Plus",
    since: "Jan 2025",
  },
  {
    id: 3,
    name: "Lena Schmidt",
    email: "lena@email.com",
    credits: 8,
    bookings: 5,
    attended: 3,
    lastClass: "Core & Breathe",
    segment: "Drop-in",
    since: "Nov 2025",
  },
  {
    id: 4,
    name: "Max Bauer",
    email: "max@email.com",
    credits: 31,
    bookings: 15,
    attended: 14,
    lastClass: "Vinyasa Flow",
    segment: "Plus",
    since: "Mar 2024",
  },
  {
    id: 5,
    name: "Anna Klein",
    email: "anna@email.com",
    credits: 5,
    bookings: 3,
    attended: 2,
    lastClass: "Morning Flow Yoga",
    segment: "Drop-in",
    since: "Feb 2026",
  },
  {
    id: 6,
    name: "Tim Fischer",
    email: "tim@email.com",
    credits: 18,
    bookings: 9,
    attended: 8,
    lastClass: "Late Flow",
    segment: "Regular",
    since: "Jun 2025",
  },
  {
    id: 7,
    name: "Elena Vogt",
    email: "elena.v@email.com",
    credits: 26,
    bookings: 11,
    attended: 10,
    lastClass: "Prenatal Gentle",
    segment: "Corporate",
    since: "Sep 2025",
  },
  {
    id: 8,
    name: "Marc Jensen",
    email: "marc.j@email.com",
    credits: 12,
    bookings: 7,
    attended: 5,
    lastClass: "Power Lunch Flow",
    segment: "Regular",
    since: "Dec 2025",
  },
];

export default function OperatorCreditsPage() {
  const totalCredits = customers.reduce((s, c) => s + c.credits, 0);
  const totalBookings = customers.reduce((s, c) => s + c.bookings, 0);
  const totalAttended = customers.reduce((s, c) => s + c.attended, 0);
  const attendanceRate = Math.round((totalAttended / totalBookings) * 100);

  const stats = [
    {
      label: "Total class credits on the sheet",
      value: `€${totalCredits}`,
      hint: "Add-up of the fake balances below",
      icon: Coins,
      accent: "text-indigo-600 dark:text-indigo-400",
    },
    {
      label: "Bookings (sample)",
      value: totalBookings,
      hint: "Reservations in this pretend month",
      icon: UserRound,
      accent: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Actually showed up",
      value: `${attendanceRate}%`,
      hint: "Of booked spots, how many walked in",
      icon: Percent,
      accent: "text-amber-600 dark:text-amber-400",
    },
    {
      label: "People in this table",
      value: customers.length,
      hint: "Made-up members for layout",
      icon: Users,
      accent: "text-rose-600 dark:text-rose-400",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <p className="max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground">
          <strong className="font-medium text-foreground">Sample grid</strong> for desk layout. Real balances:{" "}
          <Link href="/yoga/credits" className="font-medium text-primary underline-offset-4 hover:underline">
            Members → Wallet
          </Link>
          .
        </p>
        <Badge variant="secondary" className="w-fit shrink-0 font-normal">
          Sample data
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <OperatorStatTile
            key={stat.label}
            label={stat.label}
            value={stat.value}
            hint={stat.hint}
            icon={stat.icon}
            stripe="indigo"
            valueClassName={stat.accent}
            iconClassName={stat.accent}
          />
        ))}
      </div>

      <Card className="overflow-hidden p-0">
        <CardHeader className="border-b border-border px-6 py-4">
          <CardTitle className="text-base">Who owes what (sample)</CardTitle>
          <CardDescription className="text-xs">Eight fake people — names are for vibes only</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {["Person", "Type", "Balance (€)", "Booked", "Showed up", "Member since", "Last class"].map((h) => (
                  <TableHead key={h} className="h-11 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs text-muted-foreground">{c.email}</div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{c.segment}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="tabular-nums font-semibold">
                      €{c.credits}
                    </Badge>
                  </TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">{c.bookings}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        bookingRate(c) >= 80 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"
                      )}
                    >
                      {c.attended} ({bookingRate(c)}%)
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{c.since}</TableCell>
                  <TableCell className="text-muted-foreground">{c.lastClass}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <details className="group rounded-xl border border-border/80 bg-muted/15 text-sm open:bg-muted/20">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 font-medium text-foreground [&::-webkit-details-marker]:hidden">
          <span>For the accounting-minded folks</span>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground transition group-open:rotate-180" aria-hidden />
        </summary>
        <div className="space-y-2 border-t border-border/60 px-4 pb-4 pt-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            When someone buys a pack, that cash sits as “they’re owed classes” until they take them. Comparing{" "}
            <em>booked</em> vs <em>actually came</em> keeps front desk and back office from arguing about the same numbers.
          </p>
          <p className="text-xs">
            In a real rollout you’d export CSVs by studio. This screen is just showing you the shape of that story.
          </p>
        </div>
      </details>
    </div>
  );
}

function bookingRate(c: { attended: number; bookings: number }) {
  return Math.round((c.attended / c.bookings) * 100);
}
