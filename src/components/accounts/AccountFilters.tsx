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
      className={cn("space-y-2.5", className)}
      aria-label="Account filters"
    >
      <div className="flex shrink-0 flex-wrap items-center gap-2.5">
        <FilterSelect
          label="Eligibility"
          value={filters.eligibility}
          options={eligibilityFilterOptions}
          onValueChange={(value) => updateFilter("eligibility", value)}
          className="w-full min-w-[10.5rem] sm:w-[10.5rem]"
        />
        <FilterSelect
          label="Smart Marketing"
          value={filters.smartMarketing}
          options={smartMarketingFilterOptions}
          onValueChange={(value) => updateFilter("smartMarketing", value)}
          className="w-full min-w-[10.5rem] sm:w-[10.5rem]"
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
            placeholder="Search accounts"
            value={filters.q}
            onChange={(event) => {
              void setFilters({ q: event.target.value, page: 1 });
            }}
            aria-label="Search accounts"
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
          {filters.eligibility !== FILTER_ALL ? (
            <ActiveFilterChip
              label={`Eligibility: ${
                eligibilityFilterOptions.find(
                  (option) => option.value === filters.eligibility,
                )?.label ?? filters.eligibility
              }`}
              onRemove={() => updateFilter("eligibility", FILTER_ALL)}
            />
          ) : null}
          {filters.smartMarketing !== FILTER_ALL ? (
            <ActiveFilterChip
              label={`Smart Marketing: ${
                smartMarketingFilterOptions.find(
                  (option) => option.value === filters.smartMarketing,
                )?.label ?? filters.smartMarketing
              }`}
              onRemove={() => updateFilter("smartMarketing", FILTER_ALL)}
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
