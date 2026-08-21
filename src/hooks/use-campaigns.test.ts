import { describe, expect, it } from "vitest";
import { mergeCampaignCollections } from "@/hooks/use-campaigns";
import type { Campaign } from "@/types/campaign";

function buildCampaign(name: string): Campaign {
  return {
    id: "cmp-001",
    name,
    dealer: "Ikon Motors North",
    timeZone: "CST",
    status: "active",
    messages: 10,
    clickThroughRate: 4,
    createdBy: { id: "u1", name: "Ada Lovelace", initials: "AL" },
    createdAt: "2026-01-01T00:00:00.000Z",
    group: "Service",
    lastUpdatedAt: "2026-01-02T00:00:00.000Z",
    nextUpdateAt: "2026-01-03T00:00:00.000Z",
  };
}

describe("mergeCampaignCollections", () => {
  it("lets a persisted edit override the matching mock campaign", () => {
    const campaigns = mergeCampaignCollections(
      [buildCampaign("Persisted edit")],
      [buildCampaign("Mock seed")],
      {},
    );

    expect(campaigns).toHaveLength(1);
    expect(campaigns[0]?.name).toBe("Persisted edit");
  });
});
