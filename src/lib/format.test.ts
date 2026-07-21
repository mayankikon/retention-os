import { describe, expect, it } from "vitest";
import { formatClickThroughRate } from "@/lib/format";

describe("formatClickThroughRate", () => {
  it("formats to one decimal place with percent sign", () => {
    expect(formatClickThroughRate(12.5)).toBe("12.5%");
  });

  it("formats zero", () => {
    expect(formatClickThroughRate(0)).toBe("0.0%");
  });
});
