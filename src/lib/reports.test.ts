import { describe, expect, it } from "vitest";
import { FILTER_ALL } from "@/data/lookups";
import { mockCampaigns } from "@/data/campaigns.mock";
import {
  ACTIVITY_DETAIL_ROWS,
  REPORTING_ROOFTOPS,
  WEEKLY_CER_WEEKS,
} from "@/data/reporting.mock";
import {
  aggregateReportWeeks,
  REPORT_PAGE_SIZE,
  assignReportActivityCampaigns,
  describeReportCampaign,
  describeReportWeeklyScope,
  filterReportActivityRows,
  filterReportWeeks,
  findDealershipById,
  formatReportCampaignLabel,
  formatSignedPercent,
  isReportDealershipInGroup,
  listReportDealerships,
  paginateReportItems,
  rankReportDealerships,
  rankReportRowsByMetric,
  sumRooftopMetricsInRange,
  summarizeReportKpis,
} from "@/lib/reports";
import { resolveReportDatePreset } from "@/lib/report-date-range";
import type { Campaign } from "@/types/campaign";
import type { ReportingRooftop } from "@/types/reporting";
import type {
  WeeklyMessageMetrics,
  WeeklyMessageType,
  WeeklyPerformanceWeek,
} from "@/types/reporting";

function createWeeklyWeek(input: {
  weekId: string;
  label: string;
  startDate: string;
  endDate: string;
  dealer: string;
  metricsByMessage: Record<WeeklyMessageType, WeeklyMessageMetrics>;
}): WeeklyPerformanceWeek {
  return {
    id: input.weekId,
    year: Number(input.startDate.slice(0, 4)),
    month: Number(input.startDate.slice(5, 7)),
    label: input.label,
    startDate: input.startDate,
    endDate: input.endDate,
    dealer: input.dealer,
    metricsByMessage: input.metricsByMessage,
  };
}

/**
 * Two dealers report the Aug 08 week and only one reports Aug 01, so cumulative
 * sums and partial week coverage are both exercised without the shared mock.
 */
const TWO_DEALER_WEEKS: WeeklyPerformanceWeek[] = [
  createWeeklyWeek({
    weekId: "week-fixture-08-08",
    label: "Aug 08–Aug 14",
    startDate: "2026-08-08",
    endDate: "2026-08-14",
    dealer: "Ikon Motors North",
    metricsByMessage: {
      initial: { sent: 100, clicks: 20 },
      reminder1: { sent: 50, clicks: 5 },
      reminder2: { sent: 20, clicks: 2 },
      reminder3: { sent: 10, clicks: 1 },
    },
  }),
  createWeeklyWeek({
    weekId: "week-fixture-08-08",
    label: "Aug 08–Aug 14",
    startDate: "2026-08-08",
    endDate: "2026-08-14",
    dealer: "Ikon Motors South",
    metricsByMessage: {
      initial: { sent: 200, clicks: 30 },
      reminder1: { sent: 60, clicks: 6 },
      reminder2: { sent: 30, clicks: 3 },
      reminder3: { sent: 10, clicks: 1 },
    },
  }),
  createWeeklyWeek({
    weekId: "week-fixture-08-01",
    label: "Aug 01–Aug 07",
    startDate: "2026-08-01",
    endDate: "2026-08-07",
    dealer: "Ikon Motors North",
    metricsByMessage: {
      initial: { sent: 80, clicks: 8 },
      reminder1: { sent: 40, clicks: 4 },
      reminder2: { sent: 20, clicks: 1 },
      reminder3: { sent: 5, clicks: 0 },
    },
  }),
];

