import { describe, expect, it } from "vitest";
import {
  addDaysToIso,
  clampDayIndex,
  clampDurationDays,
  clampStartDateForDuration,
  durationToWidthPx,
  getDateFromDayIndex,
  getMaxStartDayIndex,
  getTimelineDayIndex,
  snapDayIndexFromContainer,
  snapDayIndexFromPointer,
  startDateToLeftPercent,
  startDateToLeftPx,
} from "@/lib/story-map/timeline-math";
import { DAY_WIDTH_PX, TOTAL_TIMELINE_DAYS } from "@/lib/story-map/constants";

describe("getTimelineDayIndex", () => {
  it("returns 0 for timeline start", () => {
    expect(getTimelineDayIndex("2026-06-01")).toBe(0);
  });

  it("clamps dates before the timeline start", () => {
    expect(getTimelineDayIndex("2026-05-01")).toBe(0);
  });

  it("clamps dates after the timeline end", () => {
    expect(getTimelineDayIndex("2028-01-01")).toBe(TOTAL_TIMELINE_DAYS - 1);
  });
});

describe("getDateFromDayIndex", () => {
  it("round-trips with getTimelineDayIndex", () => {
    const iso = getDateFromDayIndex(30);
    expect(getTimelineDayIndex(iso)).toBe(30);
  });
});

describe("clampDayIndex", () => {
  it("keeps in-range values", () => {
    expect(clampDayIndex(10)).toBe(10);
  });

  it("clamps negative and overflow indices", () => {
    expect(clampDayIndex(-5)).toBe(0);
    expect(clampDayIndex(99999)).toBe(TOTAL_TIMELINE_DAYS - 1);
  });
});

describe("duration and position helpers", () => {
  it("converts duration to pixel width", () => {
    expect(durationToWidthPx(7)).toBe(7 * DAY_WIDTH_PX);
  });

  it("enforces minimum duration of 1 day", () => {
    expect(clampDurationDays(0)).toBe(1);
    expect(durationToWidthPx(0)).toBe(DAY_WIDTH_PX);
  });

  it("maps start date to left offset", () => {
    expect(startDateToLeftPx("2026-06-01")).toBe(0);
    expect(startDateToLeftPx("2026-06-08")).toBe(7 * DAY_WIDTH_PX);
  });

  it("snaps pointer position to day index", () => {
    const originLeft = 100;
    const scrollLeft = 0;
    const clientX = originLeft + 3 * DAY_WIDTH_PX + 5;
    expect(
      snapDayIndexFromPointer(clientX, scrollLeft, originLeft),
    ).toBe(3);
  });

  it("maps percent layout start date", () => {
    expect(startDateToLeftPercent("2026-06-01")).toBe("0%");
  });
});

describe("snapDayIndexFromContainer", () => {
  it("snaps pointer within container width", () => {
    const originLeft = 0;
    const containerWidth = TOTAL_TIMELINE_DAYS * DAY_WIDTH_PX;
    const clientX = 3 * DAY_WIDTH_PX + 5;
    expect(
      snapDayIndexFromContainer(clientX, originLeft, containerWidth),
    ).toBe(3);
  });
});

describe("clampStartDateForDuration", () => {
  it("prevents bar from extending past timeline end", () => {
    const maxStart = getMaxStartDayIndex(14);
    const clamped = clampStartDateForDuration("2027-06-30", 14);
    expect(getTimelineDayIndex(clamped)).toBe(maxStart);
  });
});

describe("addDaysToIso", () => {
  it("adds days across month boundaries", () => {
    expect(addDaysToIso("2026-06-30", 1)).toBe("2026-07-01");
  });
});
