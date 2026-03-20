"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { backend, isBackendConfigured, type BackendCreditBalance } from "@/components/api/backend";
import { useAuth } from "@/components/auth/useAuth";
import { MOCK_CREDIT_PROFILE } from "@/components/yoga/mockScheduleCredits";
import { useLocalWalletSpend } from "@/hooks/useLocalWalletSpend";

export function useCreditsWallet() {
  const { user, hydrated } = useAuth();
  const spendScope = user?.id != null ? String(user.id) : "guest";
  const localSpendEUR = useLocalWalletSpend(spendScope);
  const [data, setData] = useState<BackendCreditBalance | null>(null);
  const [loading, setLoading] = useState(false);

  const refetch = useCallback(async () => {
    if (!user?.id || !isBackendConfigured()) {
      setData(null);
      return;
    }
    setLoading(true);
    try {
      const b = await backend.getCredits(user.id);
      setData(b);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!hydrated) return;
    void refetch();
  }, [hydrated, refetch]);

  const live = data != null;
  const apiOrMockBalance = data?.balance ?? MOCK_CREDIT_PROFILE.balanceEUR;
  const balanceEUR = useMemo(
    () => Math.max(0, Math.round(apiOrMockBalance - localSpendEUR)),
    [apiOrMockBalance, localSpendEUR],
  );

  return {
    balanceEUR,
    /** Balance from API or demo profile before session-only guest debits. */
    apiOrMockBalanceEUR: Math.round(apiOrMockBalance),
    localSpendEUR,
    transactions: data?.transactions ?? [],
    displayName: user?.name?.trim() || MOCK_CREDIT_PROFILE.displayName,
    memberTierLabel: MOCK_CREDIT_PROFILE.memberTier,
    nextReward: MOCK_CREDIT_PROFILE.nextReward,
    pendingCashbackEUR: MOCK_CREDIT_PROFILE.pendingCashbackEUR,
    monthlyAllowanceEUR: MOCK_CREDIT_PROFILE.monthlyAllowanceEUR,
    usedThisMonthEUR: MOCK_CREDIT_PROFILE.usedThisMonthEUR,
    live,
    loading,
    refetch,
    canUseApi: hydrated && Boolean(user?.id) && isBackendConfigured(),
  };
}
