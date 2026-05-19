"use client";

import { FormField } from "@/components/campaigns/setup/FormField";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CampaignSetupDraft } from "@/types/campaign-setup";

interface RemindersStepProps {
  draft: CampaignSetupDraft;
  errors: Record<string, string>;
  onChange: (patch: Partial<CampaignSetupDraft>) => void;
}

export function RemindersStep({ draft, errors, onChange }: RemindersStepProps) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Enable reminder templates and configure up to three follow-ups. Manually
        add the Dealer DID to each reminder and attach the campaign image to
        every template.
      </p>

      <div className="flex items-center gap-2">
        <Checkbox
          id="remindersEnabled"
          checked={draft.remindersEnabled}
          onChange={(e) => onChange({ remindersEnabled: e.target.checked })}
        />
        <Label htmlFor="remindersEnabled">Enable reminder templates</Label>
      </div>

      <FormField
        label="Dealer DID"
        htmlFor="dealerDid"
        hint="Required in each reminder message and primary promo."
        error={errors.dealerDid}
        required
      >
        <Input
          id="dealerDid"
          value={draft.dealerDid}
          onChange={(e) => onChange({ dealerDid: e.target.value })}
          placeholder="(555) 123-4567"
          hasError={Boolean(errors.dealerDid)}
        />
      </FormField>

      {draft.remindersEnabled ? (
        <>
          <FormField
            label="Reminder 1"
            htmlFor="reminder1"
            error={errors.reminder1Text}
            required
          >
            <Textarea
              id="reminder1"
              value={draft.reminder1Text}
              onChange={(e) => onChange({ reminder1Text: e.target.value })}
              rows={4}
              hasError={Boolean(errors.reminder1Text)}
            />
          </FormField>

          <FormField
            label="Reminder 2"
            htmlFor="reminder2"
            error={errors.reminder2Text}
            required
          >
            <Textarea
              id="reminder2"
              value={draft.reminder2Text}
              onChange={(e) => onChange({ reminder2Text: e.target.value })}
              rows={4}
              hasError={Boolean(errors.reminder2Text)}
            />
          </FormField>

          <FormField label="Reminder 3 (optional)" htmlFor="reminder3">
            <Textarea
              id="reminder3"
              value={draft.reminder3Text}
              onChange={(e) => onChange({ reminder3Text: e.target.value })}
              rows={3}
            />
          </FormField>
        </>
      ) : null}
    </div>
  );
}
