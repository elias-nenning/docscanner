import Link from "next/link";
import { BarChart3, Coins, LayoutDashboard, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const pillars = [
  {
    title: "Desk",
    icon: BarChart3,
    body: "Live timetable + network rollups: spot weak buckets before you discount the whole house.",
  },
  {
    title: "Members",
    icon: Users,
    body: "Wallet, packs, and fills in one checkout path: no hidden codes; numbers match finance.",
  },
  {
    title: "Economics",
    icon: Coins,
    body: "Incentives lock to soft slots only; liability, redemption, and attendance stay in one model.",
  },
];

const steps = [
  { n: "1", title: "Publish truth", detail: "Capacity, instructors, and slot archetypes per site." },
  { n: "2", title: "Target weak demand", detail: "Tiered fill credits (e.g. €5 / €3) when projected fill drops." },
  { n: "3", title: "Close the loop", detail: "Bookings, wallets, and show-ups reconcile in Desk without re-keying." },
];

export function HomeSections() {
  return (
    <section className="border-t border-border bg-muted/25 py-10 md:py-12">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="text-center">
          <p className="ff-eyebrow">Why FlowFill</p>
          <h2 className="ff-section-title mx-auto mt-1 max-w-lg text-balance md:text-xl">
            Fill mats without racing to the bottom
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-pretty text-xs text-muted-foreground md:text-sm">
            One product, two workspaces: <strong className="font-medium text-foreground">Members</strong> books and pays;{" "}
            <strong className="font-medium text-foreground">Desk</strong> sees utilization and credit exposure, same API and
            policy engine.
          </p>
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-3">
          {pillars.map((p) => (
            <div
              key={p.title}
              className="rounded-xl border border-border bg-card p-4 shadow-sm transition hover:border-primary/20"
            >
              <p.icon className="size-6 text-primary" aria-hidden />
              <h3 className="mt-2 text-sm font-semibold text-foreground">{p.title}</h3>
              <p className="mt-1 text-xs leading-snug text-muted-foreground">{p.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <div className="flex items-center gap-1.5 text-foreground">
            <Sparkles className="size-4 text-primary" aria-hidden />
            <h3 className="ff-section-title text-sm md:text-base">How it fits</h3>
          </div>
          <ol className="mt-3 grid gap-2 md:grid-cols-3">
            {steps.map((s) => (
              <li
                key={s.n}
                className="relative rounded-xl border border-border bg-background/80 px-3 py-3 pt-6 shadow-sm backdrop-blur-sm"
              >
                <span className="absolute left-3 top-2 text-[10px] font-bold tabular-nums text-muted-foreground">{s.n}</span>
                <p className="text-sm font-semibold text-foreground">{s.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{s.detail}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 border-t border-border pt-6">
          <Button asChild className="h-9 rounded-full px-4 text-sm" variant="secondary">
            <Link href="/yoga/schedule">Schedule</Link>
          </Button>
          <Button asChild className="h-9 rounded-full px-4 text-sm" variant="outline">
            <Link href="/dashboard/directory">Directory</Link>
          </Button>
          <Button asChild className="h-9 rounded-full px-4 text-sm" variant="default">
            <Link href="/dashboard" className="inline-flex items-center gap-1.5">
              <LayoutDashboard className="size-3.5" aria-hidden />
              Desk
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
