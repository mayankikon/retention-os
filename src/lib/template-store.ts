import { createSeedTemplates } from "@/data/templates.seed";
import type {
  MessageTemplate,
  TemplateActor,
  TemplateAuditAction,
  TemplateDraft,
  TemplateStatus,
} from "@/types/template";

const STORAGE_KEY = "retention-os-message-templates";
export const TEMPLATES_UPDATED_EVENT = "templates-updated";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function cloneTemplates(templates: MessageTemplate[]): MessageTemplate[] {
  return structuredClone(templates);
}

function readTemplates(): MessageTemplate[] {
  if (!isBrowser()) return createSeedTemplates();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = createSeedTemplates();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return cloneTemplates(seeded);
    }
    const parsed = JSON.parse(raw) as MessageTemplate[];
    return Array.isArray(parsed) ? cloneTemplates(parsed) : createSeedTemplates();
  } catch {
    return createSeedTemplates();
  }
}

function writeTemplates(templates: MessageTemplate[]): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  window.dispatchEvent(new CustomEvent(TEMPLATES_UPDATED_EVENT));
}

function createAuditEvent(
  action: TemplateAuditAction,
  summary: string,
  actor: TemplateActor,
) {
  return {
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    action,
    summary,
    actor,
    at: new Date().toISOString(),
  };
}

export function getTemplates(): MessageTemplate[] {
  return readTemplates().sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export function getTemplateById(templateId: string): MessageTemplate | null {
  return readTemplates().find((template) => template.id === templateId) ?? null;
}

export function createEmptyTemplateDraft(): TemplateDraft {
  return {
    heading: "",
    message: "",
    primaryPromoText: "",
    dealerUrl: "",
    campaignImageFileName: null,
    campaignImagePreviewUrl: null,
    reminder1Enabled: true,
    reminder1Text: "",
    reminder1ImageFileName: null,
    reminder1ImagePreviewUrl: null,
    reminder2Enabled: false,
    reminder2Text: "",
    reminder2ImageFileName: null,
    reminder2ImagePreviewUrl: null,
    reminder3Enabled: false,
    reminder3Text: "",
    reminder3ImageFileName: null,
    reminder3ImagePreviewUrl: null,
  };
}

export function templateToDraft(template: MessageTemplate): TemplateDraft {
  return {
    heading: template.heading,
    message: template.message,
    primaryPromoText: template.primaryPromoText,
    dealerUrl: template.dealerUrl,
    campaignImageFileName: template.campaignImageFileName,
    campaignImagePreviewUrl: template.campaignImagePreviewUrl,
    reminder1Enabled: template.reminder1Enabled,
    reminder1Text: template.reminder1Text,
    reminder1ImageFileName: template.reminder1ImageFileName,
    reminder1ImagePreviewUrl: template.reminder1ImagePreviewUrl,
    reminder2Enabled: template.reminder2Enabled,
    reminder2Text: template.reminder2Text,
    reminder2ImageFileName: template.reminder2ImageFileName,
    reminder2ImagePreviewUrl: template.reminder2ImagePreviewUrl,
    reminder3Enabled: template.reminder3Enabled,
    reminder3Text: template.reminder3Text,
    reminder3ImageFileName: template.reminder3ImageFileName,
    reminder3ImagePreviewUrl: template.reminder3ImagePreviewUrl,
  };
}

export function createTemplate(
  draft: TemplateDraft,
  actor: TemplateActor,
  status: Extract<TemplateStatus, "draft" | "published"> = "draft",
): MessageTemplate {
  const now = new Date().toISOString();
  const id = `tpl-${Date.now()}`;
  const createdEvent = createAuditEvent("created", "Template created", actor);
  const events = [createdEvent];
  if (status === "published") {
    events.push(
      createAuditEvent("published", "Published for campaign use", actor),
    );
  }

  const template: MessageTemplate = {
    id,
    ...draft,
    heading: draft.heading.trim(),
    message: draft.message.trim(),
    status,
    isSystem: false,
    createdBy: actor,
    createdAt: now,
    updatedBy: actor,
    updatedAt: now,
    auditEvents: events,
  };

  writeTemplates([template, ...readTemplates()]);
  return template;
}

export function updateTemplate(
  templateId: string,
  draft: TemplateDraft,
  actor: TemplateActor,
): MessageTemplate | null {
  const templates = readTemplates();
  const index = templates.findIndex((template) => template.id === templateId);
  if (index < 0) return null;

  const existing = templates[index];
  const updated: MessageTemplate = {
    ...existing,
    ...draft,
    heading: draft.heading.trim(),
    message: draft.message.trim(),
    updatedBy: actor,
    updatedAt: new Date().toISOString(),
    auditEvents: [
      createAuditEvent("updated", "Template content updated", actor),
      ...existing.auditEvents,
    ],
  };

  templates[index] = updated;
  writeTemplates(templates);
  return updated;
}

export function setTemplateStatus(
  templateId: string,
  status: TemplateStatus,
  actor: TemplateActor,
): MessageTemplate | null {
  const templates = readTemplates();
  const index = templates.findIndex((template) => template.id === templateId);
  if (index < 0) return null;

  const existing = templates[index];
  if (existing.status === status) return existing;

  const actionByStatus: Record<TemplateStatus, TemplateAuditAction> = {
    draft: "unpublished",
    published: "published",
    archived: "archived",
  };
  const summaryByStatus: Record<TemplateStatus, string> = {
    draft: "Moved back to draft",
    published: "Published for campaign use",
    archived: "Archived",
  };

  // Restoring from archive to draft/published gets a clearer audit label.
  const action =
    existing.status === "archived" && status !== "archived"
      ? "restored"
      : actionByStatus[status];
  const summary =
    action === "restored"
      ? `Restored to ${status}`
      : summaryByStatus[status];

  const updated: MessageTemplate = {
    ...existing,
    status,
    updatedBy: actor,
    updatedAt: new Date().toISOString(),
    auditEvents: [
      createAuditEvent(action, summary, actor),
      ...existing.auditEvents,
    ],
  };

  templates[index] = updated;
  writeTemplates(templates);
  return updated;
}

export function deleteTemplate(templateId: string): boolean {
  const templates = readTemplates();
  const next = templates.filter((template) => template.id !== templateId);
  if (next.length === templates.length) return false;
  writeTemplates(next);
  return true;
}
