import { describe, expect, it } from "vitest";
import { mockCampaigns } from "@/data/campaigns.mock";
import { getCampaignAnalytics } from "@/lib/campaign-analytics";
import { buildCampaignChangelog } from "@/lib/campaign-changelog";
import { findCampaignById } from "@/lib/campaign-lookup";

describe("campaign analytics", () => {
  it("returns zeros for draft campaigns with no sends", () => {
    const draft = mockCampaigns.find((c) => c.status === "draft");
    expect(draft).toBeDefined();

    const analytics = getCampaignAnalytics(draft!);
    expect(analytics).toEqual({
      recipientsSent: 0,
      openedCount: 0,
      deliveredCount: 0,
    });
  });

  it("derives engagement metrics for active campaigns", () => {
    const active = mockCampaigns.find((c) => c.id === "cmp-001");
    expect(active).toBeDefined();

    const analytics = getCampaignAnalytics(active!);
    expect(analytics.recipientsSent).toBe(active!.messages);
    expect(analytics.deliveredCount).toBeGreaterThan(0);
    expect(analytics.openedCount).toBeGreaterThan(0);
    expect(analytics.deliveredCount).toBeLessThanOrEqual(analytics.recipientsSent);
  });
});

describe("campaign changelog", () => {
  it("includes created and lifecycle entries", () => {
    const campaign = mockCampaigns.find((c) => c.id === "cmp-003");
    expect(campaign).toBeDefined();

    const entries = buildCampaignChangelog(campaign!);
    expect(entries.some((entry) => entry.action === "created")).toBe(true);
    expect(entries.some((entry) => entry.action === "paused")).toBe(true);
    expect(entries[0]!.timestamp >= entries[entries.length - 1]!.timestamp).toBe(
      true,
    );
  });

  it("identifies a live copy update in the audit trail", () => {
    const campaign = mockCampaigns.find((c) => c.id === "cmp-001");
    expect(campaign).toBeDefined();

    const entries = buildCampaignChangelog({
      ...campaign!,
      copyUpdatedAt: "2026-08-21T17:00:00.000Z",
      lastUpdatedAt: "2026-08-21T17:00:00.000Z",
    });

    expect(entries).toContainEqual(
      expect.objectContaining({
        action: "updated",
        summary: "Live message copy updated",
        details:
          "Initial and reminder body copy changed for future eligible sends only.",
      }),
    );
  });
});

describe("campaign lookup", () => {
  it("finds mock campaigns by id", () => {
    expect(findCampaignById("cmp-001")?.name).toBe("Spring Service Reminder");
    expect(findCampaignById("missing-id")).toBeUndefined();
  });
});
