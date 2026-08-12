import { describe, expect, it } from "vitest";
import {
  formatDealershipList,
  getCampaignDealers,
  getDealershipColumnDisplay,
} from "@/lib/campaign-dealers";

describe("getCampaignDealers", () => {
  it("returns the dealers array when present", () => {
    expect(
      getCampaignDealers({
        dealer: "Ikon Motors North",
        dealers: ["Ikon Motors North", "Ikon Motors South"],
      }),
    ).toEqual(["Ikon Motors North", "Ikon Motors South"]);
  });

  it("falls back to the primary dealer for legacy rows", () => {
    expect(getCampaignDealers({ dealer: "Summit Chevrolet" })).toEqual([
      "Summit Chevrolet",
    ]);
  });
});

describe("getDealershipColumnDisplay", () => {
  it("shows only the primary name for a single dealership", () => {
    expect(
      getDealershipColumnDisplay({ dealer: "Premier Auto Group" }),
    ).toEqual({
      primaryLabel: "Premier Auto Group",
      additionalCount: 0,
      allDealers: ["Premier Auto Group"],
    });
  });

  it("shows +2 when three dealerships are selected", () => {
    expect(
      getDealershipColumnDisplay({
        dealer: "Ikon Motors North",
        dealers: [
          "Ikon Motors North",
          "Ikon Motors South",
          "Ikon Motors East",
        ],
      }),
    ).toEqual({
      primaryLabel: "Ikon Motors North",
      additionalCount: 2,
      allDealers: [
        "Ikon Motors North",
        "Ikon Motors South",
        "Ikon Motors East",
      ],
    });
  });
});

describe("formatDealershipList", () => {
  it("joins all dealership names for detail copy", () => {
    expect(
      formatDealershipList([
        "Ikon Motors North",
        "Ikon Motors South",
        "Ikon Motors East",
      ]),
    ).toBe("Ikon Motors North, Ikon Motors South, Ikon Motors East");
  });
});
