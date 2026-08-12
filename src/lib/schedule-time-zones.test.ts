import { describe, expect, it } from "vitest";
import { getScheduleTimeZoneTable } from "@/lib/schedule-time-zones";
import { convertSendTimeBetweenZones } from "@/lib/send-time";

describe("convertSendTimeBetweenZones", () => {
  it("matches the offsets implied by the SOP reference table", () => {
    expect(convertSendTimeBetweenZones("12:05", "EST", "CST")?.time).toBe(
      "11:05",
    );
    expect(convertSendTimeBetweenZones("12:15", "PST", "CST")?.time).toBe(
      "14:15",
    );
    expect(convertSendTimeBetweenZones("12:00", "MST", "CST")?.time).toBe(
      "13:00",
    );
  });

  it("is a no-op within the same zone", () => {
    expect(convertSendTimeBetweenZones("06:10", "CST", "CST")).toEqual({
      time: "06:10",
      dayOffset: 0,
    });
  });

  it("reports a previous-day roll when the conversion crosses midnight", () => {
    expect(convertSendTimeBetweenZones("00:30", "EST", "PST")).toEqual({
      time: "21:30",
      dayOffset: -1,
    });
  });

  it("reports a next-day roll when the conversion crosses midnight forward", () => {
    expect(convertSendTimeBetweenZones("23:30", "PST", "EST")).toEqual({
      time: "02:30",
      dayOffset: 1,
    });
  });

  it("returns null for invalid input", () => {
    expect(convertSendTimeBetweenZones(null, "CST", "EST")).toBeNull();
    expect(convertSendTimeBetweenZones("25:00", "CST", "EST")).toBeNull();
  });
});

describe("getScheduleTimeZoneTable", () => {
  it("falls back to the authored SOP windows when no send time is pinned", () => {
    const table = getScheduleTimeZoneTable(null, "EST");

    expect(table.isPinnedToSendTime).toBe(false);
    expect(table.managerTimeZone).toBe("CST");
    expect(table.rows.find((row) => row.timeZone === "CST")?.smsWindow).toBe(
      "11:45am – 12:30pm",
    );
    expect(table.rows.find((row) => row.timeZone === "EST")?.isManagerZone).toBe(
      true,
    );
  });

  it("converts a pinned send time into each zone's manager time", () => {
    const table = getScheduleTimeZoneTable("06:10", "CST");

    expect(table.isPinnedToSendTime).toBe(true);
    expect(table.managerTimeZone).toBe("CST");
    expect(
      table.rows.map((row) => [row.timeZone, row.smsWindow, row.managerTime]),
    ).toEqual([
      ["CST", "6:10 AM", "Same (CST)"],
      ["EST", "6:10 AM", "5:10 AM CST"],
      ["PST", "6:10 AM", "8:10 AM CST"],
      ["MST", "6:10 AM", "7:10 AM CST"],
    ]);
  });

  it("expresses the manager column in the primary dealership zone", () => {
    const table = getScheduleTimeZoneTable("12:30", "PST");

    expect(table.managerTimeZone).toBe("PST");
    expect(table.rows.find((row) => row.timeZone === "PST")?.managerTime).toBe(
      "Same (PST)",
    );
    expect(table.rows.find((row) => row.timeZone === "CST")?.managerTime).toBe(
      "10:30 AM PST",
    );
  });

  it("flags a day roll in the manager column", () => {
    const table = getScheduleTimeZoneTable("00:30", "PST");

    expect(table.rows.find((row) => row.timeZone === "EST")?.managerTime).toBe(
      "9:30 PM PST (prev day)",
    );
  });

  it("updates every row when the send time changes", () => {
    const morning = getScheduleTimeZoneTable("06:10", "CST");
    const afternoon = getScheduleTimeZoneTable("14:45", "CST");

    expect(morning.rows.map((row) => row.smsWindow)).not.toEqual(
      afternoon.rows.map((row) => row.smsWindow),
    );
    expect(afternoon.rows.every((row) => row.smsWindow === "2:45 PM")).toBe(
      true,
    );
  });
});
