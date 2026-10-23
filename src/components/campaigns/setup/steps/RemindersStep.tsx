"use client";

import {
  Checkbox,
  Label,
} from "@ikontechnologies-arlington/nxtg-design-shiftpackage/primitives";

import { FormField } from "@/components/campaigns/setup/FormField";
import {
  ImagePreviewCard,
  OptionalImageUpload,
} from "@/components/campaigns/setup/OptionalImageUpload";
import { VariableTextarea } from "@/components/campaigns/setup/VariableTextarea";
import { useProductVersion } from "@/contexts/product-version-context";
import type { CampaignSetupDraft } from "@/types/campaign-setup";
import { CUSTOM_TEMPLATE_ID } from "@/types/template";
import { cn } from "@/lib/utils";

interface RemindersStepProps {
  draft: CampaignSetupDraft;
  errors: Record<string, string>;
  onChange: (patch: Partial<CampaignSetupDraft>) => void;
  /** Jumps to the Messaging step's Campaign Image field. */
  onUploadCampaignImage?: () => void;
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

export function RemindersStep({
  draft,
  errors,
  onChange,
  onUploadCampaignImage,
}: RemindersStepProps) {
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
            onUploadCampaignImage={onUploadCampaignImage}
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
  onUploadCampaignImage,
}: {
  field: ReminderFieldConfig;
  draft: CampaignSetupDraft;
  errors: Record<string, string>;
  onChange: (patch: Partial<CampaignSetupDraft>) => void;
  onUploadCampaignImage?: () => void;
}) {
  const { versionId } = useProductVersion();
  const isMvpV10Version = versionId === "mvp_v1_0";
  const isEnabled = draft[field.enabledKey];
  const textValue = draft[field.textKey];
  const textError = isEnabled && field.textErrorKey
    ? errors[field.textErrorKey]
    : undefined;
  const hasPrimaryImage = Boolean(draft.campaignImagePreviewUrl);
  const isUsingPrimaryImage = hasPrimaryImage && draft[field.usePrimaryImageKey];
  const hasCustomImage = Boolean(draft[field.previewKey]);
  const usePrimaryId = `${field.imageHtmlFor}UsePrimary`;

  return (
    <div
      className={cn(
        "space-y-4 rounded-[var(--radius-sm)] border border-border bg-card p-4",
        isEnabled && "border-primary bg-primary/5",
      )}
    >
      <label className="flex items-center gap-3">
        <Checkbox
          id={`${field.textareaId}Enabled`}
          checked={isEnabled}
          onCheckedChange={(checked) =>
            onChange({ [field.enabledKey]: checked })
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
            label={`${field.label} Text`}
            htmlFor={field.textareaId}
            error={textError}
            required
          >
            <VariableTextarea
              id={field.textareaId}
              value={textValue}
              onValueChange={(text) =>
                onChange({
                  [field.textKey]: text,
                  ...(isMvpV10Version
                    ? {}
                    : { messageTemplateId: CUSTOM_TEMPLATE_ID }),
                })
              }
              rows={field.rows}
              invalid={Boolean(textError)}
            />
          </FormField>

          {isUsingPrimaryImage ? (
            <FormField
              label={`${field.label} Image`}
              hint={
                hasCustomImage
                  ? "Your custom reminder image is kept. Uncheck the box below to use it again."
                  : undefined
              }
            >
              <ImagePreviewCard
                src={draft.campaignImagePreviewUrl ?? ""}
                alt={`${field.label} uses the primary campaign image`}
              >
                <p className="min-w-0 text-sm">
                  <span className="block font-medium text-foreground">
                    Using primary campaign image
                  </span>
                  <span className="block truncate text-muted-foreground">
                    {draft.campaignImageFileName ?? "Campaign image"}
                  </span>
                </p>
              </ImagePreviewCard>
            </FormField>
          ) : (
            <OptionalImageUpload
              label={`${field.label} Image`}
              htmlFor={field.imageHtmlFor}
              hint="Optional. Upload a custom image for this reminder."
              fileName={draft[field.fileNameKey]}
              previewUrl={draft[field.previewKey]}
              onChange={(fileName, previewUrl) =>
                onChange({
                  [field.fileNameKey]: fileName,
                  [field.previewKey]: previewUrl,
                  // An uploaded reminder image is an explicit choice, so stop
                  // defaulting to the primary image once one exists.
                  ...(previewUrl ? { [field.usePrimaryImageKey]: false } : {}),
                })
              }
            />
          )}

          <div className="flex items-start gap-3 text-sm">
            <Checkbox
              id={usePrimaryId}
              checked={isUsingPrimaryImage}
              onCheckedChange={(checked) =>
                onChange({ [field.usePrimaryImageKey]: checked })
              }
              className="mt-0.5"
              disabled={!hasPrimaryImage}
            />
            <span>
              <Label
                htmlFor={usePrimaryId}
                className={cn(
                  "font-medium",
                  hasPrimaryImage
                    ? "cursor-pointer text-foreground"
                    : "cursor-not-allowed text-muted-foreground",
                )}
              >
                Use primary campaign image
              </Label>
              {!hasPrimaryImage ? (
                <span className="mt-1 block text-muted-foreground">
                  {onUploadCampaignImage ? (
                    <button
                      type="button"
                      onClick={onUploadCampaignImage}
                      className="font-medium text-primary underline underline-offset-4 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      Upload a campaign image
                    </button>
                  ) : (
                    "Upload a campaign image"
                  )}{" "}
                  on the Messaging step to enable this option.
                </span>
              ) : null}
            </span>
          </div>
        </>
      ) : null}
    </div>
  );
}
