import type { CampaignSetupDraft, SetupStepMeta } from "@/types/campaign-setup";
import { SCHEDULE_DAYS } from "@/types/campaign-setup";
import { DEALERS } from "@/data/lookups";

export const SETUP_STEP_META: SetupStepMeta[] = [
  {
    id: "general",
    label: "General",
    description: "Campaign name and image",
  },
  {
    id: "messaging",
    label: "Messaging",
    description: "Primary SMS and URLs",
  },
  {
    id: "reminders",
    label: "Reminders",
    description: "Follow-up message templates",
  },
  {
    id: "configuration",
    label: "Configuration",
    description: "Type, services, schedule",
  },
  {
    id: "review",
    label: "Review & activate",
    description: "Test, verify, and launch",
  },
];

export const DEFAULT_PRIMARY_PROMO =
  'Hey [@FN@], It\'s Jay from ABC Motors. We noticed your [@YEA@] [@MAK@] [@MOD@] may be due for an oil change to protect engine performance and reliability. CLICK the link to schedule or call us at (Dealer DID) [@DSP@]';

export const DEFAULT_REMINDER_1 =
  "Hi [@FN@], Jay again! Just checking in on your [@MOD@]. We have a few appointment slots available this week for your oil change. Grab a spot here: [@DSP@] Call: (Dealer DID)";

export const DEFAULT_REMINDER_2 =
  "Hey [@FN@], I'll stop bugging you about the [@MOD@] oil change for now! Just wanted to make sure you were taken care of. If you still need that service later, the link below stays active. BOOK NOW: [@DSP@] PHONE: (Dealer DID)";

export const DEFAULT_REMINDER_3 = "";

export const SERVICE_INTERVAL_OPTIONS = [
  {
    value: "every_180_days_5000_mile",
    label: "Every 180 Days / 5000 Mile",
  },
] as const;

export const CAMPAIGN_TYPE_OPTIONS = [
  {
    value: "predefined" as const,
    label: "Predefined",
    description: "Standard campaign type for dealership setup",
    disabled: false,
  },
  {
    value: "custom" as const,
    label: "Custom",
    description: "Handled by Leadership",
    disabled: true,
  },
  {
    value: "push" as const,
    label: "Push",
    description: "Handled by Leadership",
    disabled: true,
  },
];

export const TIME_ZONE_SCHEDULE_REFERENCE = [
  {
    timeZone: "CST",
    smsWindow: "11:45am – 12:30pm",
    managerTime: "Same (CST)",
  },
  {
    timeZone: "EST",
    smsWindow: "12:05am – 1:00pm",
    managerTime: "11:05am – 11:45am CST",
  },
  {
    timeZone: "PST",
    smsWindow: "12:15am – 1:00pm",
    managerTime: "14:15 – 15:00 CST",
  },
  {
    timeZone: "MST",
    smsWindow: "12:00pm – 12:45pm",
    managerTime: "13:00 – 13:45 CST",
  },
] as const;

export const TIME_ZONE_OPTIONS = TIME_ZONE_SCHEDULE_REFERENCE.map((row) => ({
  value: row.timeZone,
  label:
    row.timeZone === "CST"
      ? "Central Time (CST)"
      : row.timeZone === "EST"
        ? "Eastern Time (EST)"
        : row.timeZone === "PST"
          ? "Pacific Time (PST)"
          : "Mountain Time (MST)",
}));

export function getTimeZoneLabel(timeZone: string): string {
  return (
    TIME_ZONE_OPTIONS.find((option) => option.value === timeZone)?.label ??
    timeZone
  );
}

export const SUBFLEET_OPTIONS = DEALERS.filter(
  (dealer) => dealer !== "All Dealerships",
).map((dealer) => ({ value: dealer, label: dealer }));

export function createDefaultSetupDraft(): CampaignSetupDraft {
  return {
    campaignName: "",
    campaignImageFileName: null,
    campaignImagePreviewUrl: null,
    primaryPromoText: DEFAULT_PRIMARY_PROMO,
    dealerUrl: "",
    additionalUrl: "",
    remindersEnabled: true,
    reminder1Text: DEFAULT_REMINDER_1,
    reminder2Text: DEFAULT_REMINDER_2,
    reminder3Text: DEFAULT_REMINDER_3,
    dealerDid: "",
    campaignType: "predefined",
    serviceInterval: SERVICE_INTERVAL_OPTIONS[0].value,
    subfleets: [],
    deliveryFrequency: "ongoing",
    scheduleDays: [...SCHEDULE_DAYS],
    timeZone: "CST",
    testPhoneNumber: "",
  };
}

export const CAMPAIGN_NAME_TEMPLATE_HINT =
  "Suggested SOP format: SM [Dealership Name] [Time Zone] [Date] [Your Initials] — e.g. SM ABC Motors PST 2/17 JT";
