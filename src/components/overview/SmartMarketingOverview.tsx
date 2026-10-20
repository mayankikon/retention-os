"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@ikontechnologies-arlington/nxtg-design-shiftpackage/primitives";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  SquareArrowOutUpRight,
} from "lucide-react";
import { AccountEmptyState } from "@/components/accounts/AccountEmptyState";
import { TitleBar } from "@/components/layout/TitleBar";
import { OverviewAccountTable } from "@/components/overview/OverviewAccountTable";
import { FILTER_ALL } from "@/data/lookups";
import { useAccounts, useUpdateSmartMarketing } from "@/hooks/use-accounts";
import { useCampaigns } from "@/hooks/use-campaigns";
import {
  SMART_MARKETING_FILTER_OFF,
  SMART_MARKETING_FILTER_ON,
  filterAccounts,
  resolveAccountEmptyStateVariant,
} from "@/lib/account-filters";
import { getTotalPages, paginateItems } from "@/lib/pagination";
import {
  OVERVIEW_PAGE_SIZE,
  getNextOverviewSort,
  getOverviewStats,
  sortOverviewAccounts,
  type OverviewSort,
} from "@/lib/smart-marketing-overview";
import { cn } from "@/lib/utils";

const overviewParsers = {
  q: parseAsString.withDefault(""),
  eligibility: parseAsString.withDefault(FILTER_ALL),
  smartMarketing: parseAsString.withDefault(FILTER_ALL),
  page: parseAsInteger.withDefault(1),
};

const ELIGIBILITY_OPTIONS = [
  { value: FILTER_ALL, label: "All" },
  { value: "eligible", label: "Eligible" },
  { value: "not_eligible", label: "Ineligible" },
];

const ACTIVE_STATUS_OPTIONS = [
  { value: FILTER_ALL, label: "All" },
  { value: SMART_MARKETING_FILTER_ON, label: "Enabled" },
  { value: SMART_MARKETING_FILTER_OFF, label: "Disabled" },
];

/** Figma "Universal Dropdown": shows its label until a value is picked. */
function OverviewDropdown({
  label,
  value,
  options,
  onValueChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onValueChange: (value: string) => void;
}) {
  const selected = options.find((option) => option.value === value);
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
        aria-label={label}
        className="control-hover-stroke h-10 gap-4 rounded-[4px] bg-white px-4 text-[16px] leading-[22px] text-[#111] data-[size=default]:h-10 [&_svg:not([class*='size-'])]:size-6"
      >
        <span>
          {value === FILTER_ALL || !selected ? label : selected.label}
        </span>
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

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 rounded-lg border border-[#dcdcdc] bg-white p-4">
      <p className="text-[12px] leading-4 text-[#525c66]">{label}</p>
      <p className="text-[24px] font-semibold leading-[29px] text-black">
        {value}
      </p>
    </div>
  );
}

function OverviewPagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const arrowClassName =
    "flex cursor-pointer items-center border border-[#dcdcdc] bg-white p-2 text-[#111] hover:bg-[#f4f4f4] disabled:cursor-not-allowed disabled:text-[#b4b4b4] disabled:hover:bg-white";
  return (
    <nav aria-label="Pagination" className="flex overflow-clip rounded-[4px]">
      <button
        type="button"
        className={cn(arrowClassName, "rounded-l-[4px]")}
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="size-6" aria-hidden />
      </button>
      <p className="flex items-center gap-px border-y border-[#dcdcdc] bg-white px-3 py-[9px] text-[16px] leading-[22px] whitespace-nowrap">
        <span className="text-[#111]">{page}</span>
        <span className="text-[#8f8f8f]">/</span>
        <span className="text-[#8f8f8f]">{totalPages}</span>
      </p>
      <button
        type="button"
        className={cn(arrowClassName, "rounded-r-[4px]")}
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
      >
        <ChevronRight className="size-6" aria-hidden />
      </button>
    </nav>
  );
}

