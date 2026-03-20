import Link from "next/link";
import { FlowFillJourneyStrip } from "@/components/FlowFillJourney";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="ff-page-frame max-w-lg px-4 py-14 text-center sm:py-16 md:px-6">
        <p className="ff-eyebrow text-muted-foreground">404</p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">We couldn’t find that page</h1>
        <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
          URL may have moved. Pick an entry point below.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button asChild variant="secondary" className="rounded-full">
            <Link href="/">Home</Link>
          </Button>
          <Button asChild className="rounded-full">
            <Link href="/yoga/home">Studio</Link>
          </Button>
        </div>
      </main>
      <FlowFillJourneyStrip />
    </div>
  );
}
