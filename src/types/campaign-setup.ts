export const SETUP_STEPS = [
  "general",
  "messaging",
  "reminders",
  "configuration",
  "review",
] as const;

export type SetupStepId = (typeof SETUP_STEPS)[number];

export const CAMPAIGN_TYPES = ["predefined"] as const;
export type CampaignType = (typeof CAMPAIGN_TYPES)[number];

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

export const SERVICE_TRIGGER_TYPES = ["time", "mileage", "oem"] as const;
export type ServiceTriggerType = (typeof SERVICE_TRIGGER_TYPES)[number];

export const SERVICE_TRIGGER_MODES = ["interval", "oem"] as const;
export type ServiceTriggerMode = (typeof SERVICE_TRIGGER_MODES)[number];

/** @deprecated Prefer template store ids + CUSTOM_TEMPLATE_ID. Kept for legacy seeds. */
export const CAMPAIGN_MESSAGE_TEMPLATE_IDS = [
  "oil_change",
  "service_reminder",
  "check_engine_light",
  "custom",
] as const;

/** Campaign setup template reference: managed template id or "custom". */
export type CampaignMessageTemplateId = string;

export const DELIVERY_CHANNELS = ["sms", "email"] as const;
export type DeliveryChannel = (typeof DELIVERY_CHANNELS)[number];

export const AUDIENCE_ATTRIBUTES = [
  "vehicleYear",
  "vehicleMake",
  "vehicleModel",
  "customerZip",
  "customerCity",
  "vehiclePurchaseDate",
  "odometer",
] as const;

export type AudienceAttribute = (typeof AUDIENCE_ATTRIBUTES)[number];

export interface AudienceFilterRule {
  id: string;
  attribute: AudienceAttribute;
  value: string;
}

export interface CampaignSetupDraft {
  campaignName: string;
  campaignImageFileName: string | null;
  campaignImagePreviewUrl: string | null;
  messageTemplateId: CampaignMessageTemplateId | null;
  primaryPromoText: string;
  dealerUrl: string;
  deliveryChannels: DeliveryChannel[];
  reminder1Enabled: boolean;
  reminder1Text: string;
  reminder1ImageFileName: string | null;
  reminder1ImagePreviewUrl: string | null;
  reminder1UsePrimaryImage: boolean;
  reminder2Enabled: boolean;
  reminder2Text: string;
  reminder2ImageFileName: string | null;
  reminder2ImagePreviewUrl: string | null;
  reminder2UsePrimaryImage: boolean;
  reminder3Enabled: boolean;
  reminder3Text: string;
  reminder3ImageFileName: string | null;
  reminder3ImagePreviewUrl: string | null;
  reminder3UsePrimaryImage: boolean;
  campaignType: CampaignType;
  serviceTriggerMode: ServiceTriggerMode;
  serviceTriggerTypes: ServiceTriggerType[];
  timeServiceTriggerPreset: string;
  mileageServiceTriggerPreset: string;
  oemMake: string;
  oemModel: string;
  subfleets: string[];
  scheduleDays: ScheduleDay[];
  timeZone: SetupTimeZone;
  testPhoneNumber: string;
  suppressionListFileName: string | null;
  suppressionListEntryCount: number | null;
  tcpaComplianceConfirmed: boolean;
  audienceFilters: AudienceFilterRule[];
}

export interface SetupStepMeta {
  id: SetupStepId;
  label: string;
  description: string;
}
