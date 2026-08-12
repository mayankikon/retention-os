"use client";

import {
  Checkbox,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ikontechnologies-arlington/nxtg-design-shiftpackage/primitives";

import { AudienceFilters } from "@/components/campaigns/setup/AudienceFilters";
import { FormField } from "@/components/campaigns/setup/FormField";
import { SendTimeField } from "@/components/campaigns/setup/SendTimeField";
import { getTimeZoneLabel } from "@/data/campaign-setup.defaults";
import {
  getOemMakes,
  getOemModelsForMake,
  getOemServiceSchedule,
  getOemTrimsForMakeModel,
  MILEAGE_SERVICE_TRIGGER_OPTIONS,
  SERVICE_TRIGGER_MODE_OPTIONS,
  TIME_SERVICE_TRIGGER_OPTIONS,
} from "@/data/service-triggers";
import { toDateInputValue } from "@/lib/campaign-window";
import { CONFIGURATION_DAY_LABELS } from "@/lib/format-schedule";
import { getScheduleTimeZoneTable } from "@/lib/schedule-time-zones";
import { formatSendTimeLabel } from "@/lib/send-time";
import {
  getServiceTriggerMode,
  setServiceTriggerMode,
} from "@/lib/service-triggers";
import type {
  CampaignSetupDraft,
  ScheduleDay,
  ServiceTriggerMode,
} from "@/types/campaign-setup";
import { OEM_AUDIENCE_ATTRIBUTES, SCHEDULE_DAYS } from "@/types/campaign-setup";
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
  const oemTrims =
    draft.oemMake && draft.oemModel
      ? getOemTrimsForMakeModel(draft.oemMake, draft.oemModel)
      : [];
  const oemSchedule =
    draft.oemMake && draft.oemModel
      ? getOemServiceSchedule(draft.oemMake, draft.oemModel)
      : undefined;
  const scheduleTimeZones = getScheduleTimeZoneTable(
    draft.sendTimeLocal,
    draft.timeZone,
  );
  const serviceTriggerError =
    errors.timeServiceTriggerPreset ??
    errors.mileageServiceTriggerPreset ??
    errors.oemMake ??
    errors.oemModel ??
    errors.audienceFilters;

  const today = toDateInputValue(new Date());
  const startDate = draft.campaignStartDate ?? "";

  // Clearing the start date also drops the time so no orphan clock time is kept.
  const handleStartDateChange = (nextStartDate: string) => {
    onChange({
      campaignStartDate: nextStartDate || null,
      campaignStartTimeLocal: nextStartDate ? draft.campaignStartTimeLocal : null,
    });
  };

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
        label="Service Triggers"
        error={serviceTriggerError}
        hint="Choose time and mileage intervals or an OEM schedule, then optionally narrow the audience."
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
                  "rounded-[var(--radius-sm)] border border-border bg-card p-3",
                  isSelected && "border-primary bg-primary/5",
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
                        value={draft.timeServiceTriggerPreset || null}
                        onValueChange={(value) => {
                          if (value == null) return;
                          onChange({ timeServiceTriggerPreset: value });
                        }}
                        items={TIME_SERVICE_TRIGGER_OPTIONS}
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
                        value={draft.mileageServiceTriggerPreset || null}
                        onValueChange={(value) => {
                          if (value == null) return;
                          onChange({ mileageServiceTriggerPreset: value });
                        }}
                        items={MILEAGE_SERVICE_TRIGGER_OPTIONS}
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

                    <div className="border-t border-border pt-4">
                      <p className="mb-3 text-sm font-medium text-foreground">
                        Audience Query
                      </p>
                      <AudienceFilters
                        draft={draft}
                        errors={errors}
                        onChange={onChange}
                        embedded
                      />
                    </div>
                  </div>
                ) : null}

                {isSelected && option.value === "oem" ? (
                  <div className="mt-3 space-y-4 pl-7">
                    <div className="grid gap-4 sm:grid-cols-3">
                      <FormField
                        label="Make"
                        htmlFor="oemMake"
                        error={errors.oemMake}
                        required
                      >
                        <Select
                          value={draft.oemMake || null}
                          onValueChange={(value) => {
                            if (value == null) return;
                            onChange({
                              oemMake: value,
                              oemModel: "",
                              oemTrim: "",
                            });
                          }}
                          items={getOemMakes().map((make) => ({
                            value: make,
                            label: make,
                          }))}
                        >
                          <SelectTrigger id="oemMake">
                            <SelectValue placeholder="Select Make" />
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
                          value={draft.oemModel || null}
                          onValueChange={(value) => {
                            if (value == null) return;
                            onChange({ oemModel: value, oemTrim: "" });
                          }}
                          disabled={!draft.oemMake}
                          items={oemModels.map((model) => ({
                            value: model,
                            label: model,
                          }))}
                        >
                          <SelectTrigger id="oemModel">
                            <SelectValue
                              placeholder={
                                draft.oemMake
                                  ? "Select Model"
                                  : "Choose Make First"
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

                      <FormField label="Trim" htmlFor="oemTrim">
                        <Select
                          value={draft.oemTrim || null}
                          onValueChange={(value) => {
                            if (value == null) return;
                            onChange({ oemTrim: value });
                          }}
                          disabled={!draft.oemMake || !draft.oemModel}
                          items={oemTrims.map((trim) => ({
                            value: trim,
                            label: trim,
                          }))}
                        >
                          <SelectTrigger id="oemTrim">
                            <SelectValue
                              placeholder={
                                draft.oemMake && draft.oemModel
                                  ? "Select Trim"
                                  : "Choose Model First"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {oemTrims.map((trim) => (
                              <SelectItem key={trim} value={trim}>
                                {trim}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormField>
                    </div>

                    {oemSchedule ? (
                      <div className="rounded-md border border-border bg-background p-3 text-sm">
                        <p className="font-medium text-foreground">
                          {oemSchedule.make} {oemSchedule.model} OEM Schedule
                        </p>
                        {draft.oemTrim ? (
                          <p className="mt-1 text-sm text-muted-foreground">
                            Scoped to {draft.oemTrim}
                          </p>
                        ) : null}
                        <p className="mt-1 text-muted-foreground">
                          Trigger: every{" "}
                          {oemSchedule.intervalMiles.toLocaleString("en-US")} miles or{" "}
                          {oemSchedule.intervalDays} days — {oemSchedule.summary}
                        </p>
                      </div>
                    ) : null}

                    <div className="border-t border-border pt-4">
                      <p className="mb-3 text-sm font-medium text-foreground">
                        Audience Query
                      </p>
                      {draft.oemMake && draft.oemModel ? (
                        <p className="mb-3 text-xs text-muted-foreground">
                          Vehicle Scope: {draft.oemMake} {draft.oemModel}
                          {draft.oemTrim
                            ? ` · ${draft.oemTrim}`
                            : " · All Trims"}
                        </p>
                      ) : null}
                      <AudienceFilters
                        draft={draft}
                        errors={errors}
                        onChange={onChange}
                        embedded
                        allowedAttributes={OEM_AUDIENCE_ATTRIBUTES}
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </fieldset>
      </FormField>

      <FormField
        label="Campaign Duration"
        hint="How long the campaign runs. Sends stop after the end date."
        required
      >
        <div className="space-y-4 rounded-[var(--radius-sm)] border border-border bg-card p-3">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Start Date (optional)"
              htmlFor="campaignStartDate"
              hint="Leave blank to start the moment you create the campaign."
              error={errors.campaignStartDate}
            >
              <Input
                id="campaignStartDate"
                type="date"
                value={startDate}
                min={today}
                max={draft.campaignEndDate || undefined}
                aria-invalid={Boolean(errors.campaignStartDate)}
                onChange={(event) => handleStartDateChange(event.target.value)}
              />
            </FormField>

            <FormField
              label="End Date"
              htmlFor="campaignEndDate"
              hint="Last day this campaign sends."
              error={errors.campaignEndDate}
              required
            >
              <Input
                id="campaignEndDate"
                type="date"
                value={draft.campaignEndDate}
                min={startDate || today}
                aria-invalid={Boolean(errors.campaignEndDate)}
                onChange={(event) =>
                  onChange({ campaignEndDate: event.target.value })
                }
              />
            </FormField>
          </div>

          {startDate ? (
            <FormField
              label="Start Time (optional)"
              htmlFor="campaignStartTimeLocal"
              hint={
                draft.campaignStartTimeLocal
                  ? `Starts at ${formatSendTimeLabel(draft.campaignStartTimeLocal)} in ${getTimeZoneLabel(draft.timeZone)}.`
                  : "Leave blank to start at the beginning of the start date."
              }
              error={errors.campaignStartTimeLocal}
            >
              <SendTimeField
                id="campaignStartTimeLocal"
                timeLabel="Start"
                value={draft.campaignStartTimeLocal}
                onChange={(campaignStartTimeLocal) =>
                  onChange({ campaignStartTimeLocal })
                }
                hasError={Boolean(errors.campaignStartTimeLocal)}
              />
            </FormField>
          ) : null}
        </div>
      </FormField>

      <FormField
        label="Define Schedule"
        error={errors.scheduleDays ?? errors.sendTimeLocal}
        hint="Always Monday–Saturday. Optional send time uses the primary dealership time zone from General."
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
                onCheckedChange={(checked) => toggleDay(day, checked)}
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
            (primary dealership from the General step)
          </span>
        </p>

        <FormField
          label="Send Time (optional)"
          htmlFor="sendTimeLocal"
          hint={
            draft.sendTimeLocal
              ? `Sends at ${formatSendTimeLabel(draft.sendTimeLocal)} local time in each dealership's zone. Clear it to follow the SOP lunch windows below.`
              : "Leave blank to follow the SOP lunch windows below, or pick a local clock time to pin an exact send hour."
          }
          error={errors.sendTimeLocal}
        >
          <SendTimeField
            id="sendTimeLocal"
            value={draft.sendTimeLocal}
            onChange={(sendTimeLocal) => onChange({ sendTimeLocal })}
            hasError={Boolean(errors.sendTimeLocal)}
          />
        </FormField>

        <div className="mt-4 overflow-x-auto rounded-md border border-border">
          <table className="w-full text-xs">
            <caption className="px-3 py-2 text-left text-xs text-muted-foreground">
              {scheduleTimeZones.isPinnedToSendTime
                ? `Each dealership sends at ${formatSendTimeLabel(draft.sendTimeLocal)} local time. Manager column shows when that lands on your clock.`
                : "SOP lunch windows apply while no send time is pinned."}
            </caption>
            <thead>
              <tr className="border-b bg-muted/50 text-left">
                <th className="px-3 py-2 font-medium">Time zone</th>
                <th className="px-3 py-2 font-medium">SMS sent (local)</th>
                <th className="px-3 py-2 font-medium">
                  Manager time ({scheduleTimeZones.managerTimeZone})
                </th>
              </tr>
            </thead>
            <tbody>
              {scheduleTimeZones.rows.map((row) => (
                <tr
                  key={row.timeZone}
                  className={cn(
                    "border-b last:border-0",
                    row.isManagerZone && "bg-muted/40",
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
