"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ikontechnologies-arlington/nxtg-design-shiftpackage/primitives";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import {
  dealerGroupFilterOptions,
  FILTER_ALL,
  getDealerFilterOptionsForGroup,
  isDealerInGroup,
} from "@/data/lookups";
import { cn } from "@/lib/utils";

const scopeParsers = {
  group: parseAsString.withDefault(FILTER_ALL),
  dealer: parseAsString.withDefault(FILTER_ALL),
  page: parseAsInteger.withDefault(1),
};

interface DealershipScopeBarProps {
  className?: string;
}

export function DealershipScopeBar({ className }: DealershipScopeBarProps) {
  const [filters, setFilters] = useQueryStates(scopeParsers, {
    shallow: false,
    history: "push",
  });

  const dealerOptions = getDealerFilterOptionsForGroup(filters.group);

  const handleGroupChange = (group: string) => {
    const nextDealer = isDealerInGroup(filters.dealer, group)
      ? filters.dealer
      : FILTER_ALL;
    void setFilters({
      group,
      dealer: nextDealer,
      page: 1,
    });
  };

  const handleDealerChange = (dealer: string) => {
    void setFilters({
      dealer,
      page: 1,
    });
  };

  return (
    <section
      className={cn(
        "flex h-14 shrink-0 items-center justify-start gap-2.5",
        className,
      )}
      aria-label="Dealership Scope"
    >
      <ScopeSelect
        label="Group"
        value={filters.group}
        options={dealerGroupFilterOptions}
        onValueChange={handleGroupChange}
        className="w-[11.5rem] sm:w-[13rem]"
      />
      <ScopeSelect
        label="Dealer"
        value={filters.dealer}
        options={dealerOptions}
        onValueChange={handleDealerChange}
        className="w-[11.5rem] sm:w-[13rem]"
      />
    </section>
  );
}

interface ScopeSelectProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onValueChange: (value: string) => void;
  className?: string;
}

function ScopeSelect({
  label,
  value,
  options,
  onValueChange,
  className,
}: ScopeSelectProps) {
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
        className={cn(
          "control-hover-stroke !h-[calc(2.25rem+8px)] !min-h-[calc(2.25rem+8px)]",
          className,
        )}
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
