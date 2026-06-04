import type { CampaignSetupDraft, SetupStepId } from "@/types/campaign-setup";
import { validateServiceTriggerFields } from "@/lib/service-triggers";
import { validateDeliveryChannels } from "@/lib/delivery-channels";

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

  Object.assign(errors, validateDeliveryChannels(draft));

  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateRemindersStep(
  draft: CampaignSetupDraft,
): StepValidationResult {
  const errors: Record<string, string> = {};

  if (draft.reminder1Enabled && !hasText(draft.reminder1Text)) {
    errors.reminder1Text = "Reminder 1 text is required when enabled.";
  }
  if (draft.reminder2Enabled && !hasText(draft.reminder2Text)) {
    errors.reminder2Text = "Reminder 2 text is required when enabled.";
  }
  if (draft.reminder3Enabled && !hasText(draft.reminder3Text)) {
    errors.reminder3Text = "Reminder 3 text is required when enabled.";
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateConfigurationStep(
  draft: CampaignSetupDraft,
): StepValidationResult {
  const errors: Record<string, string> = {};

  Object.assign(errors, validateServiceTriggerFields(draft));

  if (draft.scheduleDays.length === 0) {
    errors.scheduleDays = "Schedule must include Monday through Saturday.";
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateReviewStep(
  draft: CampaignSetupDraft,
  options: { requireTestSend?: boolean; requireTcpaCompliance?: boolean } = {},
): StepValidationResult {
  const errors: Record<string, string> = {};

  if (options.requireTestSend && !hasText(draft.testPhoneNumber)) {
    errors.testPhoneNumber =
      "Enter a mobile number to send a campaign test before activating.";
  }

  if (options.requireTcpaCompliance && !draft.tcpaComplianceConfirmed) {
    errors.tcpaComplianceConfirmed =
      "Confirm TCPA compliance and opt-out suppression before activating.";
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateSetupStep(
  stepId: SetupStepId,
  draft: CampaignSetupDraft,
  options?: { requireTestSend?: boolean; requireTcpaCompliance?: boolean },
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
        requireTcpaCompliance: options?.requireTcpaCompliance ?? false,
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
