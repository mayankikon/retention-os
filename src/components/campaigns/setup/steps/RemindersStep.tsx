"use client";

import { FormField } from "@/components/campaigns/setup/FormField";
import { OptionalImageUpload } from "@/components/campaigns/setup/OptionalImageUpload";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getReminderImagePreviewUrl } from "@/lib/reminder-setup";
import type { CampaignSetupDraft } from "@/types/campaign-setup";
import { cn } from "@/lib/utils";

interface RemindersStepProps {
  draft: CampaignSetupDraft;
  errors: Record<string, string>;
  onChange: (patch: Partial<CampaignSetupDraft>) => void;
}

interface ReminderFieldConfig {
  index: 1 | 2 | 3;
  label: string;
  textareaId: string;
  imageHtmlFor: string;
  enabledKey: keyof Pick<
    CampaignSetupDraft,
    "reminder1Enabled" | "reminder2Enabled" | "reminder3Enabled"
  >;
  textKey: keyof Pick<
    CampaignSetupDraft,
    "reminder1Text" | "reminder2Text" | "reminder3Text"
  >;
  fileNameKey: keyof Pick<
    CampaignSetupDraft,
    | "reminder1ImageFileName"
    | "reminder2ImageFileName"
    | "reminder3ImageFileName"
  >;
  previewKey: keyof Pick<
    CampaignSetupDraft,
    | "reminder1ImagePreviewUrl"
    | "reminder2ImagePreviewUrl"
    | "reminder3ImagePreviewUrl"
  >;
  usePrimaryImageKey: keyof Pick<
    CampaignSetupDraft,
    | "reminder1UsePrimaryImage"
    | "reminder2UsePrimaryImage"
    | "reminder3UsePrimaryImage"
  >;
  textErrorKey?: keyof Pick<
    CampaignSetupDraft,
    "reminder1Text" | "reminder2Text" | "reminder3Text"
  >;
  rows: number;
}

const REMINDER_FIELDS: ReminderFieldConfig[] = [
  {
    index: 1,
    label: "Reminder 1",
    textareaId: "reminder1",
    imageHtmlFor: "reminder1Image",
    enabledKey: "reminder1Enabled",
    textKey: "reminder1Text",
    fileNameKey: "reminder1ImageFileName",
    previewKey: "reminder1ImagePreviewUrl",
    usePrimaryImageKey: "reminder1UsePrimaryImage",
    textErrorKey: "reminder1Text",
    rows: 4,
  },
  {
    index: 2,
    label: "Reminder 2",
    textareaId: "reminder2",
    imageHtmlFor: "reminder2Image",
    enabledKey: "reminder2Enabled",
    textKey: "reminder2Text",
    fileNameKey: "reminder2ImageFileName",
    previewKey: "reminder2ImagePreviewUrl",
    usePrimaryImageKey: "reminder2UsePrimaryImage",
    textErrorKey: "reminder2Text",
    rows: 4,
  },
  {
    index: 3,
    label: "Reminder 3",
    textareaId: "reminder3",
    imageHtmlFor: "reminder3Image",
    enabledKey: "reminder3Enabled",
    textKey: "reminder3Text",
    fileNameKey: "reminder3ImageFileName",
    previewKey: "reminder3ImagePreviewUrl",
    usePrimaryImageKey: "reminder3UsePrimaryImage",
    textErrorKey: "reminder3Text",
    rows: 3,
  },
];

export function RemindersStep({ draft, errors, onChange }: RemindersStepProps) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Choose which follow-up reminders to send — one, two, or all three. Each
        enabled reminder can use its own image or reuse the primary campaign
        image.
      </p>

      <div className="space-y-4">
        {REMINDER_FIELDS.map((field) => (
          <ReminderTemplateField
            key={field.textareaId}
            field={field}
            draft={draft}
            errors={errors}
            onChange={onChange}
          />
        ))}
      </div>
    </div>
  );
}

function ReminderTemplateField({
  field,
  draft,
  errors,
  onChange,
}: {
  field: ReminderFieldConfig;
  draft: CampaignSetupDraft;
  errors: Record<string, string>;
  onChange: (patch: Partial<CampaignSetupDraft>) => void;
}) {
  const isEnabled = draft[field.enabledKey];
  const textValue = draft[field.textKey];
  const textError = isEnabled && field.textErrorKey
    ? errors[field.textErrorKey]
    : undefined;
  const hasCustomImage = Boolean(draft[field.previewKey]);
  const resolvedPreview = getReminderImagePreviewUrl(draft, field.index);

  return (
    <div
      className={cn(
        "space-y-4 rounded-md border border-border p-4",
        isEnabled && "border-brand-primary/40 bg-muted/20",
      )}
    >
      <label className="flex items-center gap-3">
        <Checkbox
          id={`${field.textareaId}Enabled`}
          checked={isEnabled}
          onChange={(event) =>
            onChange({ [field.enabledKey]: event.target.checked })
          }
        />
        <Label
          htmlFor={`${field.textareaId}Enabled`}
          className="cursor-pointer font-medium"
        >
          Send {field.label.toLowerCase()}
        </Label>
      </label>

      {isEnabled ? (
        <>
          <FormField
            label={`${field.label} text`}
            htmlFor={field.textareaId}
            error={textError}
            required
          >
            <Textarea
              id={field.textareaId}
              value={textValue}
              onChange={(e) => onChange({ [field.textKey]: e.target.value })}
              rows={field.rows}
              hasError={Boolean(textError)}
            />
          </FormField>

          <OptionalImageUpload
            label={`${field.label} image`}
            htmlFor={field.imageHtmlFor}
            hint="Optional. Upload a custom image for this reminder."
            fileName={hasCustomImage ? draft[field.fileNameKey] : null}
            previewUrl={hasCustomImage ? draft[field.previewKey] : null}
            onChange={(fileName, previewUrl) =>
              onChange({
                [field.fileNameKey]: fileName,
                [field.previewKey]: previewUrl,
              })
            }
          />

          {!hasCustomImage ? (
            <label className="flex items-start gap-3 text-sm">
              <Checkbox
                id={`${field.imageHtmlFor}UsePrimary`}
                checked={draft[field.usePrimaryImageKey]}
                onChange={(event) =>
                  onChange({
                    [field.usePrimaryImageKey]: event.target.checked,
                  })
                }
                className="mt-0.5"
                disabled={!draft.campaignImagePreviewUrl}
              />
              <span>
                <Label
                  htmlFor={`${field.imageHtmlFor}UsePrimary`}
                  className="cursor-pointer font-medium text-foreground"
                >
                  Use primary campaign image
                </Label>
                <span className="mt-1 block text-muted-foreground">
                  {draft.campaignImagePreviewUrl
                    ? "Reuses the image from the Messaging step when no reminder image is uploaded."
                    : "Upload a campaign image on the Messaging step to enable this option."}
                </span>
              </span>
            </label>
          ) : null}

          {resolvedPreview && !hasCustomImage && draft[field.usePrimaryImageKey] ? (
            <img
              src={resolvedPreview}
              alt={`${field.label} preview using primary image`}
              className="max-h-32 rounded-md border border-border object-contain"
            />
          ) : null}
        </>
      ) : null}
    </div>
  );
}
