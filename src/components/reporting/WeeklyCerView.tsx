"use client";

import { useMemo, useState } from "react";
import {
  Button,
  Input,
  InputContainer,
} from "@ikontechnologies-arlington/nxtg-design-shiftpackage/primitives";
import { FILTER_ALL } from "@/data/lookups";
import { WEEKLY_CER_WEEKS } from "@/data/reporting.mock";
import { formatMessageCount } from "@/lib/format";
import {
  buildCsv,
  downloadCsv,
  filterWeeklyPerformance,
  formatCerPercent,
  getWeeklyCerPercent,
  listWeeklyDealers,
  WEEKLY_MESSAGE_LABELS,
  WEEKLY_MESSAGE_TYPES,
  WEEKLY_METRIC_ROWS,
} from "@/lib/reporting";
import {
  ReportingEmptyState,
  ReportingExportButton,
  ReportingFieldLabel,
  ReportingSelect,
} from "@/components/reporting/reporting-ui";
import { cn } from "@/lib/utils";

const MONTH_OPTIONS = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const YEAR_OPTIONS = [
  { value: "2026", label: "2026" },
  { value: "2025", label: "2025" },
];

interface WeeklyFilterDraft {
  year: string;
  month: string;
  dealer: string;
  dealerQuery: string;
}

const DEFAULT_FILTERS: WeeklyFilterDraft = {
  year: "2026",
  month: "8",
  dealer: FILTER_ALL,
  dealerQuery: "",
};

export function WeeklyCerView() {
  const [draft, setDraft] = useState<WeeklyFilterDraft>(DEFAULT_FILTERS);
  const [applied, setApplied] = useState<WeeklyFilterDraft>(DEFAULT_FILTERS);

  const dealerOptions = useMemo(() => {
    const query = draft.dealerQuery.trim().toLowerCase();
    const dealers = listWeeklyDealers(WEEKLY_CER_WEEKS).filter((dealer) =>
      dealer.toLowerCase().includes(query),
    );
    return [
      { value: FILTER_ALL, label: "All dealers" },
      ...dealers.map((dealer) => ({ value: dealer, label: dealer })),
    ];
  }, [draft.dealerQuery]);

  const weeks = useMemo(
    () =>
      filterWeeklyPerformance(WEEKLY_CER_WEEKS, {
        year: Number(applied.year),
        month: Number(applied.month),
        dealer: applied.dealer,
      }),
    [applied],
  );

  const handleExport = () => {
    const headers = [
      "Week",
      "Dealer",
      "Metric",
      ...WEEKLY_MESSAGE_TYPES.map((type) => WEEKLY_MESSAGE_LABELS[type]),
    ];
    const rows = weeks.flatMap((week) =>
      WEEKLY_METRIC_ROWS.map((metric) => [
        week.label,
        week.dealer,
        metric.label,
        ...WEEKLY_MESSAGE_TYPES.map((type) => {
          const metrics = week.metricsByMessage[type];
          if (metric.key === "sent") return String(metrics.sent);
          if (metric.key === "clicks") return String(metrics.clicks);
          return formatCerPercent(
            getWeeklyCerPercent(metrics.sent, metrics.clicks),
          );
        }),
      ]),
    );
    downloadCsv("smart-service-lead-weekly-cer.csv", buildCsv(headers, rows));
  };

  return (
    <div className="flex flex-col gap-6">
      <section className="space-y-3" aria-label="Weekly CER filters">
        <div className="flex flex-wrap items-end gap-2.5">
          <div className="w-full min-w-[8rem] sm:w-[8rem]">
            <ReportingFieldLabel>Year</ReportingFieldLabel>
            <ReportingSelect
              label="Year"
              value={draft.year}
              options={YEAR_OPTIONS}
              onValueChange={(year) => setDraft((current) => ({ ...current, year }))}
              className="w-full"
            />
          </div>
          <div className="w-full min-w-[11rem] sm:w-[11rem]">
            <ReportingFieldLabel>Month</ReportingFieldLabel>
            <ReportingSelect
              label="Month"
              value={draft.month}
              options={MONTH_OPTIONS}
              onValueChange={(month) =>
                setDraft((current) => ({ ...current, month }))
              }
              className="w-full"
            />
          </div>
          <div className="w-full min-w-[12rem] sm:w-[14rem]">
            <ReportingFieldLabel>Search dealers</ReportingFieldLabel>
            <InputContainer size="lg" className="control-hover-stroke">
              <Input
                standalone={false}
                size="lg"
                type="search"
                placeholder="Search dealer"
                value={draft.dealerQuery}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    dealerQuery: event.target.value,
                  }))
                }
                aria-label="Search dealers"
              />
            </InputContainer>
          </div>
          <div className="w-full min-w-[14rem] sm:w-[16rem]">
            <ReportingFieldLabel>Dealer</ReportingFieldLabel>
            <ReportingSelect
              label="Dealer"
              value={draft.dealer}
              options={dealerOptions}
              onValueChange={(dealer) =>
                setDraft((current) => ({ ...current, dealer }))
              }
              className="w-full"
            />
          </div>
          <Button size="lg" onClick={() => setApplied(draft)}>
            Apply Filters
          </Button>
          <ReportingExportButton
            onExport={handleExport}
            disabled={weeks.length === 0}
          />
        </div>
      </section>

      {weeks.length === 0 ? (
        <ReportingEmptyState
          title="No weekly CER for these filters"
          description="Choose another year, month, or dealer, then apply filters. August 2026 has portfolio data across Ikon, Premier, and Lakeside rooftops."
          actionLabel="Reset filters"
          onAction={() => {
            setDraft(DEFAULT_FILTERS);
            setApplied(DEFAULT_FILTERS);
          }}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {weeks.map((week) => (
            <article
              key={week.id}
              className="surface-stroke-sharp overflow-hidden rounded-[var(--radius-sm)] bg-card"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">
                    Weekly Performance
                  </h2>
                  <p className="text-xs text-muted-foreground">{week.dealer}</p>
                </div>
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground">
                  {week.label}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm">
                  <thead>
                    <tr className="bg-[#fafafa] text-left text-muted-foreground">
                      <th className="px-4 py-2.5 font-medium">Message Type</th>
                      {WEEKLY_MESSAGE_TYPES.map((type) => (
                        <th key={type} className="px-4 py-2.5 font-medium">
                          {WEEKLY_MESSAGE_LABELS[type]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {WEEKLY_METRIC_ROWS.map((metric) => (
                      <tr key={metric.key} className="border-t border-border">
                        <td className="px-4 py-2.5 font-medium text-foreground">
                          {metric.label}
                        </td>
                        {WEEKLY_MESSAGE_TYPES.map((type) => {
                          const metrics = week.metricsByMessage[type];
                          const isCer = metric.key === "cer";
                          const value = isCer
                            ? formatCerPercent(
                                getWeeklyCerPercent(metrics.sent, metrics.clicks),
                              )
                            : formatMessageCount(
                                metric.key === "sent"
                                  ? metrics.sent
                                  : metrics.clicks,
                              );
                          return (
                            <td
                              key={type}
                              className={cn(
                                "px-4 py-2.5",
                                isCer
                                  ? "font-semibold text-emerald-700"
                                  : "text-foreground",
                              )}
                            >
                              {value}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
