import type { CampaignSetupDraft } from "@/types/campaign-setup";

const DATE_INPUT_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Clock time applied on the campaign start date (start of local day). */
const DEFAULT_START_TIME_LOCAL = "00:00";

/**
 * Formats a `yyyy-MM-dd` value from the local calendar date.
 * `toISOString().slice(0, 10)` is avoided because it shifts to UTC and can
 * report yesterday or tomorrow for operators west or east of Greenwich.
 */
export function toDateInputValue(date: Date): string {
  const year = String(date.getFullYear()).padStart(4, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/** True when the value is a `yyyy-MM-dd` string naming a real calendar date. */
export function isValidDateInput(value: string | null | undefined): boolean {
  return parseDateInput(value) !== null;
}

/** Local midnight for a `yyyy-MM-dd` value, or null when it is not a real date. */
function parseDateInput(value: string | null | undefined): Date | null {
  if (!value) return null;

  const match = DATE_INPUT_PATTERN.exec(value.trim());
  if (!match) return null;

  const year = Number.parseInt(match[1], 10);
  const month = Number.parseInt(match[2], 10);
  const day = Number.parseInt(match[3], 10);
  const parsed = new Date(year, month - 1, day);

  // Rejects overflow dates such as 2026-02-30, which Date silently rolls over.
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return parsed;
}

export interface CampaignWindow {
  /** ISO instant the campaign starts sending. */
  startsAt: string;
  /** ISO instant the campaign stops sending, or null while no end date is set. */
  endsAt: string | null;
}

/**
 * Turns the operator-facing date fields into instants.
 * Start date begins at local midnight; the end date runs through the end of
 * that local day when set.
 */
export function resolveCampaignWindow(
  draft: Pick<CampaignSetupDraft, "campaignStartDate" | "campaignEndDate">,
  createdAt: Date,
): CampaignWindow {
  return {
    startsAt: resolveStartsAt(draft.campaignStartDate, createdAt),
    endsAt: resolveEndsAt(draft.campaignEndDate),
  };
}

function resolveStartsAt(
  campaignStartDate: string | null,
  createdAt: Date,
): string {
  const startDate = parseDateInput(campaignStartDate);
  if (!startDate) return createdAt.toISOString();

  const [hour, minute] = DEFAULT_START_TIME_LOCAL.split(":");
  startDate.setHours(Number.parseInt(hour, 10), Number.parseInt(minute, 10), 0, 0);

  return startDate.toISOString();
}

function resolveEndsAt(campaignEndDate: string): string | null {
  const endDate = parseDateInput(campaignEndDate);
  if (!endDate) return null;

  endDate.setHours(23, 59, 59, 999);

  return endDate.toISOString();
}

/**
 * Rules for the campaign run window: the start date is required, the end date
 * is optional, and when both are set the window must move forward in time.
 */
export function validateCampaignWindow(
  draft: Pick<CampaignSetupDraft, "campaignStartDate" | "campaignEndDate">,
  now: Date = new Date(),
): Record<string, string> {
  const errors: Record<string, string> = {};
  const startDate = draft.campaignStartDate?.trim() ?? "";
  const endDate = draft.campaignEndDate.trim();

  if (!startDate) {
    errors.campaignStartDate = "Campaign start date is required.";
  } else if (!isValidDateInput(startDate)) {
    errors.campaignStartDate = "Enter a start date as YYYY-MM-DD.";
  }

  if (endDate) {
    if (!isValidDateInput(endDate)) {
      errors.campaignEndDate = "Enter an end date as YYYY-MM-DD.";
    } else if (!errors.campaignStartDate) {
      const earliestEndDate = startDate || toDateInputValue(now);

      // `yyyy-MM-dd` strings compare correctly as text, so no parsing is needed.
      if (endDate < earliestEndDate) {
        errors.campaignEndDate = startDate
          ? "End date must be on or after the start date."
          : "End date must be today or later.";
      }
    }
  }

  return errors;
}
