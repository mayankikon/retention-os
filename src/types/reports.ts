import type {
  ActivityDetailRow,
  WeeklyMessageMetrics,
  WeeklyMessageType,
} from "@/types/reporting";

export const REPORT_PERFORMANCE_MODES = ["weekly", "monthly"] as const;

export type ReportPerformanceMode =
  (typeof REPORT_PERFORMANCE_MODES)[number];

export const REPORT_RANK_METRICS = [
  "messages",
  "clicks",
  "uplift",
  "cer",
] as const;

export type ReportRankMetric = (typeof REPORT_RANK_METRICS)[number];

/** Inclusive calendar range, stored as local ISO `YYYY-MM-DD` days. */
export interface ReportDateRange {
  startDate: string;
  endDate: string;
}

/** Ordered as they appear in the date filter's preset sidebar. */
export const REPORT_DATE_PRESETS = [
  "monthToDate",
  "lastMonth",
  "last3Days",
  "last7Days",
  "lastWeek",
  "last30Days",
  "last90Days",
  "last6Months",
  "yearToDate",
] as const;

export type ReportDatePresetId = (typeof REPORT_DATE_PRESETS)[number];

export interface ReportCampaignSummary {
  name: string | null;
  additionalCount: number;
}

/** One customer click row, attributed to a single campaign. */
export interface ReportActivityRow extends ActivityDetailRow {
  /** Null when the dealership has no campaign that has sent. */
  campaign: string | null;
  campaignId: string | null;
}

export interface ReportDealershipRow {
  dealershipId: string;
  dealership: string;
  group: string;
  campaign: ReportCampaignSummary;
  messages: number;
  firstMessage: number;
  retried: number;
  clicks: number;
  firstTime: number;
  cerPercent: number;
  isLowSample: boolean;
  rank: number | null;
}

export interface ReportKpis {
  messagesSent: number;
  totalClicks: number;
  upliftPercent: number;
  cerPercent: number;
}

/** One week of weekly performance, summed across every dealer in scope. */
export interface ReportWeeklySection {
  weekId: string;
  label: string;
  startDate: string;
  endDate: string;
  dealershipCount: number;
  metricsByMessage: Record<WeeklyMessageType, WeeklyMessageMetrics>;
  totals: WeeklyMessageMetrics;
}

/** What the weekly stack is scoped to, stated once above the week sections. */
export interface ReportWeeklyScope {
  name: string;
  isCumulative: boolean;
  dealershipCount: number;
  dealershipId: string | null;
}
