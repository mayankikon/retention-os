import { describe, expect, it } from "vitest";
import {
  formatSendTimeLabel,
  getSendTimeMinuteOptions,
  isSendTimeLocal,
  parseSendTimeLocal,
  toSendTimeLocal,
} from "@/lib/send-time";

describe("parseSendTimeLocal", () => {
  it("splits an afternoon time into 12-hour parts", () => {
    expect(parseSendTimeLocal("21:39")).toEqual({
      hour12: 9,
      minute: 39,
      meridiem: "PM",
    });
  });

  it("treats midnight as 12 AM and noon as 12 PM", () => {
    expect(parseSendTimeLocal("00:30")).toEqual({
      hour12: 12,
      minute: 30,
      meridiem: "AM",
    });
    expect(parseSendTimeLocal("12:00")).toEqual({
      hour12: 12,
      minute: 0,
      meridiem: "PM",
    });
  });

  it("returns null for empty or malformed values", () => {
    expect(parseSendTimeLocal(null)).toBeNull();
    expect(parseSendTimeLocal("")).toBeNull();
    expect(parseSendTimeLocal("25:99")).toBeNull();
    expect(parseSendTimeLocal("9:30 PM")).toBeNull();
  });
});

describe("toSendTimeLocal", () => {
  it("serializes parts to zero-padded 24-hour time", () => {
    expect(toSendTimeLocal({ hour12: 9, minute: 5, meridiem: "AM" })).toBe(
      "09:05",
    );
    expect(toSendTimeLocal({ hour12: 9, minute: 39, meridiem: "PM" })).toBe(
      "21:39",
    );
  });

  it("maps 12 AM to midnight and 12 PM to noon", () => {
    expect(toSendTimeLocal({ hour12: 12, minute: 0, meridiem: "AM" })).toBe(
      "00:00",
    );
    expect(toSendTimeLocal({ hour12: 12, minute: 0, meridiem: "PM" })).toBe(
      "12:00",
    );
  });

  it("round-trips every value the control can produce", () => {
    for (const meridiem of ["AM", "PM"] as const) {
      for (let hour12 = 1; hour12 <= 12; hour12 += 1) {
        const serialized = toSendTimeLocal({ hour12, minute: 45, meridiem });
        expect(isSendTimeLocal(serialized)).toBe(true);
        expect(parseSendTimeLocal(serialized)).toEqual({
          hour12,
          minute: 45,
          meridiem,
        });
      }
    }
  });
});

describe("formatSendTimeLabel", () => {
  it("formats a stored value for operators", () => {
    expect(formatSendTimeLabel("12:30")).toBe("12:30 PM");
    expect(formatSendTimeLabel("09:05")).toBe("9:05 AM");
  });

  it("returns an empty string when no time is set", () => {
    expect(formatSendTimeLabel(null)).toBe("");
  });
});

describe("getSendTimeMinuteOptions", () => {
  it("offers five-minute steps by default", () => {
    const options = getSendTimeMinuteOptions();
    expect(options).toHaveLength(12);
    expect(options[0]).toEqual({ value: "0", label: "00" });
    expect(options.at(-1)).toEqual({ value: "55", label: "55" });
  });

  it("keeps an existing off-step minute selectable", () => {
    const options = getSendTimeMinuteOptions(39);
    expect(options.map((option) => option.value)).toContain("39");
  });
});
