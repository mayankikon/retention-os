import { describe, expect, it } from "vitest";
import { FILTER_ALL } from "@/data/lookups";
import {
  ACTIVITY_DETAIL_ROWS,
  REPORTING_ROOFTOPS,
  WEEKLY_CER_WEEKS,
} from "@/data/reporting.mock";
import {
  buildCsv,
  calculateCerPercent,
  canShowCerLeaderboard,
  filterActivityRows,
  filterWeeklyPerformance,
  formatMileage,
  isMultiRooftopGroup,
  MIN_CER_SAMPLE_SENT,
  MISSING_MILEAGE_DISPLAY,
  rankRooftopsByCer,
  summarizeActivity,
} from "@/lib/reporting";
import type { ReportingRooftop } from "@/types/reporting";

describe("CER ranking", () => {
  it("ranks rooftops by CER% and keeps dealer group as a secondary label", () => {
    const rows = rankRooftopsByCer(REPORTING_ROOFTOPS, "mtd");

    expect(rows[0]?.rooftop).toBe("Premier Auto Group");
    expect(rows[0]?.dealerGroup).toBe("Premier Auto Group");
    expect(rows[0]?.rank).toBe(1);
    expect(rows[1]?.rooftop).toBe("Heritage BMW");
    expect(rows[1]?.dealerGroup).toBe("Heritage Luxury Motors");
  });

  it("excludes single-rooftop groups from the leaderboard", () => {
    const rows = rankRooftopsByCer(REPORTING_ROOFTOPS, "mtd");

    expect(isMultiRooftopGroup(REPORTING_ROOFTOPS, "Summit Automotive Group")).toBe(
      false,
    );
    expect(rows.some((row) => row.rooftop === "Summit Chevrolet")).toBe(false);
  });

  it("does not crown a 100% CER rooftop with a tiny sample", () => {
    const rows = rankRooftopsByCer(REPORTING_ROOFTOPS, "mtd");
    const airport = rows.find((row) => row.rooftop === "Premier Airport");

    expect(airport?.sent).toBeLessThan(MIN_CER_SAMPLE_SENT);
    expect(airport?.cerPercent).toBe(100);
    expect(airport?.isLowSample).toBe(true);
    expect(airport?.rank).toBeNull();
    expect(rows[0]?.rooftop).not.toBe("Premier Airport");
    expect(rows[0]?.isLowSample).toBe(false);
  });

  it("filters rooftops by search without inventing group-as-rank entities", () => {
    const rows = rankRooftopsByCer(REPORTING_ROOFTOPS, "mtd", "lakeside");

    expect(rows.every((row) => row.dealerGroup === "Lakeside Auto Group")).toBe(
      true,
    );
    expect(rows.map((row) => row.rank)).toEqual([1, 2, 3]);
  });
});

describe("leaderboard visibility", () => {
  it("hides the leaderboard for an ungrouped rooftop scope", () => {
    expect(canShowCerLeaderboard("ungrouped")).toBe(false);
    expect(canShowCerLeaderboard("portfolio")).toBe(true);
  });
});

describe("weekly CER filters", () => {
  it("returns August 2026 weeks for the default reporting month", () => {
    const weeks = filterWeeklyPerformance(WEEKLY_CER_WEEKS, {
      year: 2026,
      month: 8,
      dealer: FILTER_ALL,
    });

    expect(weeks).toHaveLength(4);
    expect(weeks.every((week) => week.month === 8)).toBe(true);
  });

  it("returns no weeks when the dealer has no data in the selected month", () => {
    const weeks = filterWeeklyPerformance(WEEKLY_CER_WEEKS, {
      year: 2026,
      month: 8,
      dealer: "Heritage BMW",
    });

    expect(weeks).toHaveLength(0);
  });
});

describe("activity detail", () => {
  it("shows an em dash when mileage at click time is unknown", () => {
    expect(formatMileage(null)).toBe(MISSING_MILEAGE_DISPLAY);
    expect(formatMileage(41280)).toBe("41,280");
  });

  it("filters customer rows by rooftop and date range", () => {
    const rows = filterActivityRows(ACTIVITY_DETAIL_ROWS, {
      dateFrom: "2026-08-24",
      dateTo: "2026-08-28",
      dealer: FILTER_ALL,
      rooftop: "Ikon Motors North",
    });

    expect(rows).toHaveLength(1);
    expect(rows[0]?.customer).toBe("Maria Alvarez");
  });

  it("summarizes CER from clicked rows against messages sent", () => {
    const summary = summarizeActivity(ACTIVITY_DETAIL_ROWS, 1840, 12.4);

    expect(summary.totalClicks).toBe(8);
    expect(summary.cerPercent).toBe(calculateCerPercent(8, 1840));
    expect(summary.upliftPercent).toBe(12.4);
  });
});

describe("CSV export", () => {
  it("escapes commas and quotes in exported cells", () => {
    const csv = buildCsv(
      ["Customer", "Note"],
      [["Alvarez, Maria", 'Said "booked"']],
    );

    expect(csv).toBe('Customer,Note\n"Alvarez, Maria","Said ""booked"""');
  });
});

describe("sample rooftop fixtures", () => {
  it("keeps at least one low-sample rooftop in a multi-rooftop group", () => {
    const east = REPORTING_ROOFTOPS.find(
      (rooftop: ReportingRooftop) => rooftop.id === "rt-ikon-east",
    );

    expect(east?.metricsByPeriod.mtd.sent).toBeLessThan(MIN_CER_SAMPLE_SENT);
    expect(isMultiRooftopGroup(REPORTING_ROOFTOPS, "Ikon Motors")).toBe(true);
  });
});
