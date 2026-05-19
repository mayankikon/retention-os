import { describe, expect, it } from "vitest";
import { createDefaultSetupDraft } from "@/data/campaign-setup.defaults";
import {
  validateAllStepsBeforeActivate,
  validateConfigurationStep,
  validateGeneralStep,
  validateMessagingStep,
  validateRemindersStep,
} from "@/lib/campaign-setup-validation";
import type { CampaignSetupDraft } from "@/types/campaign-setup";

function validDraft(): CampaignSetupDraft {
  return {
    ...createDefaultSetupDraft(),
    campaignName: "SM ABC Motors PST 2/17 JT",
    campaignImageFileName: "logo.png",
    dealerDid: "(555) 123-4567",
    subfleets: ["Ikon Motors North"],
  };
}

describe("validateGeneralStep", () => {
  it("requires campaign name and image", () => {
    const result = validateGeneralStep(createDefaultSetupDraft());
    expect(result.isValid).toBe(false);
    expect(result.errors.campaignName).toBeDefined();
    expect(result.errors.campaignImage).toBeDefined();
  });

  it("accepts any non-empty campaign name", () => {
    const draft = { ...validDraft(), campaignName: "My custom campaign" };
    const result = validateGeneralStep(draft);
    expect(result.isValid).toBe(true);
  });
});

describe("validateMessagingStep", () => {
  it("requires primary promo text", () => {
    const draft = { ...validDraft(), primaryPromoText: "" };
    expect(validateMessagingStep(draft).isValid).toBe(false);
  });
});

describe("validateRemindersStep", () => {
  it("requires dealer DID", () => {
    const draft = { ...validDraft(), dealerDid: "" };
    expect(validateRemindersStep(draft).isValid).toBe(false);
  });

  it("requires reminder texts when enabled", () => {
    const draft = {
      ...validDraft(),
      reminder1Text: "",
    };
    expect(validateRemindersStep(draft).isValid).toBe(false);
  });
});

describe("validateConfigurationStep", () => {
  it("requires subfleets and schedule days", () => {
    const draft = {
      ...validDraft(),
      subfleets: [],
      scheduleDays: [],
    };
    const result = validateConfigurationStep(draft);
    expect(result.isValid).toBe(false);
    expect(result.errors.subfleets).toBeDefined();
    expect(result.errors.scheduleDays).toBeDefined();
  });
});

describe("validateAllStepsBeforeActivate", () => {
  it("passes for a complete draft", () => {
    expect(validateAllStepsBeforeActivate(validDraft()).isValid).toBe(true);
  });
});
