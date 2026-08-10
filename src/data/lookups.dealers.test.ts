import { describe, expect, it } from "vitest";
import {
  FILTER_ALL,
  getDealerFilterOptionsForGroup,
  getDealersForGroup,
  getKnownDealerTimeZone,
  getPrimaryTimeZoneFromDealerships,
  isDealerInGroup,
  STATUS_LABELS,
  statusFilterOptions,
} from "@/data/lookups";
import { CAMPAIGN_STATUSES } from "@/types/campaign";

describe("dealer group cascade helpers", () => {
  it("returns only dealers in the selected group", () => {
    expect(getDealersForGroup("Ikon Motors")).toEqual([
      "Ikon Motors North",
      "Ikon Motors South",
      "Ikon Motors West",
      "Ikon Motors East",
    ]);
  });

  it("returns all dealers when group is All", () => {
    expect(getDealersForGroup(FILTER_ALL).length).toBeGreaterThan(4);
  });

  it("builds dealer filter options with an All Dealers sentinel", () => {
    const options = getDealerFilterOptionsForGroup("Ikon Motors");
    expect(options[0]).toEqual({ value: FILTER_ALL, label: "All Dealers" });
    expect(options.map((option) => option.value)).toContain(
      "Ikon Motors North",
    );
    expect(options.map((option) => option.value)).not.toContain(
      "Summit Chevrolet",
    );
  });

  it("detects when a dealer no longer belongs to the selected group", () => {
    expect(isDealerInGroup("Ikon Motors North", "Ikon Motors")).toBe(true);
    expect(isDealerInGroup("Summit Chevrolet", "Ikon Motors")).toBe(false);
    expect(isDealerInGroup("Summit Chevrolet", FILTER_ALL)).toBe(true);
  });

  it("resolves known dealer timezones and primary TZ from selection order", () => {
    expect(getKnownDealerTimeZone("Ikon Motors West")).toBe("PST");
    expect(getKnownDealerTimeZone("Summit Chevrolet")).toBeUndefined();
    expect(
      getPrimaryTimeZoneFromDealerships(
        ["Ikon Motors West", "Ikon Motors North"],
        {},
      ),
    ).toBe("PST");
  });
});

describe("campaign status labels", () => {
  it("exposes the locked status set without scheduled or stopped", () => {
    expect(CAMPAIGN_STATUSES).toEqual([
      "draft",
      "active",
      "paused",
      "completed",
      "archived",
    ]);
    expect(STATUS_LABELS.archived).toBe("Archived");
    expect(
      statusFilterOptions.map((option) => option.value),
    ).not.toContain("scheduled");
    expect(
      statusFilterOptions.map((option) => option.value),
    ).not.toContain("stopped");
  });
});
