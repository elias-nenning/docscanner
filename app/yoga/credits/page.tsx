"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Building2, Coins, Receipt, Scale, ShoppingBag, Sparkles } from "lucide-react";
import { StudioPanel, StudioScaffold } from "@/components/ds/studio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MOCK_CREDIT_PACKS, MOCK_WALLET_TRANSACTIONS } from "@/lib/mock-consumer-content";
import { useCreditsWallet } from "@/hooks/useCreditsWallet";
import { backend, type BackendCreditTxn } from "@/components/api/backend";
import { useAuth } from "@/components/auth/useAuth";

const TXN_LABEL: Record<string, string> = {
  pack_purchase: "Pack",
  redemption: "Redeem",
  fill_credit: "Fill",
  expiry: "Expiry",
};

function mapTxnToRow(t: BackendCreditTxn, i: number) {
  const credit = t.amount >= 0;
  const kind = t.type?.trim() || "entry";
  return {
    id: `live-${t.id}-${i}`,
    label: t.reason?.trim() || kind,
    date: t.created_at,
    txnKind: kind,
    txnShort: TXN_LABEL[kind] ?? kind.replace(/_/g, " "),
    type: credit ? ("credit" as const) : ("debit" as const),
    amountEUR: Math.abs(Math.round(t.amount)),
  };
}

