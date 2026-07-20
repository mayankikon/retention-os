"use client";

import { useMemo, useRef, useState } from "react";
import { Braces } from "lucide-react";
import { AddMessageVariableDialog } from "@/components/campaigns/setup/AddMessageVariableDialog";
import { FormField } from "@/components/campaigns/setup/FormField";
import { OptionalImageUpload } from "@/components/campaigns/setup/OptionalImageUpload";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  buildMessageTemplatePatch,
  type CampaignMessageTemplate,
} from "@/data/campaign-message-templates";
import { useProductVersion } from "@/contexts/product-version-context";
import { useTemplates } from "@/hooks/use-templates";
import { insertTextAtCursor } from "@/lib/insert-text-at-cursor";
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isVariableDialogOpen, setIsVariableDialogOpen] = useState(false);
  const deliveryChannelOptions = getAvailableDeliveryChannelOptions(versionId);
  const isPocVersion = versionId === "poc_v0_5";
  const messageTemplates = useMemo(() => {
    const published = getAvailableMessageTemplates(versionId);
    if (isPocVersion) return published;
    return [...published, CUSTOM_PICKER_ITEM];
    // templates length/ids ensure picker refreshes after localStorage updates
  }, [versionId, isPocVersion, templates]);

  const handleInsertVariable = (token: string) => {
    const textarea = textareaRef.current;
    const selectionStart = textarea?.selectionStart ?? draft.primaryPromoText.length;
    const selectionEnd = textarea?.selectionEnd ?? selectionStart;

    const { value, cursorPosition } = insertTextAtCursor(
      draft.primaryPromoText,
      selectionStart,
      selectionEnd,
      token,
    );

    onChange({ primaryPromoText: value });

    requestAnimationFrame(() => {
      if (!textarea) return;
      textarea.focus();
      textarea.setSelectionRange(cursorPosition, cursorPosition);
    });
  };

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
      <p className="text-sm text-muted-foreground">
        {isPocVersion
          ? "POC includes Oil Change Campaign messaging over SMS only."
          : "Oil Change Campaign is selected by default. Pick another template or choose Custom to write your own primary promo and reminders."}
      </p>

      <FormField
        label="Delivery channels"
        error={errors.deliveryChannels}
        hint={
          isPocVersion
            ? "POC supports SMS only. Email is available in MVP V1.0+."
            : "Select one or more channels. The preview updates for SMS and email."
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
                  "flex cursor-pointer items-start gap-3 rounded-md border border-border p-3",
                  isEnabled && "border-brand-primary bg-muted/50",
                )}
              >
                <Checkbox
                  checked={isEnabled}
                  onChange={(event) =>
                    handleDeliveryChannelToggle(
                      option.value,
                      event.target.checked,
                    )
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
        label="Message template"
        hint={
          isPocVersion
            ? "POC includes the Oil Change Campaign template only."
            : "Published templates from Templates apply copy to messaging and reminders. Custom clears the fields so you can write from scratch."
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
                "rounded-md border border-border p-3 text-left transition-colors hover:bg-muted/50",
                draft.messageTemplateId === template.id &&
                  "border-brand-primary bg-muted/50",
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
        label="Primary promo text"
        htmlFor="primaryPromoText"
        error={errors.primaryPromoText}
        required
      >
        <div className="space-y-2">
          <Textarea
            ref={textareaRef}
            id="primaryPromoText"
            value={draft.primaryPromoText}
            onChange={(e) =>
              onChange({
                primaryPromoText: e.target.value,
                ...(isPocVersion
                  ? {}
                  : { messageTemplateId: CUSTOM_TEMPLATE_ID }),
              })
            }
            rows={5}
            hasError={Boolean(errors.primaryPromoText)}
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setIsVariableDialogOpen(true)}
          >
            <Braces className="mr-2 h-4 w-4" />
            Add variables
          </Button>
        </div>
      </FormField>

      <AddMessageVariableDialog
        open={isVariableDialogOpen}
        onOpenChange={setIsVariableDialogOpen}
        onSelectVariable={handleInsertVariable}
      />

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
        label="Campaign image"
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
