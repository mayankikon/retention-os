import type { CampaignSetupDraft, SetupStepId } from "@/types/campaign-setup";

export interface StepValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

function hasText(value: string): boolean {
  return value.trim().length > 0;
}

export function validateGeneralStep(
  draft: CampaignSetupDraft,
): StepValidationResult {
  const errors: Record<string, string> = {};

  if (!hasText(draft.campaignName)) {
    errors.campaignName = "Campaign name is required.";
  }

  if (!draft.campaignImageFileName) {
    errors.campaignImage = "Upload a 2×3 logo or storefront image.";
  }

  if (!draft.timeZone) {
    errors.timeZone = "Select a dealership time zone.";
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateMessagingStep(
  draft: CampaignSetupDraft,
): StepValidationResult {
  const errors: Record<string, string> = {};

  if (!hasText(draft.primaryPromoText)) {
    errors.primaryPromoText = "Primary promo text is required.";
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateRemindersStep(
  draft: CampaignSetupDraft,
): StepValidationResult {
  const errors: Record<string, string> = {};

  if (!hasText(draft.dealerDid)) {
    errors.dealerDid =
      "Dealer DID is required and must appear in each reminder.";
  }

  if (draft.remindersEnabled) {
    if (!hasText(draft.reminder1Text)) {
      errors.reminder1Text = "Reminder 1 text is required when enabled.";
    }
    if (!hasText(draft.reminder2Text)) {
      errors.reminder2Text = "Reminder 2 text is required when enabled.";
    }
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateConfigurationStep(
  draft: CampaignSetupDraft,
): StepValidationResult {
  const errors: Record<string, string> = {};

  if (draft.campaignType !== "predefined") {
    errors.campaignType = "Select Predefined unless directed by Leadership.";
  }

  if (!hasText(draft.serviceInterval)) {
    errors.serviceInterval = "Select a service interval.";
  }

  if (draft.subfleets.length === 0) {
    errors.subfleets = "Select at least one rooftop (subfleet).";
  }

  if (draft.scheduleDays.length === 0) {
    errors.scheduleDays = "Schedule must include Monday through Saturday.";
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateReviewStep(
  draft: CampaignSetupDraft,
  options: { requireTestSend: boolean },
): StepValidationResult {
  const errors: Record<string, string> = {};

  if (options.requireTestSend && !hasText(draft.testPhoneNumber)) {
    errors.testPhoneNumber =
      "Enter a mobile number to send a campaign test before activating.";
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateSetupStep(
  stepId: SetupStepId,
  draft: CampaignSetupDraft,
  options?: { requireTestSend?: boolean },
): StepValidationResult {
  switch (stepId) {
    case "general":
      return validateGeneralStep(draft);
    case "messaging":
      return validateMessagingStep(draft);
    case "reminders":
      return validateRemindersStep(draft);
    case "configuration":
      return validateConfigurationStep(draft);
    case "review":
      return validateReviewStep(draft, {
        requireTestSend: options?.requireTestSend ?? false,
      });
    default:
      return { isValid: true, errors: {} };
  }
}

export function validateAllStepsBeforeActivate(
  draft: CampaignSetupDraft,
): StepValidationResult {
  const steps: SetupStepId[] = [
    "general",
    "messaging",
    "reminders",
    "configuration",
  ];

  const mergedErrors: Record<string, string> = {};

  for (const stepId of steps) {
    const result = validateSetupStep(stepId, draft);
    Object.assign(mergedErrors, result.errors);
  }

  return {
    isValid: Object.keys(mergedErrors).length === 0,
    errors: mergedErrors,
  };
}
