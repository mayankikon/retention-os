import type { Account } from "@/types/account";

/** Eligibility gates whether smart marketing can be enabled; it does not imply it is on. */
export function resolveSmartMarketingEnabled(
  account: Pick<Account, "id" | "eligibility" | "isSmartMarketingEnabled">,
  overrides: Record<string, boolean>,
): boolean {
  if (account.eligibility === "not_eligible") {
    return false;
  }

  return overrides[account.id] ?? account.isSmartMarketingEnabled;
}

export function canToggleSmartMarketing(
  eligibility: Account["eligibility"],
): boolean {
  return eligibility === "eligible";
}
