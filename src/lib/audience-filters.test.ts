import { describe, expect, it } from "vitest";
import {
  BASE_AUDIENCE_POOL,
  estimateAudienceReach,
  isRuleComplete,
  summarizeAudienceFilters,
  validatePurchaseDateRangeRule,
} from "@/lib/audience-filters";
import type { AudienceFilterRule } from "@/types/campaign-setup";

function rule(overrides: Partial<AudienceFilterRule>): AudienceFilterRule {
  return {
    id: "r1",
    attribute: "vehicleMake",
    value: "Honda",
    ...overrides,
  };
}

describe("isRuleComplete", () => {
  it("requires a non-empty value", () => {
    expect(isRuleComplete(rule({ value: "" }))).toBe(false);
    expect(isRuleComplete(rule({ value: "  " }))).toBe(false);
    expect(isRuleComplete(rule({ value: "Honda" }))).toBe(true);
  });

  it("requires both purchase dates for a purchase date rule", () => {
    expect(
      isRuleComplete(
        rule({
          attribute: "vehiclePurchaseDate",
          value: "2024-01-01|2024-12-31",
        }),
      ),
    ).toBe(true);
    expect(
      isRuleComplete(
        rule({
          attribute: "vehiclePurchaseDate",
          value: "2024-01-01|",
        }),
      ),
    ).toBe(false);
  });
});

describe("estimateAudienceReach", () => {
  it("returns the base pool when there are no rules", () => {
    expect(estimateAudienceReach([])).toBe(BASE_AUDIENCE_POOL);
  });

  it("ignores incomplete rules", () => {
    expect(estimateAudienceReach([rule({ value: "" })])).toBe(
      BASE_AUDIENCE_POOL,
    );
  });

  it("is deterministic for the same input", () => {
    const rules = [rule({ value: "Honda" })];
    expect(estimateAudienceReach(rules)).toBe(estimateAudienceReach(rules));
  });

  it("shrinks (never grows) the pool as complete rules are added", () => {
    const one = [rule({ id: "a", value: "Honda" })];
    const two = [
      ...one,
      rule({ id: "b", attribute: "vehicleYear", value: "2020" }),
    ];
    expect(estimateAudienceReach(two)).toBeLessThanOrEqual(
      estimateAudienceReach(one),
    );
  });

  it("never drops below the floor", () => {
    const many: AudienceFilterRule[] = Array.from({ length: 9 }, (_, i) =>
      rule({ id: `r${i}`, attribute: "customerZip", value: `7500${i}` }),
    );
    expect(estimateAudienceReach(many)).toBeGreaterThanOrEqual(25);
  });

  it("yields different counts for different values", () => {
    const honda = estimateAudienceReach([rule({ value: "Honda" })]);
    const ford = estimateAudienceReach([rule({ value: "Ford" })]);
    expect(honda).not.toBe(ford);
  });
});

describe("summarizeAudienceFilters", () => {
  it("returns one readable line per complete rule using value labels", () => {
    const lines = summarizeAudienceFilters([
      rule({ id: "a", attribute: "vehicleYear", value: "2020" }),
      rule({ id: "b", attribute: "vehicleMake", value: "Honda" }),
      rule({ id: "c", attribute: "customerZip", value: "75001" }),
    ]);
    expect(lines).toEqual([
      "Year: 2020",
      "Make: Honda",
      "Zip Code: 75001",
    ]);
  });

  it("omits incomplete rules", () => {
    const lines = summarizeAudienceFilters([rule({ value: "" })]);
    expect(lines).toEqual([]);
  });

  it("summarizes purchase date ranges", () => {
    const lines = summarizeAudienceFilters([
      rule({
        attribute: "vehiclePurchaseDate",
        value: "2024-01-01|2024-06-30",
      }),
    ]);
    expect(lines).toEqual(["Vehicle Purchase Date: 01/01/2024 – 06/30/2024"]);
  });
});

describe("validatePurchaseDateRangeRule", () => {
  it("requires both start and end dates", () => {
    expect(
      validatePurchaseDateRangeRule({
        id: "a",
        attribute: "vehiclePurchaseDate",
        value: "2024-01-01|",
      }),
    ).toBe("Select both a start and end purchase date.");
  });

  it("rejects ranges where start is after end", () => {
    expect(
      validatePurchaseDateRangeRule({
        id: "a",
        attribute: "vehiclePurchaseDate",
        value: "2024-12-31|2024-01-01",
      }),
    ).toBe("Start date must be on or before the end date.");
  });
});
