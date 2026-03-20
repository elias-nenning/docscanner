"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { deskFooterExtras, deskPrimaryNav } from "@/lib/desk-nav";
import { memberFooterStrip } from "@/lib/member-quick-nav";

const deskLinks = [
  ...deskPrimaryNav.map(({ href, label }) => ({ href, label })),
  ...deskFooterExtras,
] as const;

export function FlowFillJourneyStripApp({ className }: { className?: string }) {
  const pathname = usePathname() ?? "";
  const onDesk = pathname.startsWith("/dashboard") || pathname === "/credits";
  const links = onDesk ? deskLinks : memberFooterStrip;

  return (
    <div
      className={cn(
        "border-t border-border bg-muted/20 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80",
        className,
      )}
    >
      <div className="ff-page-frame ff-main-padding flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
        <p className="ff-eyebrow shrink-0">Shortcuts</p>
        <nav aria-label="Related pages" className="flex min-w-0 flex-wrap gap-x-0.5 gap-y-1 text-[11px] sm:text-xs">
          {links.map((item, i) => (
            <span key={`${item.href}-${item.label}`} className="inline-flex items-center">
              {i > 0 ? (
                <span className="px-1.5 text-muted-foreground/45" aria-hidden>
                  ·
                </span>
              ) : null}
              <Link
                href={item.href}
                className="rounded-md px-0.5 font-medium text-muted-foreground underline-offset-2 hover:bg-muted/80 hover:text-foreground hover:underline"
              >
                {item.label}
              </Link>
            </span>
          ))}
        </nav>
      </div>
    </div>
  );
}
