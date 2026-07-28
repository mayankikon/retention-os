"use client";

import {
  Input,
  InputActionButton,
  InputContainer,
  InputIcon,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ikontechnologies-arlington/nxtg-design-shiftpackage/primitives";
import { Search, X } from "lucide-react";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import {
  ActiveFilterChip,
  ActiveFilterChipsBar,
} from "@/components/filters/ActiveFilterChip";
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
      className={cn("space-y-2.5", className)}
      aria-label="Campaign filters"
    >
      <div className="flex shrink-0 flex-wrap items-center gap-2.5">
        <FilterSelect
          label="Dealership"
          value={filters.dealer}
          options={dealerFilterOptions}
          onValueChange={(value) => updateFilter("dealer", value)}
          className="w-full min-w-[10.5rem] sm:w-[10.5rem]"
        />
        <FilterSelect
          label="Time Zone"
          value={filters.timeZone}
          options={timeZoneFilterOptions}
          onValueChange={(value) => updateFilter("timeZone", value)}
          className="w-full min-w-[10.5rem] sm:w-[10.5rem]"
        />
        <FilterSelect
          label="Status"
          value={filters.status}
          options={statusFilterOptions}
          onValueChange={(value) => updateFilter("status", value)}
          className="w-full min-w-[9rem] sm:w-[9rem]"
        />

        <InputContainer
          size="lg"
          className="control-hover-stroke w-full max-w-sm sm:ml-auto"
        >
          <InputIcon position="lead">
            <Search className="size-4" aria-hidden />
          </InputIcon>
          <Input
            standalone={false}
            size="lg"
            type="search"
            placeholder="Search by campaign"
            value={filters.q}
            onChange={(event) => {
              void setFilters({ q: event.target.value, page: 1 });
            }}
            aria-label="Search by campaign"
          />
          {filters.q ? (
            <InputActionButton
              position="tail"
              type="button"
              onClick={() => updateFilter("q", "")}
              aria-label="Clear search"
            >
              <X className="size-4" />
            </InputActionButton>
          ) : null}
        </InputContainer>
      </div>

      {hasActiveFilters ? (
        <ActiveFilterChipsBar onClearAll={handleClearAll}>
          {filters.q ? (
            <ActiveFilterChip
              label={`Search: "${filters.q}"`}
              onRemove={() => updateFilter("q", "")}
            />
          ) : null}
          {filters.dealer !== FILTER_ALL ? (
            <ActiveFilterChip
              label={`Dealer: ${filters.dealer}`}
              onRemove={() => updateFilter("dealer", FILTER_ALL)}
            />
          ) : null}
          {filters.timeZone !== FILTER_ALL ? (
            <ActiveFilterChip
              label={`Time Zone: ${
                timeZoneFilterOptions.find(
                  (option) => option.value === filters.timeZone,
                )?.label ?? filters.timeZone
              }`}
              onRemove={() => updateFilter("timeZone", FILTER_ALL)}
            />
          ) : null}
          {filters.status !== FILTER_ALL ? (
            <ActiveFilterChip
              label={`Status: ${filters.status}`}
              onRemove={() => updateFilter("status", FILTER_ALL)}
            />
          ) : null}
        </ActiveFilterChipsBar>
      ) : null}
    </section>
  );
}

interface FilterSelectProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onValueChange: (value: string) => void;
  className?: string;
}

function FilterSelect({
  label,
  value,
  options,
  onValueChange,
  className,
}: FilterSelectProps) {
  return (
    <Select
      value={value}
      onValueChange={(next) => {
        if (next == null) return;
        onValueChange(next);
      }}
      items={options}
    >
      <SelectTrigger
        size="lg"
        aria-label={label}
        className={cn("control-hover-stroke", className)}
      >
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
