"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { mockAccounts } from "@/data/accounts.mock";
import {
  ACCOUNTS_UPDATED_EVENT,
  getSmartMarketingOverrides,
  setSmartMarketingEnabled,
} from "@/lib/account-store";
import {
  canToggleSmartMarketing,
  resolveSmartMarketingEnabled,
} from "@/lib/account-smart-marketing";
import type { Account } from "@/types/account";

export function useAccounts(): Account[] {
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});

  const refreshOverrides = useCallback(() => {
    setOverrides(getSmartMarketingOverrides());
  }, []);

  useEffect(() => {
    refreshOverrides();

    const handleUpdate = () => refreshOverrides();
    window.addEventListener(ACCOUNTS_UPDATED_EVENT, handleUpdate);
    return () =>
      window.removeEventListener(ACCOUNTS_UPDATED_EVENT, handleUpdate);
  }, [refreshOverrides]);

  return useMemo(
    () =>
      [...mockAccounts]
        .sort((a, b) => a.dealerName.localeCompare(b.dealerName))
        .map((account) => ({
          ...account,
          isSmartMarketingEnabled: resolveSmartMarketingEnabled(
            account,
            overrides,
          ),
        })),
    [overrides],
  );
}

export function useUpdateSmartMarketing(): (
  accountId: string,
  isEnabled: boolean,
) => void {
  return useCallback((accountId: string, isEnabled: boolean) => {
    const account = mockAccounts.find((item) => item.id === accountId);
    if (!account || !canToggleSmartMarketing(account.eligibility)) {
      return;
    }

    setSmartMarketingEnabled(accountId, isEnabled);
  }, []);
}
