import type { ScheduleDay } from "@/types/campaign-setup";

const SCHEDULE_DAY_LABELS: Record<ScheduleDay, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
};

export function formatScheduleDay(day: ScheduleDay): string {
  return SCHEDULE_DAY_LABELS[day];
}

export function formatScheduleDays(days: ScheduleDay[]): string {
  if (days.length === 0) return "—";
  return days.map(formatScheduleDay).join(", ");
}

export const CONFIGURATION_DAY_LABELS = SCHEDULE_DAY_LABELS;
