"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { parseAsInteger, parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";
import { buttonVariants } from "@ikontechnologies-arlington/nxtg-design-shiftpackage/primitives";
import { ArrowLeft } from "lucide-react";
import { TitleBar } from "@/components/layout/TitleBar";
import { ReportDateRangeFilter } from "@/components/reports/ReportDateRangeFilter";
import { cn } from "@/lib/utils";
import { REPORTING_ROOFTOPS } from "@/data/reporting.mock";
import {
  DEFAULT_REPORT_DATE_PRESET,
  normalizeReportDateRange,
  resolveReportDatePreset,
  toIsoDate,
} from "@/lib/report-date-range";
import { findDealershipById } from "@/lib/reports";
import { REPORT_PERFORMANCE_MODES } from "@/types/reports";
import type { ReportDateRange } from "@/types/reports";

interface ReportShellProps {
  children: React.ReactNode;
}

const reportDateParsers = {
  mode: parseAsStringLiteral(REPORT_PERFORMANCE_MODES).withDefault("monthly"),
  from: parseAsString.withDefault(""),
  to: parseAsString.withDefault(""),
  page: parseAsInteger.withDefault(1),
};

export function ReportShell({ children }: ReportShellProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isActivity = pathname.startsWith("/reports/activity");
  const dealership = findDealershipById(
    REPORTING_ROOFTOPS,
    searchParams.get("dealership") ?? "",
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <TitleBar
        titleLeading={isActivity ? <ReportActivityBackButton /> : undefined}
        title={isActivity ? (dealership?.rooftop ?? "Activity") : "Reports"}
        subtitle={
          isActivity
            ? dealership
              ? "Customers who clicked for this dealership."
              : "Every customer click row, labeled by dealership."
            : undefined
        }
        right={isActivity ? undefined : <ReportDateRangeControl />}
      />

      <div className="app-shell-content-px app-shell-content-pb app-shell-scrollbar-dashed flex min-h-0 flex-1 flex-col overflow-y-auto pt-6">
        {children}
      </div>
    </div>
  );
}

function ReportActivityBackButton() {
  return (
    <Link
      href="/reports"
      aria-label="Back to Reports"
      className={cn(
        buttonVariants({ variant: "outline" }),
        "inline-flex shrink-0 items-center gap-1.5",
      )}
    >
      <ArrowLeft className="h-4 w-4" aria-hidden />
      Back
    </Link>
  );
}

function ReportDateRangeControl() {
  const [filters, setFilters] = useQueryStates(reportDateParsers);
  const today = useMemo(() => toIsoDate(new Date()), []);
  const defaultDateRange = useMemo(
    () => resolveReportDatePreset(DEFAULT_REPORT_DATE_PRESET, today),
    [today],
  );
  const dateRange = useMemo(
    () =>
      normalizeReportDateRange(
        { startDate: filters.from, endDate: filters.to },
        defaultDateRange,
      ),
    [defaultDateRange, filters.from, filters.to],
  );

  const handleDateRangeChange = (range: ReportDateRange) => {
    void setFilters({
      from: range.startDate,
      to: range.endDate,
      page: 1,
    });
  };

  if (filters.mode === "weekly") return null;

  return (
    <ReportDateRangeFilter
      value={dateRange}
      today={today}
      onValueChange={handleDateRangeChange}
    />
  );
}
