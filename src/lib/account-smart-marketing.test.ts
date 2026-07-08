import { describe, expect, it } from "vitest";
import {
  canToggleSmartMarketing,
  resolveSmartMarketingEnabled,
} from "@/lib/account-smart-marketing";

describe("resolveSmartMarketingEnabled", () => {
  const account = {
    id: "account-test",
    eligibility: "eligible" as const,
    isSmartMarketingEnabled: true,
  };

  it("returns false for not eligible accounts regardless of overrides", () => {
    const result = resolveSmartMarketingEnabled(
      {
        ...account,
        eligibility: "not_eligible",
        isSmartMarketingEnabled: true,
      },
      { "account-test": true },
    );

    expect(result).toBe(false);
  });

  it("uses overrides for eligible accounts", () => {
    expect(
      resolveSmartMarketingEnabled(account, { "account-test": false }),
    ).toBe(false);
    expect(
      resolveSmartMarketingEnabled(
        { ...account, isSmartMarketingEnabled: false },
        { "account-test": true },
      ),
    ).toBe(true);
  });
});

describe("canToggleSmartMarketing", () => {
  it("allows toggling only for eligible accounts", () => {
    expect(canToggleSmartMarketing("eligible")).toBe(true);
    expect(canToggleSmartMarketing("not_eligible")).toBe(false);
  });
});
