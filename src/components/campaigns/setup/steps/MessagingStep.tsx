"use client";

import { useRef, useState } from "react";
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
  CAMPAIGN_MESSAGE_TEMPLATES,
} from "@/data/campaign-message-templates";
import { DELIVERY_CHANNEL_OPTIONS } from "@/data/delivery-channels";
import { insertTextAtCursor } from "@/lib/insert-text-at-cursor";
import { toggleDeliveryChannel } from "@/lib/delivery-channels";
import type {
  CampaignMessageTemplateId,
  CampaignSetupDraft,
  DeliveryChannel,
} from "@/types/campaign-setup";
import { cn } from "@/lib/utils";

interface MessagingStepProps {
  draft: CampaignSetupDraft;
  errors: Record<string, string>;
  onChange: (patch: Partial<CampaignSetupDraft>) => void;
}

export function MessagingStep({ draft, errors, onChange }: MessagingStepProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isVariableDialogOpen, setIsVariableDialogOpen] = useState(false);

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
        Start from an approved template or write custom copy. Templates update
        primary promo text and all reminder messages.
      </p>

      <FormField
        label="Delivery channels"
        error={errors.deliveryChannels}
        hint="Select one or more channels. The preview updates for SMS and email."
        required
      >
        <div className="space-y-2">
          {DELIVERY_CHANNEL_OPTIONS.map((option) => {
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

      <FormField label="Message template" hint="Applies copy to messaging and reminders.">
        <div className="grid gap-2 sm:grid-cols-3">
          {CAMPAIGN_MESSAGE_TEMPLATES.map((template) => (
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
                messageTemplateId: null,
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
