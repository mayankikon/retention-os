"use client";

import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ikontechnologies-arlington/nxtg-design-shiftpackage/primitives";

import { useRef } from "react";
import { Plus, X } from "lucide-react";
import { FormField } from "@/components/campaigns/setup/FormField";
import {
  AUDIENCE_ATTRIBUTE_META,
  getAudienceAttributeMeta,
  getModelOptionsForMake,
  getTrimOptionsForMakeModel,
  parseDateRange,
  serializeDateRange,
} from "@/data/audience-attributes";
import {
  estimateAudienceReach,
  getSelectedMakeFromRules,
  getSelectedModelFromRules,
  syncModelRulesAfterMakeChange,
  syncTrimRulesAfterModelChange,
} from "@/lib/audience-filters";
import { cn } from "@/lib/utils";
import type {
  AudienceAttribute,
  AudienceFilterRule,
  CampaignSetupDraft,
} from "@/types/campaign-setup";

interface AudienceFiltersProps {
  draft: CampaignSetupDraft;
  errors: Record<string, string>;
  onChange: (patch: Partial<CampaignSetupDraft>) => void;
  embedded?: boolean;
  /** When set, only these attributes appear in the filter field dropdown. */
  allowedAttributes?: readonly AudienceAttribute[];
}

export function AudienceFilters({
  draft,
  errors,
  onChange,
  embedded = false,
  allowedAttributes,
}: AudienceFiltersProps) {
  const nextId = useRef(0);
  const rules = draft.audienceFilters;
  const reach = estimateAudienceReach(rules);
  const selectedMake = getSelectedMakeFromRules(rules);
  const selectedModel = getSelectedModelFromRules(rules);
  const attributeOptions = allowedAttributes
    ? AUDIENCE_ATTRIBUTE_META.filter((meta) =>
        allowedAttributes.includes(meta.attribute),
      )
    : AUDIENCE_ATTRIBUTE_META;
  const defaultAttribute =
    attributeOptions[0]?.attribute ?? AUDIENCE_ATTRIBUTE_META[0].attribute;

  const setRules = (next: AudienceFilterRule[]) => {
    onChange({ audienceFilters: next });
  };

  const addRule = () => {
    nextId.current += 1;
    setRules([
      ...rules,
      {
        id: `rule-${nextId.current}-${rules.length}`,
        attribute: defaultAttribute,
        value: "",
      },
    ]);
  };

  const updateRule = (id: string, patch: Partial<AudienceFilterRule>) => {
    let nextRules = rules.map((rule) =>
      rule.id === id ? { ...rule, ...patch } : rule,
    );

    const updatedRule = nextRules.find((rule) => rule.id === id);
    if (
      updatedRule?.attribute === "vehicleMake" &&
      patch.value &&
      typeof patch.value === "string"
    ) {
      nextRules = syncModelRulesAfterMakeChange(nextRules, patch.value);
    }

    if (
      updatedRule?.attribute === "vehicleModel" &&
      patch.value &&
      typeof patch.value === "string"
    ) {
      const make = getSelectedMakeFromRules(nextRules);
      nextRules = syncTrimRulesAfterModelChange(nextRules, make, patch.value);
    }

    setRules(nextRules);
  };

  const removeRule = (id: string) => {
    setRules(rules.filter((rule) => rule.id !== id));
  };

  const changeAttribute = (id: string, attribute: AudienceAttribute) => {
    updateRule(id, { attribute, value: "" });
  };

  const content = (
    <div className="space-y-3">
      {errors.audienceFilters ? (
        <p className="text-sm text-destructive">{errors.audienceFilters}</p>
      ) : null}

      {rules.length === 0 ? (
        <div className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
          No filters yet — add criteria to define your audience.
        </div>
      ) : null}

      {rules.map((rule) => {
        const error = errors[`audience.${rule.id}`];
        return (
          <div
            key={rule.id}
            className={cn(
              "rounded-[var(--radius-sm)] border border-border bg-card p-3",
              error && "border-destructive bg-destructive/5",
            )}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <Select
                value={rule.attribute}
                onValueChange={(value) => {
                  if (value == null) return;
                  changeAttribute(rule.id, value as AudienceAttribute);
                }}
                items={attributeOptions.map((option) => ({
                  value: option.attribute,
                  label: option.label,
                }))}
              >
                <SelectTrigger aria-label="Filter Field" className="sm:flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {attributeOptions.map((option) => (
                    <SelectItem key={option.attribute} value={option.attribute}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div
                className={cn(
                  "sm:flex-1",
                  rule.attribute === "vehiclePurchaseDate" && "sm:col-span-2",
                )}
              >
                <RuleValueEditor
                  rule={rule}
                  selectedMake={selectedMake}
                  selectedModel={selectedModel}
                  onChange={updateRule}
                />
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Remove Filter"
                onClick={() => removeRule(rule.id)}
                className="shrink-0 self-end sm:self-auto"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {error ? (
              <p className="mt-2 text-xs text-destructive" role="alert">
                {error}
              </p>
            ) : null}
          </div>
        );
      })}

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <Button type="button" variant="outline" onClick={addRule}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add Filter
        </Button>
        <p className="text-sm text-muted-foreground">
          {rules.length > 0 ? "AND · " : ""}Matches{" "}
          <span className="font-medium text-foreground">
            ~{reach.toLocaleString("en-US")}
          </span>{" "}
          Vehicles
        </p>
      </div>
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <FormField
      label="Audience Filters"
      hint="Add one or more rules. A customer must match every rule (AND) to be included."
    >
      {content}
    </FormField>
  );
}