describe("report ranking", () => {
  it("ranks monthly dealerships by CER and uses Dealership / Group labels", () => {
    const rows = rankReportDealerships({
      rooftops: REPORTING_ROOFTOPS,
      weeks: WEEKLY_CER_WEEKS,
      mode: "monthly",
    });

    expect(rows[0]?.dealership).toBe("Premier Auto Group");
    expect(rows[0]?.group).toBe("Premier Auto Group");
    expect(rows[0]?.rank).toBe(1);
    expect(rows.some((row) => row.dealership === "Summit Chevrolet")).toBe(
      false,
    );
  });

  it("uses Initial volume as First message in weekly performance", () => {
    const rows = rankReportDealerships({
      rooftops: REPORTING_ROOFTOPS,
      weeks: WEEKLY_CER_WEEKS,
      mode: "weekly",
    });
    const north = rows.find((row) => row.dealership === "Ikon Motors North");

    expect(north?.firstMessage).toBe(2010);
    expect(north?.messages).toBe(3539);
    expect(north?.retried).toBe(1529);
    expect(north?.firstTime).toBe(361);
    expect(north?.clicks).toBe(526);
  });

  it("ranks a dealership once when it reports across several weeks", () => {
    const rows = rankReportDealerships({
      rooftops: REPORTING_ROOFTOPS,
      weeks: WEEKLY_CER_WEEKS,
      mode: "weekly",
    });
    const dealerships = rows.map((row) => row.dealership);

    expect(new Set(dealerships).size).toBe(dealerships.length);
  });

  it("filters dealerships by group and dealer", () => {
    const groupRows = rankReportDealerships({
      rooftops: REPORTING_ROOFTOPS,
      weeks: WEEKLY_CER_WEEKS,
      mode: "monthly",
      group: "Lakeside Auto Group",
    });
    const dealerRow = rankReportDealerships({
      rooftops: REPORTING_ROOFTOPS,
      weeks: WEEKLY_CER_WEEKS,
      mode: "monthly",
      group: "Lakeside Auto Group",
      dealership: "Lakeside Honda",
    });

    expect(groupRows.every((row) => row.group === "Lakeside Auto Group")).toBe(
      true,
    );
    expect(groupRows.map((row) => row.dealership)).toEqual([
      "Lakeside Honda",
      "Lakeside Ford",
      "Lakeside Toyota",
    ]);
    expect(dealerRow.map((row) => row.dealership)).toEqual(["Lakeside Honda"]);
  });

  it("ignores an All Groups filter", () => {
    const allRows = rankReportDealerships({
      rooftops: REPORTING_ROOFTOPS,
      weeks: WEEKLY_CER_WEEKS,
      mode: "monthly",
      group: FILTER_ALL,
    });
    const unfiltered = rankReportDealerships({
      rooftops: REPORTING_ROOFTOPS,
      weeks: WEEKLY_CER_WEEKS,
      mode: "monthly",
    });

    expect(allRows).toEqual(unfiltered);
  });
});

