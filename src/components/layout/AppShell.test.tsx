import { describe, expect, it } from "vitest";
import {
  getSmartMarketingNavItems,
  isSmartMarketingNavItemActive,
  SMART_MARKETING_NAV_ITEMS,
} from "@/components/layout/app-navigation";

describe("Smart Marketing navigation", () => {
  it("contains only Smart Marketing-owned destinations", () => {
    expect(SMART_MARKETING_NAV_ITEMS.map((item) => item.label)).toEqual([
      "Campaigns",
      "Templates",
      "Reporting",
    ]);
    expect(
      SMART_MARKETING_NAV_ITEMS.some((item) => item.href === "/accounts"),
    ).toBe(false);
  });

  it("shows Reporting nav only on Post MVP V1.1", () => {
    expect(
      getSmartMarketingNavItems("post_mvp_v1_1").map((item) => item.label),
    ).toEqual(["Campaigns", "Templates", "Reporting"]);
    expect(
      getSmartMarketingNavItems("mvp_v1_0").map((item) => item.label),
    ).toEqual(["Campaigns", "Templates"]);
  });

  it("marks reporting child routes as active", () => {
    expect(isSmartMarketingNavItemActive("/reporting", "/reporting/weekly")).toBe(
      true,
    );
    expect(isSmartMarketingNavItemActive("/templates", "/reporting")).toBe(
      false,
    );
  });
});
