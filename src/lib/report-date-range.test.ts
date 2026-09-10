import { describe, expect, it } from "vitest";
import {
  countOverlapDays,
  countReportRangeDays,
  DEFAULT_REPORT_DATE_PRESET,
  formatReportDateRange,
  getPrecedingReportDateRange,
  listReportDatePresets,
  matchReportDatePreset,
  normalizeReportDateRange,
  parseIsoDate,
  resolveReportDatePreset,
  shiftIsoDate,
  toIsoDate,
} from "@/lib/report-date-range";
import type { ReportDateRange } from "@/types/reports";

/** Tuesday, Sep 8 2026 — mid-month, mid-week, so no preset lands on a boundary. */
const TODAY = "2026-09-08";

const SEPTEMBER_TO_DATE: ReportDateRange = {
  startDate: "2026-09-01",
  endDate: "2026-09-08",
};

describe("report date presets", () => {
  it("defaults to the current month up to today", () => {
    expect(resolveReportDatePreset(DEFAULT_REPORT_DATE_PRESET, TODAY)).toEqual(
      SEPTEMBER_TO_DATE,
    );
  });

  it("resolves each relative preset against today", () => {
    expect(resolveReportDatePreset("last3Days", TODAY)).toEqual({
      startDate: "2026-09-06",
      endDate: TODAY,
    });
    expect(resolveReportDatePreset("last7Days", TODAY)).toEqual({
      startDate: "2026-09-02",
      endDate: TODAY,
    });
    expect(resolveReportDatePreset("last90Days", TODAY)).toEqual({
      startDate: "2026-06-11",
      endDate: TODAY,
    });
    expect(resolveReportDatePreset("last6Months", TODAY)).toEqual({
      startDate: "2026-03-08",
      endDate: TODAY,
    });
    expect(resolveReportDatePreset("yearToDate", TODAY)).toEqual({
      startDate: "2026-01-01",
      endDate: TODAY,
    });
  });

  it("resolves whole calendar periods for last month and last week", () => {
    expect(resolveReportDatePreset("lastMonth", TODAY)).toEqual({
      startDate: "2026-08-01",
      endDate: "2026-08-31",
    });
    // Monday-first, matching the design system calendar.
    expect(resolveReportDatePreset("lastWeek", TODAY)).toEqual({
      startDate: "2026-08-31",
      endDate: "2026-09-06",
    });
  });

  it("rolls a January anchor back into the previous year", () => {
    expect(resolveReportDatePreset("lastMonth", "2026-01-15")).toEqual({
      startDate: "2025-12-01",
      endDate: "2025-12-31",
    });
  });

  it("lists every preset with a label and identifies the selected one", () => {
    const presets = listReportDatePresets(TODAY);

    expect(presets).toHaveLength(9);
    expect(presets[0]).toEqual({
      id: "monthToDate",
      label: "This Month",
      range: SEPTEMBER_TO_DATE,
    });
    expect(matchReportDatePreset(SEPTEMBER_TO_DATE, TODAY)).toBe("monthToDate");
    expect(
      matchReportDatePreset(
        { startDate: "2026-07-04", endDate: "2026-08-15" },
        TODAY,
      ),
    ).toBeNull();
  });
});

describe("report date range math", () => {
  it("counts inclusive days, including a single-day range", () => {
    expect(countReportRangeDays(SEPTEMBER_TO_DATE)).toBe(8);
    expect(
      countReportRangeDays({ startDate: TODAY, endDate: TODAY }),
    ).toBe(1);
  });

  it("counts only the days two ranges share", () => {
    expect(
      countOverlapDays(SEPTEMBER_TO_DATE, {
        startDate: "2026-09-05",
        endDate: "2026-09-20",
      }),
    ).toBe(4);
    expect(
      countOverlapDays(SEPTEMBER_TO_DATE, {
        startDate: "2026-08-01",
        endDate: "2026-08-31",
      }),
    ).toBe(0);
  });

  it("puts the comparison window immediately before the range", () => {
    expect(getPrecedingReportDateRange(SEPTEMBER_TO_DATE)).toEqual({
      startDate: "2026-08-24",
      endDate: "2026-08-31",
    });
  });

  it("shifts a day across month boundaries", () => {
    expect(shiftIsoDate("2026-09-01", -1)).toBe("2026-08-31");
    expect(shiftIsoDate("2026-12-31", 1)).toBe("2027-01-01");
  });
});

describe("report date range labels", () => {
  it("collapses the month and year both ends share", () => {
    expect(formatReportDateRange(SEPTEMBER_TO_DATE)).toBe("Sep 1 – 8, 2026");
  });

  it("keeps both months when the range spans a month", () => {
    expect(
      formatReportDateRange({
        startDate: "2026-07-04",
        endDate: "2026-08-15",
      }),
    ).toBe("Jul 4 – Aug 15, 2026");
  });

  it("keeps both years when the range spans a year", () => {
    expect(
      formatReportDateRange({
        startDate: "2025-12-01",
        endDate: "2026-01-15",
      }),
    ).toBe("Dec 1, 2025 – Jan 15, 2026");
  });

  it("reads a single day as one date", () => {
    expect(
      formatReportDateRange({ startDate: TODAY, endDate: TODAY }),
    ).toBe("Sep 8, 2026");
  });
});

describe("report date range parsing", () => {
  it("round-trips a Date through the ISO day format", () => {
    expect(toIsoDate(new Date(2026, 8, 8))).toBe(TODAY);
    expect(parseIsoDate(TODAY)?.getFullYear()).toBe(2026);
    expect(parseIsoDate(TODAY)?.getMonth()).toBe(8);
    expect(parseIsoDate(TODAY)?.getDate()).toBe(8);
  });

  it("rejects malformed, overflowing, and non-day values", () => {
    expect(parseIsoDate("")).toBeNull();
    expect(parseIsoDate("2026-9-8")).toBeNull();
    expect(parseIsoDate("2026-02-31")).toBeNull();
    expect(parseIsoDate("not-a-date")).toBeNull();
  });

  it("keeps a valid URL range and falls back on an invalid one", () => {
    expect(
      normalizeReportDateRange(
        { startDate: "2026-07-04", endDate: "2026-08-15" },
        SEPTEMBER_TO_DATE,
      ),
    ).toEqual({ startDate: "2026-07-04", endDate: "2026-08-15" });

    expect(
      normalizeReportDateRange({ startDate: "2026-07-04" }, SEPTEMBER_TO_DATE),
    ).toEqual(SEPTEMBER_TO_DATE);
    expect(
      normalizeReportDateRange(
        { startDate: "oops", endDate: "2026-08-15" },
        SEPTEMBER_TO_DATE,
      ),
    ).toEqual(SEPTEMBER_TO_DATE);
  });

  it("falls back when the range runs backwards", () => {
    expect(
      normalizeReportDateRange(
        { startDate: "2026-08-15", endDate: "2026-07-04" },
        SEPTEMBER_TO_DATE,
      ),
    ).toEqual(SEPTEMBER_TO_DATE);
  });
});