export default function YogaMemberCreditsPage() {
  const { user, hydrated } = useAuth();
  const wallet = useCreditsWallet();
  const [purchaseBusyId, setPurchaseBusyId] = useState<string | null>(null);
  const [purchaseErr, setPurchaseErr] = useState<string | null>(null);

  const canBuy = hydrated && Boolean(user?.id);

  async function buyPack(packId: string) {
    if (!user?.id || purchaseBusyId) return;
    setPurchaseErr(null);
    setPurchaseBusyId(packId);
    try {
      await backend.purchaseCreditPack(user.id, packId);
      await wallet.refetch();
    } catch (e) {
      setPurchaseErr(
        e instanceof Error
          ? e.message
          : "Could not add credits. If you use an external API, wire POST /credits/user/:id/purchase there too.",
      );
    } finally {
      setPurchaseBusyId(null);
    }
  }

  const activityRows = useMemo(() => {
    if (wallet.transactions.length > 0) {
      return wallet.transactions.map(mapTxnToRow);
    }
    return MOCK_WALLET_TRANSACTIONS;
  }, [wallet.transactions]);

  return (
    <StudioScaffold
      eyebrow="Wallet"
      title="Your credits & balance"
      description={
        wallet.live
          ? "This is wired to your real account: every add and subtract matches what the studio team sees on their desk. No shadow numbers."
          : "You’re looking at example activity (buying a pack, using credits, little fill offers). Sign in to swap this for your real balance."
      }
      action={
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void wallet.refetch()}
            className="text-xs font-semibold text-primary hover:underline sm:text-sm"
            disabled={!wallet.canUseApi || wallet.loading}
          >
            {wallet.loading ? "Refreshing…" : "Refresh"}
          </button>
          <Link href="/yoga/schedule" className="text-xs font-semibold text-primary hover:underline sm:text-sm">
            Book a class →
          </Link>
          <Link
            href="#buy-credits"
            className="text-xs font-semibold text-primary hover:underline sm:text-sm"
          >
            Buy credits
          </Link>
          <Link
            href="/dashboard/credits"
            className="text-[11px] font-medium text-muted-foreground hover:text-foreground hover:underline sm:text-sm"
          >
            Studio view of credits
          </Link>
        </div>
      }
    >
      <div className="grid gap-3 lg:grid-cols-3">
        <StudioPanel className="p-3.5 lg:col-span-2">
          <div className="flex items-center gap-2 text-primary">
            <Coins className="size-4" aria-hidden />
            <h2 className="text-xs font-bold text-foreground">Current balance</h2>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">{wallet.memberTierLabel}</p>
          <div className="mt-4 flex flex-wrap items-end gap-4">
            <div>
              <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Available</div>
              <div className="text-3xl font-bold tabular-nums text-foreground">€{wallet.balanceEUR}</div>
            </div>
            <div>
              <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                Monthly allowance
              </div>
              <div className="text-xl font-bold tabular-nums text-foreground">€{wallet.monthlyAllowanceEUR}</div>
            </div>
            <div>
              <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Used this month</div>
              <div className="text-xl font-bold tabular-nums text-foreground">€{wallet.usedThisMonthEUR}</div>
            </div>
          </div>
          <p className="mt-3 flex items-start gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1.5 text-[11px] text-emerald-900 dark:text-emerald-100">
            <Sparkles className="mt-0.5 size-3 shrink-0" aria-hidden />
            <span>
              <strong className="font-semibold">Next unlock:</strong> {wallet.nextReward}. Pending cashback €
              {wallet.pendingCashbackEUR} posts after check-in.
            </span>
          </p>
        </StudioPanel>

        <StudioPanel className="flex flex-col justify-between p-3.5">
          <div>
            <div className="flex items-center gap-2 text-foreground">
              <Scale className="size-3.5 text-muted-foreground" aria-hidden />
              <h2 className="text-xs font-bold">Two different things (both normal)</h2>
            </div>
            <ul className="mt-2 space-y-1.5 text-[11px] leading-snug text-muted-foreground">
              <li>
                <strong className="text-foreground">Fill offers</strong> are a small “come to this quiet class” discount — they
                show up on slower time slots, not as a spammy site-wide sale.
              </li>
              <li>
                <strong className="text-foreground">Packs</strong> are money you already spent for classes; they sit in your
                balance until you book. They can still mix with a fill offer up to whatever cap the studio sets.
              </li>
            </ul>
          </div>
          <Link
            href="/yoga/schedule"
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline sm:text-sm"
          >
            See offers on the schedule
            <ArrowRight className="size-3" aria-hidden />
          </Link>
        </StudioPanel>
      </div>

      <section id="buy-credits" className="scroll-mt-24">
        <StudioPanel className="p-3.5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-2 text-primary">
              <ShoppingBag className="size-4" aria-hidden />
              <h2 className="text-xs font-bold text-foreground sm:text-sm">Buy credits</h2>
            </div>
            <p className="max-w-xl text-[11px] leading-snug text-muted-foreground sm:text-xs">
              Pilot checkout: pick a pack and we credit your wallet instantly (no real card). Production would run through your PSP
              and post the same ledger line.
            </p>
          </div>

          {!canBuy ? (
            <p className="mt-3 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
              <Link href="/login" className="font-semibold text-primary hover:underline">
                Sign in
              </Link>{" "}
              to add credits to your account.
            </p>
          ) : null}

          {purchaseErr ? (
            <p className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {purchaseErr}
            </p>
          ) : null}

          <ul className="mt-4 grid gap-3 sm:grid-cols-3">
            {MOCK_CREDIT_PACKS.map((pack) => (
              <li key={pack.id} className="flex flex-col rounded-xl border border-border bg-card p-3 shadow-sm">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{pack.label}</div>
                <div className="mt-1 text-lg font-bold tabular-nums text-foreground">€{pack.eur}</div>
                <div className="mt-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">{pack.bonus}</div>
                <p className="mt-2 flex-1 text-[11px] leading-snug text-muted-foreground">{pack.blurb}</p>
                <div className="mt-2 text-[10px] text-muted-foreground">{pack.creditsEquiv}</div>
                <div className="mt-1 text-[10px] font-medium text-foreground">+€{pack.walletCreditEUR} wallet credit</div>
                <Button
                  type="button"
                  className="mt-3 w-full"
                  size="sm"
                  disabled={!canBuy || purchaseBusyId !== null}
                  onClick={() => void buyPack(pack.id)}
                >
                  {purchaseBusyId === pack.id ? "Adding…" : `Buy · €${pack.eur}`}
                </Button>
              </li>
            ))}
          </ul>
        </StudioPanel>
      </section>

      <StudioPanel className="overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
          <div className="flex items-center gap-2">
            <Receipt className="size-3.5 text-muted-foreground" aria-hidden />
            <h2 className="text-xs font-bold text-foreground">Recent activity</h2>
          </div>
          <span className="text-[10px] font-medium text-muted-foreground">
            {wallet.displayName}
            {wallet.live ? " · live" : ""}
          </span>
        </div>
        <ul className="divide-y divide-border">
          {activityRows.map((row) => (
            <li key={row.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {"txnShort" in row && typeof row.txnShort === "string" ? (
                    <Badge variant="outline" className="h-5 px-1.5 text-[9px] font-bold uppercase tracking-wide">
                      {row.txnShort}
                    </Badge>
                  ) : null}
                  <div className="text-xs font-medium text-foreground sm:text-sm">{row.label}</div>
                </div>
                <div className="text-[10px] text-muted-foreground sm:text-xs">{row.date}</div>
              </div>
              <div
                className={
                  row.type === "credit"
                    ? "text-xs font-bold tabular-nums text-emerald-600 dark:text-emerald-400 sm:text-sm"
                    : "text-xs font-bold tabular-nums text-foreground sm:text-sm"
                }
              >
                {row.type === "credit" ? "+" : ""}
                {row.amountEUR} €
              </div>
            </li>
          ))}
        </ul>
      </StudioPanel>

      <div className="grid gap-3 md:grid-cols-2">
        <StudioPanel className="p-3.5">
          <div className="flex items-center gap-2 text-xs font-bold text-foreground sm:text-sm">
            <Building2 className="size-3.5 text-primary" aria-hidden />
            Running the studio?
          </div>
          <p className="mt-1.5 text-xs leading-snug text-muted-foreground">
            There’s a <strong className="text-foreground">desk view</strong> with the same numbers in more of a spreadsheet vibe.
          </p>
          <Link href="/dashboard" className="mt-3 inline-flex text-xs font-semibold text-primary hover:underline sm:text-sm">
            Open desk overview →
          </Link>
        </StudioPanel>
        <StudioPanel className="p-3.5">
          <h2 className="text-xs font-bold text-foreground sm:text-sm">House rules (typical)</h2>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-muted-foreground">
            <li>Your class credits are good until you use them or they expire — whatever your studio posts wins.</li>
            <li>Late cancels might get a partial credit back; check the studio’s actual policy page.</li>
            <li>Behind the scenes, your studio can pull reports — this app is just the friendly side of that.</li>
          </ul>
        </StudioPanel>
      </div>
    </StudioScaffold>
  );
}
