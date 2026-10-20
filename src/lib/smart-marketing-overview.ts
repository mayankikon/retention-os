import type { Account } from "@/types/account";
import type { Campaign } from "@/types/campaign";

export const OVERVIEW_PAGE_SIZE = 18;

export const OVERVIEW_SORT_KEYS = [
  "dealership",
  "accountManager",
  "eligibility",
  "activeStatus",
] as const;

export type OverviewSortKey = (typeof OVERVIEW_SORT_KEYS)[number];
export type OverviewSortDirection = "asc" | "desc";

export interface OverviewSort {
  key: OverviewSortKey;
  direction: OverviewSortDirection;
}

export interface OverviewStats {
  /** Accounts allowed to run Smart Marketing. */
  eligible: number;
  /** Eligible accounts with Smart Marketing switched on. */
  enabled: number;
  /** Enabled accounts with at least one active campaign covering them. */
  live: number;
}

function getCampaignDealers(campaign: Campaign): string[] {
  return campaign.dealers?.length ? campaign.dealers : [campaign.dealer];
}

export function getOverviewStats(
  accounts: Account[],
  campaigns: Campaign[],
): OverviewStats {
  const dealersWithActiveCampaign = new Set(
    campaigns
      .filter((campaign) => campaign.status === "active")
      .flatMap(getCampaignDealers),
  );
  const enabledAccounts = accounts.filter(
    (account) => account.isSmartMarketingEnabled,
  );

  return {
    eligible: accounts.filter((account) => account.eligibility === "eligible")
      .length,
    enabled: enabledAccounts.length,
    live: enabledAccounts.filter((account) =>
      dealersWithActiveCampaign.has(account.dealerName),
    ).length,
  };
}

const SORT_VALUE: Record<OverviewSortKey, (account: Account) => string> = {
  dealership: (account) => account.dealerName,
  accountManager: (account) => account.accountManager.name,
  // "eligible" before "not_eligible" ascending.
  eligibility: (account) => account.eligibility,
  // Enabled first ascending, then ineligible (locked off) last.
  activeStatus: (account) =>
    account.isSmartMarketingEnabled
      ? "0"
      : account.eligibility === "eligible"
        ? "1"
        : "2",
};

/** Stable sort; ties keep dealership order from `filterAccounts`. */
export function sortOverviewAccounts(
  accounts: Account[],
  sort: OverviewSort | null,
): Account[] {
  if (!sort) return accounts;

  const getValue = SORT_VALUE[sort.key];
  const factor = sort.direction === "asc" ? 1 : -1;
  return [...accounts].sort(
    (a, b) => getValue(a).localeCompare(getValue(b)) * factor,
  );
}

/** Header click cycles: ascending → descending → unsorted. */
export function getNextOverviewSort(
  current: OverviewSort | null,
  key: OverviewSortKey,
): OverviewSort | null {
  if (current?.key !== key) return { key, direction: "asc" };
  if (current.direction === "asc") return { key, direction: "desc" };
  return null;
}