describe("report campaign column", () => {
  const CREATOR = { id: "u1", name: "Test User", initials: "TU" };

  function createCampaign(input: {
    id: string;
    name: string;
    dealer: string;
    dealers?: string[];
    status: Campaign["status"];
    messages: number;
  }): Campaign {
    return {
      id: input.id,
      name: input.name,
      dealer: input.dealer,
      dealers: input.dealers,
      timeZone: "CST",
      status: input.status,
      messages: input.messages,
      clickThroughRate: 0,
      createdBy: CREATOR,
      createdAt: "2026-01-01T00:00:00.000Z",
      group: "Service",
      lastUpdatedAt: "2026-01-01T00:00:00.000Z",
      nextUpdateAt: "2026-01-02T00:00:00.000Z",
    };
  }

  it("prefers an active campaign over paused or completed on the same rooftop", () => {
    const campaigns = [
      createCampaign({
        id: "cmp-paused",
        name: "Paused Promo",
        dealer: "Ikon Motors North",
        status: "paused",
        messages: 9000,
      }),
      createCampaign({
        id: "cmp-active",
        name: "Active Reminder",
        dealer: "Ikon Motors North",
        status: "active",
        messages: 100,
      }),
      createCampaign({
        id: "cmp-done",
        name: "Completed Blast",
        dealer: "Ikon Motors North",
        status: "completed",
        messages: 8000,
      }),
    ];

    expect(describeReportCampaign(campaigns, "Ikon Motors North")).toEqual({
      name: "Active Reminder",
      additionalCount: 2,
    });
  });

  it("skips drafts and archives, and reports nothing when nothing has sent", () => {
    const campaigns = [
      createCampaign({
        id: "cmp-draft",
        name: "Draft Only",
        dealer: "Lakeside Honda",
        status: "draft",
        messages: 0,
      }),
      createCampaign({
        id: "cmp-archived",
        name: "Archived Only",
        dealer: "Lakeside Honda",
        status: "archived",
        messages: 400,
      }),
    ];

    expect(describeReportCampaign(campaigns, "Lakeside Honda")).toEqual({
      name: null,
      additionalCount: 0,
    });
    expect(formatReportCampaignLabel(describeReportCampaign(campaigns, "Lakeside Honda"))).toBe(
      "—",
    );
  });

  it("counts a multi-dealer campaign on every rooftop it covers", () => {
    const campaigns = [
      createCampaign({
        id: "cmp-shared",
        name: "Spring Service Reminder",
        dealer: "Ikon Motors North",
        dealers: ["Ikon Motors North", "Ikon Motors South"],
        status: "active",
        messages: 1240,
      }),
    ];

    expect(describeReportCampaign(campaigns, "Ikon Motors South").name).toBe(
      "Spring Service Reminder",
    );
    expect(describeReportCampaign(campaigns, "Ikon Motors West").name).toBeNull();
  });

  it("formats extra campaigns as a compact +N suffix", () => {
    expect(
      formatReportCampaignLabel({
        name: "Payment Due Reminder",
        additionalCount: 3,
      }),
    ).toBe("Payment Due Reminder (+3)");
  });

  it("deals three campaigns round-robin across a dealership's customers", () => {
    const campaigns = ["Alpha", "Bravo", "Charlie"].map((name, index) =>
      createCampaign({
        id: `cmp-${name}`,
        name,
        dealer: "Ikon Motors North",
        status: "active",
        messages: 1000 - index,
      }),
    );
    const rows = assignReportActivityCampaigns(
      filterReportActivityRows(ACTIVITY_DETAIL_ROWS, "Ikon Motors North"),
      campaigns,
    );

    expect(rows.slice(0, 4).map((row) => row.campaign)).toEqual([
      "Alpha",
      "Bravo",
      "Charlie",
      "Alpha",
    ]);
    expect(new Set(rows.map((row) => row.campaign))).toEqual(
      new Set(["Alpha", "Bravo", "Charlie"]),
    );
  });

  it("keeps a customer's campaign the same whether or not the list is filtered", () => {
    const allRows = assignReportActivityCampaigns(
      ACTIVITY_DETAIL_ROWS,
      mockCampaigns,
    );
    const scopedRows = filterReportActivityRows(allRows, "Ikon Motors North");
    const northFromAll = allRows.filter(
      (row) => row.rooftop === "Ikon Motors North",
    );

    expect(scopedRows.map((row) => row.campaign)).toEqual(
      northFromAll.map((row) => row.campaign),
    );
  });

  it("leaves activity rows uncampaigned when the dealership never sent one", () => {
    const rows = assignReportActivityCampaigns(
      filterReportActivityRows(ACTIVITY_DETAIL_ROWS, "Lakeside Honda"),
      mockCampaigns,
    );

    expect(rows.every((row) => row.campaign === null)).toBe(true);
  });

  it("attaches the campaign to ranked monthly rows from the campaign list", () => {
    const rows = rankReportDealerships({
      rooftops: REPORTING_ROOFTOPS,
      weeks: WEEKLY_CER_WEEKS,
      mode: "monthly",
      campaigns: mockCampaigns,
    });
    const premier = rows.find((row) => row.dealership === "Premier Auto Group");
    const lakeside = rows.find((row) => row.dealership === "Lakeside Honda");

    expect(premier?.campaign.name).toBe("Payment Due Reminder");
    expect(premier?.campaign.additionalCount).toBeGreaterThan(0);
    expect(lakeside?.campaign.name).toBeNull();
  });
});

describe("report date range metrics", () => {
  /** Deliberately round totals so proration is checkable by hand. */
  const RANGE_ROOFTOP: ReportingRooftop = {
    id: "rt-range-fixture",
    rooftop: "Range Fixture Motors",
    dealerGroup: "Range Fixture Group",
    isSmEnabled: true,
    metricsByPeriod: {
      mtd: { sent: 800, retried: 80, clickedFirstTime: 160 },
      lm: { sent: 3100, retried: 310, clickedFirstTime: 620 },
      ytd: { sent: 10000, retried: 1000, clickedFirstTime: 2000 },
    },
  };
  const TODAY = "2026-09-08";

  it("returns the month-to-date bucket exactly for the default range", () => {
    expect(
      sumRooftopMetricsInRange(
        RANGE_ROOFTOP,
        resolveReportDatePreset("monthToDate", TODAY),
        TODAY,
      ),
    ).toEqual(RANGE_ROOFTOP.metricsByPeriod.mtd);
  });

  it("returns the last-month bucket exactly for the last-month range", () => {
    expect(
      sumRooftopMetricsInRange(
        RANGE_ROOFTOP,
        resolveReportDatePreset("lastMonth", TODAY),
        TODAY,
      ),
    ).toEqual(RANGE_ROOFTOP.metricsByPeriod.lm);
  });

  it("returns the year-to-date bucket exactly for the year-to-date range", () => {
    expect(
      sumRooftopMetricsInRange(
        RANGE_ROOFTOP,
        resolveReportDatePreset("yearToDate", TODAY),
        TODAY,
      ),
    ).toEqual(RANGE_ROOFTOP.metricsByPeriod.ytd);
  });

  it("prorates a partial window across the buckets it touches", () => {
    // Aug 31–Sep 6: one of 31 August days plus six of eight September days.
    const lastWeek = sumRooftopMetricsInRange(
      RANGE_ROOFTOP,
      resolveReportDatePreset("lastWeek", TODAY),
      TODAY,
    );

    expect(lastWeek.sent).toBe(Math.round(3100 * (1 / 31)) + Math.round(800 * (6 / 8)));
    expect(lastWeek.sent).toBeLessThan(RANGE_ROOFTOP.metricsByPeriod.lm.sent);
  });

  it("reports nothing for a window outside the covered year", () => {
    expect(
      sumRooftopMetricsInRange(
        RANGE_ROOFTOP,
        { startDate: "2024-01-01", endDate: "2024-03-31" },
        TODAY,
      ),
    ).toEqual({ sent: 0, retried: 0, clickedFirstTime: 0 });
  });
});

