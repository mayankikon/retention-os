import { describe, expect, it } from "vitest";
import { SMART_MARKETING_NAV_ITEMS } from "@/components/layout/app-navigation";

describe("Smart Marketing navigation", () => {
  it("contains only Smart Marketing-owned destinations", () => {
    expect(SMART_MARKETING_NAV_ITEMS.map((item) => item.label)).toEqual([
      "Campaigns",
      "Templates",
    ]);
    expect(
      SMART_MARKETING_NAV_ITEMS.some((item) => item.href === "/accounts"),
    ).toBe(false);
  });
});
