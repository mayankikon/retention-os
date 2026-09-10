import { FILTER_ALL } from "@/data/lookups";
import { getCampaignDealers } from "@/lib/campaign-dealers";
import { getTotalPages, paginateItems } from "@/lib/pagination";
import {
  countOverlapDays,
  countReportRangeDays,
  resolveReportDatePreset,
  shiftIsoDate,
} from "@/lib/report-date-range";
import {
  calculateCerPercent,
  isMultiRooftopGroup,
  MIN_CER_SAMPLE_SENT,
  WEEKLY_MESSAGE_TYPES,
} from "@/lib/reporting";
import type { Campaign, CampaignStatus } from "@/types/campaign";
import type {
  ActivityDetailRow,
  CerPeriodMetrics,
  ReportingRooftop,
  WeeklyPerformanceWeek,
} from "@/types/reporting";
import type {
  ReportActivityRow,
  ReportCampaignSummary,
  ReportDateRange,
  ReportDealershipRow,
  ReportKpis,
  ReportPerformanceMode,
  ReportRankMetric,
  ReportWeeklyScope,
  ReportWeeklySection,
} from "@/types/reports";

const EMPTY_REPORT_CAMPAIGN: ReportCampaignSummary = {
  name: null,
  additionalCount: 0,
};

/** Draft and archived campaigns never sent, so they stay off the ranking. */
const REPORT_CAMPAIGN_STATUS_RANK: Partial<Record<CampaignStatus, number>> = {
  active: 0,
  paused: 1,
  completed: 2,
};

export const REPORT_PERFORMANCE_MODE_LABELS: Record<
  ReportPerformanceMode,
  string
> = {
  weekly: "Weekly",
  monthly: "Monthly",
};

export const REPORT_RANK_METRIC_LABELS: Record<ReportRankMetric, string> = {
  messages: "Messages sent",
  clicks: "Total clicks",
  uplift: "Reminder Uplift",
  cer: "CER %",
};

export const REPORT_PAGE_SIZE = 10;

