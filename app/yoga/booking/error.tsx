"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function BookingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Booking error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-6">
      <h2 className="text-lg font-semibold text-foreground">Booking error</h2>
      <p className="max-w-md text-center text-sm text-muted-foreground">
        {error.message || "Could not load the booking page."}
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Try again
        </button>
        <Link
          href="/yoga/schedule?studio=prana"
          className="rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-muted"
        >
          Back to schedule
        </Link>
      </div>
    </div>
  );
}
