"use client";

import { useRef } from "react";
import { Plus, X } from "lucide-react";
import { FormField } from "@/components/campaigns/setup/FormField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AUDIENCE_ATTRIBUTE_META,
  getAudienceAttributeMeta,
  getModelOptionsForMake,
  parseDateRange,
  serializeDateRange,
} from "@/data/audience-attributes";
import {
  estimateAudienceReach,
  getSelectedMakeFromRules,
  syncModelRulesAfterMakeChange,
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
}

export function AudienceFilters({
  draft,
  errors,
  onChange,
  embedded = false,
}: AudienceFiltersProps) {
  const nextId = useRef(0);
  const rules = draft.audienceFilters;
  const reach = estimateAudienceReach(rules);
  const selectedMake = getSelectedMakeFromRules(rules);

  const setRules = (next: AudienceFilterRule[]) => {
    onChange({ audienceFilters: next });
  };

  const addRule = () => {
    nextId.current += 1;
    setRules([
      ...rules,
      {
        id: `rule-${nextId.current}-${rules.length}`,
        attribute: AUDIENCE_ATTRIBUTE_META[0].attribute,
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
              "rounded-md border border-border p-3",
              error && "border-destructive bg-destructive/5",
            )}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <Select
                value={rule.attribute}
                onValueChange={(value) =>
                  changeAttribute(rule.id, value as AudienceAttribute)
                }
              >
                <SelectTrigger aria-label="Filter Field" className="sm:flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AUDIENCE_ATTRIBUTE_META.map((option) => (
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
          {rules.length > 0 ? "AND · " : ""}matches{" "}
          <span className="font-medium text-foreground">
            ~{reach.toLocaleString("en-US")}
          </span>{" "}
          vehicles
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
  onChange: (id: string, patch: Partial<AudienceFilterRule>) => void;
}

function RuleValueEditor({ rule, selectedMake, onChange }: RuleValueEditorProps) {
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
            Start date
          </label>
          <Input
            id={`${rule.id}-purchase-start`}
            type="date"
            aria-label="Purchase start date"
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
            End date
          </label>
          <Input
            id={`${rule.id}-purchase-end`}
            type="date"
            aria-label="Purchase end date"
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
        value={rule.value || undefined}
        onValueChange={(value) => onChange(rule.id, { value })}
        disabled={!selectedMake}
      >
        <SelectTrigger aria-label="Filter Value">
          <SelectValue
            placeholder={
              selectedMake ? "Select model…" : "Add a Make filter first"
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

  if (meta.editor === "select") {
    return (
      <Select
        value={rule.value || undefined}
        onValueChange={(value) => onChange(rule.id, { value })}
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
