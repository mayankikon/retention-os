import { FILTER_ALL } from "@/data/lookups";
import type {
  ActivityDetailRow,
  ActivitySummary,
  CerTimePeriod,
  RankedLeaderboardRow,
  ReportingRooftop,
  ReportingScope,
  WeeklyMessageType,
  WeeklyPerformanceWeek,
} from "@/types/reporting";
import { WEEKLY_MESSAGE_TYPES } from "@/types/reporting";

/** Rooftops below this sent volume stay visible but are excluded from rank. */
export const MIN_CER_SAMPLE_SENT = 50;

export const MISSING_MILEAGE_DISPLAY = "—";

export const WEEKLY_MESSAGE_LABELS: Record<WeeklyMessageType, string> = {
  initial: "Initial",
  reminder1: "Reminder 1",
  reminder2: "Reminder 2",
  reminder3: "Reminder 3",
};

export const CER_TIME_PERIOD_LABELS: Record<CerTimePeriod, string> = {
  mtd: "MTD",
  lm: "LM",
  ytd: "YTD",
};

export function calculateCerPercent(
  clickedFirstTime: number,
  sent: number,
): number {
  if (sent <= 0) return 0;
  return (clickedFirstTime / sent) * 100;
}

export function formatCerPercent(cerPercent: number): string {
  return `${cerPercent.toFixed(1)}%`;
}

export function formatMileage(mileage: number | null): string {
  if (mileage == null) return MISSING_MILEAGE_DISPLAY;
  return mileage.toLocaleString("en-US");
}

export function countSmEnabledRooftopsInGroup(
  rooftops: ReportingRooftop[],
  dealerGroup: string,
): number {
  return rooftops.filter(
    (rooftop) => rooftop.dealerGroup === dealerGroup && rooftop.isSmEnabled,
  ).length;
}

export function isMultiRooftopGroup(
  rooftops: ReportingRooftop[],
  dealerGroup: string,
): boolean {
  return countSmEnabledRooftopsInGroup(rooftops, dealerGroup) >= 2;
}

export function canShowCerLeaderboard(scope: ReportingScope): boolean {
  return scope === "portfolio";
}

export function rankRooftopsByCer(
  rooftops: ReportingRooftop[],
  period: CerTimePeriod,
  searchQuery = "",
): RankedLeaderboardRow[] {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const eligible = rooftops.filter((rooftop) => {
    if (!rooftop.isSmEnabled) return false;
    if (!isMultiRooftopGroup(rooftops, rooftop.dealerGroup)) return false;
    if (!normalizedQuery) return true;
    return (
      rooftop.rooftop.toLowerCase().includes(normalizedQuery) ||
      rooftop.dealerGroup.toLowerCase().includes(normalizedQuery)
    );
  });

  const rows = eligible.map((rooftop) => {
    const metrics = rooftop.metricsByPeriod[period];
    const cerPercent = calculateCerPercent(
      metrics.clickedFirstTime,
      metrics.sent,
    );
    return {
      rooftopId: rooftop.id,
      rooftop: rooftop.rooftop,
      dealerGroup: rooftop.dealerGroup,
      sent: metrics.sent,
      retried: metrics.retried,
      clickedFirstTime: metrics.clickedFirstTime,
      cerPercent,
      isLowSample: metrics.sent < MIN_CER_SAMPLE_SENT,
      rank: null,
    } satisfies RankedLeaderboardRow;
  });

  const qualifying = rows
    .filter((row) => !row.isLowSample)
    .sort(compareLeaderboardRows);
  const lowSample = rows
    .filter((row) => row.isLowSample)
    .sort(compareLeaderboardRows);

  return [
    ...qualifying.map((row, index) => ({ ...row, rank: index + 1 })),
    ...lowSample,
  ];
}

function compareLeaderboardRows(
  left: RankedLeaderboardRow,
  right: RankedLeaderboardRow,
): number {
  if (right.cerPercent !== left.cerPercent) {
    return right.cerPercent - left.cerPercent;
  }
  if (right.sent !== left.sent) {
    return right.sent - left.sent;
  }
  return left.rooftop.localeCompare(right.rooftop);
}

export function filterWeeklyPerformance(
  weeks: WeeklyPerformanceWeek[],
  filters: { year: number; month: number; dealer: string },
): WeeklyPerformanceWeek[] {
  return weeks.filter((week) => {
    if (week.year !== filters.year) return false;
    if (week.month !== filters.month) return false;
    if (filters.dealer !== FILTER_ALL && week.dealer !== filters.dealer) {
      return false;
    }
    return true;
  });
}

export function getWeeklyCerPercent(sent: number, clicks: number): number {
  return calculateCerPercent(clicks, sent);
}

export function listWeeklyDealers(weeks: WeeklyPerformanceWeek[]): string[] {
  return [...new Set(weeks.map((week) => week.dealer))].sort((left, right) =>
    left.localeCompare(right),
  );
}

export function filterActivityRows(
  rows: ActivityDetailRow[],
  filters: {
    dateFrom: string;
    dateTo: string;
    dealer: string;
    rooftop: string;
  },
): ActivityDetailRow[] {
  return rows.filter((row) => {
    if (filters.dateFrom && row.clickDate < filters.dateFrom) return false;
    if (filters.dateTo && row.clickDate > filters.dateTo) return false;
    if (filters.dealer !== FILTER_ALL && row.dealer !== filters.dealer) {
      return false;
    }
    if (filters.rooftop !== FILTER_ALL && row.rooftop !== filters.rooftop) {
      return false;
    }
    return true;
  });
}

export function summarizeActivity(
  rows: ActivityDetailRow[],
  messagesSent: number,
  upliftPercent: number,
): ActivitySummary {
  const totalClicks = rows.length;
  return {
    messagesSent,
    totalClicks,
    upliftPercent,
    cerPercent: calculateCerPercent(totalClicks, messagesSent),
  };
}

export function listActivityDealers(rows: ActivityDetailRow[]): string[] {
  return [...new Set(rows.map((row) => row.dealer))].sort((left, right) =>
    left.localeCompare(right),
  );
}

export function listActivityRooftops(
  rows: ActivityDetailRow[],
  dealer: string,
): string[] {
  const scoped =
    dealer === FILTER_ALL
      ? rows
      : rows.filter((row) => row.dealer === dealer);
  return [...new Set(scoped.map((row) => row.rooftop))].sort((left, right) =>
    left.localeCompare(right),
  );
}

export function buildCsv(headers: string[], rows: string[][]): string {
  const escapeCell = (value: string) => {
    if (/[",\n]/.test(value)) {
      return `"${value.replaceAll('"', '""')}"`;
    }
    return value;
  };

  return [headers, ...rows]
    .map((row) => row.map(escapeCell).join(","))
    .join("\n");
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export const WEEKLY_METRIC_ROWS = [
  { key: "sent", label: "Messages Sent" },
  { key: "clicks", label: "Clicks" },
  { key: "cer", label: "CER %" },
] as const;

export { WEEKLY_MESSAGE_TYPES };
