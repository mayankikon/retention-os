import { FILTER_ALL } from "@/data/lookups";
import { getTotalPages, paginateItems } from "@/lib/pagination";
import {
  DEFAULT_ACCOUNT_PAGE_SIZE,
  type Account,
  type AccountFilters,
} from "@/types/account";

export const SMART_MARKETING_FILTER_ON = "on";
export const SMART_MARKETING_FILTER_OFF = "off";

export const eligibilityFilterOptions = [
  { value: FILTER_ALL, label: "All Eligibility" },
  { value: "eligible", label: "Eligible" },
  { value: "not_eligible", label: "Not eligible" },
];

export const smartMarketingFilterOptions = [
  { value: FILTER_ALL, label: "All Smart Marketing" },
  { value: SMART_MARKETING_FILTER_ON, label: "On" },
  { value: SMART_MARKETING_FILTER_OFF, label: "Off" },
];

export interface SelectAccountsResult {
  rows: Account[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type AccountEmptyStateVariant = "noData" | "noSearchResults" | "filteredZero";

export function hasActiveAccountFilters(filters: AccountFilters): boolean {
  return Boolean(
    filters.q.trim() ||
      (filters.eligibility && filters.eligibility !== FILTER_ALL) ||
      (filters.smartMarketing && filters.smartMarketing !== FILTER_ALL),
  );
}

function matchesSearch(account: Account, query: string): boolean {
  const haystack = [
    account.dealerName,
    account.groupName,
    account.accountManager.name,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

export function compareAccountsByDealerName(a: Account, b: Account): number {
  return a.dealerName.localeCompare(b.dealerName);
}

export function filterAccounts(
  accounts: Account[],
  filters: AccountFilters,
): Account[] {
  const query = filters.q.trim().toLowerCase();

  return accounts
    .filter((account) => {
      if (query && !matchesSearch(account, query)) {
        return false;
      }
      if (
        filters.eligibility &&
        filters.eligibility !== FILTER_ALL &&
        account.eligibility !== filters.eligibility
      ) {
        return false;
      }
      if (filters.smartMarketing && filters.smartMarketing !== FILTER_ALL) {
        const wantsEnabled =
          filters.smartMarketing === SMART_MARKETING_FILTER_ON;
        if (account.isSmartMarketingEnabled !== wantsEnabled) {
          return false;
        }
      }
      return true;
    })
    .sort(compareAccountsByDealerName);
}

export function selectAccounts(
  accounts: Account[],
  filters: AccountFilters,
  pageSize = DEFAULT_ACCOUNT_PAGE_SIZE,
): SelectAccountsResult {
  const filtered = filterAccounts(accounts, filters);
  const totalPages = getTotalPages(filtered.length, pageSize);
  const page = Math.min(Math.max(1, filters.page), totalPages);
  const rows = paginateItems(filtered, page, pageSize);

  return {
    rows,
    total: filtered.length,
    page,
    pageSize,
    totalPages,
  };
}

export function resolveAccountEmptyStateVariant(
  totalAccounts: number,
  filteredTotal: number,
  filters: AccountFilters,
): AccountEmptyStateVariant | null {
  if (totalAccounts === 0) return "noData";
  if (filteredTotal > 0) return null;

  if (filters.q.trim()) return "noSearchResults";
  if (hasActiveAccountFilters(filters)) return "filteredZero";
  return "noData";
}
