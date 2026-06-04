import type { CampaignSetupDraft } from "@/types/campaign-setup";

type ReminderIndex = 1 | 2 | 3;

const REMINDER_ENABLED_KEYS = {
  1: "reminder1Enabled",
  2: "reminder2Enabled",
  3: "reminder3Enabled",
} as const satisfies Record<ReminderIndex, keyof CampaignSetupDraft>;

const REMINDER_USE_PRIMARY_IMAGE_KEYS = {
  1: "reminder1UsePrimaryImage",
  2: "reminder2UsePrimaryImage",
  3: "reminder3UsePrimaryImage",
} as const satisfies Record<ReminderIndex, keyof CampaignSetupDraft>;

const REMINDER_IMAGE_PREVIEW_KEYS = {
  1: "reminder1ImagePreviewUrl",
  2: "reminder2ImagePreviewUrl",
  3: "reminder3ImagePreviewUrl",
} as const satisfies Record<ReminderIndex, keyof CampaignSetupDraft>;

export function isReminderEnabled(
  draft: CampaignSetupDraft,
  reminderIndex: ReminderIndex,
): boolean {
  return Boolean(draft[REMINDER_ENABLED_KEYS[reminderIndex]]);
}

export function hasAnyReminderEnabled(draft: CampaignSetupDraft): boolean {
  return (
    draft.reminder1Enabled ||
    draft.reminder2Enabled ||
    draft.reminder3Enabled
  );
}

export function getReminderImagePreviewUrl(
  draft: CampaignSetupDraft,
  reminderIndex: ReminderIndex,
): string | null {
  const customPreview = draft[REMINDER_IMAGE_PREVIEW_KEYS[reminderIndex]];
  if (customPreview) {
    return customPreview;
  }

  if (
    draft[REMINDER_USE_PRIMARY_IMAGE_KEYS[reminderIndex]] &&
    draft.campaignImagePreviewUrl
  ) {
    return draft.campaignImagePreviewUrl;
  }

  return null;
}

export function getEnabledReminderIndices(
  draft: CampaignSetupDraft,
): ReminderIndex[] {
  const indices: ReminderIndex[] = [];
  if (draft.reminder1Enabled) indices.push(1);
  if (draft.reminder2Enabled) indices.push(2);
  if (draft.reminder3Enabled) indices.push(3);
  return indices;
}
