import { describe, expect, it } from "vitest";
import { formatScheduleDays } from "@/lib/format-schedule";

describe("formatScheduleDays", () => {
  it("formats days in title case", () => {
    expect(
      formatScheduleDays(["monday", "wednesday", "friday"]),
    ).toBe("Monday, Wednesday, Friday");
  });

  it("returns em dash when empty", () => {
    expect(formatScheduleDays([])).toBe("—");
  });
});
