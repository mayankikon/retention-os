"use client";

import { AudienceFilters } from "@/components/campaigns/setup/AudienceFilters";
import { FormField } from "@/components/campaigns/setup/FormField";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getTimeZoneLabel,
  TIME_ZONE_SCHEDULE_REFERENCE,
} from "@/data/campaign-setup.defaults";
import {
  getOemMakes,
  getOemModelsForMake,
  getOemServiceSchedule,
  MILEAGE_SERVICE_TRIGGER_OPTIONS,
  SERVICE_TRIGGER_MODE_OPTIONS,
  TIME_SERVICE_TRIGGER_OPTIONS,
} from "@/data/service-triggers";
import { CONFIGURATION_DAY_LABELS } from "@/lib/format-schedule";
import {
  getServiceTriggerMode,
  getServiceTriggerSummaries,
  setServiceTriggerMode,
} from "@/lib/service-triggers";
import type {
  CampaignSetupDraft,
  ScheduleDay,
  ServiceTriggerMode,
} from "@/types/campaign-setup";
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
  const serviceTriggerMode = getServiceTriggerMode(draft);
  const oemModels = draft.oemMake ? getOemModelsForMake(draft.oemMake) : [];
  const oemSchedule =
    draft.oemMake && draft.oemModel
      ? getOemServiceSchedule(draft.oemMake, draft.oemModel)
      : undefined;
  const serviceTriggerError =
    errors.timeServiceTriggerPreset ??
    errors.mileageServiceTriggerPreset ??
    errors.oemMake ??
    errors.oemModel ??
    errors.audienceFilters;
  const selectedSummaries = getServiceTriggerSummaries(draft);

  const toggleDay = (day: ScheduleDay, checked: boolean) => {
    const next = checked
      ? [...draft.scheduleDays, day]
      : draft.scheduleDays.filter((d) => d !== day);
    onChange({ scheduleDays: next });
  };

  const handleServiceTriggerModeChange = (mode: ServiceTriggerMode) => {
    onChange(setServiceTriggerMode(draft, mode));
  };

  return (
    <div className="space-y-6">
      <FormField
        label="Service triggers"
        error={serviceTriggerError}
        hint="Choose one targeting method: time and mileage intervals, OEM schedule, or an audience query."
        required
      >
        <fieldset className="space-y-3">
          <legend className="sr-only">Service trigger mode</legend>
          {SERVICE_TRIGGER_MODE_OPTIONS.map((option) => {
            const isSelected = serviceTriggerMode === option.value;

            return (
              <div
                key={option.value}
                className={cn(
                  "rounded-md border border-border p-3",
                  isSelected && "border-brand-primary bg-muted/50",
                )}
              >
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="radio"
                    name="serviceTriggerMode"
                    checked={isSelected}
                    onChange={() => handleServiceTriggerModeChange(option.value)}
                    className="mt-1 h-4 w-4 shrink-0 accent-brand-primary"
                    aria-label={option.label}
                  />
                  <span>
                    <span className="font-medium">{option.label}</span>
                    <span className="block text-xs text-muted-foreground">
                      {option.description}
                    </span>
                  </span>
                </label>

                {isSelected && option.value === "interval" ? (
                  <div className="mt-3 space-y-4 pl-7">
                    <FormField
                      label="Time Interval"
                      htmlFor="timeServiceTriggerPreset"
                      error={errors.timeServiceTriggerPreset}
                      required
                    >
                      <Select
                        value={draft.timeServiceTriggerPreset}
                        onValueChange={(value) =>
                          onChange({ timeServiceTriggerPreset: value })
                        }
                      >
                        <SelectTrigger
                          id="timeServiceTriggerPreset"
                          aria-label="Time Interval"
                        >
                          <SelectValue placeholder="Select time interval" />
                        </SelectTrigger>
                        <SelectContent>
                          {TIME_SERVICE_TRIGGER_OPTIONS.map((preset) => (
                            <SelectItem key={preset.value} value={preset.value}>
                              {preset.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>

                    <FormField
                      label="Mileage Interval"
                      htmlFor="mileageServiceTriggerPreset"
                      error={errors.mileageServiceTriggerPreset}
                      required
                    >
                      <Select
                        value={draft.mileageServiceTriggerPreset}
                        onValueChange={(value) =>
                          onChange({ mileageServiceTriggerPreset: value })
                        }
                      >
                        <SelectTrigger
                          id="mileageServiceTriggerPreset"
                          aria-label="Mileage Interval"
                        >
                          <SelectValue placeholder="Select mileage interval" />
                        </SelectTrigger>
                        <SelectContent>
                          {MILEAGE_SERVICE_TRIGGER_OPTIONS.map((preset) => (
                            <SelectItem key={preset.value} value={preset.value}>
                              {preset.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>
                  </div>
                ) : null}

                {isSelected && option.value === "oem" ? (
                  <div className="mt-3 space-y-4 pl-7">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        label="Make"
                        htmlFor="oemMake"
                        error={errors.oemMake}
                        required
                      >
                        <Select
                          value={draft.oemMake || undefined}
                          onValueChange={(value) =>
                            onChange({ oemMake: value, oemModel: "" })
                          }
                        >
                          <SelectTrigger id="oemMake">
                            <SelectValue placeholder="Select make" />
                          </SelectTrigger>
                          <SelectContent>
                            {getOemMakes().map((make) => (
                              <SelectItem key={make} value={make}>
                                {make}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormField>

                      <FormField
                        label="Model"
                        htmlFor="oemModel"
                        error={errors.oemModel}
                        required
                      >
                        <Select
                          value={draft.oemModel || undefined}
                          onValueChange={(value) => onChange({ oemModel: value })}
                          disabled={!draft.oemMake}
                        >
                          <SelectTrigger id="oemModel">
                            <SelectValue
                              placeholder={
                                draft.oemMake
                                  ? "Select model"
                                  : "Choose make first"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {oemModels.map((model) => (
                              <SelectItem key={model} value={model}>
                                {model}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormField>
                    </div>

                    {oemSchedule ? (
                      <div className="rounded-md border border-border bg-background p-3 text-sm">
                        <p className="font-medium text-foreground">
                          {oemSchedule.make} {oemSchedule.model} OEM schedule
                        </p>
                        <p className="mt-1 text-muted-foreground">
                          Trigger: every{" "}
                          {oemSchedule.intervalMiles.toLocaleString("en-US")} miles or{" "}
                          {oemSchedule.intervalDays} days — {oemSchedule.summary}
                        </p>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {isSelected && option.value === "audience" ? (
                  <div className="mt-3 pl-7">
                    <AudienceFilters
                      draft={draft}
                      errors={errors}
                      onChange={onChange}
                      embedded
                    />
                  </div>
                ) : null}
              </div>
            );
          })}

          {selectedSummaries.length > 0 ? (
            <div className="rounded-md border border-border bg-muted/20 p-3 text-sm">
              <p className="font-medium text-foreground">Active trigger</p>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                {selectedSummaries.map((summary) => (
                  <li key={summary}>{summary}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </fieldset>
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
