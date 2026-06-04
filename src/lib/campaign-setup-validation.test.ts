import { describe, expect, it } from "vitest";
import { createDefaultSetupDraft } from "@/data/campaign-setup.defaults";
import {
  validateAllStepsBeforeActivate,
  validateConfigurationStep,
  validateGeneralStep,
  validateMessagingStep,
  validateRemindersStep,
  validateSetupStep,
} from "@/lib/campaign-setup-validation";
import type { CampaignSetupDraft } from "@/types/campaign-setup";

function validDraft(): CampaignSetupDraft {
  return {
    ...createDefaultSetupDraft(),
    campaignName: "SM ABC Motors PST 2/17 JT",
    campaignImageFileName: "logo.png",
  };
}

describe("validateGeneralStep", () => {
  it("requires campaign name", () => {
    const result = validateGeneralStep(createDefaultSetupDraft());
    expect(result.isValid).toBe(false);
    expect(result.errors.campaignName).toBeDefined();
    expect(result.errors.campaignImage).toBeUndefined();
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

  it("allows draft without campaign image", () => {
    const draft = {
      ...validDraft(),
      campaignImageFileName: null,
      campaignImagePreviewUrl: null,
    };
    expect(validateMessagingStep(draft).isValid).toBe(true);
  });

  it("requires at least one delivery channel", () => {
    const draft = {
      ...validDraft(),
      deliveryChannels: [] as const,
    };
    const result = validateMessagingStep(draft);
    expect(result.isValid).toBe(false);
    expect(result.errors.deliveryChannels).toBeDefined();
  });
});

describe("validateRemindersStep", () => {
  it("requires reminder text when that reminder is enabled", () => {
    const draft = {
      ...validDraft(),
      reminder1Enabled: true,
      reminder1Text: "",
    };
    expect(validateRemindersStep(draft).isValid).toBe(false);
  });
});

describe("validateConfigurationStep", () => {
  it("requires schedule days", () => {
    const draft = {
      ...validDraft(),
      scheduleDays: [],
    };
    const result = validateConfigurationStep(draft);
    expect(result.isValid).toBe(false);
    expect(result.errors.scheduleDays).toBeDefined();
  });

  it("requires OEM make and model when OEM trigger is selected", () => {
    const draft = {
      ...validDraft(),
      serviceTriggerTypes: ["oem"] as const,
      oemMake: "",
      oemModel: "",
    };
    const result = validateConfigurationStep(draft);
    expect(result.isValid).toBe(false);
    expect(result.errors.oemMake).toBeDefined();
    expect(result.errors.oemModel).toBeDefined();
  });
});

describe("validateAllStepsBeforeActivate", () => {
  it("passes for a complete draft", () => {
    expect(validateAllStepsBeforeActivate(validDraft()).isValid).toBe(true);
  });
});

describe("validateReviewStep", () => {
  it("requires TCPA confirmation before activation", () => {
    const draft = {
      ...validDraft(),
      tcpaComplianceConfirmed: false,
    };
    const result = validateSetupStep("review", draft, {
      requireTcpaCompliance: true,
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.tcpaComplianceConfirmed).toBeDefined();
  });
});
