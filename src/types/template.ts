export const TEMPLATE_STATUSES = ["draft", "published", "archived"] as const;
export type TemplateStatus = (typeof TEMPLATE_STATUSES)[number];

export const TEMPLATE_WIZARD_STEPS = [
  "details",
  "content",
  "reminders",
  "review",
] as const;
export type TemplateWizardStepId = (typeof TEMPLATE_WIZARD_STEPS)[number];

export const TEMPLATE_AUDIT_ACTIONS = [
  "created",
  "updated",
  "published",
  "unpublished",
  "archived",
  "restored",
  "deleted",
] as const;
export type TemplateAuditAction = (typeof TEMPLATE_AUDIT_ACTIONS)[number];

export interface TemplateActor {
  id: string;
  name: string;
  initials: string;
}

export interface TemplateAuditEvent {
  id: string;
  action: TemplateAuditAction;
  summary: string;
  actor: TemplateActor;
  at: string;
}

export interface MessageTemplate {
  id: string;
  heading: string;
  message: string;
  primaryPromoText: string;
  dealerUrl: string;
  campaignImageFileName: string | null;
  campaignImagePreviewUrl: string | null;
  reminder1Enabled: boolean;
  reminder1Text: string;
  reminder1ImageFileName: string | null;
  reminder1ImagePreviewUrl: string | null;
  reminder2Enabled: boolean;
  reminder2Text: string;
  reminder2ImageFileName: string | null;
  reminder2ImagePreviewUrl: string | null;
  reminder3Enabled: boolean;
  reminder3Text: string;
  reminder3ImageFileName: string | null;
  reminder3ImagePreviewUrl: string | null;
  status: TemplateStatus;
  isSystem: boolean;
  createdBy: TemplateActor;
  createdAt: string;
  updatedBy: TemplateActor;
  updatedAt: string;
  auditEvents: TemplateAuditEvent[];
}

export interface TemplateDraft {
  heading: string;
  message: string;
  primaryPromoText: string;
  dealerUrl: string;
  campaignImageFileName: string | null;
  campaignImagePreviewUrl: string | null;
  reminder1Enabled: boolean;
  reminder1Text: string;
  reminder1ImageFileName: string | null;
  reminder1ImagePreviewUrl: string | null;
  reminder2Enabled: boolean;
  reminder2Text: string;
  reminder2ImageFileName: string | null;
  reminder2ImagePreviewUrl: string | null;
  reminder3Enabled: boolean;
  reminder3Text: string;
  reminder3ImageFileName: string | null;
  reminder3ImagePreviewUrl: string | null;
}

/** Special campaign-setup option that is not a stored template. */
export const CUSTOM_TEMPLATE_ID = "custom";

/** Seed IDs kept stable for POC oil-change gating. */
export const OIL_CHANGE_TEMPLATE_ID = "oil_change";
export const SERVICE_REMINDER_TEMPLATE_ID = "service_reminder";
export const CHECK_ENGINE_TEMPLATE_ID = "check_engine_light";
