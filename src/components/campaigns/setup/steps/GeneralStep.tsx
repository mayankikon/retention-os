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

import { FormField } from "@/components/campaigns/setup/FormField";
import {
  getTimeZoneLabel,
  TIME_ZONE_OPTIONS,
} from "@/data/campaign-setup.defaults";
import {
  getDealersForGroup,
  getKnownDealerTimeZone,
  getPrimaryTimeZoneFromDealerships,
  groupSelectOptions,
  resolveDealerTimeZone,
} from "@/data/lookups";
import type {
  CampaignSetupDraft,
  SetupTimeZone,
} from "@/types/campaign-setup";
import { cn } from "@/lib/utils";

interface GeneralStepProps {
  draft: CampaignSetupDraft;
  errors: Record<string, string>;
  onChange: (patch: Partial<CampaignSetupDraft>) => void;
}

export function GeneralStep({ draft, errors, onChange }: GeneralStepProps) {
  const dealersInGroup = draft.groupId
    ? getDealersForGroup(draft.groupId)
    : [];

  const applyScopePatch = (patch: {
    groupId?: string;
    subfleets?: string[];
    timezoneOverrides?: Partial<Record<string, SetupTimeZone>>;
  }) => {
    const groupId = patch.groupId ?? draft.groupId;
    const subfleets = patch.subfleets ?? draft.subfleets;
    const timezoneOverrides =
      patch.timezoneOverrides ?? draft.timezoneOverrides;
    onChange({
      groupId,
      subfleets,
      timezoneOverrides,
      timeZone: getPrimaryTimeZoneFromDealerships(
        subfleets,
        timezoneOverrides,
        draft.timeZone,
      ),
    });
  };

  const handleGroupChange = (groupId: string) => {
    applyScopePatch({
      groupId,
      subfleets: [],
      timezoneOverrides: {},
    });
  };

  const handleDealershipToggle = (dealer: string, checked: boolean) => {
    const nextSubfleets = checked
      ? [...draft.subfleets, dealer]
      : draft.subfleets.filter((item) => item !== dealer);
    const nextOverrides = { ...draft.timezoneOverrides };
    if (!checked) {
      delete nextOverrides[dealer];
    }
    applyScopePatch({
      subfleets: nextSubfleets,
      timezoneOverrides: nextOverrides,
    });
  };

  const handleSelectAll = () => {
    applyScopePatch({ subfleets: [...dealersInGroup] });
  };

  const handleTimezoneFallback = (dealer: string, timeZone: SetupTimeZone) => {
    applyScopePatch({
      timezoneOverrides: {
        ...draft.timezoneOverrides,
        [dealer]: timeZone,
      },
    });
  };

  return (
    <div className="space-y-6">
      <FormField
        label="Group"
        htmlFor="groupId"
        hint="Select the dealer group, then choose one or more dealerships."
        error={errors.groupId}
        required
      >
        <Select
          value={draft.groupId || null}
          onValueChange={(value) => {
            if (value == null) return;
            handleGroupChange(value);
          }}
          items={groupSelectOptions}
        >
          <SelectTrigger id="groupId" aria-invalid={Boolean(errors.groupId)}>
            <SelectValue placeholder="Select group" />
          </SelectTrigger>
          <SelectContent>
            {groupSelectOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <FormField
        label="Dealerships"
        error={errors.dealership}
        hint={
          draft.groupId
            ? `${draft.subfleets.length} selected. Campaign runs only for the selected dealerships.`
            : "Choose a group to load dealerships."
        }
        required
      >
        {!draft.groupId ? (
          <p className="text-sm text-muted-foreground">
            Select a group to see available dealerships.
          </p>
        ) : dealersInGroup.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No dealerships are available for this group with your current
            access.
          </p>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-end">
              <button
                type="button"
                className="text-sm font-medium text-primary hover:underline"
                onClick={handleSelectAll}
              >
                Select all in group
              </button>
            </div>
            <ul className="space-y-2">
              {dealersInGroup.map((dealer) => {
                const isSelected = draft.subfleets.includes(dealer);
                const knownTimeZone = getKnownDealerTimeZone(dealer);
                const resolvedTimeZone = resolveDealerTimeZone(
                  dealer,
                  draft.timezoneOverrides,
                );

                return (
                  <li
                    key={dealer}
                    className={cn(
                      "rounded-[var(--radius-sm)] border border-border bg-card p-3",
                      isSelected && "border-primary bg-primary/5",
                    )}
                  >
                    <label className="flex cursor-pointer items-start gap-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) =>
                          handleDealershipToggle(dealer, checked)
                        }
                        className="mt-0.5"
                        aria-label={dealer}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium">{dealer}</span>
                        {knownTimeZone ? (
                          <span className="mt-1 block text-xs text-muted-foreground">
                            Timezone: {getTimeZoneLabel(knownTimeZone)}
                          </span>
                        ) : (
                          <span className="mt-1 block text-xs text-muted-foreground">
                            Timezone unknown — set a fallback for this
                            dealership.
                          </span>
                        )}
                      </span>
                    </label>

                    {isSelected && !knownTimeZone ? (
                      <div className="mt-3 pl-7">
                        <FormField
                          label="Timezone fallback"
                          htmlFor={`tz-fallback-${dealer}`}
                          error={
                            errors[`timezone.${dealer}`]
                              ? "Select a timezone for this dealership."
                              : undefined
                          }
                          required
                        >
                          <Select
                            value={resolvedTimeZone ?? null}
                            onValueChange={(value) => {
                              if (value == null) return;
                              handleTimezoneFallback(
                                dealer,
                                value as SetupTimeZone,
                              );
                            }}
                            items={TIME_ZONE_OPTIONS}
                          >
                            <SelectTrigger
                              id={`tz-fallback-${dealer}`}
                              aria-invalid={Boolean(
                                errors[`timezone.${dealer}`],
                              )}
                            >
                              <SelectValue placeholder="Select time zone" />
                            </SelectTrigger>
                            <SelectContent>
                              {TIME_ZONE_OPTIONS.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormField>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </FormField>

      <FormField
        label="Campaign Name"
        htmlFor="campaignName"
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
    </div>
  );
}
