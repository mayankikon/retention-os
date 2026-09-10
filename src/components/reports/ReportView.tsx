"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableHeaderCell,
  TableRow,
  TableSlotCell,
} from "@ikontechnologies-arlington/nxtg-design-shiftpackage/primitives";
import { DesignSystemTableShellNoTabs } from "@ikontechnologies-arlington/nxtg-design-shiftpackage";
import { parseAsInteger, parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";
import { PaginationBar } from "@/components/campaigns/PaginationBar";
import { ScopeSelect } from "@/components/campaigns/DealershipScopeBar";
import {
  ReportingEmptyState,
  ReportingExportButton,
  ReportingSummaryCard,
} from "@/components/reporting/reporting-ui";
import { FILTER_ALL } from "@/data/lookups";
import { REPORTING_ROOFTOPS, WEEKLY_CER_WEEKS } from "@/data/reporting.mock";
import { getAllCampaigns } from "@/lib/campaign-lookup";
import {
  DATA_TABLE_BODY_CELL_HEIGHT_PX,
  DATA_TABLE_CELL_INNER_HOVER_CLASS,
  DATA_TABLE_CELL_INSET_CLASS,
  DATA_TABLE_CLASS,
  DATA_TABLE_HEADER_CLASS,
  DATA_TABLE_HEADER_LABEL_CLASS,
  DATA_TABLE_HEADER_ROW_CLASS,
  DATA_TABLE_ROW_GROUP_CLASS,
  DATA_TABLE_ROW_HOVER_BACKGROUND_CLASS,
  DATA_TABLE_SHELL_BORDER_CLASS,
  DATA_TABLE_SLOT_LABEL_CLASS,
  getDataTableBodyCellFrameClass,
  getDataTableHeaderCellStyle,
  getDataTableHeaderThStyle,
  getDataTableInnerCellStyle,
} from "@/lib/data-table-chrome";
import { ReportToggleGroup } from "@/components/reports/ReportToggleGroup";
import { ReportWeeklyPerformance } from "@/components/reports/ReportWeeklyPerformance";
import {
  DEFAULT_REPORT_DATE_PRESET,
  getPrecedingReportDateRange,
  normalizeReportDateRange,
  resolveReportDatePreset,
  toIsoDate,
} from "@/lib/report-date-range";
import {
  aggregateReportWeeks,
  REPORT_PERFORMANCE_MODE_LABELS,
  REPORT_RANK_METRIC_LABELS,
  describeReportWeeklyScope,
  filterReportWeeks,
  formatReportCampaignLabel,
  formatSignedPercent,
  isReportDealershipInGroup,
  listReportDealerships,
  listReportGroups,
  paginateReportItems,
  rankReportDealerships,
  rankReportRowsByMetric,
  summarizeReportKpis,
} from "@/lib/reports";
import { formatMessageCount } from "@/lib/format";
import {
  buildCsv,
  downloadCsv,
  formatCerPercent,
  getWeeklyCerPercent,
  WEEKLY_MESSAGE_LABELS,
  WEEKLY_MESSAGE_TYPES,
  WEEKLY_METRIC_ROWS,
} from "@/lib/reporting";
import { cn } from "@/lib/utils";
import {
  REPORT_PERFORMANCE_MODES,
  REPORT_RANK_METRICS,
} from "@/types/reports";
import type { ReportRankMetric } from "@/types/reports";
import type { WeeklyMessageMetrics } from "@/types/reporting";

const REPORT_HEADERS = [
  { key: "rank", label: "Rank", widthClassName: "min-w-[72px] w-[80px]" },
  {
    key: "dealership",
    label: "Dealership",
    widthClassName: "min-w-[200px] w-[220px]",
  },
  { key: "group", label: "Group", widthClassName: "min-w-[160px] w-[180px]" },
  {
    key: "campaign",
    label: "Campaign",
    widthClassName: "min-w-[200px] w-[220px]",
  },
  { key: "messages", label: "Messages", widthClassName: "min-w-[96px] w-[108px]" },
  {
    key: "firstMessage",
    label: "First message",
    widthClassName: "min-w-[120px] w-[132px]",
  },
  { key: "retried", label: "Retried", widthClassName: "min-w-[88px] w-[100px]" },
  { key: "clicks", label: "Clicks", widthClassName: "min-w-[80px] w-[92px]" },
  {
    key: "firstTime",
    label: "First-time",
    widthClassName: "min-w-[100px] w-[112px]",
  },
  { key: "cer", label: "CER %", widthClassName: "min-w-[88px] w-[100px]" },
] as const;

const REPORT_METRIC_FILTER_OPTIONS = REPORT_RANK_METRICS.map((metric) => ({
  value: metric,
  label: REPORT_RANK_METRIC_LABELS[metric],
}));

type WeeklyMetricKey = (typeof WEEKLY_METRIC_ROWS)[number]["key"];

function formatWeeklyCsvValue(
  metrics: WeeklyMessageMetrics,
  metricKey: WeeklyMetricKey,
): string {
  if (metricKey === "sent") return String(metrics.sent);
  if (metricKey === "clicks") return String(metrics.clicks);
  return formatCerPercent(getWeeklyCerPercent(metrics.sent, metrics.clicks));
}

const reportParsers = {
  group: parseAsString.withDefault(FILTER_ALL),
  dealer: parseAsString.withDefault(FILTER_ALL),
  mode: parseAsStringLiteral(REPORT_PERFORMANCE_MODES).withDefault(
    "monthly",
  ),
  metric: parseAsStringLiteral(REPORT_RANK_METRICS),
  from: parseAsString.withDefault(""),
  to: parseAsString.withDefault(""),
  page: parseAsInteger.withDefault(1),
};

export function ReportView() {
  const [filters, setFilters] = useQueryStates(reportParsers);
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
  const comparisonDateRange = useMemo(
    () => getPrecedingReportDateRange(dateRange),
    [dateRange],
  );
  const campaigns = useMemo(() => getAllCampaigns(), []);
  const currentWeeks = useMemo(
    () =>
      filterReportWeeks(
        WEEKLY_CER_WEEKS,
        REPORTING_ROOFTOPS,
        filters.group,
        filters.dealer,
      ),
    [filters.dealer, filters.group],
  );

  const rows = useMemo(
    () =>
      rankReportDealerships({
        rooftops: REPORTING_ROOFTOPS,
        weeks: currentWeeks,
        mode: filters.mode,
        dealership: filters.dealer,
        group: filters.group,
        campaigns,
        dateRange,
        today,
      }),
    [
      campaigns,
      currentWeeks,
      dateRange,
      filters.dealer,
      filters.group,
      filters.mode,
      today,
    ],
  );
  const previousRows = useMemo(
    () =>
      rankReportDealerships({
        rooftops: REPORTING_ROOFTOPS,
        weeks: currentWeeks,
        mode: filters.mode,
        dealership: filters.dealer,
        group: filters.group,
        campaigns,
        dateRange: comparisonDateRange,
        today,
      }),
    [
      campaigns,
      comparisonDateRange,
      currentWeeks,
      filters.dealer,
      filters.group,
      filters.mode,
      today,
    ],
  );
  const kpis = useMemo(
    () => summarizeReportKpis(rows, previousRows),
    [previousRows, rows],
  );
  const rankedRows = useMemo(
    () =>
      filters.metric == null
        ? rows
        : rankReportRowsByMetric(rows, previousRows, filters.metric),
    [filters.metric, previousRows, rows],
  );
  const weeklySections = useMemo(
    () => aggregateReportWeeks(currentWeeks),
    [currentWeeks],
  );
  const weeklyScope = useMemo(
    () =>
      describeReportWeeklyScope({
        rooftops: REPORTING_ROOFTOPS,
        weeks: currentWeeks,
        group: filters.group,
        dealership: filters.dealer,
      }),
    [currentWeeks, filters.dealer, filters.group],
  );
  const pagedWeeks = useMemo(
    () => paginateReportItems(weeklySections, filters.page),
    [filters.page, weeklySections],
  );
  const pagedRows = useMemo(
    () => paginateReportItems(rankedRows, filters.page),
    [filters.page, rankedRows],
  );
  const currentPage =
    filters.mode === "weekly" ? pagedWeeks : pagedRows;

  const groupOptions = useMemo(
    () => [
      { value: FILTER_ALL, label: "All Groups" },
      ...listReportGroups(REPORTING_ROOFTOPS).map((group) => ({
        value: group,
        label: group,
      })),
    ],
    [],
  );
  const dealerOptions = useMemo(
    () => [
      { value: FILTER_ALL, label: "All Dealers" },
      ...listReportDealerships(REPORTING_ROOFTOPS, filters.group).map(
        (dealership) => ({
          value: dealership,
          label: dealership,
        }),
      ),
    ],
    [filters.group],
  );

  const handlePageChange = (page: number) => {
    void setFilters({ page });
  };

  const handleClearFilters = () => {
    void setFilters({
      group: FILTER_ALL,
      dealer: FILTER_ALL,
      metric: null,
      from: defaultDateRange.startDate,
      to: defaultDateRange.endDate,
      page: 1,
    });
  };

  const handleExport = () => {
    if (filters.mode === "weekly") {
      const headers = [
        "Scope",
        "Week",
        "Metric",
        ...WEEKLY_MESSAGE_TYPES.map((type) => WEEKLY_MESSAGE_LABELS[type]),
        "Total",
      ];
      const csvRows = weeklySections.flatMap((section) =>
        WEEKLY_METRIC_ROWS.map((metric) => [
          weeklyScope.name,
          section.label,
          metric.label,
          ...WEEKLY_MESSAGE_TYPES.map((type) =>
            formatWeeklyCsvValue(section.metricsByMessage[type], metric.key),
          ),
          formatWeeklyCsvValue(section.totals, metric.key),
        ]),
      );
      downloadCsv("reports-weekly-performance.csv", buildCsv(headers, csvRows));
      return;
    }

    const csv = buildCsv(
      [
        "Rank",
        "Dealership",
        "Group",
        "Campaign",
        "Messages",
        "First message",
        "Retried",
        "Clicks",
        "First-time",
        "CER %",
      ],
      rankedRows.map((row) => [
        row.rank == null ? "—" : String(row.rank),
        row.dealership,
        row.group,
        formatReportCampaignLabel(row.campaign),
        String(row.messages),
        String(row.firstMessage),
        String(row.retried),
        String(row.clicks),
        String(row.firstTime),
        formatCerPercent(row.cerPercent),
      ]),
    );
    downloadCsv("reports-monthly-performance.csv", csv);
  };

  const headerThStyle = getDataTableHeaderThStyle();
  const headerCellStyle = getDataTableHeaderCellStyle();
  const innerStyle = getDataTableInnerCellStyle();

  return (
    <div className="flex flex-col gap-6 pb-2">
      <section className="space-y-3" aria-label="Report filters">
        <div className="flex flex-wrap items-center gap-2.5">
          <ScopeSelect
            label="Group"
            value={filters.group}
            options={groupOptions}
            onValueChange={(group) => {
              const nextDealer = isReportDealershipInGroup(
                REPORTING_ROOFTOPS,
                filters.dealer,
                group,
              )
                ? filters.dealer
                : FILTER_ALL;
              void setFilters({ group, dealer: nextDealer, page: 1 });
            }}
            className="w-[11.5rem] sm:w-[13rem]"
          />
          <ScopeSelect
            label="Dealer"
            value={filters.dealer}
            options={dealerOptions}
            onValueChange={(dealer) => {
              void setFilters({ dealer, page: 1 });
            }}
            className="w-[11.5rem] sm:w-[13rem]"
          />
          <div className="ml-auto flex flex-wrap items-center justify-end gap-2.5">
            {filters.mode === "monthly" ? (
              <ScopeSelect
                label="Sort By"
                triggerLabel="Sort By"
                value={filters.metric ?? ""}
                options={REPORT_METRIC_FILTER_OPTIONS}
                onValueChange={(metric) => {
                  void setFilters({
                    metric: metric as ReportRankMetric,
                    page: 1,
                  });
                }}
                className="w-[11.5rem] sm:w-[13rem]"
              />
            ) : null}
            <ReportToggleGroup
              label="Performance mode"
              value={filters.mode}
              options={REPORT_PERFORMANCE_MODES.map((mode) => ({
                id: mode,
                label: REPORT_PERFORMANCE_MODE_LABELS[mode],
              }))}
              onValueChange={(mode) => {
                void setFilters({ mode, page: 1 });
              }}
            />
            <ReportingExportButton
              onExport={handleExport}
              disabled={
                filters.mode === "weekly"
                  ? currentWeeks.length === 0
                  : rows.length === 0
              }
            />
          </div>
        </div>
      </section>

      {filters.mode === "monthly" ? (
        <section
          className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
          aria-label="Report KPIs"
        >
          <ReportingSummaryCard
            label="Messages sent"
            value={formatMessageCount(kpis.messagesSent)}
          />
          <ReportingSummaryCard
            label="Total clicks"
            value={formatMessageCount(kpis.totalClicks)}
          />
          <ReportingSummaryCard
            label="Reminder Uplift"
            value={formatSignedPercent(kpis.upliftPercent)}
          />
          <ReportingSummaryCard
            label="CER %"
            value={formatCerPercent(kpis.cerPercent)}
          />
        </section>
      ) : null}

      {filters.mode === "weekly" ? (
        currentWeeks.length === 0 ? (
          <ReportingEmptyState
            title="No weekly snapshot matches these filters"
            description="Choose another dealer or group, or clear filters to see every week stacked."
          />
        ) : (
          <ReportWeeklyPerformance
            sections={pagedWeeks.items}
            scope={weeklyScope}
          />
        )
      ) : rows.length === 0 ? (
        <ReportingEmptyState
          title="No dealerships match these filters"
          description="Choose another date range, dealer, or group, or clear filters to see the full ranking."
          actionLabel="Clear filters"
          onAction={handleClearFilters}
        />
      ) : (
        <DesignSystemTableShellNoTabs
          className="min-w-0"
          cardBorderClassName={DATA_TABLE_SHELL_BORDER_CLASS}
          pagination={
            <PaginationBar
              currentPage={pagedRows.page}
              totalPages={pagedRows.totalPages}
              totalItems={pagedRows.totalItems}
              pageSize={pagedRows.pageSize}
              onPageChange={handlePageChange}
            />
          }
        >
          <Table className={DATA_TABLE_CLASS} aria-label="Dealership performance">
            <TableHeader className={DATA_TABLE_HEADER_CLASS}>
              <TableRow size="compact" className={DATA_TABLE_HEADER_ROW_CLASS}>
                {REPORT_HEADERS.map((header) => (
                  <TableHead
                    key={header.key}
                    className={cn(
                      header.widthClassName,
                      "h-auto align-middle",
                      DATA_TABLE_CELL_INSET_CLASS,
                    )}
                    style={headerThStyle}
                  >
                    <TableHeaderCell
                      variant="label"
                      label={header.label}
                      className={DATA_TABLE_HEADER_LABEL_CLASS}
                      style={headerCellStyle}
                    />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedRows.items.map((row, rowIndex) => {
                const isLastRow = rowIndex === pagedRows.items.length - 1;
                const cellFrame = getDataTableBodyCellFrameClass(isLastRow);
                const activityHref = `/reports/activity?dealership=${row.dealershipId}`;
                const values = [
                  row.rank == null ? "—" : String(row.rank),
                  row.dealership,
                  row.group,
                  formatReportCampaignLabel(row.campaign),
                  formatMessageCount(row.messages),
                  formatMessageCount(row.firstMessage),
                  formatMessageCount(row.retried),
                  formatMessageCount(row.clicks),
                  formatMessageCount(row.firstTime),
                  formatCerPercent(row.cerPercent),
                ];

                return (
                  <TableRow
                    key={row.dealershipId}
                    size="default"
                    className={cn(
                      DATA_TABLE_ROW_GROUP_CLASS,
                      "!border-0 !bg-transparent",
                      DATA_TABLE_ROW_HOVER_BACKGROUND_CLASS,
                    )}
                    style={{ minHeight: DATA_TABLE_BODY_CELL_HEIGHT_PX }}
                  >
                    {REPORT_HEADERS.map((header, cellIndex) => {
                      const value = values[cellIndex] ?? "";
                      const isDealership = header.key === "dealership";
                      const isCampaign = header.key === "campaign";
                      return (
                        <TableCell
                          key={`${row.dealershipId}-${header.key}`}
                          className={cellFrame}
                        >
                          {isDealership ? (
                            <div
                              className={cn(
                                "flex min-w-0 items-center gap-2",
                                DATA_TABLE_CELL_INNER_HOVER_CLASS,
                              )}
                              style={innerStyle}
                            >
                              <Link
                                href={activityHref}
                                className={cn(
                                  DATA_TABLE_SLOT_LABEL_CLASS,
                                  "min-w-0 truncate font-medium text-primary hover:underline",
                                )}
                              >
                                {row.dealership}
                              </Link>
                              {row.isLowSample ? (
                                <Badge
                                  tone="amber"
                                  variant="soft"
                                  className="shadow-none"
                                >
                                  Low sample
                                </Badge>
                              ) : null}
                            </div>
                          ) : isCampaign ? (
                            <div
                              className={cn(
                                "flex min-w-0 items-center gap-1.5",
                                DATA_TABLE_CELL_INNER_HOVER_CLASS,
                              )}
                              style={innerStyle}
                              title={formatReportCampaignLabel(row.campaign)}
                            >
                              <span
                                className={cn(
                                  DATA_TABLE_SLOT_LABEL_CLASS,
                                  "min-w-0 truncate",
                                  !row.campaign.name && "text-muted-foreground",
                                )}
                              >
                                {row.campaign.name ?? "—"}
                              </span>
                              {row.campaign.additionalCount > 0 ? (
                                <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
                                  +{row.campaign.additionalCount}
                                </span>
                              ) : null}
                            </div>
                          ) : (
                            <TableSlotCell
                              label={value}
                              className={cn(
                                DATA_TABLE_SLOT_LABEL_CLASS,
                                DATA_TABLE_CELL_INNER_HOVER_CLASS,
                                header.key === "cer" &&
                                  !row.isLowSample &&
                                  "font-medium text-emerald-700",
                                header.key === "group" && "text-muted-foreground",
                              )}
                              style={innerStyle}
                            />
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </DesignSystemTableShellNoTabs>
      )}

      {/* Weekly sections render outside the table shell, so they page below it. */}
      {filters.mode === "weekly" && pagedWeeks.totalItems > 0 ? (
        <PaginationBar
          currentPage={pagedWeeks.page}
          totalPages={pagedWeeks.totalPages}
          totalItems={pagedWeeks.totalItems}
          pageSize={pagedWeeks.pageSize}
          onPageChange={handlePageChange}
        />
      ) : null}
    </div>
  );
}
