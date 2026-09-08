import { describe, expect, it } from "vitest";
import {
  isSmartMarketingNavItemActive,
  SMART_MARKETING_NAV_ITEMS,
} from "@/components/layout/app-navigation";

const navHrefs: string[] = SMART_MARKETING_NAV_ITEMS.map((item) => item.href);

describe("Smart Marketing navigation", () => {
  it("contains only Smart Marketing-owned destinations", () => {
    expect(SMART_MARKETING_NAV_ITEMS.map((item) => item.label)).toEqual([
      "Campaigns",
      "Templates",
      "Reports",
    ]);
    expect(navHrefs).not.toContain("/accounts");
  });

  it("no longer exposes Robert's Reporting destination", () => {
    expect(navHrefs).not.toContain("/reporting");
  });

  it("marks report child routes as active", () => {
    expect(
      isSmartMarketingNavItemActive("/reports", "/reports/activity"),
    ).toBe(true);
    expect(isSmartMarketingNavItemActive("/reports", "/reports")).toBe(
      true,
    );
    expect(isSmartMarketingNavItemActive("/templates", "/reports")).toBe(
      false,
    );
  });

  it("keeps Campaigns inactive on the redlines route", () => {
    expect(
      isSmartMarketingNavItemActive("/campaigns", "/campaigns/redlines"),
    ).toBe(false);
    expect(isSmartMarketingNavItemActive("/campaigns", "/campaigns/123")).toBe(
      true,
    );
  });
});
