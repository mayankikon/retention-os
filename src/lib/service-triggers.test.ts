import { describe, expect, it } from "vitest";
import { createDefaultSetupDraft } from "@/data/campaign-setup.defaults";
import {
  getServiceTriggerSummaries,
  getServiceTriggerSummary,
  toggleServiceTriggerType,
  validateServiceTriggerFields,
} from "@/lib/service-triggers";

describe("service triggers", () => {
  it("defaults to the SOP time trigger", () => {
    const draft = createDefaultSetupDraft();
    expect(draft.serviceTriggerTypes).toEqual(["time"]);
    expect(draft.timeServiceTriggerPreset).toBe("180_days_5000_mile");
    expect(getServiceTriggerSummary(draft)).toBe(
      "Time: 180 days / 5,000 miles (SOP default)",
    );
  });

  it("allows multiple trigger types at once", () => {
    const draft = createDefaultSetupDraft();
    const withMileage = {
      ...draft,
      ...toggleServiceTriggerType(draft, "mileage", true),
    };

    expect(withMileage.serviceTriggerTypes).toEqual(["time", "mileage"]);
    expect(getServiceTriggerSummaries(withMileage)).toEqual([
      "Time: 180 days / 5,000 miles (SOP default)",
      "Mileage: 2,000 miles",
    ]);
  });

  it("requires at least one trigger type", () => {
    const draft = {
      ...createDefaultSetupDraft(),
      serviceTriggerTypes: [] as const,
    };

    expect(validateServiceTriggerFields(draft).serviceTriggerTypes).toBeDefined();
  });

  it("requires make and model when OEM trigger is enabled", () => {
    const draft = {
      ...createDefaultSetupDraft(),
      serviceTriggerTypes: ["oem"] as const,
      oemMake: "",
      oemModel: "",
    };

    const errors = validateServiceTriggerFields(draft);
    expect(errors.oemMake).toBeDefined();
    expect(errors.oemModel).toBeDefined();
  });

  it("summarizes OEM schedules from make and model", () => {
    const draft = {
      ...createDefaultSetupDraft(),
      serviceTriggerTypes: ["oem"] as const,
      oemMake: "Toyota",
      oemModel: "RAV4",
    };

    expect(getServiceTriggerSummary(draft)).toBe(
      "OEM: Toyota RAV4 — 10,000 mi / 12 months",
    );
    expect(validateServiceTriggerFields(draft)).toEqual({});
  });
});
