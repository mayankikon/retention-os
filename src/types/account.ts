export const ACCOUNT_ELIGIBILITY = ["eligible", "not_eligible"] as const;

export type AccountEligibility = (typeof ACCOUNT_ELIGIBILITY)[number];

export interface AccountManager {
  id: string;
  name: string;
  initials: string;
}

export interface Account {
  id: string;
  dealerName: string;
  groupName: string;
  isSmartMarketingEnabled: boolean;
  accountManager: AccountManager;
  eligibility: AccountEligibility;
}

export interface AccountFilters {
  q: string;
  eligibility: string;
  smartMarketing: string;
  page: number;
}

export const DEFAULT_ACCOUNT_PAGE_SIZE = 10;
