import { getCampaignMessageTemplate } from "@/data/campaign-message-templates";
import type {
  Campaign,
  CampaignLiveCopy,
  CampaignLiveCopyReminder,
} from "@/types/campaign";
import type { CampaignSetupDraft } from "@/types/campaign-setup";

const MESSAGE_VARIABLE_PATTERN = /\[@[A-Z0-9_]+@\]/gi;

const REMINDER_CONFIG = [
  {
    id: "reminder1",
    label: "Reminder 1",
    enabledKey: "reminder1Enabled",
    textKey: "reminder1Text",
  },
  {
    id: "reminder2",
    label: "Reminder 2",
    enabledKey: "reminder2Enabled",
    textKey: "reminder2Text",
  },
  {
    id: "reminder3",
    label: "Reminder 3",
    enabledKey: "reminder3Enabled",
    textKey: "reminder3Text",
  },
] as const satisfies ReadonlyArray<{
  id: CampaignLiveCopyReminder["id"];
  label: string;
  enabledKey: keyof Pick<
    CampaignSetupDraft,
    "reminder1Enabled" | "reminder2Enabled" | "reminder3Enabled"
  >;
  textKey: keyof Pick<
    CampaignSetupDraft,
    "reminder1Text" | "reminder2Text" | "reminder3Text"
  >;
}>;

function getMessageVariables(message: string): string[] {
  return message.match(MESSAGE_VARIABLE_PATTERN) ?? [];
}

export function hasSameMessageVariables(
  originalMessage: string,
  updatedMessage: string,
): boolean {
  const originalVariables = getMessageVariables(originalMessage);
  const updatedVariables = getMessageVariables(updatedMessage);

  return (
    originalVariables.length === updatedVariables.length &&
    originalVariables.every(
      (variable, index) => variable === updatedVariables[index],
    )
  );
}

export function getCampaignLiveCopy(campaign: Campaign): CampaignLiveCopy {
  if (campaign.liveCopy) {
    return structuredClone(campaign.liveCopy);
  }

  const setupDraft = campaign.setupDraft;
  const template = campaign.messageTemplateId
    ? getCampaignMessageTemplate(campaign.messageTemplateId)
    : undefined;

  const initialMessage =
    setupDraft?.primaryPromoText ?? template?.primaryPromoText ?? "";

  const reminders = REMINDER_CONFIG.flatMap((config) => {
    const body = setupDraft?.[config.textKey] ?? template?.[config.textKey] ?? "";
    const isEnabled = setupDraft
      ? setupDraft[config.enabledKey]
      : body.trim().length > 0;

    return isEnabled ? [{ id: config.id, label: config.label, body }] : [];
  });

  return { initialMessage, reminders };
}

export function applyCampaignLiveCopy(
  campaign: Campaign,
  copy: CampaignLiveCopy,
  updatedAt = new Date().toISOString(),
): Campaign {
  if (campaign.status !== "active" && campaign.status !== "paused") {
    throw new Error("Only active or paused campaigns support live copy edits.");
  }

  const originalCopy = getCampaignLiveCopy(campaign);
  const updatedReminderById = new Map(
    copy.reminders.map((reminder) => [reminder.id, reminder]),
  );

  const setupDraft = campaign.setupDraft
    ? structuredClone(campaign.setupDraft)
    : undefined;

  if (setupDraft) {
    setupDraft.primaryPromoText = copy.initialMessage;
    for (const config of REMINDER_CONFIG) {
      const updatedReminder = updatedReminderById.get(config.id);
      if (updatedReminder) {
        setupDraft[config.textKey] = updatedReminder.body;
      }
    }
  }

  return {
    ...campaign,
    liveCopy: {
      initialMessage: copy.initialMessage,
      reminders: originalCopy.reminders.map((reminder) => ({
        ...reminder,
        body: updatedReminderById.get(reminder.id)?.body ?? reminder.body,
      })),
    },
    setupDraft,
    lastUpdatedAt: updatedAt,
    copyUpdatedAt: updatedAt,
  };
}

export function validateCampaignLiveCopy(
  originalCopy: CampaignLiveCopy,
  updatedCopy: CampaignLiveCopy,
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!updatedCopy.initialMessage.trim()) {
    errors.initialMessage = "Initial message copy is required.";
  } else if (
    !hasSameMessageVariables(
      originalCopy.initialMessage,
      updatedCopy.initialMessage,
    )
  ) {
    errors.initialMessage = "Personalization variables are locked.";
  }

  const originalReminderById = new Map(
    originalCopy.reminders.map((reminder) => [reminder.id, reminder]),
  );
  for (const reminder of updatedCopy.reminders) {
    const originalReminder = originalReminderById.get(reminder.id);
    if (!reminder.body.trim()) {
      errors[reminder.id] = `${reminder.label} copy is required.`;
    } else if (
      originalReminder &&
      !hasSameMessageVariables(originalReminder.body, reminder.body)
    ) {
      errors[reminder.id] = "Personalization variables are locked.";
    }
  }

  return errors;
}
