import {
  getOemServiceSchedule,
  MILEAGE_SERVICE_TRIGGER_OPTIONS,
  TIME_SERVICE_TRIGGER_OPTIONS,
} from "@/data/service-triggers";
import {
  getSelectedMakeFromRules,
  isRuleComplete,
  summarizeAudienceFilters,
  validatePurchaseDateRangeRule,
} from "@/lib/audience-filters";
import { isModelValidForMake } from "@/data/audience-attributes";
import type {
  CampaignSetupDraft,
  ServiceTriggerMode,
  ServiceTriggerType,
} from "@/types/campaign-setup";

export function getDefaultPresetForTriggerType(
  triggerType: Exclude<ServiceTriggerType, "oem" | "audience">,
): string {
  switch (triggerType) {
    case "time":
      return TIME_SERVICE_TRIGGER_OPTIONS.find(
        (option) => option.value === "180_days_5000_mile",
      )!.value;
    case "mileage":
      return MILEAGE_SERVICE_TRIGGER_OPTIONS[0].value;
  }
}

export function getServiceTriggerMode(draft: CampaignSetupDraft): ServiceTriggerMode {
  if (draft.serviceTriggerMode) {
    return draft.serviceTriggerMode;
  }

  if (draft.serviceTriggerTypes.includes("oem")) {
    return "oem";
  }

  if (draft.serviceTriggerTypes.includes("audience")) {
    return "audience";
  }

  return "interval";
}

export function isServiceTriggerEnabled(
  draft: CampaignSetupDraft,
  triggerType: ServiceTriggerType,
): boolean {
  return draft.serviceTriggerTypes.includes(triggerType);
}

export function setServiceTriggerMode(
  draft: CampaignSetupDraft,
  mode: ServiceTriggerMode,
): Partial<CampaignSetupDraft> {
  if (mode === "interval") {
    return {
      serviceTriggerMode: "interval",
      serviceTriggerTypes: ["time", "mileage"],
      timeServiceTriggerPreset:
        draft.timeServiceTriggerPreset || getDefaultPresetForTriggerType("time"),
      mileageServiceTriggerPreset:
        draft.mileageServiceTriggerPreset ||
        getDefaultPresetForTriggerType("mileage"),
      oemMake: "",
      oemModel: "",
    };
  }

  if (mode === "oem") {
    return {
      serviceTriggerMode: "oem",
      serviceTriggerTypes: ["oem"],
      oemMake: draft.oemMake,
      oemModel: draft.oemModel,
    };
  }

  return {
    serviceTriggerMode: "audience",
    serviceTriggerTypes: ["audience"],
    oemMake: "",
    oemModel: "",
  };
}

export function getServiceTriggerSummaries(draft: CampaignSetupDraft): string[] {
  const mode = getServiceTriggerMode(draft);

  if (mode === "interval") {
    const timeOption = TIME_SERVICE_TRIGGER_OPTIONS.find(
      (item) => item.value === draft.timeServiceTriggerPreset,
    );
    const mileageOption = MILEAGE_SERVICE_TRIGGER_OPTIONS.find(
      (item) => item.value === draft.mileageServiceTriggerPreset,
    );

    return [
      `Time Interval: ${timeOption?.label ?? "Not selected"}`,
      `Mileage Interval: ${mileageOption?.label ?? "Not selected"}`,
    ];
  }

  if (mode === "audience") {
    const audienceLines = summarizeAudienceFilters(draft.audienceFilters);
    if (audienceLines.length === 0) {
      return ["Audience Query: No filters added"];
    }

    return audienceLines.map((line) => `Audience Query · ${line}`);
  }

  if (!draft.oemMake || !draft.oemModel) {
    return ["OEM-Recommended Service Schedule: Not selected"];
  }

  const schedule = getOemServiceSchedule(draft.oemMake, draft.oemModel);
  return [
    schedule
      ? `OEM-Recommended Service Schedule: ${schedule.make} ${schedule.model} — ${schedule.intervalMiles.toLocaleString("en-US")} mi / ${formatIntervalDays(schedule.intervalDays)}`
      : `OEM-Recommended Service Schedule: ${draft.oemMake} ${draft.oemModel}`,
  ];
}

export function getServiceTriggerSummary(draft: CampaignSetupDraft): string {
  const summaries = getServiceTriggerSummaries(draft);
  if (summaries.length === 0) {
    return "No service trigger selected";
  }

  return summaries.join("; ");
}

export function validateServiceTriggerFields(
  draft: CampaignSetupDraft,
): Record<string, string> {
  const errors: Record<string, string> = {};
  const mode = getServiceTriggerMode(draft);

  if (mode === "interval") {
    const hasValidTimePreset = TIME_SERVICE_TRIGGER_OPTIONS.some(
      (option) => option.value === draft.timeServiceTriggerPreset,
    );
    if (!hasValidTimePreset) {
      errors.timeServiceTriggerPreset = "Select a time interval.";
    }

    const hasValidMileagePreset = MILEAGE_SERVICE_TRIGGER_OPTIONS.some(
      (option) => option.value === draft.mileageServiceTriggerPreset,
    );
    if (!hasValidMileagePreset) {
      errors.mileageServiceTriggerPreset = "Select a mileage interval.";
    }

    return errors;
  }

  if (mode === "audience") {
    const completeRules = draft.audienceFilters.filter(isRuleComplete);
    if (completeRules.length === 0) {
      errors.audienceFilters = "Add at least one audience filter.";
    }

    for (const rule of draft.audienceFilters) {
      if (rule.attribute === "vehiclePurchaseDate") {
        const purchaseDateError = validatePurchaseDateRangeRule(rule);
        if (purchaseDateError) {
          errors[`audience.${rule.id}`] = purchaseDateError;
        }
        continue;
      }

      if (!isRuleComplete(rule)) {
        errors[`audience.${rule.id}`] =
          "Complete this filter or remove it (check the value and any range).";
        continue;
      }

      if (rule.attribute === "vehicleModel") {
        const make = getSelectedMakeFromRules(draft.audienceFilters);
        if (!make) {
          errors[`audience.${rule.id}`] =
            "Add a Make filter before selecting a Model.";
        } else if (!isModelValidForMake(make, rule.value.trim())) {
          errors[`audience.${rule.id}`] = `Model is not available for ${make}.`;
        }
      }
    }

    return errors;
  }

  if (!draft.oemMake.trim()) {
    errors.oemMake = "Select a vehicle make.";
  }
  if (!draft.oemModel.trim()) {
    errors.oemModel = "Select a vehicle model.";
  }
  if (
    draft.oemMake.trim() &&
    draft.oemModel.trim() &&
    !getOemServiceSchedule(draft.oemMake, draft.oemModel)
  ) {
    errors.oemModel = "No OEM schedule is available for this make and model.";
  }

  return errors;
}

function formatIntervalDays(days: number): string {
  if (days % 365 === 0 && days >= 365) {
    const years = days / 365;
    return years === 1 ? "12 months" : `${years} years`;
  }

  return `${days} days`;
}