interface RuleValueEditorProps {
  rule: AudienceFilterRule;
  selectedMake?: string;
  selectedModel?: string;
  onChange: (id: string, patch: Partial<AudienceFilterRule>) => void;
}

function RuleValueEditor({
  rule,
  selectedMake,
  selectedModel,
  onChange,
}: RuleValueEditorProps) {
  const meta = getAudienceAttributeMeta(rule.attribute);

  if (rule.attribute === "vehiclePurchaseDate") {
    const { startDate, endDate } = parseDateRange(rule.value);

    const handleDateChange = (part: "start" | "end", nextValue: string) => {
      const nextRange =
        part === "start"
          ? serializeDateRange(nextValue, endDate)
          : serializeDateRange(startDate, nextValue);
      onChange(rule.id, { value: nextRange });
    };

    return (
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="space-y-1">
          <label
            htmlFor={`${rule.id}-purchase-start`}
            className="text-xs font-medium text-muted-foreground"
          >
            Start Date
          </label>
          <Input
            id={`${rule.id}-purchase-start`}
            type="date"
            aria-label="Purchase Start Date"
            value={startDate}
            max={endDate || undefined}
            onChange={(event) => handleDateChange("start", event.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label
            htmlFor={`${rule.id}-purchase-end`}
            className="text-xs font-medium text-muted-foreground"
          >
            End Date
          </label>
          <Input
            id={`${rule.id}-purchase-end`}
            type="date"
            aria-label="Purchase End Date"
            value={endDate}
            min={startDate || undefined}
            onChange={(event) => handleDateChange("end", event.target.value)}
          />
        </div>
      </div>
    );
  }

  if (rule.attribute === "vehicleModel") {
    const modelOptions = selectedMake ? getModelOptionsForMake(selectedMake) : [];

    return (
      <Select
        value={rule.value || null}
        onValueChange={(value) => {
          if (value == null) return;
          onChange(rule.id, { value });
        }}
        disabled={!selectedMake}
        items={modelOptions}
      >
        <SelectTrigger aria-label="Filter Value">
          <SelectValue
            placeholder={
              selectedMake ? "Select Model…" : "Add a Make Filter First"
            }
          />
        </SelectTrigger>
        <SelectContent>
          {modelOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (rule.attribute === "vehicleTrim") {
    const trimOptions =
      selectedMake && selectedModel
        ? getTrimOptionsForMakeModel(selectedMake, selectedModel)
        : [];

    return (
      <Select
        value={rule.value || null}
        onValueChange={(value) => {
          if (value == null) return;
          onChange(rule.id, { value });
        }}
        disabled={!selectedMake || !selectedModel}
        items={trimOptions}
      >
        <SelectTrigger aria-label="Filter Value">
          <SelectValue
            placeholder={
              selectedMake && selectedModel
                ? "Select Trim…"
                : "Add Make and Model Filters First"
            }
          />
        </SelectTrigger>
        <SelectContent>
          {trimOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (meta.editor === "select") {
    return (
      <Select
        value={rule.value || null}
        onValueChange={(value) => {
          if (value == null) return;
          onChange(rule.id, { value });
        }}
        items={meta.options ?? []}
      >
        <SelectTrigger aria-label="Filter Value">
          <SelectValue placeholder="Select…" />
        </SelectTrigger>
        <SelectContent>
          {meta.options?.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <Input
      type={meta.editor === "date" ? "date" : meta.inputType ?? "text"}
      aria-label="Filter Value"
      placeholder={meta.placeholder}
      value={rule.value}
      onChange={(event) => onChange(rule.id, { value: event.target.value })}
    />
  );
}
