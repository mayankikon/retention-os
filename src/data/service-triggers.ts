import type { ServiceTriggerMode, ServiceTriggerType } from "@/types/campaign-setup";

export interface ServiceTriggerPresetOption {
  value: string;
  label: string;
}

export interface ServiceTriggerTypeOption {
  value: ServiceTriggerType;
  label: string;
  description: string;
}

export interface ServiceTriggerModeOption {
  value: ServiceTriggerMode;
  label: string;
  description: string;
}

export interface OemServiceSchedule {
  make: string;
  model: string;
  intervalDays: number;
  intervalMiles: number;
  summary: string;
}

export const SERVICE_TRIGGER_MODE_OPTIONS: ServiceTriggerModeOption[] = [
  {
    value: "interval",
    label: "Time Interval and Mileage Interval",
    description:
      "Trigger outreach when either the time interval or mileage interval is reached, then narrow with an audience query",
  },
  {
    value: "oem",
    label: "OEM-Recommended Service Schedule",
    description:
      "Use the manufacturer schedule for a specific make and model, then narrow with an audience query",
  },
];

export const TIME_SERVICE_TRIGGER_OPTIONS: ServiceTriggerPresetOption[] = [
  { value: "90_days", label: "90 days" },
  { value: "180_days", label: "180 days" },
  {
    value: "180_days_5000_mile",
    label: "180 days / 5,000 miles (SOP default)",
  },
  { value: "1_year", label: "1 year" },
];

export const MILEAGE_SERVICE_TRIGGER_OPTIONS: ServiceTriggerPresetOption[] = [
  { value: "2000_miles", label: "2,000 miles" },
  { value: "5000_miles", label: "5,000 miles" },
  { value: "10000_miles", label: "10,000 miles" },
  { value: "60000_miles", label: "60,000 miles" },
];

export const OEM_SERVICE_SCHEDULES: OemServiceSchedule[] = [
  {
    make: "Toyota",
    model: "RAV4",
    intervalDays: 365,
    intervalMiles: 10000,
    summary: "Oil change and tire rotation every 10,000 miles or 12 months",
  },
  {
    make: "Toyota",
    model: "Camry",
    intervalDays: 365,
    intervalMiles: 10000,
    summary: "Oil change and tire rotation every 10,000 miles or 12 months",
  },
  {
    make: "Toyota",
    model: "Corolla",
    intervalDays: 365,
    intervalMiles: 10000,
    summary: "Oil change and tire rotation every 10,000 miles or 12 months",
  },
  {
    make: "Toyota",
    model: "Highlander",
    intervalDays: 365,
    intervalMiles: 10000,
    summary: "Oil change and tire rotation every 10,000 miles or 12 months",
  },
  {
    make: "Toyota",
    model: "Tacoma",
    intervalDays: 365,
    intervalMiles: 10000,
    summary: "Oil change and tire rotation every 10,000 miles or 12 months",
  },
  {
    make: "Honda",
    model: "Civic",
    intervalDays: 365,
    intervalMiles: 10000,
    summary: "Maintenance Minder A/1 every 10,000 miles or 12 months",
  },
  {
    make: "Honda",
    model: "Accord",
    intervalDays: 365,
    intervalMiles: 10000,
    summary: "Maintenance Minder A/1 every 10,000 miles or 12 months",
  },
  {
    make: "Honda",
    model: "CR-V",
    intervalDays: 365,
    intervalMiles: 10000,
    summary: "Maintenance Minder A/1 every 10,000 miles or 12 months",
  },
  {
    make: "Honda",
    model: "Pilot",
    intervalDays: 365,
    intervalMiles: 10000,
    summary: "Maintenance Minder A/1 every 10,000 miles or 12 months",
  },
  {
    make: "Ford",
    model: "F-150",
    intervalDays: 365,
    intervalMiles: 10000,
    summary: "Oil change and multipoint inspection every 10,000 miles or 12 months",
  },
  {
    make: "Ford",
    model: "Explorer",
    intervalDays: 365,
    intervalMiles: 10000,
    summary: "Oil change and multipoint inspection every 10,000 miles or 12 months",
  },
  {
    make: "Ford",
    model: "Escape",
    intervalDays: 365,
    intervalMiles: 10000,
    summary: "Oil change and multipoint inspection every 10,000 miles or 12 months",
  },
  {
    make: "Chevrolet",
    model: "Silverado",
    intervalDays: 365,
    intervalMiles: 7500,
    summary: "Oil life monitor service every 7,500 miles or 12 months",
  },
  {
    make: "Chevrolet",
    model: "Equinox",
    intervalDays: 365,
    intervalMiles: 7500,
    summary: "Oil life monitor service every 7,500 miles or 12 months",
  },
  {
    make: "Chevrolet",
    model: "Malibu",
    intervalDays: 365,
    intervalMiles: 7500,
    summary: "Oil life monitor service every 7,500 miles or 12 months",
  },
];

export const DEFAULT_TIME_SERVICE_TRIGGER =
  TIME_SERVICE_TRIGGER_OPTIONS.find(
    (option) => option.value === "180_days_5000_mile",
  )?.value ?? TIME_SERVICE_TRIGGER_OPTIONS[0].value;

export const DEFAULT_MILEAGE_SERVICE_TRIGGER =
  MILEAGE_SERVICE_TRIGGER_OPTIONS[0].value;

export function getPresetOptionsForTriggerType(
  triggerType: ServiceTriggerType,
): ServiceTriggerPresetOption[] {
  switch (triggerType) {
    case "time":
      return TIME_SERVICE_TRIGGER_OPTIONS;
    case "mileage":
      return MILEAGE_SERVICE_TRIGGER_OPTIONS;
    default:
      return [];
  }
}

export function getOemMakes(): string[] {
  return [...new Set(OEM_SERVICE_SCHEDULES.map((schedule) => schedule.make))].sort();
}

export function getOemModelsForMake(make: string): string[] {
  return OEM_SERVICE_SCHEDULES.filter((schedule) => schedule.make === make)
    .map((schedule) => schedule.model)
    .sort();
}

export function getOemServiceSchedule(
  make: string,
  model: string,
): OemServiceSchedule | undefined {
  return OEM_SERVICE_SCHEDULES.find(
    (schedule) => schedule.make === make && schedule.model === model,
  );
}
