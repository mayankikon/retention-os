import { describe, expect, it } from "vitest";
import { createDefaultSetupDraft } from "@/data/campaign-setup.defaults";
import {
  getServiceTriggerMode,
  getServiceTriggerSummaries,
  getServiceTriggerSummary,
  setServiceTriggerMode,
  validateServiceTriggerFields,
} from "@/lib/service-triggers";

describe("service triggers", () => {
  it("defaults to interval mode with time and mileage presets", () => {
    const draft = createDefaultSetupDraft();
    expect(draft.serviceTriggerMode).toBe("interval");
    expect(draft.serviceTriggerTypes).toEqual(["time", "mileage"]);
    expect(draft.timeServiceTriggerPreset).toBe("180_days_5000_mile");
    expect(getServiceTriggerSummary(draft)).toContain(
      "Time Interval: 180 days / 5,000 miles (SOP default)",
    );
    expect(getServiceTriggerSummary(draft)).toContain(
      "Mileage Interval: 2,000 miles",
    );
  });

  it("uses interval mode with both time and mileage presets", () => {
    const draft = createDefaultSetupDraft();
    const intervalDraft = {
      ...draft,
      ...setServiceTriggerMode(draft, "interval"),
    };

    expect(intervalDraft.serviceTriggerMode).toBe("interval");
    expect(intervalDraft.serviceTriggerTypes).toEqual(["time", "mileage"]);
    expect(getServiceTriggerSummaries(intervalDraft)).toEqual([
      "Time Interval: 180 days / 5,000 miles (SOP default)",
      "Mileage Interval: 2,000 miles",
      "Audience Query: No filters added",
    ]);
  });

  it("requires time and mileage presets in interval mode", () => {
    const draft = {
      ...createDefaultSetupDraft(),
      timeServiceTriggerPreset: "",
      mileageServiceTriggerPreset: "",
    };

    const errors = validateServiceTriggerFields(draft);
    expect(errors.timeServiceTriggerPreset).toBeDefined();
    expect(errors.mileageServiceTriggerPreset).toBeDefined();
  });

  it("requires make and model in OEM mode", () => {
    const draft = {
      ...createDefaultSetupDraft(),
      ...setServiceTriggerMode(createDefaultSetupDraft(), "oem"),
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
      ...setServiceTriggerMode(createDefaultSetupDraft(), "oem"),
      oemMake: "Toyota",
      oemModel: "RAV4",
    };

    expect(getServiceTriggerSummary(draft)).toContain(
      "OEM-Recommended Service Schedule: Toyota RAV4 — 10,000 mi / 12 months",
    );
    expect(validateServiceTriggerFields(draft)).toEqual({});
  });

  it("clears OEM fields when switching back to interval mode", () => {
    const draft = {
      ...createDefaultSetupDraft(),
      ...setServiceTriggerMode(createDefaultSetupDraft(), "oem"),
      oemMake: "Toyota",
      oemModel: "RAV4",
    };

    const intervalDraft = {
      ...draft,
      ...setServiceTriggerMode(draft, "interval"),
    };

    expect(intervalDraft.oemMake).toBe("");
    expect(intervalDraft.oemModel).toBe("");
    expect(intervalDraft.serviceTriggerTypes).toEqual(["time", "mileage"]);
  });

  it("nests audience query filters under interval or OEM", () => {
    const draft = {
      ...createDefaultSetupDraft(),
      ...setServiceTriggerMode(createDefaultSetupDraft(), "interval"),
      audienceFilters: [
        { id: "a", attribute: "vehicleMake" as const, value: "Toyota" },
        { id: "b", attribute: "vehicleModel" as const, value: "Corolla" },
      ],
    };

    expect(getServiceTriggerMode(draft)).toBe("interval");
    expect(getServiceTriggerSummaries(draft)).toEqual([
      "Time Interval: 180 days / 5,000 miles (SOP default)",
      "Mileage Interval: 2,000 miles",
      "Audience Query · Make: Toyota",
      "Audience Query · Model: Corolla",
    ]);
  });

  it("migrates legacy audience-only mode to interval", () => {
    const draft = {
      ...createDefaultSetupDraft(),
      serviceTriggerMode: "audience" as never,
      serviceTriggerTypes: ["audience"] as never[],
      audienceFilters: [],
    };

    expect(getServiceTriggerMode(draft)).toBe("interval");
  });
});
