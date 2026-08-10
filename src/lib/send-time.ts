/** Minute granularity offered by the send time control. */
export const SEND_TIME_MINUTE_STEP = 5;

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
