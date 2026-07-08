import { describe, expect, it } from "vitest";
import { mockAccounts } from "@/data/accounts.mock";
import { FILTER_ALL } from "@/data/lookups";
import {
  filterAccounts,
  hasActiveAccountFilters,
  resolveAccountEmptyStateVariant,
  selectAccounts,
  SMART_MARKETING_FILTER_OFF,
  SMART_MARKETING_FILTER_ON,
} from "@/lib/account-filters";
import type { AccountFilters } from "@/types/account";

const baseFilters: AccountFilters = {
  q: "",
  eligibility: FILTER_ALL,
  smartMarketing: FILTER_ALL,
  page: 1,
};

describe("filterAccounts", () => {
  it("includes 26 dealership accounts", () => {
    expect(mockAccounts).toHaveLength(26);
  });

  it("returns accounts sorted alphabetically by dealer name", () => {
    const result = filterAccounts(mockAccounts, baseFilters);
    const dealerNames = result.map((account) => account.dealerName);
    expect(dealerNames).toEqual([...dealerNames].sort((a, b) => a.localeCompare(b)));
  });

  it("returns all accounts when no filters are active", () => {
    const result = filterAccounts(mockAccounts, baseFilters);
    expect(result).toHaveLength(mockAccounts.length);
  });

  it("filters by dealer name search", () => {
    const result = filterAccounts(mockAccounts, {
      ...baseFilters,
      q: "ikon motors north",
    });
    expect(result).toHaveLength(1);
    expect(result[0]?.dealerName).toBe("Ikon Motors North");
  });

  it("filters by group name search", () => {
    const result = filterAccounts(mockAccounts, {
      ...baseFilters,
      q: "heritage luxury motors",
    });
    expect(result).toHaveLength(1);
    expect(result[0]?.dealerName).toBe("Heritage BMW");
  });

  it("filters by account manager search", () => {
    const result = filterAccounts(mockAccounts, {
      ...baseFilters,
      q: "daniel foster",
    });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((account) => account.accountManager.name === "Daniel Foster")).toBe(
      true,
    );
  });

  it("filters by eligibility", () => {
    const result = filterAccounts(mockAccounts, {
      ...baseFilters,
      eligibility: "not_eligible",
    });
    expect(result.every((account) => account.eligibility === "not_eligible")).toBe(
      true,
    );
    expect(result.length).toBeGreaterThan(0);
  });

  it("keeps eligible accounts with smart marketing off independent of eligibility", () => {
    const eligibleOff = mockAccounts.filter(
      (account) =>
        account.eligibility === "eligible" && !account.isSmartMarketingEnabled,
    );

    expect(eligibleOff.length).toBeGreaterThan(0);
  });

  it("filters by smart marketing status", () => {
    const enabled = filterAccounts(mockAccounts, {
      ...baseFilters,
      smartMarketing: SMART_MARKETING_FILTER_ON,
    });
    const disabled = filterAccounts(mockAccounts, {
      ...baseFilters,
      smartMarketing: SMART_MARKETING_FILTER_OFF,
    });

    expect(enabled.every((account) => account.isSmartMarketingEnabled)).toBe(true);
    expect(disabled.every((account) => !account.isSmartMarketingEnabled)).toBe(
      true,
    );
  });

  it("returns zero results when filters do not match", () => {
    const result = filterAccounts(mockAccounts, {
      ...baseFilters,
      q: "nonexistent-account-xyz",
    });
    expect(result).toHaveLength(0);
  });
});

describe("selectAccounts", () => {
  it("paginates filtered results", () => {
    const result = selectAccounts(mockAccounts, { ...baseFilters, page: 1 }, 3);
    expect(result.rows).toHaveLength(3);
    expect(result.page).toBe(1);
    expect(result.total).toBe(mockAccounts.length);
  });

  it("clamps page to last page when page is too high", () => {
    const result = selectAccounts(
      mockAccounts,
      { ...baseFilters, page: 999 },
      3,
    );
    expect(result.page).toBe(result.totalPages);
  });
});

describe("resolveAccountEmptyStateVariant", () => {
  it("returns noSearchResults when query has no matches", () => {
    const variant = resolveAccountEmptyStateVariant(mockAccounts.length, 0, {
      ...baseFilters,
      q: "zzz",
    });
    expect(variant).toBe("noSearchResults");
  });

  it("returns filteredZero when filters exclude all rows", () => {
    const variant = resolveAccountEmptyStateVariant(mockAccounts.length, 0, {
      ...baseFilters,
      eligibility: "eligible",
      smartMarketing: SMART_MARKETING_FILTER_OFF,
    });
    expect(variant).toBe("filteredZero");
  });
});

describe("hasActiveAccountFilters", () => {
  it("returns false for default filters", () => {
    expect(hasActiveAccountFilters(baseFilters)).toBe(false);
  });

  it("returns true when search query is set", () => {
    expect(hasActiveAccountFilters({ ...baseFilters, q: "test" })).toBe(true);
  });
});
