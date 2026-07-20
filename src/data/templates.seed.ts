import type { MessageTemplate, TemplateActor } from "@/types/template";
import {
  CHECK_ENGINE_TEMPLATE_ID,
  OIL_CHANGE_TEMPLATE_ID,
  SERVICE_REMINDER_TEMPLATE_ID,
} from "@/types/template";

const SYSTEM_ACTOR: TemplateActor = {
  id: "u-system",
  name: "Ikon System",
  initials: "IS",
};

const SEED_CREATED_AT = "2026-06-01T15:00:00.000Z";

function buildSeedTemplate(
  id: string,
  heading: string,
  message: string,
  primaryPromoText: string,
  reminder1Text: string,
  reminder2Text: string,
  reminder3Text: string,
): MessageTemplate {
  return {
    id,
    heading,
    message,
    primaryPromoText,
    dealerUrl: "",
    campaignImageFileName: null,
    campaignImagePreviewUrl: null,
    reminder1Enabled: Boolean(reminder1Text),
    reminder1Text,
    reminder1ImageFileName: null,
    reminder1ImagePreviewUrl: null,
    reminder2Enabled: Boolean(reminder2Text),
    reminder2Text,
    reminder2ImageFileName: null,
    reminder2ImagePreviewUrl: null,
    reminder3Enabled: Boolean(reminder3Text),
    reminder3Text,
    reminder3ImageFileName: null,
    reminder3ImagePreviewUrl: null,
    status: "published",
    isSystem: true,
    createdBy: SYSTEM_ACTOR,
    createdAt: SEED_CREATED_AT,
    updatedBy: SYSTEM_ACTOR,
    updatedAt: SEED_CREATED_AT,
    auditEvents: [
      {
        id: `${id}-audit-created`,
        action: "created",
        summary: "System template seeded",
        actor: SYSTEM_ACTOR,
        at: SEED_CREATED_AT,
      },
      {
        id: `${id}-audit-published`,
        action: "published",
        summary: "Published for campaign use",
        actor: SYSTEM_ACTOR,
        at: SEED_CREATED_AT,
      },
    ],
  };
}

export function createSeedTemplates(): MessageTemplate[] {
  return [
    buildSeedTemplate(
      OIL_CHANGE_TEMPLATE_ID,
      "Oil Change Campaign",
      "Oil change due messaging with follow-up reminders.",
      'Hey [@FN@], It\'s Jay from ABC Motors. We noticed your [@YEA@] [@MAK@] [@MOD@] may be due for an oil change to protect engine performance and reliability. CLICK the link to schedule or call us at (Dealer DID) [@DSP@]',
      "Hi [@FN@], Jay again! Just checking in on your [@MOD@]. We have a few appointment slots available this week for your oil change. Grab a spot here: [@DSP@] Call: (Dealer DID)",
      "Hey [@FN@], I'll stop bugging you about the [@MOD@] oil change for now! Just wanted to make sure you were taken care of. If you still need that service later, the link below stays active. BOOK NOW: [@DSP@] PHONE: (Dealer DID)",
      "[@FN@], last reminder about your [@MOD@] oil change. Schedule before your next interval to keep warranty coverage valid. [@DSP@] | (Dealer DID)",
    ),
    buildSeedTemplate(
      SERVICE_REMINDER_TEMPLATE_ID,
      "Service Reminder Campaign",
      "General factory-recommended service interval outreach.",
      "Hi [@FN@], ABC Motors here. Your [@YEA@] [@MAK@] [@MOD@] is approaching its recommended service interval. Book your visit to stay on schedule: [@DSP@] or call (Dealer DID).",
      "[@FN@], friendly reminder — your [@MOD@] service window is open. We can get you in this week. Schedule here: [@DSP@] | (Dealer DID)",
      "Hey [@FN@], still need service on your [@MOD@]? Our team saved a few openings for returning customers. Book now: [@DSP@] PHONE: (Dealer DID)",
      "[@FN@], final service reminder for your [@YEA@] [@MAK@] [@MOD@]. Let us know if you already completed service elsewhere. [@DSP@]",
    ),
    buildSeedTemplate(
      CHECK_ENGINE_TEMPLATE_ID,
      "Check Engine Light",
      "Diagnostic outreach when a check-engine alert is detected.",
      "Hi [@FN@], ABC Motors detected a check-engine alert on your [@YEA@] [@MAK@] [@MOD@]. Don't ignore the light — schedule a diagnostic today: [@DSP@] or (Dealer DID).",
      "[@FN@], your [@MOD@] check-engine light still needs attention. Our certified techs can diagnose it quickly. Book here: [@DSP@] | (Dealer DID)",
      "Hey [@FN@], checking back on your [@MOD@] engine warning. Early diagnosis can prevent costly repairs. Schedule now: [@DSP@] PHONE: (Dealer DID)",
      "[@FN@], last reminder about your check-engine alert. We're here when you're ready — same-day diagnostics available. [@DSP@]",
    ),
  ];
}
