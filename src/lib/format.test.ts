import { describe, expect, it } from "vitest";
import { formatConversionRate } from "@/lib/format";

describe("formatConversionRate", () => {
  it("formats a percentage with one decimal place", () => {
    expect(formatConversionRate(12.5)).toBe("12.5%");
  });

  it("formats zero", () => {
    expect(formatConversionRate(0)).toBe("0.0%");
  });
});
