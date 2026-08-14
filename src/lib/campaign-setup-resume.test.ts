import { describe, expect, it } from "vitest";
import { createDefaultSetupDraft } from "@/data/campaign-setup.defaults";
import { toDateInputValue } from "@/lib/campaign-window";
import {
  getFirstIncompleteSetupStep,
  getResumeLandingStep,
  hasFullSetupDraft,
  hydrateSetupDraftFromCampaign,
  isSetupDraftComplete,
  isStepSelectable,
} from "@/lib/campaign-setup-resume";
import type { Campaign } from "@/types/campaign";
import type { CampaignSetupDraft } from "@/types/campaign-setup";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function completeDraft(): CampaignSetupDraft {
  return {
    ...createDefaultSetupDraft(),
    campaignName: "Complete campaign",
    groupId: "Ikon Motors",
    subfleets: ["Ikon Motors North"],
    campaignStartDate: toDateInputValue(new Date()),
    campaignEndDate: toDateInputValue(new Date(Date.now() + 30 * MS_PER_DAY)),
    sendTimeLocal: "12:00",
  };
}

function thinCampaign(overrides: Partial<Campaign> = {}): Campaign {
  return {
    id: "cmp-thin",
    name: "Thin draft",
    dealer: "Ikon Motors North",
    dealers: ["Ikon Motors North"],
    timeZone: "CST",
    status: "draft",
    messages: 0,
    clickThroughRate: 0,
    createdBy: { id: "u1", name: "Ada", initials: "AL" },
    createdAt: "2026-01-01T00:00:00.000Z",
    group: "Ikon Motors",
    lastUpdatedAt: "2026-01-02T00:00:00.000Z",
    nextUpdateAt: "2026-01-03T00:00:00.000Z",
    ...overrides,
  };
}

describe("campaign-setup-resume", () => {
  it("reports incomplete drafts and first incomplete step", () => {
    const draft = createDefaultSetupDraft();
    expect(isSetupDraftComplete(draft)).toBe(false);
    expect(getFirstIncompleteSetupStep(draft)).toBe("general");
  });

  it("reports complete drafts and lands on review", () => {
    const draft = completeDraft();
    expect(isSetupDraftComplete(draft)).toBe(true);
    expect(getResumeLandingStep(draft)).toBe("review");
  });

  it("honors preferred step when allowed", () => {
    const draft = completeDraft();
    expect(getResumeLandingStep(draft, "messaging")).toBe("messaging");
  });

  it("clamps preferred future step to first incomplete", () => {
    const draft = {
      ...createDefaultSetupDraft(),
      campaignName: "Named",
      groupId: "Ikon Motors",
      subfleets: ["Ikon Motors North"],
    };
    expect(getFirstIncompleteSetupStep(draft)).toBe("configuration");
    expect(getResumeLandingStep(draft, "review")).toBe("configuration");
  });

  it("hydrates full setupDraft when present", () => {
    const setupDraft = completeDraft();
    const campaign = thinCampaign({ setupDraft });
    expect(hasFullSetupDraft(campaign)).toBe(true);
    expect(hydrateSetupDraftFromCampaign(campaign).campaignName).toBe(
      "Complete campaign",
    );
  });

  it("recovers thin drafts from campaign list fields", () => {
    const campaign = thinCampaign({
      name: "Recovered",
      messageTemplateId: "oil_change",
    });
    expect(hasFullSetupDraft(campaign)).toBe(false);
    const draft = hydrateSetupDraftFromCampaign(campaign);
    expect(draft.campaignName).toBe("Recovered");
    expect(draft.groupId).toBe("Ikon Motors");
    expect(draft.subfleets).toEqual(["Ikon Motors North"]);
  });

  it("allows selecting completed or current steps only", () => {
    const completed = new Set<"general" | "messaging">(["general", "messaging"]);
    expect(isStepSelectable("messaging", completed, "reminders")).toBe(true);
    expect(isStepSelectable("reminders", completed, "reminders")).toBe(true);
    expect(isStepSelectable("configuration", completed, "reminders")).toBe(
      false,
    );
  });
});
