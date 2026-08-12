import { describe, expect, it } from "vitest";
import { mockCampaigns } from "@/data/campaigns.mock";
import { FILTER_ALL } from "@/data/lookups";
import {
  filterCampaigns,
  hasActiveFilters,
  resolveEmptyStateVariant,
  selectCampaigns,
} from "@/lib/filters";
import type { CampaignFilters } from "@/types/campaign";

const baseFilters: CampaignFilters = {
  q: "",
  group: FILTER_ALL,
  dealer: FILTER_ALL,
  timeZone: FILTER_ALL,
  status: FILTER_ALL,
  page: 1,
};

describe("filterCampaigns", () => {
  it("excludes archived campaigns when status filter is All", () => {
    const result = filterCampaigns(mockCampaigns, baseFilters);
    expect(result.every((campaign) => campaign.status !== "archived")).toBe(
      true,
    );
    expect(result.length).toBe(
      mockCampaigns.filter((campaign) => campaign.status !== "archived").length,
    );
  });

  it("returns only archived campaigns when status filter is archived", () => {
    const result = filterCampaigns(mockCampaigns, {
      ...baseFilters,
      status: "archived",
    });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((campaign) => campaign.status === "archived")).toBe(
      true,
    );
  });

  it("filters by campaign name search", () => {
    const result = filterCampaigns(mockCampaigns, {
      ...baseFilters,
      q: "spring",
    });
    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe("Spring Service Reminder");
  });

  it("filters by dealer", () => {
    const result = filterCampaigns(mockCampaigns, {
      ...baseFilters,
      dealer: "Ikon Motors North",
    });
    expect(
      result.every(
        (campaign) =>
          campaign.dealer === "Ikon Motors North" ||
          campaign.dealers?.includes("Ikon Motors North"),
      ),
    ).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("matches a multi-dealership campaign when filtering by a secondary dealer", () => {
    const result = filterCampaigns(mockCampaigns, {
      ...baseFilters,
      dealer: "Ikon Motors East",
    });
    expect(result.some((campaign) => campaign.id === "cmp-001")).toBe(true);
  });

  it("filters by dealer group when no specific dealer is selected", () => {
    const result = filterCampaigns(mockCampaigns, {
      ...baseFilters,
      group: "Ikon Motors",
    });
    expect(result.length).toBeGreaterThan(0);
    expect(
      result.every((campaign) => campaign.dealer.startsWith("Ikon Motors")),
    ).toBe(true);
  });

  it("filters by time zone and status", () => {
    const result = filterCampaigns(mockCampaigns, {
      ...baseFilters,
      timeZone: "PST",
      status: "active",
    });
    expect(
      result.every((c) => c.timeZone === "PST" && c.status === "active"),
    ).toBe(true);
  });

  it("returns zero results when filters do not match", () => {
    const result = filterCampaigns(mockCampaigns, {
      ...baseFilters,
      q: "nonexistent-campaign-xyz",
    });
    expect(result).toHaveLength(0);
  });
});

describe("selectCampaigns", () => {
  it("paginates filtered results", () => {
    const nonArchivedCount = mockCampaigns.filter(
      (campaign) => campaign.status !== "archived",
    ).length;
    const result = selectCampaigns(mockCampaigns, { ...baseFilters, page: 2 }, 10);
    expect(result.rows).toHaveLength(10);
    expect(result.page).toBe(2);
    expect(result.total).toBe(nonArchivedCount);
  });

  it("clamps page to last page when page is too high", () => {
    const result = selectCampaigns(
      mockCampaigns,
      { ...baseFilters, page: 999 },
      10,
    );
    expect(result.page).toBe(result.totalPages);
  });
});

describe("resolveEmptyStateVariant", () => {
  it("returns noSearchResults when query has no matches", () => {
    const variant = resolveEmptyStateVariant(mockCampaigns.length, 0, {
      ...baseFilters,
      q: "zzz",
    });
    expect(variant).toBe("noSearchResults");
  });

  it("returns filteredZero when filters exclude all rows", () => {
    const variant = resolveEmptyStateVariant(mockCampaigns.length, 0, {
      ...baseFilters,
      status: "draft",
      dealer: "Nonexistent Dealer",
    });
    expect(variant).toBe("filteredZero");
  });
});

describe("hasActiveFilters", () => {
  it("returns false for default filters", () => {
    expect(hasActiveFilters(baseFilters)).toBe(false);
  });

  it("returns true when search query is set", () => {
    expect(hasActiveFilters({ ...baseFilters, q: "test" })).toBe(true);
  });
});
