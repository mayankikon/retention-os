import { describe, expect, it } from "vitest";
import {
  getNextOverviewSort,
  getOverviewStats,
  sortOverviewAccounts,
} from "@/lib/smart-marketing-overview";
import type { Account } from "@/types/account";
import type { Campaign } from "@/types/campaign";

function makeAccount(
  dealerName: string,
  overrides: Partial<Account> = {},
): Account {
  return {
    id: dealerName,
    dealerName,
    groupName: "",
    isSmartMarketingEnabled: false,
    eligibility: "eligible",
    accountManager: { id: "am", name: "Manager", initials: "M" },
    ...overrides,
  };
}

function makeCampaign(
  status: Campaign["status"],
  dealer: string,
  dealers?: string[],
): Campaign {
  return { id: `${status}-${dealer}`, status, dealer, dealers } as Campaign;
}

describe("getOverviewStats", () => {
  const accounts = [
    makeAccount("Alpha", { isSmartMarketingEnabled: true }),
    makeAccount("Bravo", { isSmartMarketingEnabled: true }),
    makeAccount("Charlie"),
    makeAccount("Delta", { eligibility: "not_eligible" }),
  ];

  it("counts eligible and enabled accounts", () => {
    const stats = getOverviewStats(accounts, []);
    expect(stats.eligible).toBe(3);
    expect(stats.enabled).toBe(2);
    expect(stats.live).toBe(0);
  });

  it("counts enabled accounts covered by an active campaign as live", () => {
    const stats = getOverviewStats(accounts, [
      makeCampaign("active", "Charlie", ["Charlie", "Alpha"]),
      makeCampaign("paused", "Bravo"),
    ]);
    // Charlie is covered but not enabled; Bravo's campaign is not active.
    expect(stats.live).toBe(1);
  });
});

describe("sortOverviewAccounts", () => {
  const accounts = [
    makeAccount("Bravo", { eligibility: "not_eligible" }),
    makeAccount("Alpha", { isSmartMarketingEnabled: true }),
    makeAccount("Charlie"),
  ];
  const names = (rows: Account[]) => rows.map((row) => row.dealerName);

  it("keeps the incoming order when unsorted", () => {
    expect(names(sortOverviewAccounts(accounts, null))).toEqual([
      "Bravo",
      "Alpha",
      "Charlie",
    ]);
  });

  it("sorts by dealership in both directions", () => {
    expect(
      names(sortOverviewAccounts(accounts, { key: "dealership", direction: "asc" })),
    ).toEqual(["Alpha", "Bravo", "Charlie"]);
    expect(
      names(sortOverviewAccounts(accounts, { key: "dealership", direction: "desc" })),
    ).toEqual(["Charlie", "Bravo", "Alpha"]);
  });

  it("orders active status as enabled, off, then ineligible", () => {
    expect(
      names(
        sortOverviewAccounts(accounts, { key: "activeStatus", direction: "asc" }),
      ),
    ).toEqual(["Alpha", "Charlie", "Bravo"]);
  });
});

describe("getNextOverviewSort", () => {
  it("cycles ascending, descending, then off", () => {
    const asc = getNextOverviewSort(null, "eligibility");
    expect(asc).toEqual({ key: "eligibility", direction: "asc" });
    const desc = getNextOverviewSort(asc, "eligibility");
    expect(desc).toEqual({ key: "eligibility", direction: "desc" });
    expect(getNextOverviewSort(desc, "eligibility")).toBeNull();
  });

  it("starts ascending when switching columns", () => {
    expect(
      getNextOverviewSort({ key: "dealership", direction: "desc" }, "accountManager"),
    ).toEqual({ key: "accountManager", direction: "asc" });
  });
});
