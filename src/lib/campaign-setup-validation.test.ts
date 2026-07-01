import { describe, expect, it } from "vitest";
import { createDefaultSetupDraft } from "@/data/campaign-setup.defaults";
import {
  validateAllStepsBeforeActivate,
  validateAudienceStep,
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
    subfleets: ["Ikon Motors North"],
  };
}

describe("validateGeneralStep", () => {
  it("requires campaign name and dealership", () => {
    const result = validateGeneralStep(createDefaultSetupDraft());
    expect(result.isValid).toBe(false);
    expect(result.errors.campaignName).toBeDefined();
    expect(result.errors.dealership).toBeDefined();
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
      serviceTriggerMode: "oem" as const,
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

describe("validateAudienceStep", () => {
  it("is valid when audience targeting is not selected", () => {
    const draft = { ...validDraft(), audienceFilters: [] };
    expect(validateAudienceStep(draft).isValid).toBe(true);
  });

  it("is valid when every added rule is complete in audience mode", () => {
    const draft = {
      ...validDraft(),
      serviceTriggerMode: "audience" as const,
      serviceTriggerTypes: ["audience"] as const,
      audienceFilters: [
        { id: "a", attribute: "vehicleMake" as const, value: "Honda" },
      ],
    };
    expect(validateAudienceStep(draft).isValid).toBe(true);
  });

  it("requires at least one filter in audience mode", () => {
    const draft = {
      ...validDraft(),
      serviceTriggerMode: "audience" as const,
      serviceTriggerTypes: ["audience"] as const,
      audienceFilters: [],
    };
    const result = validateAudienceStep(draft);
    expect(result.isValid).toBe(false);
    expect(result.errors.audienceFilters).toBeDefined();
  });

  it("flags an incomplete rule by its id", () => {
    const draft = {
      ...validDraft(),
      serviceTriggerMode: "audience" as const,
      serviceTriggerTypes: ["audience"] as const,
      audienceFilters: [
        { id: "a", attribute: "vehicleMake" as const, value: "" },
      ],
    };
    const result = validateAudienceStep(draft);
    expect(result.isValid).toBe(false);
    expect(result.errors["audience.a"]).toBeDefined();
  });

  it("rejects a model that does not belong to the selected make", () => {
    const draft = {
      ...validDraft(),
      serviceTriggerMode: "audience" as const,
      serviceTriggerTypes: ["audience"] as const,
      audienceFilters: [
        { id: "a", attribute: "vehicleMake" as const, value: "Honda" },
        { id: "b", attribute: "vehicleModel" as const, value: "Corolla" },
      ],
    };
    const result = validateAudienceStep(draft);
    expect(result.isValid).toBe(false);
    expect(result.errors["audience.b"]).toContain("Honda");
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
