"use client";

import { useRef, useState } from "react";
import { Braces } from "lucide-react";
import { AddMessageVariableDialog } from "@/components/campaigns/setup/AddMessageVariableDialog";
import { FormField } from "@/components/campaigns/setup/FormField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { insertTextAtCursor } from "@/lib/insert-text-at-cursor";
import type { CampaignSetupDraft } from "@/types/campaign-setup";

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

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Use the approved SMS template unless the dealer provided custom copy.
        Leave URL fields blank for initial campaigns.
      </p>

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
            onChange={(e) => onChange({ primaryPromoText: e.target.value })}
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

      <FormField label="Additional URL" htmlFor="additionalUrl">
        <Input
          id="additionalUrl"
          type="url"
          value={draft.additionalUrl}
          onChange={(e) => onChange({ additionalUrl: e.target.value })}
          placeholder="https://"
        />
      </FormField>
    </div>
  );
}
