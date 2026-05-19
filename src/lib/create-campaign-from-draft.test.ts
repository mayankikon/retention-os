import { describe, expect, it } from "vitest";
import { createDefaultSetupDraft } from "@/data/campaign-setup.defaults";
import { MOCK_CURRENT_USER } from "@/data/current-user.mock";
import { createCampaignFromDraft } from "@/lib/create-campaign-from-draft";

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
});
