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
  dealer: FILTER_ALL,
  timeZone: FILTER_ALL,
  status: FILTER_ALL,
  page: 1,
};

describe("filterCampaigns", () => {
  it("returns all campaigns when no filters are active", () => {
    const result = filterCampaigns(mockCampaigns, baseFilters);
    expect(result).toHaveLength(mockCampaigns.length);
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
    expect(result.every((c) => c.dealer === "Ikon Motors North")).toBe(true);
    expect(result.length).toBeGreaterThan(0);
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
    const result = selectCampaigns(mockCampaigns, { ...baseFilters, page: 2 }, 10);
    expect(result.rows).toHaveLength(10);
    expect(result.page).toBe(2);
    expect(result.total).toBe(mockCampaigns.length);
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
