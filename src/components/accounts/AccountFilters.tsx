"use client";

import { Search, X } from "lucide-react";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FILTER_ALL } from "@/data/lookups";
import {
  eligibilityFilterOptions,
  smartMarketingFilterOptions,
} from "@/lib/account-filters";
import { cn } from "@/lib/utils";

const filterParsers = {
  q: parseAsString.withDefault(""),
  eligibility: parseAsString.withDefault(FILTER_ALL),
  smartMarketing: parseAsString.withDefault(FILTER_ALL),
  page: parseAsInteger.withDefault(1),
};

interface AccountFiltersProps {
  className?: string;
}

export function AccountFilters({ className }: AccountFiltersProps) {
  const [filters, setFilters] = useQueryStates(filterParsers, {
    shallow: false,
    history: "push",
  });

  const hasActiveFilters =
    Boolean(filters.q) ||
    filters.eligibility !== FILTER_ALL ||
    filters.smartMarketing !== FILTER_ALL;

  const handleClearAll = () => {
    void setFilters({
      q: "",
      eligibility: FILTER_ALL,
      smartMarketing: FILTER_ALL,
      page: 1,
    });
  };

  const updateFilter = (key: keyof typeof filterParsers, value: string) => {
    void setFilters({ [key]: value, page: 1 });
  };

  return (
    <section
      className={cn("space-y-3", className)}
      aria-label="Account filters"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:flex-1 lg:max-w-xl">
          <FilterSelect
            label="Eligibility"
            value={filters.eligibility}
            options={eligibilityFilterOptions}
            onValueChange={(value) => updateFilter("eligibility", value)}
          />
          <FilterSelect
            label="Smart Marketing"
            value={filters.smartMarketing}
            options={smartMarketingFilterOptions}
            onValueChange={(value) => updateFilter("smartMarketing", value)}
          />
        </div>

        <div className="relative w-full lg:max-w-xs">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="Search accounts"
            value={filters.q}
            onChange={(event) => {
              void setFilters({ q: event.target.value, page: 1 });
            }}
            className="pl-9 pr-9"
            aria-label="Search accounts"
          />
          {filters.q ? (
            <button
              type="button"
              onClick={() => updateFilter("q", "")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>

      {hasActiveFilters ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Active filters:</span>
          {filters.q ? (
            <FilterChip
              label={`Search: "${filters.q}"`}
              onRemove={() => updateFilter("q", "")}
            />
          ) : null}
          {filters.eligibility !== FILTER_ALL ? (
            <FilterChip
              label={`Eligibility: ${
                eligibilityFilterOptions.find(
                  (option) => option.value === filters.eligibility,
                )?.label ?? filters.eligibility
              }`}
              onRemove={() => updateFilter("eligibility", FILTER_ALL)}
            />
          ) : null}
          {filters.smartMarketing !== FILTER_ALL ? (
            <FilterChip
              label={`Smart Marketing: ${
                smartMarketingFilterOptions.find(
                  (option) => option.value === filters.smartMarketing,
                )?.label ?? filters.smartMarketing
              }`}
              onRemove={() => updateFilter("smartMarketing", FILTER_ALL)}
            />
          ) : null}
          <Button variant="ghost" size="sm" onClick={handleClearAll}>
            Clear all
          </Button>
        </div>
      ) : null}
    </section>
  );
}

interface FilterSelectProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onValueChange: (value: string) => void;
}

function FilterSelect({
  label,
  value,
  options,
  onValueChange,
}: FilterSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger aria-label={label}>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

interface FilterChipProps {
  label: string;
  onRemove: () => void;
}

function FilterChip({ label, onRemove }: FilterChipProps) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="rounded-full p-0.5 hover:bg-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`Remove ${label}`}
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}
