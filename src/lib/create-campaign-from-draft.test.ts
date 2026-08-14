import { describe, expect, it } from "vitest";
import { createDefaultSetupDraft } from "@/data/campaign-setup.defaults";
import { MOCK_CURRENT_USER } from "@/data/current-user.mock";
import { toDateInputValue } from "@/lib/campaign-window";
import { createCampaignFromDraft, updateCampaignFromDraft } from "@/lib/create-campaign-from-draft";

describe("createCampaignFromDraft", () => {
  it("sets createdBy from the current user and timestamps createdAt", () => {
    const draft = {
      ...createDefaultSetupDraft(),
      campaignName: "My Campaign",
      subfleets: ["Ikon Motors North"],
    };

    const campaign = createCampaignFromDraft(draft, MOCK_CURRENT_USER);

    expect(campaign.name).toBe("My Campaign");
    expect(campaign.createdBy).toEqual({
      id: MOCK_CURRENT_USER.id,
      name: MOCK_CURRENT_USER.name,
      initials: MOCK_CURRENT_USER.initials,
    });
    expect(campaign.createdAt).toBeTruthy();
    expect(new Date(campaign.createdAt).getTime()).toBeLessThanOrEqual(
      Date.now(),
    );
  });

  it("copies time zone from the setup draft", () => {
    const draft = {
      ...createDefaultSetupDraft(),
      campaignName: "Pacific campaign",
      timeZone: "PST" as const,
      subfleets: ["Ikon Motors West"],
    };

    const campaign = createCampaignFromDraft(draft, MOCK_CURRENT_USER);
    expect(campaign.timeZone).toBe("PST");
  });

  it("starts the run window at creation time when no start date is chosen", () => {
    const draft = {
      ...createDefaultSetupDraft(),
      campaignName: "Immediate campaign",
      campaignEndDate: "2026-09-30",
    };

    const campaign = createCampaignFromDraft(draft, MOCK_CURRENT_USER);

    expect(campaign.startsAt).toBe(campaign.createdAt);
    expect(toDateInputValue(new Date(campaign.endsAt as string))).toBe(
      "2026-09-30",
    );
  });

  it("uses the chosen start date for the run window", () => {
    const draft = {
      ...createDefaultSetupDraft(),
      campaignName: "Scheduled window campaign",
      campaignStartDate: "2026-09-01",
      campaignEndDate: "2026-09-30",
    };

    const campaign = createCampaignFromDraft(draft, MOCK_CURRENT_USER);
    const startsAt = new Date(campaign.startsAt as string);

    expect(toDateInputValue(startsAt)).toBe("2026-09-01");
    expect(startsAt.getHours()).toBe(0);
    expect(startsAt.getMinutes()).toBe(0);
  });

  it("stores a null end when no end date is chosen", () => {
    const draft = {
      ...createDefaultSetupDraft(),
      campaignName: "Open-ended campaign",
      campaignStartDate: "2026-09-01",
      campaignEndDate: "",
    };

    const campaign = createCampaignFromDraft(draft, MOCK_CURRENT_USER);
    expect(campaign.endsAt).toBeNull();
  });

  it("stores every selected dealership and keeps the first as primary", () => {
    const draft = {
      ...createDefaultSetupDraft(),
      campaignName: "Multi-dealer campaign",
      subfleets: [
        "Ikon Motors North",
        "Ikon Motors South",
        "Ikon Motors East",
      ],
      campaignEndDate: "2026-09-30",
    };

    const campaign = createCampaignFromDraft(draft, MOCK_CURRENT_USER);

    expect(campaign.dealer).toBe("Ikon Motors North");
    expect(campaign.dealers).toEqual([
      "Ikon Motors North",
      "Ikon Motors South",
      "Ikon Motors East",
    ]);
  });

  it("initializes click-through rate to zero and defaults to active", () => {
    const draft = {
      ...createDefaultSetupDraft(),
      campaignName: "New campaign",
    };

    const campaign = createCampaignFromDraft(draft, MOCK_CURRENT_USER);
    expect(campaign.clickThroughRate).toBe(0);
    expect(campaign.status).toBe("active");
  });

  it("persists the full setup draft for resume", () => {
    const draft = {
      ...createDefaultSetupDraft(),
      campaignName: "Persisted setup",
      primaryPromoText: "Hello world",
      subfleets: ["Ikon Motors North"],
    };

    const campaign = createCampaignFromDraft(draft, MOCK_CURRENT_USER, {
      status: "draft",
    });

    expect(campaign.setupDraft?.campaignName).toBe("Persisted setup");
    expect(campaign.setupDraft?.primaryPromoText).toBe("Hello world");
  });

  it("updates an existing campaign in place", () => {
    const draft = {
      ...createDefaultSetupDraft(),
      campaignName: "Original",
      subfleets: ["Ikon Motors North"],
    };
    const existing = createCampaignFromDraft(draft, MOCK_CURRENT_USER, {
      status: "draft",
    });

    const updated = updateCampaignFromDraft(
      existing,
      {
        ...draft,
        campaignName: "Renamed draft",
        primaryPromoText: "Updated promo",
      },
      { status: "draft" },
    );

    expect(updated.id).toBe(existing.id);
    expect(updated.createdAt).toBe(existing.createdAt);
    expect(updated.name).toBe("Renamed draft");
    expect(updated.setupDraft?.primaryPromoText).toBe("Updated promo");
    expect(updated.status).toBe("draft");
  });
});
