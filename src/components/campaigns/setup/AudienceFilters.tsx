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
} from "@/data/audience-attributes";
import { estimateAudienceReach } from "@/lib/audience-filters";
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
}

export function AudienceFilters({ draft, errors, onChange }: AudienceFiltersProps) {
  // Stable, render-safe ids for new rules without Math.random / Date.now.
  const nextId = useRef(0);
  const rules = draft.audienceFilters;
  const reach = estimateAudienceReach(rules);

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
    setRules(rules.map((rule) => (rule.id === id ? { ...rule, ...patch } : rule)));
  };

  const removeRule = (id: string) => {
    setRules(rules.filter((rule) => rule.id !== id));
  };

  const changeAttribute = (id: string, attribute: AudienceAttribute) => {
    // The value editor changes with the field, so clear the previous value.
    updateRule(id, { attribute, value: "" });
  };

  return (
    <FormField
      label="Audience Filters"
      hint="Add one or more rules. A customer must match every rule (AND) to be included. Leave empty to target all customers."
    >
      <div className="space-y-3">
        {rules.length === 0 ? (
          <div className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
            No filters yet — this campaign will reach all eligible customers.
          </div>
        ) : null}

        {rules.map((rule) => {
          const error = errors[`audience.${rule.id}`];
          return (
            <div
              key={rule.id}
              className={cn(
                "rounded-md border border-border p-3",
                error && "border-red-500 bg-red-50/40",
              )}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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

                <div className="sm:flex-1">
                  <RuleValueEditor rule={rule} onChange={updateRule} />
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
                <p className="mt-2 text-xs text-red-600" role="alert">
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
    </FormField>
  );
}

interface RuleValueEditorProps {
  rule: AudienceFilterRule;
  onChange: (id: string, patch: Partial<AudienceFilterRule>) => void;
}

function RuleValueEditor({ rule, onChange }: RuleValueEditorProps) {
  const meta = getAudienceAttributeMeta(rule.attribute);

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