export interface ReportPage<T> {
  items: T[];
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

export function paginateReportItems<T>(
  items: T[],
  page: number,
  pageSize = REPORT_PAGE_SIZE,
): ReportPage<T> {
  const totalPages = getTotalPages(items.length, pageSize);
  const safePage = Math.min(Math.max(1, page), totalPages);
  return {
    items: paginateItems(items, safePage, pageSize),
    page: safePage,
    totalPages,
    totalItems: items.length,
    pageSize,
  };
}

export function listReportGroups(rooftops: ReportingRooftop[]): string[] {
  return [...new Set(rooftops.map((rooftop) => rooftop.dealerGroup))].sort(
    (left, right) => left.localeCompare(right),
  );
}

export function listReportDealerships(
  rooftops: ReportingRooftop[],
  group?: string,
): string[] {
  const groupFilter = group ?? FILTER_ALL;
  return rooftops
    .filter(
      (rooftop) =>
        groupFilter === FILTER_ALL || rooftop.dealerGroup === groupFilter,
    )
    .map((rooftop) => rooftop.rooftop)
    .sort((left, right) => left.localeCompare(right));
}

export function isReportDealershipInGroup(
  rooftops: ReportingRooftop[],
  dealership: string,
  group: string,
): boolean {
  if (!group || group === FILTER_ALL) return true;
  if (!dealership || dealership === FILTER_ALL) return true;
  return rooftops.some(
    (rooftop) =>
      rooftop.rooftop === dealership && rooftop.dealerGroup === group,
  );
}

export function findDealershipById(
  rooftops: ReportingRooftop[],
  dealershipId: string,
): ReportingRooftop | undefined {
  return rooftops.find((rooftop) => rooftop.id === dealershipId);
}

/**
 * Campaigns covering a rooftop that have actually sent, best first: active
 * beats paused beats completed. Drafts and archives never sent, so they are
 * left out of every campaign column.
 */
export function listReportCampaignNames(
  campaigns: Campaign[],
  dealership: string,
): string[] {
  return listReportCampaigns(campaigns, dealership).map(
    (campaign) => campaign.name,
  );
}

export function listReportCampaigns(
  campaigns: Campaign[],
  dealership: string,
): Campaign[] {
  return campaigns
    .filter((campaign) => {
      if (REPORT_CAMPAIGN_STATUS_RANK[campaign.status] == null) return false;
      return getCampaignDealers(campaign).includes(dealership);
    })
    .sort(compareReportCampaigns);
}

/**
 * Names the campaign a rooftop is most recently running. Extra matching
 * campaigns collapse to a +N count so the cell stays one line.
 */
export function describeReportCampaign(
  campaigns: Campaign[],
  dealership: string,
): ReportCampaignSummary {
  const names = listReportCampaignNames(campaigns, dealership);
  if (names.length === 0) return EMPTY_REPORT_CAMPAIGN;

  return {
    name: names[0] ?? null,
    additionalCount: names.length - 1,
  };
}

export function formatReportCampaignLabel(
  campaign: ReportCampaignSummary,
): string {
  if (!campaign.name) return "—";
  if (campaign.additionalCount === 0) return campaign.name;
  return `${campaign.name} (+${campaign.additionalCount})`;
}

function compareReportCampaigns(left: Campaign, right: Campaign): number {
  const leftRank = REPORT_CAMPAIGN_STATUS_RANK[left.status] ?? Number.MAX_SAFE_INTEGER;
  const rightRank = REPORT_CAMPAIGN_STATUS_RANK[right.status] ?? Number.MAX_SAFE_INTEGER;
  if (leftRank !== rightRank) return leftRank - rightRank;
  if (right.messages !== left.messages) return right.messages - left.messages;
  return left.name.localeCompare(right.name);
}

export function rankReportDealerships(input: {
  rooftops: ReportingRooftop[];
  weeks: WeeklyPerformanceWeek[];
  mode: ReportPerformanceMode;
  dealership?: string;
  group?: string;
  campaigns?: Campaign[];
  /** Monthly mode only; omit to report the month-to-date bucket as-is. */
  dateRange?: ReportDateRange;
  today?: string;
}): ReportDealershipRow[] {
  const campaigns = input.campaigns ?? [];
  const rows =
    input.mode === "weekly"
      ? buildWeeklyDealershipRows(input.rooftops, input.weeks, campaigns)
      : buildMonthlyDealershipRows(
          input.rooftops,
          campaigns,
          input.dateRange,
          input.today,
        );

  const groupFilter = input.group ?? FILTER_ALL;
  const dealershipFilter = input.dealership ?? FILTER_ALL;

  const filtered = rows.filter((row) => {
    if (groupFilter !== FILTER_ALL && row.group !== groupFilter) {
      return false;
    }
    if (dealershipFilter !== FILTER_ALL && row.dealership !== dealershipFilter) {
      return false;
    }
    return true;
  });

  return assignReportRanks(filtered);
}

function buildMonthlyDealershipRows(
  rooftops: ReportingRooftop[],
  campaigns: Campaign[],
  dateRange?: ReportDateRange,
  today?: string,
): ReportDealershipRow[] {
  return rooftops
    .filter(
      (rooftop) =>
        rooftop.isSmEnabled &&
        isMultiRooftopGroup(rooftops, rooftop.dealerGroup),
    )
    .map((rooftop) => {
      const metrics =
        dateRange && today
          ? sumRooftopMetricsInRange(rooftop, dateRange, today)
          : rooftop.metricsByPeriod.mtd;
      return toReportRow({
        dealershipId: rooftop.id,
        dealership: rooftop.rooftop,
        group: rooftop.dealerGroup,
        campaign: describeReportCampaign(campaigns, rooftop.rooftop),
        messages: metrics.sent,
        firstMessage: Math.max(metrics.sent - metrics.retried, 0),
        retried: metrics.retried,
        clicks: metrics.clickedFirstTime,
        firstTime: metrics.clickedFirstTime,
      });
    })
    .filter((row) => row.messages > 0);
}

interface RooftopPeriodSegment extends ReportDateRange {
  metrics: CerPeriodMetrics;
}

/**
 * Rooftops only carry month-to-date, last-month, and year-to-date buckets, so
 * each bucket is spread evenly over the days it covers. Any calendar range can
 * then be summed, and a range matching a bucket still returns it exactly.
 */
export function sumRooftopMetricsInRange(
  rooftop: ReportingRooftop,
  range: ReportDateRange,
  today: string,
): CerPeriodMetrics {
  return listRooftopPeriodSegments(rooftop, today).reduce<CerPeriodMetrics>(
    (totals, segment) => {
      const overlapDays = countOverlapDays(range, segment);
      if (overlapDays === 0) return totals;

      const share = overlapDays / countReportRangeDays(segment);
      return {
        sent: totals.sent + Math.round(segment.metrics.sent * share),
        retried: totals.retried + Math.round(segment.metrics.retried * share),
        clickedFirstTime:
          totals.clickedFirstTime +
          Math.round(segment.metrics.clickedFirstTime * share),
      };
    },
    { sent: 0, retried: 0, clickedFirstTime: 0 },
  );
}

function listRooftopPeriodSegments(
  rooftop: ReportingRooftop,
  today: string,
): RooftopPeriodSegment[] {
  const monthToDate = resolveReportDatePreset("monthToDate", today);
  const lastMonth = resolveReportDatePreset("lastMonth", today);
  const { mtd, lm, ytd } = rooftop.metricsByPeriod;

  const segments: RooftopPeriodSegment[] = [
    { ...monthToDate, metrics: mtd },
    { ...lastMonth, metrics: lm },
  ];

  // Whatever the year total has left over covers Jan 1 through last month.
  const earlierThisYear: ReportDateRange = {
    startDate: resolveReportDatePreset("yearToDate", today).startDate,
    endDate: shiftIsoDate(lastMonth.startDate, -1),
  };
  if (earlierThisYear.startDate <= earlierThisYear.endDate) {
    segments.push({
      ...earlierThisYear,
      metrics: {
        sent: Math.max(ytd.sent - mtd.sent - lm.sent, 0),
        retried: Math.max(ytd.retried - mtd.retried - lm.retried, 0),
        clickedFirstTime: Math.max(
          ytd.clickedFirstTime - mtd.clickedFirstTime - lm.clickedFirstTime,
          0,
        ),
      },
    });
  }

  return segments;
}

/** Sums every visible week per dealership so a dealership is ranked once. */
function buildWeeklyDealershipRows(
  rooftops: ReportingRooftop[],
  weeks: WeeklyPerformanceWeek[],
  campaigns: Campaign[],
): ReportDealershipRow[] {
  const rooftopByName = new Map(
    rooftops.map((rooftop) => [rooftop.rooftop, rooftop]),
  );
  const totalsByDealership = new Map<string, WeeklyDealershipTotals>();

  for (const week of weeks) {
    const rooftop = rooftopByName.get(week.dealer);
    if (!rooftop || !rooftop.isSmEnabled) continue;
    if (!isMultiRooftopGroup(rooftops, rooftop.dealerGroup)) continue;

    const totals =
      totalsByDealership.get(rooftop.id) ?? createWeeklyDealershipTotals();
    for (const type of WEEKLY_MESSAGE_TYPES) {
      const metrics = week.metricsByMessage[type];
      totals.messages += metrics.sent;
      totals.clicks += metrics.clicks;
      if (type === "initial") {
        totals.firstMessage += metrics.sent;
        totals.firstTime += metrics.clicks;
      } else {
        totals.retried += metrics.sent;
      }
    }
    totalsByDealership.set(rooftop.id, totals);
  }

  return [...totalsByDealership].flatMap(([dealershipId, totals]) => {
    const rooftop = rooftops.find((candidate) => candidate.id === dealershipId);
    if (!rooftop) return [];
    return [
      toReportRow({
        dealershipId,
        dealership: rooftop.rooftop,
        group: rooftop.dealerGroup,
        campaign: describeReportCampaign(campaigns, rooftop.rooftop),
        ...totals,
      }),
    ];
  });
}

interface WeeklyDealershipTotals {
  messages: number;
  firstMessage: number;
  retried: number;
  clicks: number;
  firstTime: number;
}

function createWeeklyDealershipTotals(): WeeklyDealershipTotals {
  return {
    messages: 0,
    firstMessage: 0,
    retried: 0,
    clicks: 0,
    firstTime: 0,
  };
}

function toReportRow(
  input: Omit<ReportDealershipRow, "cerPercent" | "isLowSample" | "rank">,
): ReportDealershipRow {
  return {
    ...input,
    cerPercent: calculateCerPercent(input.firstTime, input.messages),
    isLowSample: input.messages < MIN_CER_SAMPLE_SENT,
    rank: null,
  };
}

function assignReportRanks(
  rows: ReportDealershipRow[],
): ReportDealershipRow[] {
  const qualifying = rows
    .filter((row) => !row.isLowSample)
    .sort(compareReportRows);
  const lowSample = rows
    .filter((row) => row.isLowSample)
    .sort(compareReportRows);

  return [
    ...qualifying.map((row, index) => ({ ...row, rank: index + 1 })),
    ...lowSample,
  ];
}

function compareReportRows(
  left: ReportDealershipRow,
  right: ReportDealershipRow,
): number {
  if (right.cerPercent !== left.cerPercent) {
    return right.cerPercent - left.cerPercent;
  }
  if (right.messages !== left.messages) {
    return right.messages - left.messages;
  }
  return left.dealership.localeCompare(right.dealership);
}

/**
 * Re-ranks monthly dealerships by the selected summary metric.
 * Uplift is each rooftop's CER change from the preceding date window.
 */
export function rankReportRowsByMetric(
  currentRows: ReportDealershipRow[],
  previousRows: ReportDealershipRow[],
  metric: ReportRankMetric,
): ReportDealershipRow[] {
  const previousRowByDealershipId = new Map(
    previousRows.map((row) => [row.dealershipId, row]),
  );
  const getMetricValue = (row: ReportDealershipRow): number => {
    if (metric === "messages") return row.messages;
    if (metric === "clicks") return row.clicks;
    if (metric === "cer") return row.cerPercent;

    const previousRow = previousRowByDealershipId.get(row.dealershipId);
    return row.cerPercent - (previousRow?.cerPercent ?? 0);
  };
  const compareByMetric = (
    left: ReportDealershipRow,
    right: ReportDealershipRow,
  ): number => {
    const metricDifference = getMetricValue(right) - getMetricValue(left);
    if (metricDifference !== 0) return metricDifference;
    if (right.messages !== left.messages) return right.messages - left.messages;
    return left.dealership.localeCompare(right.dealership);
  };

  if (metric !== "cer") {
    return [...currentRows]
      .sort(compareByMetric)
      .map((row, index) => ({ ...row, rank: index + 1 }));
  }

  const qualifyingRows = currentRows
    .filter((row) => !row.isLowSample)
    .sort(compareByMetric);
  const lowSampleRows = currentRows
    .filter((row) => row.isLowSample)
    .sort(compareByMetric);

  return [
    ...qualifyingRows.map((row, index) => ({ ...row, rank: index + 1 })),
    ...lowSampleRows.map((row) => ({ ...row, rank: null })),
  ];
}

export function summarizeReportKpis(
  currentRows: ReportDealershipRow[],
  previousRows: ReportDealershipRow[],
): ReportKpis {
  const messagesSent = sumBy(currentRows, (row) => row.messages);
  const totalClicks = sumBy(currentRows, (row) => row.clicks);
  const firstTime = sumBy(currentRows, (row) => row.firstTime);
  const cerPercent = calculateCerPercent(firstTime, messagesSent);

  const previousMessages = sumBy(previousRows, (row) => row.messages);
  const previousFirstTime = sumBy(previousRows, (row) => row.firstTime);
  const previousCerPercent = calculateCerPercent(
    previousFirstTime,
    previousMessages,
  );

  return {
    messagesSent,
    totalClicks,
    upliftPercent: cerPercent - previousCerPercent,
    cerPercent,
  };
}

export function filterReportWeeks(
  weeks: WeeklyPerformanceWeek[],
  rooftops: ReportingRooftop[],
  group?: string,
  dealership?: string,
): WeeklyPerformanceWeek[] {
  const rooftopByName = new Map(
    rooftops.map((rooftop) => [rooftop.rooftop, rooftop]),
  );
  const groupFilter = group ?? FILTER_ALL;
  const dealershipFilter = dealership ?? FILTER_ALL;

  return weeks.filter((week) => {
    const rooftop = rooftopByName.get(week.dealer);
    if (groupFilter !== FILTER_ALL && rooftop?.dealerGroup !== groupFilter) {
      return false;
    }
    if (dealershipFilter !== FILTER_ALL && week.dealer !== dealershipFilter) {
      return false;
    }
    return true;
  });
}

/**
 * Collapses per-dealer week rows into one cumulative section per week, newest
 * week first, so the stack varies by week instead of repeating dealer headers.
 */
export function aggregateReportWeeks(
  weeks: WeeklyPerformanceWeek[],
): ReportWeeklySection[] {
  const sectionByWeekId = new Map<string, ReportWeeklySection>();
  const dealershipsByWeekId = new Map<string, Set<string>>();

  for (const week of weeks) {
    const section = sectionByWeekId.get(week.id) ?? createWeeklySection(week);
    const dealerships =
      dealershipsByWeekId.get(week.id) ?? new Set<string>();

    for (const type of WEEKLY_MESSAGE_TYPES) {
      const metrics = week.metricsByMessage[type];
      section.metricsByMessage[type].sent += metrics.sent;
      section.metricsByMessage[type].clicks += metrics.clicks;
      section.totals.sent += metrics.sent;
      section.totals.clicks += metrics.clicks;
    }

    dealerships.add(week.dealer);
    section.dealershipCount = dealerships.size;
    dealershipsByWeekId.set(week.id, dealerships);
    sectionByWeekId.set(week.id, section);
  }

  return [...sectionByWeekId.values()].sort((left, right) =>
    right.startDate.localeCompare(left.startDate),
  );
}

function createWeeklySection(
  week: WeeklyPerformanceWeek,
): ReportWeeklySection {
  return {
    weekId: week.id,
    label: week.label,
    startDate: week.startDate,
    endDate: week.endDate,
    dealershipCount: 0,
    metricsByMessage: {
      initial: { sent: 0, clicks: 0 },
      reminder1: { sent: 0, clicks: 0 },
      reminder2: { sent: 0, clicks: 0 },
      reminder3: { sent: 0, clicks: 0 },
    },
    totals: { sent: 0, clicks: 0 },
  };
}

/**
 * Names the weekly stack once: a single dealership links to its activity, while
 * a group or the whole portfolio reports how many rooftops the totals cover.
 */
export function describeReportWeeklyScope(input: {
  rooftops: ReportingRooftop[];
  weeks: WeeklyPerformanceWeek[];
  group?: string;
  dealership?: string;
}): ReportWeeklyScope {
  const groupFilter = input.group ?? FILTER_ALL;
  const dealershipFilter = input.dealership ?? FILTER_ALL;
  const dealershipCount = new Set(input.weeks.map((week) => week.dealer)).size;

  if (dealershipFilter !== FILTER_ALL) {
    const rooftop = input.rooftops.find(
      (candidate) => candidate.rooftop === dealershipFilter,
    );
    return {
      name: dealershipFilter,
      isCumulative: false,
      dealershipCount: 1,
      dealershipId: rooftop?.id ?? null,
    };
  }

  return {
    name: groupFilter === FILTER_ALL ? "All dealers" : groupFilter,
    isCumulative: true,
    dealershipCount,
    dealershipId: null,
  };
}

/**
 * Deals a dealership's campaigns out across its customer rows round-robin, so
 * a rooftop running three campaigns shows all three down the list rather than
 * repeating the top one. Assign over the full activity set before filtering —
 * the position within a dealership is what keeps a customer's campaign stable.
 */
export function assignReportActivityCampaigns(
  rows: ActivityDetailRow[],
  campaigns: Campaign[],
): ReportActivityRow[] {
  const campaignsByDealership = new Map<string, Campaign[]>();
  const rowCountByDealership = new Map<string, number>();

  return rows.map((row) => {
    let dealershipCampaigns = campaignsByDealership.get(row.rooftop);
    if (!dealershipCampaigns) {
      dealershipCampaigns = listReportCampaigns(campaigns, row.rooftop);
      campaignsByDealership.set(row.rooftop, dealershipCampaigns);
    }
    if (dealershipCampaigns.length === 0) {
      return { ...row, campaign: null, campaignId: null };
    }

    const rowsSoFar = rowCountByDealership.get(row.rooftop) ?? 0;
    rowCountByDealership.set(row.rooftop, rowsSoFar + 1);
    const campaign =
      dealershipCampaigns[rowsSoFar % dealershipCampaigns.length];
    return {
      ...row,
      campaign: campaign?.name ?? null,
      campaignId: campaign?.id ?? null,
    };
  });
}

export function filterReportActivityRows<
  T extends Pick<ActivityDetailRow, "rooftop"> & { campaignId?: string | null },
>(rows: T[], dealershipName?: string, campaignId?: string): T[] {
  return rows.filter((row) => {
    if (dealershipName && row.rooftop !== dealershipName) return false;
    if (campaignId && row.campaignId !== campaignId) return false;
    return true;
  });
}

export function listReportActivityDealerships(
  rows: ActivityDetailRow[],
): string[] {
  return [...new Set(rows.map((row) => row.rooftop))].sort((left, right) =>
    left.localeCompare(right),
  );
}

export function formatSignedPercent(value: number): string {
  const absolute = `${Math.abs(value).toFixed(1)}%`;
  if (value > 0) return `+${absolute}`;
  if (value < 0) return `-${absolute}`;
  return absolute;
}

function sumBy<T>(items: T[], readValue: (item: T) => number): number {
  return items.reduce((total, item) => total + readValue(item), 0);
}
