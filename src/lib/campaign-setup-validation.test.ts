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
import { toDateInputValue } from "@/lib/campaign-window";
import type { CampaignSetupDraft } from "@/types/campaign-setup";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function validDraft(): CampaignSetupDraft {
  return {
    ...createDefaultSetupDraft(),
    campaignName: "SM ABC Motors PST 2/17 JT",
    campaignImageFileName: "logo.png",
    groupId: "Ikon Motors",
    subfleets: ["Ikon Motors North"],
    campaignEndDate: toDateInputValue(new Date(Date.now() + 30 * MS_PER_DAY)),
  };
}

describe("validateGeneralStep", () => {
  it("requires campaign name, group, and dealership", () => {
    const result = validateGeneralStep(createDefaultSetupDraft());
    expect(result.isValid).toBe(false);
    expect(result.errors.campaignName).toBeDefined();
    expect(result.errors.groupId).toBeDefined();
    expect(result.errors.dealership).toBeDefined();
    expect(result.errors.campaignImage).toBeUndefined();
  });

  it("accepts any non-empty campaign name with group and dealership", () => {
    const draft = { ...validDraft(), campaignName: "My custom campaign" };
    const result = validateGeneralStep(draft);
    expect(result.isValid).toBe(true);
  });

  it("requires timezone fallback when dealership TZ is unknown", () => {
    const draft: CampaignSetupDraft = {
      ...validDraft(),
      groupId: "Summit Automotive Group",
      subfleets: ["Summit Chevrolet"],
      timezoneOverrides: {},
    };
    const result = validateGeneralStep(draft);
    expect(result.isValid).toBe(false);
    expect(result.errors["timezone.Summit Chevrolet"]).toBeDefined();
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

  it("requires a campaign end date", () => {
    const draft = { ...validDraft(), campaignEndDate: "" };
    const result = validateConfigurationStep(draft);
    expect(result.isValid).toBe(false);
    expect(result.errors.campaignEndDate).toBeDefined();
  });

  it("allows an empty optional start date and start time", () => {
    const draft = {
      ...validDraft(),
      campaignStartDate: null,
      campaignStartTimeLocal: null,
    };
    expect(validateConfigurationStep(draft).isValid).toBe(true);
  });

  it("rejects an end date that falls before the start date", () => {
    const draft = {
      ...validDraft(),
      campaignStartDate: toDateInputValue(new Date(Date.now() + 10 * MS_PER_DAY)),
      campaignEndDate: toDateInputValue(new Date(Date.now() + 5 * MS_PER_DAY)),
    };
    const result = validateConfigurationStep(draft);
    expect(result.isValid).toBe(false);
    expect(result.errors.campaignEndDate).toBeDefined();
  });

  it("allows empty optional send time", () => {
    const draft = { ...validDraft(), sendTimeLocal: null };
    expect(validateConfigurationStep(draft).isValid).toBe(true);
  });

  it("rejects invalid optional send time", () => {
    const draft = { ...validDraft(), sendTimeLocal: "25:99" };
    const result = validateConfigurationStep(draft);
    expect(result.isValid).toBe(false);
    expect(result.errors.sendTimeLocal).toBeDefined();
  });

  it("accepts valid optional send time", () => {
    const draft = { ...validDraft(), sendTimeLocal: "12:30" };
    expect(validateConfigurationStep(draft).isValid).toBe(true);
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
  it("allows empty audience filters under interval/OEM", () => {
    const draft = { ...validDraft(), audienceFilters: [] };
    expect(validateAudienceStep(draft).isValid).toBe(true);
  });

  it("is valid when every added rule is complete", () => {
    const draft = {
      ...validDraft(),
      audienceFilters: [
        { id: "a", attribute: "vehicleMake" as const, value: "Honda" },
      ],
    };
    expect(validateAudienceStep(draft).isValid).toBe(true);
  });

  it("rejects a model that does not belong to the selected make", () => {
    const draft = {
      ...validDraft(),
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
