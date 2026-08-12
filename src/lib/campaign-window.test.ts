import { describe, expect, it } from "vitest";
import {
  isValidDateInput,
  resolveCampaignWindow,
  toDateInputValue,
  validateCampaignWindow,
} from "@/lib/campaign-window";

function windowDraft(overrides: {
  campaignStartDate?: string | null;
  campaignStartTimeLocal?: string | null;
  campaignEndDate?: string;
}) {
  return {
    campaignStartDate: null,
    campaignStartTimeLocal: null,
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

  it("applies the chosen start date and time in local time", () => {
    const window = resolveCampaignWindow(
      windowDraft({
        campaignStartDate: "2026-09-01",
        campaignStartTimeLocal: "14:30",
        campaignEndDate: "2026-09-30",
      }),
      createdAt,
    );

    const startsAt = new Date(window.startsAt);
    expect(toDateInputValue(startsAt)).toBe("2026-09-01");
    expect(startsAt.getHours()).toBe(14);
    expect(startsAt.getMinutes()).toBe(30);
  });

  it("starts at the beginning of the day when only a start date is set", () => {
    const window = resolveCampaignWindow(
      windowDraft({
        campaignStartDate: "2026-09-01",
        campaignEndDate: "2026-09-30",
      }),
      createdAt,
    );

    const startsAt = new Date(window.startsAt);
    expect(startsAt.getHours()).toBe(0);
    expect(startsAt.getMinutes()).toBe(0);
  });

  it("ends at the end of the local end date", () => {
    const window = resolveCampaignWindow(
      windowDraft({ campaignEndDate: "2026-09-30" }),
      createdAt,
    );

    const endsAt = new Date(window.endsAt as string);
    expect(toDateInputValue(endsAt)).toBe("2026-09-30");
    expect(endsAt.getHours()).toBe(23);
    expect(endsAt.getMinutes()).toBe(59);
  });

  it("returns a null end instant while no end date is chosen", () => {
    expect(resolveCampaignWindow(windowDraft({}), createdAt).endsAt).toBeNull();
  });
});

describe("validateCampaignWindow", () => {
  const now = new Date(2026, 7, 12, 9, 56);

  it("requires an end date", () => {
    const errors = validateCampaignWindow(windowDraft({}), now);
    expect(errors.campaignEndDate).toBe("Campaign end date is required.");
  });

  it("accepts a future end date with no start date", () => {
    const errors = validateCampaignWindow(
      windowDraft({ campaignEndDate: "2026-08-31" }),
      now,
    );
    expect(errors).toEqual({});
  });

  it("accepts an end date on the same day the campaign starts", () => {
    const errors = validateCampaignWindow(
      windowDraft({
        campaignStartDate: "2026-08-20",
        campaignStartTimeLocal: "08:00",
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

  it("rejects a past end date when the campaign starts on creation", () => {
    const errors = validateCampaignWindow(
      windowDraft({ campaignEndDate: "2026-08-11" }),
      now,
    );
    expect(errors.campaignEndDate).toBe("End date must be today or later.");
  });

  it("rejects malformed start dates and start times", () => {
    const errors = validateCampaignWindow(
      windowDraft({
        campaignStartDate: "2026-02-30",
        campaignStartTimeLocal: "25:99",
        campaignEndDate: "2026-09-30",
      }),
      now,
    );

    expect(errors.campaignStartDate).toBeDefined();
    expect(errors.campaignStartTimeLocal).toBeDefined();
  });
});
