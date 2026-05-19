"use client";

import { FormField } from "@/components/campaigns/setup/FormField";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CAMPAIGN_NAME_TEMPLATE_HINT,
  TIME_ZONE_OPTIONS,
} from "@/data/campaign-setup.defaults";
import type { CampaignSetupDraft } from "@/types/campaign-setup";

interface GeneralStepProps {
  draft: CampaignSetupDraft;
  errors: Record<string, string>;
  onChange: (patch: Partial<CampaignSetupDraft>) => void;
}

export function GeneralStep({ draft, errors, onChange }: GeneralStepProps) {
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      onChange({
        campaignImageFileName: null,
        campaignImagePreviewUrl: null,
      });
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    onChange({
      campaignImageFileName: file.name,
      campaignImagePreviewUrl: previewUrl,
    });
  };

  return (
    <div className="space-y-6">
      <FormField
        label="Campaign name"
        htmlFor="campaignName"
        hint={CAMPAIGN_NAME_TEMPLATE_HINT}
        error={errors.campaignName}
        required
      >
        <Input
          id="campaignName"
          value={draft.campaignName}
          onChange={(e) => onChange({ campaignName: e.target.value })}
          placeholder="Enter campaign name"
          hasError={Boolean(errors.campaignName)}
        />
      </FormField>

      <FormField
        label="Dealership time zone"
        htmlFor="timeZone"
        hint="Used to schedule SMS delivery per the SOP time zone table."
        error={errors.timeZone}
        required
      >
        <Select
          value={draft.timeZone}
          onValueChange={(value) =>
            onChange({ timeZone: value as CampaignSetupDraft["timeZone"] })
          }
        >
          <SelectTrigger id="timeZone">
            <SelectValue placeholder="Select time zone" />
          </SelectTrigger>
          <SelectContent>
            {TIME_ZONE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <FormField
        label="Campaign image"
        htmlFor="campaignImage"
        hint="Upload a 2×3 logo or high-quality storefront image."
        error={errors.campaignImage}
        required
      >
        <Input
          id="campaignImage"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="cursor-pointer file:mr-4 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1 file:text-sm"
        />
        {draft.campaignImagePreviewUrl ? (
          <img
            src={draft.campaignImagePreviewUrl}
            alt="Campaign preview"
            className="mt-3 max-h-40 rounded-md border border-border object-contain"
          />
        ) : null}
      </FormField>
    </div>
  );
}
