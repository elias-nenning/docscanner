import Link from "next/link";
import { CalendarCheck2, Coins, LayoutDashboard, MapPin } from "lucide-react";

/** Plain-language tour: member clicks mirror what studio staff see. */
export function ScheduleMemberGuide() {
  const steps = [
    {
      icon: MapPin,
      t: "Studio",
      d: (
        <>
          <Link href="/dashboard/directory" className="text-primary hover:underline">
            Pick a location
          </Link>
        </>
      ),
    },
    {
      icon: Coins,
      t: "Book",
      d: "Pay with your balance; quiet classes may shave a few euros off.",
    },
    {
      icon: CalendarCheck2,
      t: "Calendar",
      d: (
        <>
          <Link href="/yoga/my-calendar" className="text-primary hover:underline">
            Your week
          </Link>
        </>
      ),
    },
    {
      icon: LayoutDashboard,
      t: "Studio check",
      d: (
        <>
          <Link href="/dashboard" className="text-primary hover:underline">
            How full?
          </Link>
          {" · "}
          <Link href="/dashboard/credits" className="text-primary hover:underline">
            Credits sheet
          </Link>
        </>
      ),
    },
  ];

  return (
    <div className="ff-panel p-3">
      <p className="ff-eyebrow text-foreground/80">How the story lines up</p>
      <p className="ff-page-desc mt-1 max-w-none">
        You book with <strong className="text-foreground">honest little perks on quiet classes</strong>, they show on{" "}
        <strong className="text-foreground">your calendar</strong>, and the <strong className="text-foreground">studio desk</strong>{" "}
        sees the same fills and balances — no secret spreadsheet nobody trusts.
      </p>
      <ul className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s) => (
          <li key={s.t} className="flex gap-2 rounded-lg border border-border bg-muted/20 px-2.5 py-2">
            <s.icon className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-foreground">{s.t}</p>
              <p className="text-[10px] leading-snug text-muted-foreground">{s.d}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
