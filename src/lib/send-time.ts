import type { SetupTimeZone } from "@/types/campaign-setup";

/** Minute granularity offered by the send time control. */
export const SEND_TIME_MINUTE_STEP = 5;

const MINUTES_PER_DAY = 24 * 60;

/**
 * Standard-time UTC offsets. This prototype models the four fixed zone labels
 * without daylight saving, matching the authored SOP reference table.
 */
export const SETUP_TIME_ZONE_UTC_OFFSET_HOURS: Record<SetupTimeZone, number> = {
  EST: -5,
  CST: -6,
  MST: -7,
  PST: -8,
};

export const SEND_TIME_MERIDIEMS = ["AM", "PM"] as const;

export type SendTimeMeridiem = (typeof SEND_TIME_MERIDIEMS)[number];

export interface SendTimeParts {
  /** 1–12 as shown in the UI. */
  hour12: number;
  /** 0–59. */
  minute: number;
  meridiem: SendTimeMeridiem;
}

const SEND_TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function isSendTimeLocal(value: string): boolean {
  return SEND_TIME_PATTERN.test(value.trim());
}

/** Splits a stored 24-hour `HH:mm` value into the parts the UI selects. */
export function parseSendTimeLocal(
  value: string | null | undefined,
): SendTimeParts | null {
  if (!value) return null;

  const match = SEND_TIME_PATTERN.exec(value.trim());
  if (!match) return null;

  const hour24 = Number.parseInt(match[1], 10);
  const minute = Number.parseInt(match[2], 10);

  return {
    hour12: hour24 % 12 === 0 ? 12 : hour24 % 12,
    minute,
    meridiem: hour24 < 12 ? "AM" : "PM",
  };
}

/** Serializes UI parts back to the stored 24-hour `HH:mm` value. */
export function toSendTimeLocal({
  hour12,
  minute,
  meridiem,
}: SendTimeParts): string {
  const baseHour = hour12 % 12;
  const hour24 = meridiem === "PM" ? baseHour + 12 : baseHour;

  return `${String(hour24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

/** Operator-facing label, e.g. `12:30 PM`. Empty string when unset. */
export function formatSendTimeLabel(value: string | null | undefined): string {
  const parts = parseSendTimeLocal(value);
  if (!parts) return "";

  return `${parts.hour12}:${String(parts.minute).padStart(2, "0")} ${parts.meridiem}`;
}

export interface ConvertedSendTime {
  /** 24-hour `HH:mm` clock time in the target zone. */
  time: string;
  /** -1 when the moment lands on the previous day, +1 on the next day. */
  dayOffset: number;
}

/**
 * Re-expresses a wall-clock time in another zone, e.g. 6:10am EST is 5:10am CST.
 * Returns null when the input is not a valid `HH:mm` value.
 */
export function convertSendTimeBetweenZones(
  value: string | null | undefined,
  fromTimeZone: SetupTimeZone,
  toTimeZone: SetupTimeZone,
): ConvertedSendTime | null {
  const parts = parseSendTimeLocal(value);
  if (!parts) return null;

  const [hourText, minuteText] = toSendTimeLocal(parts).split(":");
  const minutesFromMidnight =
    Number.parseInt(hourText, 10) * 60 + Number.parseInt(minuteText, 10);
  const offsetMinutes =
    (SETUP_TIME_ZONE_UTC_OFFSET_HOURS[toTimeZone] -
      SETUP_TIME_ZONE_UTC_OFFSET_HOURS[fromTimeZone]) *
    60;

  const shifted = minutesFromMidnight + offsetMinutes;
  const normalized = ((shifted % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;

  return {
    time: `${String(Math.floor(normalized / 60)).padStart(2, "0")}:${String(
      normalized % 60,
    ).padStart(2, "0")}`,
    dayOffset: Math.floor(shifted / MINUTES_PER_DAY),
  };
}

export function getSendTimeHourOptions(): { value: string; label: string }[] {
  return Array.from({ length: 12 }, (_, index) => {
    const hour12 = index + 1;
    return { value: String(hour12), label: String(hour12) };
  });
}

/**
 * Minute options on the standard step, plus the current minute when a stored
 * value falls between steps so an existing time is never silently rewritten.
 */
export function getSendTimeMinuteOptions(
  currentMinute?: number,
): { value: string; label: string }[] {
  const minutes = new Set<number>();
  for (let minute = 0; minute < 60; minute += SEND_TIME_MINUTE_STEP) {
    minutes.add(minute);
  }
  if (currentMinute != null) {
    minutes.add(currentMinute);
  }

  return Array.from(minutes)
    .sort((a, b) => a - b)
    .map((minute) => ({
      value: String(minute),
      label: String(minute).padStart(2, "0"),
    }));
}
