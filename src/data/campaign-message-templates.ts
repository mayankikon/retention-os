import type { CampaignSetupDraft } from "@/types/campaign-setup";
import type { CampaignMessageTemplateId } from "@/types/campaign-setup";

export interface CampaignMessageTemplate {
  id: CampaignMessageTemplateId;
  label: string;
  description: string;
  primaryPromoText: string;
  reminder1Text: string;
  reminder2Text: string;
  reminder3Text: string;
}

export const CAMPAIGN_MESSAGE_TEMPLATES: CampaignMessageTemplate[] = [
  {
    id: "oil_change",
    label: "Oil Change Campaign",
    description: "Oil change due messaging with follow-up reminders.",
    primaryPromoText:
      'Hey [@FN@], It\'s Jay from ABC Motors. We noticed your [@YEA@] [@MAK@] [@MOD@] may be due for an oil change to protect engine performance and reliability. CLICK the link to schedule or call us at (Dealer DID) [@DSP@]',
    reminder1Text:
      "Hi [@FN@], Jay again! Just checking in on your [@MOD@]. We have a few appointment slots available this week for your oil change. Grab a spot here: [@DSP@] Call: (Dealer DID)",
    reminder2Text:
      "Hey [@FN@], I'll stop bugging you about the [@MOD@] oil change for now! Just wanted to make sure you were taken care of. If you still need that service later, the link below stays active. BOOK NOW: [@DSP@] PHONE: (Dealer DID)",
    reminder3Text:
      "[@FN@], last reminder about your [@MOD@] oil change. Schedule before your next interval to keep warranty coverage valid. [@DSP@] | (Dealer DID)",
  },
  {
    id: "service_reminder",
    label: "Service Reminder Campaign",
    description: "General factory-recommended service interval outreach.",
    primaryPromoText:
      "Hi [@FN@], ABC Motors here. Your [@YEA@] [@MAK@] [@MOD@] is approaching its recommended service interval. Book your visit to stay on schedule: [@DSP@] or call (Dealer DID).",
    reminder1Text:
      "[@FN@], friendly reminder — your [@MOD@] service window is open. We can get you in this week. Schedule here: [@DSP@] | (Dealer DID)",
    reminder2Text:
      "Hey [@FN@], still need service on your [@MOD@]? Our team saved a few openings for returning customers. Book now: [@DSP@] PHONE: (Dealer DID)",
    reminder3Text:
      "[@FN@], final service reminder for your [@YEA@] [@MAK@] [@MOD@]. Let us know if you already completed service elsewhere. [@DSP@]",
  },
  {
    id: "check_engine_light",
    label: "Check Engine Light",
    description: "Diagnostic outreach when a check-engine alert is detected.",
    primaryPromoText:
      "Hi [@FN@], ABC Motors detected a check-engine alert on your [@YEA@] [@MAK@] [@MOD@]. Don't ignore the light — schedule a diagnostic today: [@DSP@] or (Dealer DID).",
    reminder1Text:
      "[@FN@], your [@MOD@] check-engine light still needs attention. Our certified techs can diagnose it quickly. Book here: [@DSP@] | (Dealer DID)",
    reminder2Text:
      "Hey [@FN@], checking back on your [@MOD@] engine warning. Early diagnosis can prevent costly repairs. Schedule now: [@DSP@] PHONE: (Dealer DID)",
    reminder3Text:
      "[@FN@], last reminder about your check-engine alert. We're here when you're ready — same-day diagnostics available. [@DSP@]",
  },
];

export function getCampaignMessageTemplate(
  templateId: CampaignMessageTemplateId,
): CampaignMessageTemplate | undefined {
  return CAMPAIGN_MESSAGE_TEMPLATES.find((template) => template.id === templateId);
}

export function buildMessageTemplatePatch(
  templateId: CampaignMessageTemplateId,
): Partial<CampaignSetupDraft> {
  const template = getCampaignMessageTemplate(templateId);
  if (!template) {
    return {};
  }

  return {
    messageTemplateId: templateId,
    primaryPromoText: template.primaryPromoText,
    reminder1Text: template.reminder1Text,
    reminder2Text: template.reminder2Text,
    reminder3Text: template.reminder3Text,
  };
}
