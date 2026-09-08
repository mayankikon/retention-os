import {
  addDays,
  differenceInCalendarDays,
  endOfMonth,
  endOfWeek,
  format,
  isValid,
  parseISO,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
  subMonths,
  subWeeks,
} from "date-fns";
import {
  REPORT_DATE_PRESETS,
  type ReportDatePresetId,
  type ReportDateRange,
} from "@/types/reports";

export const DEFAULT_REPORT_DATE_PRESET: ReportDatePresetId = "monthToDate";

export const REPORT_DATE_PRESET_LABELS: Record<ReportDatePresetId, string> = {
  monthToDate: "This month",
  lastMonth: "Last month",
  last3Days: "Last 3 days",
  last7Days: "Last 7 days",
  lastWeek: "Last week",
  last30Days: "Last 30 days",
  last90Days: "Last 90 days",
  last6Months: "Last 6 months",
  yearToDate: "Year to date",
};

export interface ReportDatePresetOption {
  id: ReportDatePresetId;
  label: string;
  range: ReportDateRange;
}

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Monday-first, matching the design system calendar. */
const WEEK_OPTIONS = { weekStartsOn: 1 } as const;

export function toIsoDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/** Returns null for anything that is not a real `YYYY-MM-DD` day. */
export function parseIsoDate(isoDate: string): Date | null {
  if (!ISO_DATE_PATTERN.test(isoDate)) return null;
  const parsed = parseISO(isoDate);
  if (!isValid(parsed)) return null;
  // parseISO accepts overflowing days such as 2026-02-31, so round-trip it.
  return toIsoDate(parsed) === isoDate ? parsed : null;
}

export function shiftIsoDate(isoDate: string, dayOffset: number): string {
  return toIsoDate(addDays(requireIsoDate(isoDate), dayOffset));
}

export function countReportRangeDays(range: ReportDateRange): number {
  return (
    differenceInCalendarDays(
      requireIsoDate(range.endDate),
      requireIsoDate(range.startDate),
    ) + 1
  );
}

/** Days shared by both ranges, or 0 when they do not overlap. */
export function countOverlapDays(
  left: ReportDateRange,
  right: ReportDateRange,
): number {
  const startDate =
    left.startDate > right.startDate ? left.startDate : right.startDate;
  const endDate = left.endDate < right.endDate ? left.endDate : right.endDate;
  if (startDate > endDate) return 0;
  return countReportRangeDays({ startDate, endDate });
}

/** The equally long window immediately before `range`, used for uplift. */
export function getPrecedingReportDateRange(
  range: ReportDateRange,
): ReportDateRange {
  const dayCount = countReportRangeDays(range);
  return {
    startDate: shiftIsoDate(range.startDate, -dayCount),
    endDate: shiftIsoDate(range.startDate, -1),
  };
}

export function resolveReportDatePreset(
  presetId: ReportDatePresetId,
  today: string,
): ReportDateRange {
  const anchor = requireIsoDate(today);

  switch (presetId) {
    case "monthToDate":
      return { startDate: toIsoDate(startOfMonth(anchor)), endDate: today };
    case "lastMonth": {
      const previousMonth = subMonths(anchor, 1);
      return {
        startDate: toIsoDate(startOfMonth(previousMonth)),
        endDate: toIsoDate(endOfMonth(previousMonth)),
      };
    }
    case "last3Days":
      return { startDate: toIsoDate(subDays(anchor, 2)), endDate: today };
    case "last7Days":
      return { startDate: toIsoDate(subDays(anchor, 6)), endDate: today };
    case "lastWeek": {
      const previousWeek = subWeeks(anchor, 1);
      return {
        startDate: toIsoDate(startOfWeek(previousWeek, WEEK_OPTIONS)),
        endDate: toIsoDate(endOfWeek(previousWeek, WEEK_OPTIONS)),
      };
    }
    case "last30Days":
      return { startDate: toIsoDate(subDays(anchor, 29)), endDate: today };
    case "last90Days":
      return { startDate: toIsoDate(subDays(anchor, 89)), endDate: today };
    case "last6Months":
      return { startDate: toIsoDate(subMonths(anchor, 6)), endDate: today };
    case "yearToDate":
      return { startDate: toIsoDate(startOfYear(anchor)), endDate: today };
  }
}

export function listReportDatePresets(
  today: string,
): ReportDatePresetOption[] {
  return REPORT_DATE_PRESETS.map((presetId) => ({
    id: presetId,
    label: REPORT_DATE_PRESET_LABELS[presetId],
    range: resolveReportDatePreset(presetId, today),
  }));
}

export function matchReportDatePreset(
  range: ReportDateRange,
  today: string,
): ReportDatePresetId | null {
  const match = listReportDatePresets(today).find(
    (preset) =>
      preset.range.startDate === range.startDate &&
      preset.range.endDate === range.endDate,
  );
  return match?.id ?? null;
}

/**
 * Reads as `Sep 1 – 8, 2026`, dropping the parts both ends share so the filter
 * trigger stays short. Month names keep the app's en-US convention.
 */
export function formatReportDateRange(range: ReportDateRange): string {
  const startDate = requireIsoDate(range.startDate);
  const endDate = requireIsoDate(range.endDate);

  if (range.startDate === range.endDate) {
    return format(startDate, "MMM d, yyyy");
  }
  if (startDate.getFullYear() !== endDate.getFullYear()) {
    return `${format(startDate, "MMM d, yyyy")} – ${format(endDate, "MMM d, yyyy")}`;
  }
  if (startDate.getMonth() === endDate.getMonth()) {
    return `${format(startDate, "MMM d")} – ${format(endDate, "d, yyyy")}`;
  }
  return `${format(startDate, "MMM d")} – ${format(endDate, "MMM d, yyyy")}`;
}

/**
 * URL params are user-editable, so an unparseable or reversed range falls back
 * to the default rather than pushing invalid dates into the report queries.
 */
export function normalizeReportDateRange(
  candidate: Partial<ReportDateRange>,
  fallback: ReportDateRange,
): ReportDateRange {
  const startDate = candidate.startDate ?? "";
  const endDate = candidate.endDate ?? "";
  if (!parseIsoDate(startDate) || !parseIsoDate(endDate)) return fallback;
  if (startDate > endDate) return fallback;
  return { startDate, endDate };
}

function requireIsoDate(isoDate: string): Date {
  const parsed = parseIsoDate(isoDate);
  if (!parsed) {
    throw new Error(`Expected an ISO YYYY-MM-DD date, received "${isoDate}"`);
  }
  return parsed;
}