describe("report ranking by date range", () => {
  const TODAY = "2026-09-08";

  it("matches the unfiltered ranking when the range is month to date", () => {
    const withoutRange = rankReportDealerships({
      rooftops: REPORTING_ROOFTOPS,
      weeks: WEEKLY_CER_WEEKS,
      mode: "monthly",
    });
    const withMonthToDate = rankReportDealerships({
      rooftops: REPORTING_ROOFTOPS,
      weeks: WEEKLY_CER_WEEKS,
      mode: "monthly",
      dateRange: resolveReportDatePreset("monthToDate", TODAY),
      today: TODAY,
    });

    expect(withMonthToDate).toEqual(withoutRange);
  });

  it("reports higher volume for a wider range", () => {
    const sumMessages = (dateRange: ReturnType<typeof resolveReportDatePreset>) =>
      rankReportDealerships({
        rooftops: REPORTING_ROOFTOPS,
        weeks: WEEKLY_CER_WEEKS,
        mode: "monthly",
        dateRange,
        today: TODAY,
      }).reduce((total, row) => total + row.messages, 0);

    expect(sumMessages(resolveReportDatePreset("yearToDate", TODAY))).toBeGreaterThan(
      sumMessages(resolveReportDatePreset("last7Days", TODAY)),
    );
  });

  it("drops dealerships with no messages in the range", () => {
    const rows = rankReportDealerships({
      rooftops: REPORTING_ROOFTOPS,
      weeks: WEEKLY_CER_WEEKS,
      mode: "monthly",
      dateRange: { startDate: "2024-01-01", endDate: "2024-03-31" },
      today: TODAY,
    });

    expect(rows).toEqual([]);
  });

  it("ignores the date range in weekly mode", () => {
    const weekly = rankReportDealerships({
      rooftops: REPORTING_ROOFTOPS,
      weeks: WEEKLY_CER_WEEKS,
      mode: "weekly",
      dateRange: { startDate: "2024-01-01", endDate: "2024-03-31" },
      today: TODAY,
    });

    expect(weekly.length).toBeGreaterThan(0);
  });
});

describe("report KPIs", () => {
  it("rolls visible rows into messages, clicks, CER, and uplift vs the prior set", () => {
    const current = rankReportDealerships({
      rooftops: REPORTING_ROOFTOPS,
      weeks: WEEKLY_CER_WEEKS,
      mode: "monthly",
    });
    const previous = current.map((row) => ({
      ...row,
      firstTime: Math.round(row.firstTime * 0.8),
    }));
    const kpis = summarizeReportKpis(current, previous);

    expect(kpis.messagesSent).toBeGreaterThan(0);
    expect(kpis.totalClicks).toBeGreaterThan(0);
    expect(kpis.cerPercent).toBeGreaterThan(0);
    expect(kpis.upliftPercent).toBeGreaterThan(0);
  });

  it("formats signed percents for uplift", () => {
    expect(formatSignedPercent(12.4)).toBe("+12.4%");
    expect(formatSignedPercent(-3.1)).toBe("-3.1%");
    expect(formatSignedPercent(0)).toBe("0.0%");
  });
});

