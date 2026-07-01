import { describe, expect, it } from "vitest";
import {
  getModelsForMake,
  formatPurchaseDateRangeLabel,
  isModelValidForMake,
  isPurchaseDateRangeComplete,
  parseDateRange,
  serializeDateRange,
} from "@/data/audience-attributes";
import {
  syncModelRulesAfterMakeChange,
  validatePurchaseDateRangeRule,
} from "@/lib/audience-filters";

describe("vehicle make and model options", () => {
  it("returns Toyota models for Toyota", () => {
    expect(getModelsForMake("Toyota")).toEqual([
      "Camry",
      "Corolla",
      "RAV4",
      "Highlander",
      "Tacoma",
    ]);
  });

  it("does not allow Corolla for Honda", () => {
    expect(isModelValidForMake("Honda", "Corolla")).toBe(false);
    expect(isModelValidForMake("Honda", "Civic")).toBe(true);
  });

  it("clears invalid model rules when make changes", () => {
    const next = syncModelRulesAfterMakeChange(
      [
        { id: "a", attribute: "vehicleMake", value: "Toyota" },
        { id: "b", attribute: "vehicleModel", value: "Corolla" },
      ],
      "Honda",
    );

    expect(next[1]?.value).toBe("");
  });
});

describe("purchase date range", () => {
  it("serializes and parses a date range", () => {
    expect(serializeDateRange("2024-01-01", "2024-12-31")).toBe(
      "2024-01-01|2024-12-31",
    );
    expect(parseDateRange("2024-01-01|2024-12-31")).toEqual({
      startDate: "2024-01-01",
      endDate: "2024-12-31",
    });
  });

  it("requires both dates to be complete", () => {
    expect(isPurchaseDateRangeComplete("2024-01-01|2024-12-31")).toBe(true);
    expect(isPurchaseDateRangeComplete("2024-01-01|")).toBe(false);
    expect(isPurchaseDateRangeComplete("|2024-12-31")).toBe(false);
  });

  it("formats purchase date ranges for summaries", () => {
    expect(formatPurchaseDateRangeLabel("2024-01-01|2024-12-31")).toBe(
      "01/01/2024 – 12/31/2024",
    );
  });
});
