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
import {
  dealerFilterOptions,
  FILTER_ALL,
  timeZoneFilterOptions,
  statusFilterOptions,
} from "@/data/lookups";
import { cn } from "@/lib/utils";

const filterParsers = {
  q: parseAsString.withDefault(""),
  dealer: parseAsString.withDefault(FILTER_ALL),
  timeZone: parseAsString.withDefault(FILTER_ALL),
  status: parseAsString.withDefault(FILTER_ALL),
  page: parseAsInteger.withDefault(1),
};

interface CampaignFiltersProps {
  className?: string;
}

export function CampaignFilters({ className }: CampaignFiltersProps) {
  const [filters, setFilters] = useQueryStates(filterParsers, {
    shallow: false,
    history: "push",
  });

  const hasActiveFilters =
    Boolean(filters.q) ||
    filters.dealer !== FILTER_ALL ||
    filters.timeZone !== FILTER_ALL ||
    filters.status !== FILTER_ALL;

  const handleClearAll = () => {
    void setFilters({
      q: "",
      dealer: FILTER_ALL,
      timeZone: FILTER_ALL,
      status: FILTER_ALL,
      page: 1,
    });
  };

  const updateFilter = (key: keyof typeof filterParsers, value: string) => {
    void setFilters({ [key]: value, page: 1 });
  };

  return (
    <section
      className={cn("space-y-3", className)}
      aria-label="Campaign filters"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:flex-1 lg:max-w-2xl">
          <FilterSelect
            label="Dealership"
            value={filters.dealer}
            options={dealerFilterOptions}
            onValueChange={(value) => updateFilter("dealer", value)}
          />
          <FilterSelect
            label="Time Zone"
            value={filters.timeZone}
            options={timeZoneFilterOptions}
            onValueChange={(value) => updateFilter("timeZone", value)}
          />
          <FilterSelect
            label="Status"
            value={filters.status}
            options={statusFilterOptions}
            onValueChange={(value) => updateFilter("status", value)}
          />
        </div>

        <div className="relative w-full lg:max-w-xs">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="Search by campaign"
            value={filters.q}
            onChange={(event) => {
              void setFilters({ q: event.target.value, page: 1 });
            }}
            className="pl-9 pr-9"
            aria-label="Search by campaign"
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
          {filters.dealer !== FILTER_ALL ? (
            <FilterChip
              label={`Dealer: ${filters.dealer}`}
              onRemove={() => updateFilter("dealer", FILTER_ALL)}
            />
          ) : null}
          {filters.timeZone !== FILTER_ALL ? (
            <FilterChip
              label={`Time Zone: ${
                timeZoneFilterOptions.find(
                  (option) => option.value === filters.timeZone,
                )?.label ?? filters.timeZone
              }`}
              onRemove={() => updateFilter("timeZone", FILTER_ALL)}
            />
          ) : null}
          {filters.status !== FILTER_ALL ? (
            <FilterChip
              label={`Status: ${filters.status}`}
              onRemove={() => updateFilter("status", FILTER_ALL)}
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
