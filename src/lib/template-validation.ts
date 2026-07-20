import type { TemplateDraft, TemplateWizardStepId } from "@/types/template";

export interface TemplateValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateTemplateStep(
  step: TemplateWizardStepId,
  draft: TemplateDraft,
): TemplateValidationResult {
  const errors: Record<string, string> = {};

  if (step === "details" || step === "review") {
    if (!draft.heading.trim()) {
      errors.heading = "Heading is required.";
    }
    if (!draft.message.trim()) {
      errors.message = "Message summary is required.";
    }
  }

  if (step === "content" || step === "review") {
    if (!draft.primaryPromoText.trim()) {
      errors.primaryPromoText = "Primary promo text is required.";
    }
  }

  if (step === "reminders" || step === "review") {
    const reminderChecks: Array<{
      enabled: boolean;
      text: string;
      key: string;
      label: string;
    }> = [
      {
        enabled: draft.reminder1Enabled,
        text: draft.reminder1Text,
        key: "reminder1Text",
        label: "Reminder 1",
      },
      {
        enabled: draft.reminder2Enabled,
        text: draft.reminder2Text,
        key: "reminder2Text",
        label: "Reminder 2",
      },
      {
        enabled: draft.reminder3Enabled,
        text: draft.reminder3Text,
        key: "reminder3Text",
        label: "Reminder 3",
      },
    ];

    for (const reminder of reminderChecks) {
      if (reminder.enabled && !reminder.text.trim()) {
        errors[reminder.key] = `${reminder.label} text is required when enabled.`;
      }
    }
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}
