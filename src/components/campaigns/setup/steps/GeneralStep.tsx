"use client";

import {
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ikontechnologies-arlington/nxtg-design-shiftpackage/primitives";

import { FormField } from "@/components/campaigns/setup/FormField";
import {
  CAMPAIGN_NAME_TEMPLATE_HINT,
  TIME_ZONE_OPTIONS,
} from "@/data/campaign-setup.defaults";
import { dealershipOptions } from "@/data/lookups";
import type { CampaignSetupDraft } from "@/types/campaign-setup";

interface GeneralStepProps {
  draft: CampaignSetupDraft;
  errors: Record<string, string>;
  onChange: (patch: Partial<CampaignSetupDraft>) => void;
}

export function GeneralStep({ draft, errors, onChange }: GeneralStepProps) {
  const selectedDealership = draft.subfleets[0] ?? "";

  return (
    <div className="space-y-6">
      <FormField
        label="Dealership"
        htmlFor="dealership"
        hint="The store this campaign will run for."
        error={errors.dealership}
        required
      >
        <Select
          value={selectedDealership || null}
          onValueChange={(value) => {
            if (value == null) return;
            onChange({ subfleets: [value] });
          }}
          items={dealershipOptions}
        >
          <SelectTrigger id="dealership" aria-invalid={Boolean(errors.dealership)}>
            <SelectValue placeholder="Select dealership" />
          </SelectTrigger>
          <SelectContent>
            {dealershipOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <FormField
        label="Campaign Name"
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
          aria-invalid={Boolean(errors.campaignName)}
        />
      </FormField>

      <FormField
        label="Dealership Time Zone"
        htmlFor="timeZone"
        hint="Used to schedule SMS delivery per the SOP time zone table."
        error={errors.timeZone}
        required
      >
        <Select
          value={draft.timeZone}
          onValueChange={(value) => {
            if (value == null) return;
            onChange({ timeZone: value as CampaignSetupDraft["timeZone"] });
          }}
          items={TIME_ZONE_OPTIONS}
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
    </div>
  );
}
