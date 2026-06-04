import {
  getOemServiceSchedule,
  getPresetOptionsForTriggerType,
  MILEAGE_SERVICE_TRIGGER_OPTIONS,
  TIME_SERVICE_TRIGGER_OPTIONS,
} from "@/data/service-triggers";
import type { CampaignSetupDraft, ServiceTriggerType } from "@/types/campaign-setup";

export function getDefaultPresetForTriggerType(
  triggerType: Exclude<ServiceTriggerType, "oem">,
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

export function isServiceTriggerEnabled(
  draft: CampaignSetupDraft,
  triggerType: ServiceTriggerType,
): boolean {
  return draft.serviceTriggerTypes.includes(triggerType);
}

export function toggleServiceTriggerType(
  draft: CampaignSetupDraft,
  triggerType: ServiceTriggerType,
  enabled: boolean,
): Partial<CampaignSetupDraft> {
  const currentTypes = draft.serviceTriggerTypes;
  const nextTypes = enabled
    ? [...new Set([...currentTypes, triggerType])]
    : currentTypes.filter((type) => type !== triggerType);

  const patch: Partial<CampaignSetupDraft> = {
    serviceTriggerTypes: nextTypes,
  };

  if (enabled && triggerType === "time" && !draft.timeServiceTriggerPreset) {
    patch.timeServiceTriggerPreset = getDefaultPresetForTriggerType("time");
  }

  if (enabled && triggerType === "mileage" && !draft.mileageServiceTriggerPreset) {
    patch.mileageServiceTriggerPreset =
      getDefaultPresetForTriggerType("mileage");
  }

  if (!enabled && triggerType === "oem") {
    patch.oemMake = "";
    patch.oemModel = "";
  }

  return patch;
}

export function getServiceTriggerSummaries(draft: CampaignSetupDraft): string[] {
  const summaries: string[] = [];

  if (isServiceTriggerEnabled(draft, "time")) {
    const option = TIME_SERVICE_TRIGGER_OPTIONS.find(
      (item) => item.value === draft.timeServiceTriggerPreset,
    );
    summaries.push(`Time: ${option?.label ?? "Not selected"}`);
  }

  if (isServiceTriggerEnabled(draft, "mileage")) {
    const option = MILEAGE_SERVICE_TRIGGER_OPTIONS.find(
      (item) => item.value === draft.mileageServiceTriggerPreset,
    );
    summaries.push(`Mileage: ${option?.label ?? "Not selected"}`);
  }

  if (isServiceTriggerEnabled(draft, "oem")) {
    if (!draft.oemMake || !draft.oemModel) {
      summaries.push("OEM: Schedule not selected");
    } else {
      const schedule = getOemServiceSchedule(draft.oemMake, draft.oemModel);
      summaries.push(
        schedule
          ? `OEM: ${schedule.make} ${schedule.model} — ${schedule.intervalMiles.toLocaleString("en-US")} mi / ${formatIntervalDays(schedule.intervalDays)}`
          : `OEM: ${draft.oemMake} ${draft.oemModel}`,
      );
    }
  }

  return summaries;
}

export function getServiceTriggerSummary(draft: CampaignSetupDraft): string {
  const summaries = getServiceTriggerSummaries(draft);
  if (summaries.length === 0) {
    return "No service triggers selected";
  }

  return summaries.join("; ");
}

export function validateServiceTriggerFields(
  draft: CampaignSetupDraft,
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (draft.serviceTriggerTypes.length === 0) {
    errors.serviceTriggerTypes = "Select at least one service trigger.";
    return errors;
  }

  if (isServiceTriggerEnabled(draft, "time")) {
    const hasValidPreset = TIME_SERVICE_TRIGGER_OPTIONS.some(
      (option) => option.value === draft.timeServiceTriggerPreset,
    );
    if (!hasValidPreset) {
      errors.timeServiceTriggerPreset = "Select a time interval.";
    }
  }

  if (isServiceTriggerEnabled(draft, "mileage")) {
    const hasValidPreset = MILEAGE_SERVICE_TRIGGER_OPTIONS.some(
      (option) => option.value === draft.mileageServiceTriggerPreset,
    );
    if (!hasValidPreset) {
      errors.mileageServiceTriggerPreset = "Select a mileage interval.";
    }
  }

  if (isServiceTriggerEnabled(draft, "oem")) {
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

  return errors;
}

function formatIntervalDays(days: number): string {
  if (days % 365 === 0 && days >= 365) {
    const years = days / 365;
    return years === 1 ? "12 months" : `${years} years`;
  }

  return `${days} days`;
}
