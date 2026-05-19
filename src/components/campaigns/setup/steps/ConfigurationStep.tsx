"use client";

import { FormField } from "@/components/campaigns/setup/FormField";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CAMPAIGN_TYPE_OPTIONS,
  getTimeZoneLabel,
  SERVICE_INTERVAL_OPTIONS,
  SUBFLEET_OPTIONS,
  TIME_ZONE_SCHEDULE_REFERENCE,
} from "@/data/campaign-setup.defaults";
import { CONFIGURATION_DAY_LABELS } from "@/lib/format-schedule";
import type { CampaignSetupDraft, ScheduleDay } from "@/types/campaign-setup";
import { SCHEDULE_DAYS } from "@/types/campaign-setup";
import { cn } from "@/lib/utils";

interface ConfigurationStepProps {
  draft: CampaignSetupDraft;
  errors: Record<string, string>;
  onChange: (patch: Partial<CampaignSetupDraft>) => void;
}

export function ConfigurationStep({
  draft,
  errors,
  onChange,
}: ConfigurationStepProps) {
  const toggleSubfleet = (value: string, checked: boolean) => {
    const next = checked
      ? [...draft.subfleets, value]
      : draft.subfleets.filter((s) => s !== value);
    onChange({ subfleets: next });
  };

  const toggleDay = (day: ScheduleDay, checked: boolean) => {
    const next = checked
      ? [...draft.scheduleDays, day]
      : draft.scheduleDays.filter((d) => d !== day);
    onChange({ scheduleDays: next });
  };

  return (
    <div className="space-y-6">
      <FormField
        label="Campaign type"
        error={errors.campaignType}
        required
      >
        <div className="space-y-2">
          {CAMPAIGN_TYPE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-md border border-border p-3",
                draft.campaignType === option.value && "border-brand-primary bg-muted/50",
                option.disabled && "cursor-not-allowed opacity-60",
              )}
            >
              <input
                type="radio"
                name="campaignType"
                value={option.value}
                checked={draft.campaignType === option.value}
                disabled={option.disabled}
                onChange={() => onChange({ campaignType: option.value })}
                className="mt-1"
              />
              <span>
                <span className="font-medium">{option.label}</span>
                <span className="block text-xs text-muted-foreground">
                  {option.description}
                </span>
              </span>
            </label>
          ))}
        </div>
      </FormField>

      <FormField
        label="Services"
        htmlFor="serviceInterval"
        error={errors.serviceInterval}
        required
      >
        <Select
          value={draft.serviceInterval}
          onValueChange={(value) => onChange({ serviceInterval: value })}
        >
          <SelectTrigger id="serviceInterval">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SERVICE_INTERVAL_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <FormField
        label="Subfleets"
        error={errors.subfleets}
        hint="Select the rooftop(s) for this campaign."
        required
      >
        <div className="grid gap-2 sm:grid-cols-2">
          {SUBFLEET_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-muted/50"
            >
              <Checkbox
                checked={draft.subfleets.includes(opt.value)}
                onChange={(e) => toggleSubfleet(opt.value, e.target.checked)}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </FormField>

      <FormField label="Delivery frequency" required>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="deliveryFrequency"
              checked={draft.deliveryFrequency === "ongoing"}
              onChange={() => onChange({ deliveryFrequency: "ongoing" })}
            />
            Ongoing
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="deliveryFrequency"
              checked={draft.deliveryFrequency === "send_once"}
              onChange={() => onChange({ deliveryFrequency: "send_once" })}
            />
            Send once
          </label>
        </div>
      </FormField>

      <FormField
        label="Define schedule"
        error={errors.scheduleDays}
        hint="Always Monday–Saturday. Times follow dealership time zone (Campaign Manager uses CST)."
        required
      >
        <div className="mb-3 flex flex-wrap gap-2">
          {SCHEDULE_DAYS.map((day) => (
            <label
              key={day}
              className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-sm"
            >
              <Checkbox
                checked={draft.scheduleDays.includes(day)}
                onChange={(e) => toggleDay(day, e.target.checked)}
              />
              {CONFIGURATION_DAY_LABELS[day]}
            </label>
          ))}
        </div>

        <p className="mb-3 text-sm text-muted-foreground">
          Time zone:{" "}
          <span className="font-medium text-foreground">
            {getTimeZoneLabel(draft.timeZone)}
          </span>
          <span className="text-muted-foreground">
            {" "}
            (selected on the General step)
          </span>
        </p>

        <div className="mt-4 overflow-x-auto rounded-md border border-border">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b bg-muted/50 text-left">
                <th className="px-3 py-2 font-medium">Time zone</th>
                <th className="px-3 py-2 font-medium">SMS sent</th>
                <th className="px-3 py-2 font-medium">Manager time (CST)</th>
              </tr>
            </thead>
            <tbody>
              {TIME_ZONE_SCHEDULE_REFERENCE.map((row) => (
                <tr
                  key={row.timeZone}
                  className={cn(
                    "border-b last:border-0",
                    row.timeZone === draft.timeZone && "bg-muted/40",
                  )}
                >
                  <td className="px-3 py-2">{row.timeZone}</td>
                  <td className="px-3 py-2">{row.smsWindow}</td>
                  <td className="px-3 py-2">{row.managerTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </FormField>
    </div>
  );
}
