import {
  getOemServiceSchedule,
  MILEAGE_SERVICE_TRIGGER_OPTIONS,
  TIME_SERVICE_TRIGGER_OPTIONS,
} from "@/data/service-triggers";
import {
  getSelectedMakeFromRules,
  getSelectedModelFromRules,
  isRuleComplete,
  summarizeAudienceFilters,
  validatePurchaseDateRangeRule,
} from "@/lib/audience-filters";
import { isModelValidForMake, isTrimValidForMakeModel } from "@/data/audience-attributes";
import type {
  CampaignSetupDraft,
  ServiceTriggerMode,
  ServiceTriggerType,
} from "@/types/campaign-setup";

export function getDefaultPresetForTriggerType(
  triggerType: Exclude<ServiceTriggerType, "oem">,
): string {
  switch (triggerType) {
    case "time":
      return TIME_SERVICE_TRIGGER_OPTIONS.find(
        (option) => option.value === "180_days",
      )!.value;
    case "mileage":
      return MILEAGE_SERVICE_TRIGGER_OPTIONS[0].value;
  }
}

export function getServiceTriggerMode(draft: CampaignSetupDraft): ServiceTriggerMode {
  if (draft.serviceTriggerMode === "oem") {
    return "oem";
  }

  // Legacy "audience"-only drafts migrate to interval while keeping filters.
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
  if (mode === "oem") {
    return {
      serviceTriggerMode: "oem",
      serviceTriggerTypes: ["oem"],
      oemMake: draft.oemMake,
      oemModel: draft.oemModel,
      oemTrim: draft.oemTrim,
      audienceFilters: draft.audienceFilters.filter(
        (rule) =>
          rule.attribute !== "vehicleMake" &&
          rule.attribute !== "vehicleModel" &&
          rule.attribute !== "vehicleTrim",
      ),
    };
  }

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
    oemTrim: "",
  };
}

export function getServiceTriggerSummaries(draft: CampaignSetupDraft): string[] {
  const mode = getServiceTriggerMode(draft);
  const summaries: string[] = [];

  if (mode === "interval") {
    const timeOption = TIME_SERVICE_TRIGGER_OPTIONS.find(
      (item) => item.value === draft.timeServiceTriggerPreset,
    );
    const mileageOption = MILEAGE_SERVICE_TRIGGER_OPTIONS.find(
      (item) => item.value === draft.mileageServiceTriggerPreset,
    );

    summaries.push(
      `Time Interval: ${timeOption?.label ?? "Not Selected"}`,
      `Mileage Interval: ${mileageOption?.label ?? "Not Selected"}`,
    );
  } else if (!draft.oemMake || !draft.oemModel) {
    summaries.push("OEM-Recommended Service Schedule: Not Selected");
  } else {
    const schedule = getOemServiceSchedule(draft.oemMake, draft.oemModel);
    summaries.push(
      schedule
        ? `OEM-Recommended Service Schedule: ${schedule.make} ${schedule.model}${draft.oemTrim ? ` ${draft.oemTrim}` : ""} — ${schedule.intervalMiles.toLocaleString("en-US")} mi / ${formatIntervalDays(schedule.intervalDays)}`
        : `OEM-Recommended Service Schedule: ${draft.oemMake} ${draft.oemModel}${draft.oemTrim ? ` ${draft.oemTrim}` : ""}`,
    );
  }

  const audienceLines = summarizeAudienceFilters(draft.audienceFilters);
  if (audienceLines.length === 0) {
    summaries.push("Audience Query: No Filters Added");
  } else {
    summaries.push(
      ...audienceLines.map((line) => `Audience Query · ${line}`),
    );
  }

  return summaries;
}

export function getServiceTriggerSummary(draft: CampaignSetupDraft): string {
  const summaries = getServiceTriggerSummaries(draft);
  if (summaries.length === 0) {
    return "No Service Trigger Selected";
  }

  return summaries.join("; ");
}

export function validateAudienceFilterFields(
  draft: CampaignSetupDraft,
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const rule of draft.audienceFilters) {
    if (rule.attribute === "vehiclePurchaseDate") {
      const range = rule.value.trim();
      if (!range) continue;
      const purchaseDateError = validatePurchaseDateRangeRule(rule);
      if (purchaseDateError) {
        errors[`audience.${rule.id}`] = purchaseDateError;
      }
      continue;
    }

    if (!rule.value.trim()) {
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

    if (rule.attribute === "vehicleTrim") {
      const make = getSelectedMakeFromRules(draft.audienceFilters);
      const model = getSelectedModelFromRules(draft.audienceFilters);
      if (!make || !model) {
        errors[`audience.${rule.id}`] =
          "Add Make and Model filters before selecting a Trim.";
      } else if (!isTrimValidForMakeModel(make, model, rule.value.trim())) {
        errors[`audience.${rule.id}`] =
          `Trim is not available for ${make} ${model}.`;
      }
    }
  }

  return errors;
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
  } else {
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
  }

  return {
    ...errors,
    ...validateAudienceFilterFields(draft),
  };
}

function formatIntervalDays(days: number): string {
  if (days % 365 === 0 && days >= 365) {
    const years = days / 365;
    return years === 1 ? "12 Months" : `${years} Years`;
  }

  return `${days} Days`;
}
