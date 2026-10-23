"use client";

import {
  Checkbox,
  Input,
} from "@ikontechnologies-arlington/nxtg-design-shiftpackage/primitives";

import { useMemo } from "react";
import { FormField } from "@/components/campaigns/setup/FormField";
import { OptionalImageUpload } from "@/components/campaigns/setup/OptionalImageUpload";
import { VariableTextarea } from "@/components/campaigns/setup/VariableTextarea";
import {
  buildMessageTemplatePatch,
  type CampaignMessageTemplate,
} from "@/data/campaign-message-templates";
import { useProductVersion } from "@/contexts/product-version-context";
import { useTemplates } from "@/hooks/use-templates";
import { toggleDeliveryChannel } from "@/lib/delivery-channels";
import {
  getAvailableDeliveryChannelOptions,
  getAvailableMessageTemplates,
} from "@/lib/product-version";
import type {
  CampaignMessageTemplateId,
  CampaignSetupDraft,
  DeliveryChannel,
} from "@/types/campaign-setup";
import { CUSTOM_TEMPLATE_ID } from "@/types/template";
import { cn } from "@/lib/utils";

interface MessagingStepProps {
  draft: CampaignSetupDraft;
  errors: Record<string, string>;
  onChange: (patch: Partial<CampaignSetupDraft>) => void;
}

const CUSTOM_PICKER_ITEM: CampaignMessageTemplate = {
  id: CUSTOM_TEMPLATE_ID,
  label: "Custom",
  description: "Write your own primary promo and reminder copy.",
  primaryPromoText: "",
  reminder1Text: "",
  reminder2Text: "",
  reminder3Text: "",
};

export function MessagingStep({ draft, errors, onChange }: MessagingStepProps) {
  const { versionId } = useProductVersion();
  const templates = useTemplates();
  const deliveryChannelOptions = getAvailableDeliveryChannelOptions(versionId);
  const isMvpV10Version = versionId === "mvp_v1_0";
  const messageTemplates = useMemo(() => {
    const published = getAvailableMessageTemplates(versionId);
    if (isMvpV10Version) return published;
    return [...published, CUSTOM_PICKER_ITEM];
    // templates length/ids ensure picker refreshes after localStorage updates
  }, [versionId, isMvpV10Version, templates]);

  const handleSelectTemplate = (templateId: CampaignMessageTemplateId) => {
    onChange(buildMessageTemplatePatch(templateId));
  };

  const handleDeliveryChannelToggle = (
    channel: DeliveryChannel,
    enabled: boolean,
  ) => {
    onChange({
      deliveryChannels: toggleDeliveryChannel(draft, channel, enabled),
    });
  };

  return (
    <div className="space-y-6">
      {isMvpV10Version ? (
        <p className="text-sm text-muted-foreground">
          MVP V1.0 includes Oil Change Campaign messaging over SMS only.
        </p>
      ) : null}

      <FormField
        label="Delivery Channels"
        error={errors.deliveryChannels}
        hint={
          isMvpV10Version
            ? "MVP V1.0 supports SMS only. Email is available in Post MVP V1.1+."
            : undefined
        }
        required
      >
        <div className="space-y-2">
          {deliveryChannelOptions.map((option) => {
            const isEnabled = draft.deliveryChannels.includes(option.value);

            return (
              <label
                key={option.value}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-[var(--radius-sm)] border border-border bg-card p-3",
                  isEnabled && "border-primary bg-primary/5",
                )}
              >
                <Checkbox
                  checked={isEnabled}
                  onCheckedChange={(checked) =>
                    handleDeliveryChannelToggle(option.value, checked)
                  }
                  className="mt-0.5"
                  aria-label={option.label}
                />
                <span>
                  <span className="font-medium">{option.label}</span>
                  <span className="block text-xs text-muted-foreground">
                    {option.description}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </FormField>

      <FormField
        label="Message Template"
        hint={
          isMvpV10Version
            ? "MVP V1.0 includes the Oil Change Campaign template only."
            : undefined
        }
      >
        <div
          className={cn(
            "grid gap-2",
            messageTemplates.length <= 1
              ? "grid-cols-1"
              : "sm:grid-cols-2 lg:grid-cols-3",
          )}
        >
          {messageTemplates.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => handleSelectTemplate(template.id)}
              className={cn(
                "rounded-[var(--radius-sm)] border border-border bg-card p-3 text-left transition-colors hover:bg-muted/50",
                draft.messageTemplateId === template.id &&
                  "border-primary bg-primary/5",
              )}
            >
              <span className="block text-sm font-medium">{template.label}</span>
              <span className="mt-1 block text-xs text-muted-foreground">
                {template.description}
              </span>
            </button>
          ))}
        </div>
      </FormField>

      <FormField
        label="Primary Promo Text"
        htmlFor="primaryPromoText"
        error={errors.primaryPromoText}
        required
      >
        <VariableTextarea
          id="primaryPromoText"
          value={draft.primaryPromoText}
          onValueChange={(primaryPromoText) =>
            onChange({
              primaryPromoText,
              ...(isMvpV10Version
                ? {}
                : { messageTemplateId: CUSTOM_TEMPLATE_ID }),
            })
          }
          rows={5}
          invalid={Boolean(errors.primaryPromoText)}
        />
      </FormField>

      <FormField
        label="Dealer URL"
        htmlFor="dealerUrl"
        hint="Optional for initial campaigns."
      >
        <Input
          id="dealerUrl"
          type="url"
          value={draft.dealerUrl}
          onChange={(e) => onChange({ dealerUrl: e.target.value })}
          placeholder="https://"
        />
      </FormField>

      <OptionalImageUpload
        label="Campaign Image"
        htmlFor="campaignImage"
        hint="Optional. Upload a 2×3 logo or high-quality storefront image — shown as an MMS attachment in the preview."
        error={errors.campaignImage}
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
