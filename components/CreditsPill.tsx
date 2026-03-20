"use client";

import type { ComponentProps } from "react";
import Link from "next/link";
import { Coins } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCreditsWallet } from "@/hooks/useCreditsWallet";

type CreditsPillProps = {
  className?: string;
  compact?: boolean;
} & Pick<ComponentProps<typeof Link>, "onClick">;

export function CreditsPill({ className, compact, onClick }: CreditsPillProps) {
  const { balanceEUR, loading, live } = useCreditsWallet();
  const label = loading ? "…" : `€${balanceEUR}`;

  return (
    <Link
      href="/yoga/credits"
      onClick={onClick}
      title={
        live
          ? `Wallet: €${balanceEUR} available`
          : `Demo wallet: €${balanceEUR} — sign in for live balance`
      }
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border/90 bg-background/80 px-2.5 py-1 text-xs font-semibold text-foreground shadow-sm backdrop-blur-sm transition",
        "hover:border-border hover:bg-muted/60",
        compact && "px-2 py-0.5 text-[11px]",
        className
      )}
    >
      <Coins className="size-3.5 shrink-0 opacity-80" aria-hidden />
      <span className="tabular-nums tracking-tight" aria-live="polite" aria-atomic="true">
        {label}
      </span>
      {!compact ? <span className="font-medium text-muted-foreground">credits</span> : null}
    </Link>
  );
}
