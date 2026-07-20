import type { TemplateWizardStepId } from "@/types/template";

export interface TemplateWizardStepMeta {
  id: TemplateWizardStepId;
  label: string;
  description: string;
}

export const TEMPLATE_WIZARD_STEP_META: TemplateWizardStepMeta[] = [
  {
    id: "details",
    label: "Details",
    description: "Heading and message summary",
  },
  {
    id: "content",
    label: "Content",
    description: "Primary promo, URL, and image",
  },
  {
    id: "reminders",
    label: "Reminders",
    description: "Follow-up messages",
  },
  {
    id: "review",
    label: "Review",
    description: "Save draft or publish",
  },
];
