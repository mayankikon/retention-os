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
import {
  OptionCardText,
  SECTION_CARD_CLASS,
  optionCardClassName,
  optionCardNestedClassName,
} from "@/components/campaigns/setup/OptionCard";
import { SendTimeField } from "@/components/campaigns/setup/SendTimeField";
import { useProductVersion } from "@/contexts/product-version-context";
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
import { isOemServiceScheduleAvailable } from "@/lib/product-version";
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
  const { versionId } = useProductVersion();
  const isOemScheduleAvailable = isOemServiceScheduleAvailable(versionId);
  const serviceTriggerMode = isOemScheduleAvailable
    ? getServiceTriggerMode(draft)
    : "interval";
  const serviceTriggerModeOptions = isOemScheduleAvailable
    ? SERVICE_TRIGGER_MODE_OPTIONS
    : SERVICE_TRIGGER_MODE_OPTIONS.filter((option) => option.value === "interval");
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

  const handleStartDateChange = (nextStartDate: string) => {
    onChange({
      campaignStartDate: nextStartDate || null,
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
        required
      >
        <fieldset className="space-y-3">
          <legend className="sr-only">Service trigger mode</legend>
          {serviceTriggerModeOptions.map((option) => {
            const isSelected = serviceTriggerMode === option.value;

            return (
              <div
                key={option.value}
                className={optionCardClassName(isSelected)}
              >
                {isOemScheduleAvailable ? (
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="radio"
                      name="serviceTriggerMode"
                      checked={isSelected}
                      onChange={() =>
                        handleServiceTriggerModeChange(option.value)
                      }
                      className="mt-1 h-4 w-4 shrink-0 accent-brand-primary"
                      aria-label={option.label}
                    />
                    <OptionCardText
                      title={option.label}
                      description={option.description}
                    />
                  </label>
                ) : (
                  <OptionCardText
                    title={option.label}
                    description={option.description}
                  />
                )}

                {isSelected && option.value === "interval" ? (
                  <div
                    className={optionCardNestedClassName(
                      isOemScheduleAvailable,
                    )}
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
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
                            className="w-full"
                            aria-label="Time Interval"
                          >
                            <SelectValue placeholder="Select time interval" />
                          </SelectTrigger>
                          <SelectContent>
                            {TIME_SERVICE_TRIGGER_OPTIONS.map((preset) => (
                              <SelectItem
                                key={preset.value}
                                value={preset.value}
                              >
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
                            className="w-full"
                            aria-label="Mileage Interval"
                          >
                            <SelectValue placeholder="Select mileage interval" />
                          </SelectTrigger>
                          <SelectContent>
                            {MILEAGE_SERVICE_TRIGGER_OPTIONS.map((preset) => (
                              <SelectItem
                                key={preset.value}
                                value={preset.value}
                              >
                                {preset.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormField>
                    </div>

                    <div className="border-t border-border pt-4">
                      <AudienceQueryHeader />
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
                  <div
                    className={optionCardNestedClassName(
                      isOemScheduleAvailable,
                    )}
                  >
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
                      <div
                        className={cn(
                          SECTION_CARD_CLASS,
                          "bg-background text-sm",
                        )}
                      >
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
                      <AudienceQueryHeader />
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
        required
      >
        <div className={SECTION_CARD_CLASS}>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Start Date"
              htmlFor="campaignStartDate"
              hint="First day this campaign can send."
              error={errors.campaignStartDate}
              required
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
              hint="Optional. Last day this campaign sends when set."
              error={errors.campaignEndDate}
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
        </div>
      </FormField>

      <FormField
        label="Define Schedule"
        error={errors.scheduleDays ?? errors.sendTimeLocal}
        required
      >
        <div className={cn(SECTION_CARD_CLASS, "space-y-4")}>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {SCHEDULE_DAYS.map((day) => {
              const isSelected = draft.scheduleDays.includes(day);
              return (
                <label
                  key={day}
                  className={cn(
                    "flex cursor-pointer items-center gap-1.5 rounded-[var(--radius-sm)] border border-border bg-card px-2.5 py-1.5 text-sm transition-colors",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/40",
                  )}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => toggleDay(day, checked)}
                  />
                  {CONFIGURATION_DAY_LABELS[day]}
                </label>
              );
            })}
          </div>

          <p className="text-sm text-muted-foreground">
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
            label="Send Time"
            htmlFor="sendTimeLocal"
            hint={
              draft.sendTimeLocal
                ? `Sends at ${formatSendTimeLabel(draft.sendTimeLocal)} local time in each dealership's zone.`
                : "Pick a local clock time to pin an exact send hour for each dealership."
            }
            error={errors.sendTimeLocal}
            required
          >
            <SendTimeField
              id="sendTimeLocal"
              value={draft.sendTimeLocal}
              onChange={(sendTimeLocal) => onChange({ sendTimeLocal })}
              hasError={Boolean(errors.sendTimeLocal)}
            />
          </FormField>

          <div className="overflow-x-auto rounded-[var(--radius-sm)] border border-border">
            <table className="w-full text-xs">
              <caption className="px-3 py-2 text-left text-xs text-muted-foreground">
                {scheduleTimeZones.isPinnedToSendTime
                  ? `Each dealership sends at ${formatSendTimeLabel(draft.sendTimeLocal)} local time. Manager column shows when that lands on your clock.`
                  : "Choose a send time to pin the local send hour for every dealership."}
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
        </div>
      </FormField>
    </div>
  );
}

/** "Audience Query" label; the estimated reach sits above the message preview. */
function AudienceQueryHeader() {
  return (
    <p className="mb-3 text-sm font-medium text-foreground">Audience Query</p>
  );
}
