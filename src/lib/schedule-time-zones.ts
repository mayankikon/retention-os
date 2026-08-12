import { TIME_ZONE_SCHEDULE_REFERENCE } from "@/data/campaign-setup.defaults";
import {
  convertSendTimeBetweenZones,
  formatSendTimeLabel,
} from "@/lib/send-time";
import { SETUP_TIME_ZONES, type SetupTimeZone } from "@/types/campaign-setup";

export interface ScheduleTimeZoneRow {
  timeZone: SetupTimeZone;
  /** When customers in this zone receive the SMS, on their own local clock. */
  smsWindow: string;
  /** The same moment expressed on the campaign manager's clock. */
  managerTime: string;
  isManagerZone: boolean;
}

export interface ScheduleTimeZoneTable {
  /** Zone the manager column is expressed in. */
  managerTimeZone: SetupTimeZone;
  /** True when rows are derived from a pinned send time instead of SOP windows. */
  isPinnedToSendTime: boolean;
  rows: ScheduleTimeZoneRow[];
}

function formatDayOffset(dayOffset: number): string {
  if (dayOffset < 0) return " (prev day)";
  if (dayOffset > 0) return " (next day)";
  return "";
}

/**
 * Rows for the schedule reference table.
 *
 * With no pinned send time the authored SOP lunch windows are shown, which are
 * expressed against CST. Once a send time is pinned, every dealership sends at
 * that same local clock time, so each row converts back to the manager's zone.
 */
export function getScheduleTimeZoneTable(
  sendTimeLocal: string | null | undefined,
  managerTimeZone: SetupTimeZone,
): ScheduleTimeZoneTable {
  const sendTimeLabel = formatSendTimeLabel(sendTimeLocal);

  if (!sendTimeLabel) {
    return {
      managerTimeZone: "CST",
      isPinnedToSendTime: false,
      rows: TIME_ZONE_SCHEDULE_REFERENCE.map((row) => ({
        timeZone: row.timeZone,
        smsWindow: row.smsWindow,
        managerTime: row.managerTime,
        isManagerZone: row.timeZone === managerTimeZone,
      })),
    };
  }

  return {
    managerTimeZone,
    isPinnedToSendTime: true,
    rows: SETUP_TIME_ZONES.map((timeZone) => {
      if (timeZone === managerTimeZone) {
        return {
          timeZone,
          smsWindow: sendTimeLabel,
          managerTime: `Same (${managerTimeZone})`,
          isManagerZone: true,
        };
      }

      const converted = convertSendTimeBetweenZones(
        sendTimeLocal,
        timeZone,
        managerTimeZone,
      );

      return {
        timeZone,
        smsWindow: sendTimeLabel,
        managerTime: converted
          ? `${formatSendTimeLabel(converted.time)} ${managerTimeZone}${formatDayOffset(converted.dayOffset)}`
          : "—",
        isManagerZone: false,
      };
    }),
  };
}
