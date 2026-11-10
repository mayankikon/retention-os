import { describe, expect, it } from "vitest";
import { createDefaultSetupDraft } from "@/data/campaign-setup.defaults";
import {
  applyCampaignLiveCopy,
  getCampaignLiveCopy,
  hasSameMessageVariables,
  validateCampaignLiveCopy,
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
  it("extracts the initial message and every reminder with its on/off state", () => {
    const campaign = buildCampaign();
    const copy = getCampaignLiveCopy(campaign);

    expect(copy.initialMessage).toBe("Hi [@FN@], service your [@MOD@].");
    expect(copy.reminders).toEqual([
      {
        id: "reminder1",
        label: "Reminder 1",
        body: "Reminder for [@FN@] and [@MOD@].",
        enabled: true,
      },
      {
        id: "reminder2",
        label: "Reminder 2",
        body: campaign.setupDraft!.reminder2Text,
        enabled: false,
      },
      {
        id: "reminder3",
        label: "Reminder 3",
        body: campaign.setupDraft!.reminder3Text,
        enabled: false,
      },
    ]);
  });

  it("treats reminders missing from older saved copy as off", () => {
    const copy = getCampaignLiveCopy({
      ...buildCampaign(),
      liveCopy: {
        initialMessage: "Saved [@FN@] [@MOD@].",
        reminders: [
          { id: "reminder1", label: "Reminder 1", body: "Saved reminder." },
        ] as never,
      },
    });

    expect(copy.reminders.map((reminder) => reminder.enabled)).toEqual([
      true,
      false,
      false,
    ]);
  });

  it("requires reminder text only while the reminder is on", () => {
    const original = getCampaignLiveCopy(buildCampaign());
    const cleared = original.reminders.map((reminder) => ({
      ...reminder,
      body: "",
    }));

    expect(
      validateCampaignLiveCopy(original, { ...original, reminders: cleared }),
    ).toEqual({ reminder1: "Reminder 1 text is required while it's turned on." });
    expect(
      validateCampaignLiveCopy(original, {
        ...original,
        reminders: cleared.map((reminder) => ({ ...reminder, enabled: false })),
      }),
    ).toEqual({});
    expect(
      validateCampaignLiveCopy(original, { ...original, initialMessage: " " }),
    ).toHaveProperty("initialMessage");
  });

  it("turns a reminder off, keeps its text, and logs the change", () => {
    const campaign = buildCampaign();
    const original = getCampaignLiveCopy(campaign);
    const at = "2026-08-22T09:00:00.000Z";
    const updated = applyCampaignLiveCopy(
      campaign,
      {
        ...original,
        reminders: original.reminders.map((reminder) =>
          reminder.id === "reminder1" ? { ...reminder, enabled: false } : reminder,
        ),
      },
      at,
    );

    expect(updated.status).toBe("active");
    expect(updated.setupDraft?.reminder1Enabled).toBe(false);
    expect(updated.setupDraft?.reminder1Text).toBe(
      "Reminder for [@FN@] and [@MOD@].",
    );
    expect(updated.reminderToggleEvents).toEqual([
      { reminderId: "reminder1", label: "Reminder 1", enabled: false, at },
    ]);
    expect(updated.copyUpdatedAt).toBeUndefined();
    expect(updated.lastUpdatedAt).toBe(at);
    expect(getCampaignLiveCopy(updated).reminders[0]).toMatchObject({
      enabled: false,
      body: "Reminder for [@FN@] and [@MOD@].",
    });
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
            enabled: true,
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
