import { describe, expect, it } from "vitest";
import { createDefaultSetupDraft } from "@/data/campaign-setup.defaults";
import {
  applyCampaignLiveCopy,
  getCampaignLiveCopy,
  hasSameMessageVariables,
} from "@/lib/campaign-live-copy";
import type { Campaign } from "@/types/campaign";

function buildCampaign(status: Campaign["status"] = "active"): Campaign {
  return {
    id: "cmp-live",
    name: "Live campaign",
    dealer: "Ikon Motors North",
    timeZone: "CST",
    status,
    messages: 12,
    clickThroughRate: 4,
    createdBy: { id: "u1", name: "Ada Lovelace", initials: "AL" },
    createdAt: "2026-01-01T00:00:00.000Z",
    group: "Service",
    lastUpdatedAt: "2026-01-02T00:00:00.000Z",
    nextUpdateAt: "2026-01-03T00:00:00.000Z",
    setupDraft: {
      ...createDefaultSetupDraft(),
      primaryPromoText: "Hi [@FN@], service your [@MOD@].",
      reminder1Text: "Reminder for [@FN@] and [@MOD@].",
      reminder2Enabled: false,
      reminder3Enabled: false,
    },
  };
}

describe("campaign live copy", () => {
  it("extracts only the initial message and enabled reminder bodies", () => {
    const copy = getCampaignLiveCopy(buildCampaign());

    expect(copy.initialMessage).toBe("Hi [@FN@], service your [@MOD@].");
    expect(copy.reminders).toEqual([
      {
        id: "reminder1",
        label: "Reminder 1",
        body: "Reminder for [@FN@] and [@MOD@].",
      },
    ]);
  });

  it("preserves the exact personalization variable sequence", () => {
    const original = "Hi [@FN@], your [@YEA@] [@MOD@] is due.";

    expect(
      hasSameMessageVariables(
        original,
        "Hello [@FN@] — the [@YEA@] [@MOD@] needs service.",
      ),
    ).toBe(true);
    expect(
      hasSameMessageVariables(original, "Hello [@FN@], your [@MOD@] is due."),
    ).toBe(false);
    expect(
      hasSameMessageVariables(
        original,
        "Hello [@FN@], your [@MAK@] [@MOD@] is due.",
      ),
    ).toBe(false);
  });

  it("updates copy and timestamp without changing live status or locked setup", () => {
    const campaign = buildCampaign("paused");
    const updated = applyCampaignLiveCopy(
      campaign,
      {
        initialMessage: "Hello [@FN@], please service your [@MOD@].",
        reminders: [
          {
            id: "reminder1",
            label: "Reminder 1",
            body: "A quick reminder for [@FN@] and [@MOD@].",
          },
        ],
      },
      "2026-08-21T17:00:00.000Z",
    );

    expect(updated.status).toBe("paused");
    expect(updated.name).toBe(campaign.name);
    expect(updated.setupDraft?.campaignStartDate).toBe(
      campaign.setupDraft?.campaignStartDate,
    );
    expect(updated.setupDraft?.primaryPromoText).toBe(
      "Hello [@FN@], please service your [@MOD@].",
    );
    expect(updated.setupDraft?.reminder1Text).toBe(
      "A quick reminder for [@FN@] and [@MOD@].",
    );
    expect(updated.lastUpdatedAt).toBe("2026-08-21T17:00:00.000Z");
    expect(updated.copyUpdatedAt).toBe("2026-08-21T17:00:00.000Z");
  });
});