describe("report metric ranking", () => {
  const currentRows = [
    {
      dealershipId: "dealer-a",
      dealership: "Dealer A",
      group: "Group",
      campaign: { name: null, additionalCount: 0 },
      messages: 100,
      firstMessage: 90,
      retried: 10,
      clicks: 20,
      firstTime: 10,
      cerPercent: 10,
      isLowSample: false,
      rank: 1,
    },
    {
      dealershipId: "dealer-b",
      dealership: "Dealer B",
      group: "Group",
      campaign: { name: null, additionalCount: 0 },
      messages: 200,
      firstMessage: 180,
      retried: 20,
      clicks: 15,
      firstTime: 30,
      cerPercent: 15,
      isLowSample: false,
      rank: 2,
    },
  ];
  const previousRows = [
    { ...currentRows[0], cerPercent: 5 },
    { ...currentRows[1], cerPercent: 14 },
  ];

  it("ranks highest first by messages, clicks, and CER", () => {
    expect(rankReportRowsByMetric(currentRows, previousRows, "messages")[0].dealershipId)
      .toBe("dealer-b");
    expect(rankReportRowsByMetric(currentRows, previousRows, "clicks")[0].dealershipId)
      .toBe("dealer-a");
    expect(rankReportRowsByMetric(currentRows, previousRows, "cer")[0].dealershipId)
      .toBe("dealer-b");
  });

  it("ranks uplift by CER change from the preceding window", () => {
    const rankedRows = rankReportRowsByMetric(
      currentRows,
      previousRows,
      "uplift",
    );

    expect(rankedRows.map((row) => row.dealershipId)).toEqual([
      "dealer-a",
      "dealer-b",
    ]);
    expect(rankedRows.map((row) => row.rank)).toEqual([1, 2]);
  });
});

describe("report pagination", () => {
  it("pages ranked dealerships and clamps an out-of-range page", () => {
    const rows = rankReportDealerships({
      rooftops: REPORTING_ROOFTOPS,
      weeks: WEEKLY_CER_WEEKS,
      mode: "monthly",
    });
    const firstPage = paginateReportItems(rows, 1);
    const lastPage = paginateReportItems(rows, 99);

    expect(firstPage.pageSize).toBe(REPORT_PAGE_SIZE);
    expect(firstPage.items).toHaveLength(Math.min(REPORT_PAGE_SIZE, rows.length));
    expect(firstPage.items[0]?.dealership).toBe(rows[0]?.dealership);
    expect(lastPage.page).toBe(firstPage.totalPages);
    expect(lastPage.items.length).toBeGreaterThan(0);
  });
});

describe("report weeks", () => {
  it("keeps every week when no filter is applied", () => {
    expect(
      new Set(
        filterReportWeeks(WEEKLY_CER_WEEKS, REPORTING_ROOFTOPS).map(
          (week) => week.label,
        ),
      ),
    ).toEqual(
      new Set([
        "Aug 01–Aug 07",
        "Aug 08–Aug 14",
        "Aug 15–Aug 21",
        "Aug 22–Aug 28",
        "Jul 04–Jul 10",
      ]),
    );
  });

  it("filters stacked weeks by group and dealer", () => {
    const rows = filterReportWeeks(
      WEEKLY_CER_WEEKS,
      REPORTING_ROOFTOPS,
      "Premier Auto Group",
      "Premier Auto Group",
    );

    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((row) => row.dealer === "Premier Auto Group")).toBe(true);
  });

  it("lists dealers for a group and resets dealers outside that group", () => {
    expect(
      listReportDealerships(REPORTING_ROOFTOPS, "Lakeside Auto Group"),
    ).toEqual(["Lakeside Ford", "Lakeside Honda", "Lakeside Toyota"]);
    expect(
      isReportDealershipInGroup(
        REPORTING_ROOFTOPS,
        "Lakeside Honda",
        "Premier Auto Group",
      ),
    ).toBe(false);
  });
});

