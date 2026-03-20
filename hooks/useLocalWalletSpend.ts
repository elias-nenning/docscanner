"use client";

import { useEffect, useState } from "react";

const EVT = "ff-wallet-local-spend";

function readSpend(scopeKey: string): number {
  if (typeof window === "undefined") return 0;
  const raw = sessionStorage.getItem(`ff_local_credit_spend:${scopeKey}`);
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** Session-only debits when checkout doesn’t hit the credits API (guest / deep-link without instance). */
export function addLocalCreditSpend(amount: number, scopeKey: string) {
  if (typeof window === "undefined" || !Number.isFinite(amount) || amount <= 0) return;
  const next = readSpend(scopeKey) + Math.round(amount);
  sessionStorage.setItem(`ff_local_credit_spend:${scopeKey}`, String(next));
  window.dispatchEvent(new CustomEvent(EVT, { detail: { scopeKey } }));
}

export function useLocalWalletSpend(scopeKey: string): number {
  const [n, setN] = useState(0);

  useEffect(() => {
    const sync = (e: Event) => {
      const d = (e as CustomEvent<{ scopeKey?: string }>).detail;
      if (d?.scopeKey != null && d.scopeKey !== scopeKey) return;
      setN(readSpend(scopeKey));
    };
    setN(readSpend(scopeKey));
    window.addEventListener(EVT, sync as EventListener);
    return () => window.removeEventListener(EVT, sync as EventListener);
  }, [scopeKey]);

  return n;
}