/** Smart Marketing overview (Figma: Campaign Builder MVP › 2475:2974). */
export function SmartMarketingOverview() {
  const router = useRouter();
  const accounts = useAccounts();
  const campaigns = useCampaigns();
  const updateSmartMarketing = useUpdateSmartMarketing();
  const [filters, setFilters] = useQueryStates(overviewParsers);
  const [sort, setSort] = useState<OverviewSort | null>(null);

  const stats = useMemo(
    () => getOverviewStats(accounts, campaigns),
    [accounts, campaigns],
  );
  const filtered = useMemo(
    () => sortOverviewAccounts(filterAccounts(accounts, filters), sort),
    [accounts, filters, sort],
  );
  const totalPages = getTotalPages(filtered.length, OVERVIEW_PAGE_SIZE);
  const page = Math.min(Math.max(1, filters.page), totalPages);
  const rows = paginateItems(filtered, page, OVERVIEW_PAGE_SIZE);
  const emptyVariant = resolveAccountEmptyStateVariant(
    accounts.length,
    filtered.length,
    filters,
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-16">
      <TitleBar
        className="mt-0 min-h-0 gap-0 pt-4 pb-0"
        top={
          <span className="text-[12px] leading-4 text-[color:var(--theme-text-secondary)]">
            Smart Marketing
          </span>
        }
        title="Smart Marketing"
        right={
          <Button
            size="header"
            className="gap-2.5 px-4"
            leadingIcon={<SquareArrowOutUpRight className="size-6" aria-hidden />}
            onClick={() => router.push("/campaigns")}
          >
            Go to Campaign Builder
          </Button>
        }
      />

      <section
        aria-label="Smart Marketing summary"
        className="app-shell-content-px mt-6 flex gap-4"
      >
        <StatCard label="Eligible" value={stats.eligible} />
        <StatCard label="Enabled" value={stats.enabled} />
        <StatCard label="Live" value={stats.live} />
      </section>

      <div className="app-shell-content-px mt-6 flex items-start">
        <label className="flex h-10 w-[250px] shrink-0 items-center gap-2 rounded-[4px] border border-[#dcdcdc] bg-white px-2 py-1.5 focus-within:border-[#b4b4b4]">
          <Search className="size-6 shrink-0 text-[#666]" aria-hidden />
          <input
            type="search"
            value={filters.q}
            onChange={(event) =>
              void setFilters({ q: event.target.value, page: 1 })
            }
            placeholder="Search"
            aria-label="Search dealerships"
            className="min-w-0 flex-1 bg-transparent text-[16px] leading-[22px] text-[#111] outline-none placeholder:text-[#8f8f8f]"
          />
        </label>
        <div className="flex min-w-0 flex-1 items-center justify-end gap-4">
          <OverviewDropdown
            label="Eligibility"
            value={filters.eligibility}
            options={ELIGIBILITY_OPTIONS}
            onValueChange={(eligibility) =>
              void setFilters({ eligibility, page: 1 })
            }
          />
          <OverviewDropdown
            label="Active Status"
            value={filters.smartMarketing}
            options={ACTIVE_STATUS_OPTIONS}
            onValueChange={(smartMarketing) =>
              void setFilters({ smartMarketing, page: 1 })
            }
          />
          <OverviewPagination
            page={page}
            totalPages={totalPages}
            onPageChange={(nextPage) => void setFilters({ page: nextPage })}
          />
        </div>
      </div>

      <div className="mt-4">
        {emptyVariant ? (
          <div className="app-shell-content-px">
            <AccountEmptyState
              variant={emptyVariant}
              onReset={() =>
                void setFilters({
                  q: "",
                  eligibility: FILTER_ALL,
                  smartMarketing: FILTER_ALL,
                  page: 1,
                })
              }
            />
          </div>
        ) : (
          <OverviewAccountTable
            accounts={rows}
            sort={sort}
            onSortChange={(key) => setSort((current) => getNextOverviewSort(current, key))}
            onSmartMarketingChange={updateSmartMarketing}
          />
        )}
      </div>
    </div>
  );
}
