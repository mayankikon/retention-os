"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormField } from "@/components/campaigns/setup/FormField";
import { OptionalImageUpload } from "@/components/campaigns/setup/OptionalImageUpload";
import { TemplateWizardStepper } from "@/components/templates/TemplateWizardStepper";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCurrentUser } from "@/contexts/session-context";
import {
  createEmptyTemplateDraft,
  createTemplate,
  setTemplateStatus,
  templateToDraft,
  updateTemplate,
} from "@/lib/template-store";
import { validateTemplateStep } from "@/lib/template-validation";
import { cn } from "@/lib/utils";
import type {
  MessageTemplate,
  TemplateDraft,
  TemplateWizardStepId,
} from "@/types/template";
import { TEMPLATE_WIZARD_STEPS } from "@/types/template";

interface TemplateWizardProps {
  mode: "create" | "edit";
  initialTemplate?: MessageTemplate;
}

export function TemplateWizard({ mode, initialTemplate }: TemplateWizardProps) {
  const router = useRouter();
  const user = useCurrentUser();
  const actor = useMemo(
    () => ({ id: user.id, name: user.name, initials: user.initials }),
    [user],
  );

  const [step, setStep] = useState<TemplateWizardStepId>("details");
  const [draft, setDraft] = useState<TemplateDraft>(() =>
    initialTemplate
      ? templateToDraft(initialTemplate)
      : createEmptyTemplateDraft(),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [completedSteps, setCompletedSteps] = useState<
    Set<TemplateWizardStepId>
  >(() => new Set());

  const currentIndex = TEMPLATE_WIZARD_STEPS.indexOf(step);
  const isFirstStep = currentIndex === 0;
  const isLastStep = step === "review";

  const updateDraft = (patch: Partial<TemplateDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
    setErrors({});
  };

  const handleNext = () => {
    const result = validateTemplateStep(step, draft);
    if (!result.isValid) {
      setErrors(result.errors);
      return;
    }
    setCompletedSteps((prev) => new Set(prev).add(step));
    if (isLastStep) return;
    setStep(TEMPLATE_WIZARD_STEPS[currentIndex + 1]);
  };

  const handleBack = () => {
    if (isFirstStep) return;
    setStep(TEMPLATE_WIZARD_STEPS[currentIndex - 1]);
  };

  const persist = (status: "draft" | "published") => {
    const result = validateTemplateStep("review", draft);
    if (!result.isValid) {
      setErrors(result.errors);
      setStep("review");
      return;
    }

    if (mode === "edit" && initialTemplate) {
      const updated = updateTemplate(initialTemplate.id, draft, actor);
      if (!updated) return;
      if (status === "published" && updated.status !== "published") {
        setTemplateStatus(updated.id, "published", actor);
      }
      if (status === "draft" && updated.status === "published") {
        setTemplateStatus(updated.id, "draft", actor);
      }
      router.push(`/templates/${updated.id}`);
      return;
    }

    const created = createTemplate(draft, actor, status);
    router.push(`/templates/${created.id}`);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {mode === "create" ? "Create template" : "Edit template"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Define reusable messaging for campaign setup.
        </p>
      </div>

      <TemplateWizardStepper
        currentStepId={step}
        completedSteps={completedSteps}
      />

      <div className="flex min-h-[28rem] flex-col rounded-lg border border-border bg-card shadow-sm">
        <div className="flex-1 space-y-6 p-6">
          {step === "details" ? (
            <DetailsStep draft={draft} errors={errors} onChange={updateDraft} />
          ) : null}
          {step === "content" ? (
            <ContentStep draft={draft} errors={errors} onChange={updateDraft} />
          ) : null}
          {step === "reminders" ? (
            <RemindersStep draft={draft} errors={errors} onChange={updateDraft} />
          ) : null}
          {step === "review" ? <ReviewStep draft={draft} /> : null}
        </div>

        <div className="mt-auto flex flex-col-reverse gap-3 border-t border-border px-6 py-6 sm:flex-row sm:justify-between">
          <Button variant="ghost" asChild>
            <Link
              href={
                mode === "edit" && initialTemplate
                  ? `/templates/${initialTemplate.id}`
                  : "/templates"
              }
            >
              Cancel
            </Link>
          </Button>
          <div className="flex flex-wrap gap-2">
            {!isFirstStep ? (
              <Button type="button" variant="outline" onClick={handleBack}>
                Back
              </Button>
            ) : null}
            {!isLastStep ? (
              <Button type="button" onClick={handleNext}>
                Continue
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => persist("draft")}
                >
                  Save draft
                </Button>
                <Button type="button" onClick={() => persist("published")}>
                  {mode === "edit" ? "Save & publish" : "Publish"}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailsStep({
  draft,
  errors,
  onChange,
}: {
  draft: TemplateDraft;
  errors: Record<string, string>;
  onChange: (patch: Partial<TemplateDraft>) => void;
}) {
  return (
    <div className="space-y-6">
      <FormField
        label="Heading"
        htmlFor="heading"
        required
        error={errors.heading}
        hint="Display name shown in Templates and campaign setup."
      >
        <Input
          id="heading"
          value={draft.heading}
          onChange={(e) => onChange({ heading: e.target.value })}
          placeholder="e.g. Oil Change Campaign"
        />
      </FormField>
      <FormField
        label="Message"
        htmlFor="message"
        required
        error={errors.message}
        hint="Short summary of what this template is for."
      >
        <Textarea
          id="message"
          value={draft.message}
          onChange={(e) => onChange({ message: e.target.value })}
          rows={3}
          hasError={Boolean(errors.message)}
          placeholder="Describe the campaign messaging this template supports."
        />
      </FormField>
    </div>
  );
}

function ContentStep({
  draft,
  errors,
  onChange,
}: {
  draft: TemplateDraft;
  errors: Record<string, string>;
  onChange: (patch: Partial<TemplateDraft>) => void;
}) {
  return (
    <div className="space-y-6">
      <FormField
        label="Primary promo text"
        htmlFor="primaryPromoText"
        required
        error={errors.primaryPromoText}
      >
        <Textarea
          id="primaryPromoText"
          value={draft.primaryPromoText}
          onChange={(e) => onChange({ primaryPromoText: e.target.value })}
          rows={5}
          hasError={Boolean(errors.primaryPromoText)}
        />
      </FormField>
      <FormField label="Dealer URL" htmlFor="dealerUrl" hint="Optional.">
        <Input
          id="dealerUrl"
          type="url"
          value={draft.dealerUrl}
          onChange={(e) => onChange({ dealerUrl: e.target.value })}
          placeholder="https://"
        />
      </FormField>
      <OptionalImageUpload
        label="Campaign image"
        htmlFor="templateImage"
        hint="Optional image associated with this template."
        fileName={draft.campaignImageFileName}
        previewUrl={draft.campaignImagePreviewUrl}
        onChange={(fileName, previewUrl) =>
          onChange({
            campaignImageFileName: fileName,
            campaignImagePreviewUrl: previewUrl,
          })
        }
      />
    </div>
  );
}

function RemindersStep({
  draft,
  errors,
  onChange,
}: {
  draft: TemplateDraft;
  errors: Record<string, string>;
  onChange: (patch: Partial<TemplateDraft>) => void;
}) {
  const fields = [
    {
      index: 1 as const,
      enabledKey: "reminder1Enabled" as const,
      textKey: "reminder1Text" as const,
      fileKey: "reminder1ImageFileName" as const,
      previewKey: "reminder1ImagePreviewUrl" as const,
      label: "Reminder 1",
    },
    {
      index: 2 as const,
      enabledKey: "reminder2Enabled" as const,
      textKey: "reminder2Text" as const,
      fileKey: "reminder2ImageFileName" as const,
      previewKey: "reminder2ImagePreviewUrl" as const,
      label: "Reminder 2",
    },
    {
      index: 3 as const,
      enabledKey: "reminder3Enabled" as const,
      textKey: "reminder3Text" as const,
      fileKey: "reminder3ImageFileName" as const,
      previewKey: "reminder3ImagePreviewUrl" as const,
      label: "Reminder 3",
    },
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Enable up to three follow-up reminders. Enabled reminders require text.
      </p>
      {fields.map((field) => {
        const isEnabled = draft[field.enabledKey];
        return (
          <div
            key={field.enabledKey}
            className={cn(
              "space-y-4 rounded-md border border-border p-4",
              isEnabled && "border-brand-primary/40 bg-muted/20",
            )}
          >
            <label className="flex items-center gap-3">
              <Checkbox
                checked={isEnabled}
                onChange={(e) =>
                  onChange({ [field.enabledKey]: e.target.checked })
                }
              />
              <Label className="cursor-pointer font-medium">{field.label}</Label>
            </label>
            {isEnabled ? (
              <>
                <FormField
                  label={`${field.label} text`}
                  htmlFor={field.textKey}
                  required
                  error={errors[field.textKey]}
                >
                  <Textarea
                    id={field.textKey}
                    value={draft[field.textKey]}
                    onChange={(e) =>
                      onChange({ [field.textKey]: e.target.value })
                    }
                    rows={3}
                    hasError={Boolean(errors[field.textKey])}
                  />
                </FormField>
                <OptionalImageUpload
                  label={`${field.label} image`}
                  htmlFor={`${field.textKey}-image`}
                  hint="Optional."
                  fileName={draft[field.fileKey]}
                  previewUrl={draft[field.previewKey]}
                  onChange={(fileName, previewUrl) =>
                    onChange({
                      [field.fileKey]: fileName,
                      [field.previewKey]: previewUrl,
                    })
                  }
                />
              </>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function ReviewStep({ draft }: { draft: TemplateDraft }) {
  return (
    <div className="space-y-4 text-sm">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Heading
        </p>
        <p className="mt-1 font-medium text-foreground">{draft.heading || "—"}</p>
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Message
        </p>
        <p className="mt-1 text-foreground">{draft.message || "—"}</p>
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Primary promo text
        </p>
        <p className="mt-1 whitespace-pre-wrap text-foreground">
          {draft.primaryPromoText || "—"}
        </p>
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Dealer URL
        </p>
        <p className="mt-1 text-foreground">{draft.dealerUrl || "—"}</p>
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Reminders enabled
        </p>
        <p className="mt-1 text-foreground">
          {[
            draft.reminder1Enabled ? "1" : null,
            draft.reminder2Enabled ? "2" : null,
            draft.reminder3Enabled ? "3" : null,
          ]
            .filter(Boolean)
            .join(", ") || "None"}
        </p>
      </div>
    </div>
  );
}
