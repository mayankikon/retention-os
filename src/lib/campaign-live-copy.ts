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

/**
 * Live copy for the Edit live copy screen: the initial message plus all three
 * reminders with their on/off state. Turned-off reminders keep their text.
 */
export function getCampaignLiveCopy(campaign: Campaign): CampaignLiveCopy {
  const setupDraft = campaign.setupDraft;
  const template = campaign.messageTemplateId
    ? getCampaignMessageTemplate(campaign.messageTemplateId)
    : undefined;
  const savedReminderById = new Map(
    (campaign.liveCopy?.reminders ?? []).map((reminder) => [reminder.id, reminder]),
  );

  const initialMessage =
    campaign.liveCopy?.initialMessage ??
    setupDraft?.primaryPromoText ??
    template?.primaryPromoText ??
    "";

  const reminders = REMINDER_CONFIG.map((config) => {
    const saved = savedReminderById.get(config.id);
    const body =
      saved?.body ?? setupDraft?.[config.textKey] ?? template?.[config.textKey] ?? "";
    // Copies saved before reminders could be toggled only listed sending reminders.
    const enabled = saved
      ? saved.enabled ?? true
      : campaign.liveCopy
        ? false
        : setupDraft
          ? setupDraft[config.enabledKey]
          : body.trim().length > 0;

    return { id: config.id, label: config.label, body, enabled };
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
  const reminders = originalCopy.reminders.map((reminder) => {
    const updated = updatedReminderById.get(reminder.id);
    return updated
      ? { ...reminder, body: updated.body, enabled: updated.enabled }
      : reminder;
  });

  const textChanged =
    copy.initialMessage !== originalCopy.initialMessage ||
    reminders.some(
      (reminder, index) => reminder.body !== originalCopy.reminders[index].body,
    );
  const toggleEvents = reminders
    .filter(
      (reminder, index) =>
        reminder.enabled !== originalCopy.reminders[index].enabled,
    )
    .map((reminder) => ({
      reminderId: reminder.id,
      label: reminder.label,
      enabled: reminder.enabled,
      at: updatedAt,
    }));

  const setupDraft = campaign.setupDraft
    ? structuredClone(campaign.setupDraft)
    : undefined;

  if (setupDraft) {
    setupDraft.primaryPromoText = copy.initialMessage;
    for (const config of REMINDER_CONFIG) {
      const reminder = reminders.find((item) => item.id === config.id);
      if (!reminder) continue;
      setupDraft[config.textKey] = reminder.body;
      setupDraft[config.enabledKey] = reminder.enabled;
    }
  }

  return {
    ...campaign,
    liveCopy: { initialMessage: copy.initialMessage, reminders },
    setupDraft,
    lastUpdatedAt: updatedAt,
    // Only wording changes count as a copy edit; on/off has its own events.
    copyUpdatedAt: textChanged ? updatedAt : campaign.copyUpdatedAt,
    reminderToggleEvents: [
      ...(campaign.reminderToggleEvents ?? []),
      ...toggleEvents,
    ],
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
  // Reminder text is required (and its variables locked) only while it's on.
  for (const reminder of updatedCopy.reminders) {
    if (!reminder.enabled) continue;
    const originalReminder = originalReminderById.get(reminder.id);
    if (!reminder.body.trim()) {
      errors[reminder.id] = `${reminder.label} text is required while it's turned on.`;
    } else if (
      originalReminder?.body.trim() &&
      !hasSameMessageVariables(originalReminder.body, reminder.body)
    ) {
      errors[reminder.id] = "Personalization variables are locked.";
    }
  }

  return errors;
}