describe("report weekly sections", () => {
  it("sums every dealer in a week into one cumulative section, newest first", () => {
    const sections = aggregateReportWeeks(TWO_DEALER_WEEKS);

    expect(sections.map((section) => section.label)).toEqual([
      "Aug 08–Aug 14",
      "Aug 01–Aug 07",
    ]);

    const [recent] = sections;

    expect(recent?.dealershipCount).toBe(2);
    expect(recent?.metricsByMessage.initial).toEqual({ sent: 300, clicks: 50 });
    expect(recent?.metricsByMessage.reminder1).toEqual({
      sent: 110,
      clicks: 11,
    });
    expect(recent?.metricsByMessage.reminder3).toEqual({ sent: 20, clicks: 2 });
    expect(recent?.totals).toEqual({ sent: 480, clicks: 68 });
  });

  it("reports a week that only one dealer contributed to", () => {
    const [, partialWeek] = aggregateReportWeeks(TWO_DEALER_WEEKS);

    expect(partialWeek?.label).toBe("Aug 01–Aug 07");
    expect(partialWeek?.dealershipCount).toBe(1);
    expect(partialWeek?.totals).toEqual({ sent: 145, clicks: 13 });
  });

  it("returns no sections when no week matches the filters", () => {
    expect(
      aggregateReportWeeks(
        filterReportWeeks(
          WEEKLY_CER_WEEKS,
          REPORTING_ROOFTOPS,
          "Nonexistent Group",
        ),
      ),
    ).toEqual([]);
  });

  it("keeps one section per week of the shared reporting mock", () => {
    const weeks = filterReportWeeks(WEEKLY_CER_WEEKS, REPORTING_ROOFTOPS);
    const sections = aggregateReportWeeks(weeks);

    expect(sections).toHaveLength(new Set(weeks.map((week) => week.id)).size);
    expect(sections.map((section) => section.startDate)).toEqual(
      [...sections.map((section) => section.startDate)].sort((left, right) =>
        right.localeCompare(left),
      ),
    );
    for (const section of sections) {
      const dealers = weeks
        .filter((week) => week.id === section.weekId)
        .map((week) => week.dealer);
      expect(section.dealershipCount).toBe(new Set(dealers).size);
    }
  });
});

describe("report weekly scope", () => {
  it("names a single dealership and links it to activity", () => {
    const scope = describeReportWeeklyScope({
      rooftops: REPORTING_ROOFTOPS,
      weeks: TWO_DEALER_WEEKS,
      dealership: "Ikon Motors North",
    });

    expect(scope).toEqual({
      name: "Ikon Motors North",
      isCumulative: false,
      dealershipCount: 1,
      dealershipId: "rt-ikon-north",
    });
  });

  it("counts the rooftops behind a cumulative group scope", () => {
    const scope = describeReportWeeklyScope({
      rooftops: REPORTING_ROOFTOPS,
      weeks: TWO_DEALER_WEEKS,
      group: "Ikon Motors",
    });

    expect(scope.name).toBe("Ikon Motors");
    expect(scope.isCumulative).toBe(true);
    expect(scope.dealershipCount).toBe(2);
    expect(scope.dealershipId).toBeNull();
  });

  it("falls back to a cumulative all-dealers scope", () => {
    const scope = describeReportWeeklyScope({
      rooftops: REPORTING_ROOFTOPS,
      weeks: TWO_DEALER_WEEKS,
    });

    expect(scope.name).toBe("All dealers");
    expect(scope.isCumulative).toBe(true);
    expect(scope.dealershipCount).toBe(2);
  });

  it("keeps a missing dealership linkless", () => {
    const scope = describeReportWeeklyScope({
      rooftops: REPORTING_ROOFTOPS,
      weeks: TWO_DEALER_WEEKS,
      dealership: "Unlisted Motors",
    });

    expect(scope.name).toBe("Unlisted Motors");
    expect(scope.dealershipId).toBeNull();
  });
});

describe("report activity drill-down", () => {
  it("keeps the full activity set when no dealership is selected", () => {
    expect(filterReportActivityRows(ACTIVITY_DETAIL_ROWS)).toEqual(
      ACTIVITY_DETAIL_ROWS,
    );
  });

  it("gives every dealership at least 10 customers", () => {
    for (const rooftop of REPORTING_ROOFTOPS) {
      const rows = filterReportActivityRows(
        ACTIVITY_DETAIL_ROWS,
        rooftop.rooftop,
      );
      expect(rows.length).toBeGreaterThanOrEqual(10);
    }
  });

  it("keeps Maria Alvarez on Ikon Motors North with the rest of that store", () => {
    const rows = filterReportActivityRows(
      ACTIVITY_DETAIL_ROWS,
      "Ikon Motors North",
    );

    expect(rows.some((row) => row.customer === "Maria Alvarez")).toBe(true);
    expect(rows).toHaveLength(10);
  });

  it("resolves a dealership id from the portfolio", () => {
    expect(findDealershipById(REPORTING_ROOFTOPS, "rt-ikon-north")?.rooftop).toBe(
      "Ikon Motors North",
    );
    expect(findDealershipById(REPORTING_ROOFTOPS, "missing")).toBeUndefined();
  });
});
