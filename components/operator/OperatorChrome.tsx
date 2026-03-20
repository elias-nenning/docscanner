import { FlowFillJourneyStrip } from "@/components/FlowFillJourney";
import Nav from "@/components/Nav";

type OperatorChromeProps = {
  children: React.ReactNode;
};

/**
 * Operator / B2B shell: intentionally distinct from the consumer studio app:
 * cool slate base, violet wash, so changes read clearly vs. marketing + /yoga.
 */
export function OperatorChrome({ children }: OperatorChromeProps) {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_55%_at_50%_-8%,hsl(var(--sidebar-primary)/0.14),transparent_55%)] dark:bg-[radial-gradient(ellipse_85%_55%_at_50%_-8%,hsl(var(--sidebar-primary)/0.1),transparent_55%)]"
        aria-hidden
      />
      <div className="relative flex min-h-screen flex-col">
        <Nav />
        <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-5 sm:px-5 lg:px-6">{children}</div>
        <FlowFillJourneyStrip tone="app" />
      </div>
    </div>
  );
}
