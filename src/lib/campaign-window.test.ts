import { describe, expect, it } from "vitest";
import {
  isFutureCampaignStartDate,
  isValidDateInput,
  resolveCampaignWindow,
  toDateInputValue,
  validateCampaignWindow,
} from "@/lib/campaign-window";

function windowDraft(overrides: {
  campaignStartDate?: string | null;
  campaignEndDate?: string;
}) {
  return {
    campaignStartDate: null,
    campaignEndDate: "",
    ...overrides,
  };
}

describe("toDateInputValue", () => {
  it("formats the local calendar date without shifting to UTC", () => {
    expect(toDateInputValue(new Date(2026, 0, 5, 23, 30))).toBe("2026-01-05");
    expect(toDateInputValue(new Date(2026, 11, 31, 0, 15))).toBe("2026-12-31");
  });
});

describe("isFutureCampaignStartDate", () => {
  const now = new Date(2026, 7, 21, 15, 0);

  it("is false for today, the past, and missing dates", () => {
    expect(isFutureCampaignStartDate("2026-08-21", now)).toBe(false);
    expect(isFutureCampaignStartDate("2026-08-20", now)).toBe(false);
    expect(isFutureCampaignStartDate(null, now)).toBe(false);
    expect(isFutureCampaignStartDate("not-a-date", now)).toBe(false);
  });

  it("is true only when the start date is after today", () => {
    expect(isFutureCampaignStartDate("2026-08-22", now)).toBe(true);
  });
});

describe("isValidDateInput", () => {
  it("accepts a real yyyy-MM-dd date", () => {
    expect(isValidDateInput("2026-02-28")).toBe(true);
  });

  it("rejects blank, malformed, and non-calendar dates", () => {
    expect(isValidDateInput("")).toBe(false);
    expect(isValidDateInput(null)).toBe(false);
    expect(isValidDateInput("08/12/2026")).toBe(false);
    expect(isValidDateInput("2026-02-30")).toBe(false);
    expect(isValidDateInput("2026-13-01")).toBe(false);
  });
});

describe("resolveCampaignWindow", () => {
  const createdAt = new Date(2026, 7, 12, 9, 56, 12);

  it("starts at the creation moment when no start date is set", () => {
    const window = resolveCampaignWindow(
      windowDraft({ campaignEndDate: "2026-09-30" }),
      createdAt,
    );

    expect(window.startsAt).toBe(createdAt.toISOString());
  });

  it("starts at the beginning of the chosen start date", () => {
    const window = resolveCampaignWindow(
      windowDraft({
        campaignStartDate: "2026-09-01",
        campaignEndDate: "2026-09-30",
      }),
      createdAt,
    );

    const startsAt = new Date(window.startsAt);
    expect(toDateInputValue(startsAt)).toBe("2026-09-01");
    expect(startsAt.getHours()).toBe(0);
    expect(startsAt.getMinutes()).toBe(0);
  });

  it("ends at the end of the local end date", () => {
    const window = resolveCampaignWindow(
      windowDraft({
        campaignStartDate: "2026-09-01",
        campaignEndDate: "2026-09-30",
      }),
      createdAt,
    );

    const endsAt = new Date(window.endsAt as string);
    expect(toDateInputValue(endsAt)).toBe("2026-09-30");
    expect(endsAt.getHours()).toBe(23);
    expect(endsAt.getMinutes()).toBe(59);
  });

  it("returns a null end instant while no end date is chosen", () => {
    expect(
      resolveCampaignWindow(
        windowDraft({ campaignStartDate: "2026-09-01" }),
        createdAt,
      ).endsAt,
    ).toBeNull();
  });
});

describe("validateCampaignWindow", () => {
  const now = new Date(2026, 7, 12, 9, 56);

  it("requires a start date", () => {
    const errors = validateCampaignWindow(
      windowDraft({ campaignEndDate: "2026-08-31" }),
      now,
    );
    expect(errors.campaignStartDate).toBe("Campaign start date is required.");
  });

  it("allows a blank optional end date when start date is set", () => {
    const errors = validateCampaignWindow(
      windowDraft({ campaignStartDate: "2026-08-20" }),
      now,
    );
    expect(errors).toEqual({});
  });

  it("accepts an end date on the same day the campaign starts", () => {
    const errors = validateCampaignWindow(
      windowDraft({
        campaignStartDate: "2026-08-20",
        campaignEndDate: "2026-08-20",
      }),
      now,
    );
    expect(errors).toEqual({});
  });

  it("rejects an end date before the start date", () => {
    const errors = validateCampaignWindow(
      windowDraft({
        campaignStartDate: "2026-08-20",
        campaignEndDate: "2026-08-19",
      }),
      now,
    );
    expect(errors.campaignEndDate).toBe(
      "End date must be on or after the start date.",
    );
  });

  it("rejects malformed start dates", () => {
    const errors = validateCampaignWindow(
      windowDraft({
        campaignStartDate: "2026-02-30",
        campaignEndDate: "2026-09-30",
      }),
      now,
    );

    expect(errors.campaignStartDate).toBeDefined();
  });

  it("rejects malformed end dates when provided", () => {
    const errors = validateCampaignWindow(
      windowDraft({
        campaignStartDate: "2026-08-20",
        campaignEndDate: "2026-02-30",
      }),
      now,
    );

    expect(errors.campaignEndDate).toBeDefined();
  });
});
