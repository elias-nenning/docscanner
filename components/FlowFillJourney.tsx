import Link from "next/link";
import { FLOWFILL_JOURNEY_BEATS } from "@/lib/flowfill-journey";
import { cn } from "@/lib/utils";

const toneClass = {
  marketing: {
    section: "border-t border-border bg-muted/15",
    inner: "ff-page-frame ff-main-padding",
    eyebrow: "text-muted-foreground",
    title: "text-foreground",
    link: "text-muted-foreground hover:text-foreground",
    step: "text-muted-foreground/80",
  },
  /** Members + Desk in-app footer (same chrome as marketing tokens). */
  app: {
    section: "border-t border-border bg-background/90 backdrop-blur-sm",
    inner: "ff-page-frame ff-main-padding py-3.5 sm:py-4",
    eyebrow: "text-muted-foreground",
    title: "text-foreground",
    link: "text-muted-foreground hover:text-foreground",
    step: "text-muted-foreground/80",
  },
  dark: {
    section: "border-t border-slate-800 bg-slate-950 text-white",
    inner: "mx-auto max-w-4xl px-4 py-5 sm:px-6",
    eyebrow: "text-slate-400",
    title: "text-white",
    link: "text-slate-300 hover:text-white",
    step: "text-slate-500",
  },
} as const;

export type FlowFillJourneyTone = keyof typeof toneClass;

/** Horizontal strip: quick navigation across the product. */
export function FlowFillJourneyStrip({
  className,
  tone = "marketing",
}: {
  className?: string;
  tone?: FlowFillJourneyTone;
}) {
  const t = toneClass[tone];
  return (
    <div className={cn(t.section, className)}>
      <div className={cn(t.inner, "space-y-1.5")}>
        <p className={cn("text-[10px] font-bold uppercase tracking-[0.14em]", t.eyebrow)}>Quick links</p>
        <nav aria-label="Jump to key pages" className="flex flex-wrap gap-x-1 gap-y-1 text-[11px] sm:text-xs">
          {FLOWFILL_JOURNEY_BEATS.map((b, i) => (
            <span key={b.href} className="inline-flex items-center gap-1">
              {i > 0 ? <span className={cn("px-0.5 opacity-60", t.step)} aria-hidden>·</span> : null}
              <Link href={b.href} className={cn("font-medium underline-offset-2 hover:underline", t.link)} title={b.hint}>
                <span className={cn("mr-0.5 tabular-nums", t.step)}>{b.step}</span>
                {b.label}
              </Link>
            </span>
          ))}
          <span className={cn("inline-flex items-center opacity-60", t.step)} aria-hidden>
            <span className="px-0.5">·</span>
          </span>
          <Link href="/login" className={cn("font-medium underline-offset-2 hover:underline", t.link)}>
            Sign in
          </Link>
        </nav>
      </div>
    </div>
  );
}

/** Homepage footer: compact step grid. */
export function FlowFillSiteFooter() {
  return (
    <footer className="border-t border-border bg-muted/15">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <p className="ff-eyebrow text-muted-foreground">Prototype</p>
        <h2 className="mt-1 text-base font-semibold tracking-tight text-foreground">
          Members and Desk in one workspace
        </h2>
        <p className="mt-1 max-w-xl text-xs text-muted-foreground">
          Same account and data. Switch between Members and Desk from the sidebar or header anytime.
        </p>
        <ol className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {FLOWFILL_JOURNEY_BEATS.map((b) => (
            <li key={b.href}>
              <Link
                href={b.href}
                className="ff-panel block h-full rounded-lg p-3 transition hover:border-primary/25 hover:shadow-sm"
              >
                <span className="text-[10px] font-bold tabular-nums text-muted-foreground">{b.step}</span>
                <p className="mt-0.5 text-sm font-semibold text-foreground">{b.label}</p>
                <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{b.hint}</p>
              </Link>
            </li>
          ))}
        </ol>
        <div className="mt-4 text-xs text-muted-foreground">
          <Link href="/login" className="font-medium text-primary underline-offset-2 hover:underline">
            Sign in
          </Link>
          <span className="mx-1.5">·</span>
          After login: Members home.
        </div>
      </div>
    </footer>
  );
}
