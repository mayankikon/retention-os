export const SETUP_STEPS = [
  "general",
  "messaging",
  "reminders",
  "configuration",
  "review",
] as const;

export type SetupStepId = (typeof SETUP_STEPS)[number];

export const CAMPAIGN_TYPES = ["predefined", "custom", "push"] as const;
export type CampaignType = (typeof CAMPAIGN_TYPES)[number];

export const DELIVERY_FREQUENCIES = ["ongoing", "send_once"] as const;
export type DeliveryFrequency = (typeof DELIVERY_FREQUENCIES)[number];

export const SETUP_TIME_ZONES = ["CST", "EST", "PST", "MST"] as const;
export type SetupTimeZone = (typeof SETUP_TIME_ZONES)[number];

export const SCHEDULE_DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

export type ScheduleDay = (typeof SCHEDULE_DAYS)[number];

export interface CampaignSetupDraft {
  campaignName: string;
  campaignImageFileName: string | null;
  campaignImagePreviewUrl: string | null;
  primaryPromoText: string;
  dealerUrl: string;
  additionalUrl: string;
  remindersEnabled: boolean;
  reminder1Text: string;
  reminder2Text: string;
  reminder3Text: string;
  dealerDid: string;
  campaignType: CampaignType;
  serviceInterval: string;
  subfleets: string[];
  deliveryFrequency: DeliveryFrequency;
  scheduleDays: ScheduleDay[];
  timeZone: SetupTimeZone;
  testPhoneNumber: string;
}

export interface SetupStepMeta {
  id: SetupStepId;
  label: string;
  description: string;
}
