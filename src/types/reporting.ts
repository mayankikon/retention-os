export const REPORTING_TABS = [
  "leaderboard",
  "weekly",
  "activity",
] as const;

export type ReportingTab = (typeof REPORTING_TABS)[number];

export const CER_TIME_PERIODS = ["mtd", "lm", "ytd"] as const;

export type CerTimePeriod = (typeof CER_TIME_PERIODS)[number];

export const REPORTING_SCOPES = ["portfolio", "ungrouped"] as const;

export type ReportingScope = (typeof REPORTING_SCOPES)[number];

export const WEEKLY_MESSAGE_TYPES = [
  "initial",
  "reminder1",
  "reminder2",
  "reminder3",
] as const;

export type WeeklyMessageType = (typeof WEEKLY_MESSAGE_TYPES)[number];

export interface CerPeriodMetrics {
  sent: number;
  retried: number;
  clickedFirstTime: number;
}

export interface ReportingRooftop {
  id: string;
  rooftop: string;
  dealerGroup: string;
  isSmEnabled: boolean;
  metricsByPeriod: Record<CerTimePeriod, CerPeriodMetrics>;
}

export interface RankedLeaderboardRow {
  rooftopId: string;
  rooftop: string;
  dealerGroup: string;
  sent: number;
  retried: number;
  clickedFirstTime: number;
  cerPercent: number;
  isLowSample: boolean;
  rank: number | null;
}

export interface WeeklyMessageMetrics {
  sent: number;
  clicks: number;
}

export interface WeeklyPerformanceWeek {
  id: string;
  year: number;
  month: number;
  label: string;
  startDate: string;
  endDate: string;
  dealer: string;
  metricsByMessage: Record<WeeklyMessageType, WeeklyMessageMetrics>;
}

export interface ActivityDetailRow {
  id: string;
  customer: string;
  vin: string;
  phone: string;
  email: string;
  clickDate: string;
  message: string;
  dealer: string;
  rooftop: string;
  mileage: number | null;
}

export interface ActivitySummary {
  messagesSent: number;
  totalClicks: number;
  upliftPercent: number;
  cerPercent: number;
}
