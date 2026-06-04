import {
  DAY_WIDTH_PX,
  TIMELINE_END_ISO,
  TIMELINE_START_ISO,
  TOTAL_TIMELINE_DAYS,
} from "@/lib/story-map/constants";

const MS_PER_DAY = 86_400_000;

function parseIsoDateUtc(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function formatIsoDateUtc(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const timelineStartUtc = parseIsoDateUtc(TIMELINE_START_ISO);
const timelineEndUtc = parseIsoDateUtc(TIMELINE_END_ISO);

export function getTimelineDayIndex(isoDate: string): number {
  const date = parseIsoDateUtc(isoDate);
  const rawIndex = Math.floor(
    (date.getTime() - timelineStartUtc.getTime()) / MS_PER_DAY,
  );
  return clampDayIndex(rawIndex);
}

export function getDateFromDayIndex(dayIndex: number): string {
  const clamped = clampDayIndex(dayIndex);
  const date = new Date(timelineStartUtc.getTime() + clamped * MS_PER_DAY);
  return formatIsoDateUtc(date);
}

export function clampDayIndex(dayIndex: number): number {
  return Math.max(0, Math.min(TOTAL_TIMELINE_DAYS - 1, dayIndex));
}

export function clampDurationDays(durationDays: number): number {
  return Math.max(1, Math.round(durationDays));
}

export function durationToWidthPx(
  durationDays: number,
  dayWidthPx: number = DAY_WIDTH_PX,
): number {
  return clampDurationDays(durationDays) * dayWidthPx;
}

export function startDateToLeftPx(
  startDate: string,
  dayWidthPx: number = DAY_WIDTH_PX,
): number {
  return getTimelineDayIndex(startDate) * dayWidthPx;
}

export function snapDayIndexFromPointer(
  clientX: number,
  scrollLeft: number,
  originLeft: number,
  dayWidthPx: number = DAY_WIDTH_PX,
): number {
  const relativeX = clientX - originLeft + scrollLeft;
  const rawIndex = Math.floor(relativeX / dayWidthPx);
  return clampDayIndex(rawIndex);
}

export function dayIndexToLeftPercent(dayIndex: number): string {
  return `${(clampDayIndex(dayIndex) / TOTAL_TIMELINE_DAYS) * 100}%`;
}

export function durationToWidthPercent(durationDays: number): string {
  return `${(clampDurationDays(durationDays) / TOTAL_TIMELINE_DAYS) * 100}%`;
}

export function startDateToLeftPercent(startDate: string): string {
  return dayIndexToLeftPercent(getTimelineDayIndex(startDate));
}

/** Map pointer X within a full-width timeline container to a day index */
export function snapDayIndexFromContainer(
  clientX: number,
  originLeft: number,
  containerWidthPx: number,
): number {
  if (containerWidthPx <= 0) return 0;
  const relativeX = clientX - originLeft;
  const rawIndex = Math.floor(
    (relativeX / containerWidthPx) * TOTAL_TIMELINE_DAYS,
  );
  return clampDayIndex(rawIndex);
}

export function getMaxStartDayIndex(durationDays: number): number {
  return Math.max(0, TOTAL_TIMELINE_DAYS - clampDurationDays(durationDays));
}

export function clampStartDateForDuration(
  startDate: string,
  durationDays: number,
): string {
  const startIndex = getTimelineDayIndex(startDate);
  const maxStart = getMaxStartDayIndex(durationDays);
  return getDateFromDayIndex(Math.min(startIndex, maxStart));
}

export function addDaysToIso(isoDate: string, days: number): string {
  const date = parseIsoDateUtc(isoDate);
  date.setUTCDate(date.getUTCDate() + days);
  return formatIsoDateUtc(date);
}

export function isDateInTimelineRange(isoDate: string): boolean {
  const date = parseIsoDateUtc(isoDate);
  return date >= timelineStartUtc && date <= timelineEndUtc;
}

export interface MonthSegment {
  label: string;
  startDayIndex: number;
  dayCount: number;
}

export function buildMonthSegments(): MonthSegment[] {
  const segments: MonthSegment[] = [];
  let cursor = new Date(timelineStartUtc.getTime());

  while (cursor <= timelineEndUtc) {
    const year = cursor.getUTCFullYear();
    const month = cursor.getUTCMonth();
    const monthStart = new Date(Date.UTC(year, month, 1));
    const monthEnd = new Date(Date.UTC(year, month + 1, 0));

    const segmentStart = cursor > monthStart ? cursor : monthStart;
    const segmentEnd = monthEnd > timelineEndUtc ? timelineEndUtc : monthEnd;

    const startDayIndex = Math.floor(
      (segmentStart.getTime() - timelineStartUtc.getTime()) / MS_PER_DAY,
    );
    const dayCount =
      Math.floor(
        (segmentEnd.getTime() - segmentStart.getTime()) / MS_PER_DAY,
      ) + 1;

    const label = segmentStart.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });

    segments.push({ label, startDayIndex, dayCount });
    cursor = new Date(Date.UTC(year, month + 1, 1));
  }

  return segments;
}
