import type { AudienceAttribute } from "@/types/campaign-setup";

/**
 * Each audience attribute maps to a single value editor shown directly after
 * the field is chosen — there is no operator/condition step. The editor type
 * decides how the value is captured:
 *   - "select" → dropdown of pre-filled options
 *   - "text"   → free input (text or number)
 *   - "date"       → native date picker
 *   - "dateRange"  → start and end date pickers
 */

export const DATE_RANGE_SEPARATOR = "|";

export interface AudienceOption {
  value: string;
  label: string;
}

export type AudienceEditor = "select" | "text" | "date" | "dateRange";

export interface AudienceAttributeMeta {
  attribute: AudienceAttribute;
  label: string;
  editor: AudienceEditor;
  /** Options for "select" editors. */
  options?: AudienceOption[];
  /** Input type for "text" editors. */
  inputType?: "text" | "number";
  placeholder?: string;
}

function descending(from: number, to: number): number[] {
  const out: number[] = [];
  for (let n = from; n >= to; n -= 1) {
    out.push(n);
  }
  return out;
}

const YEAR_OPTIONS: AudienceOption[] = descending(2026, 2012).map((year) => ({
  value: String(year),
  label: String(year),
}));

const MAKE_OPTIONS: AudienceOption[] = [
  "Toyota",
  "Honda",
  "Ford",
  "Chevrolet",
  "Nissan",
  "Jeep",
  "Ram",
  "GMC",
].map((make) => ({ value: make, label: make }));

const CITY_OPTIONS: AudienceOption[] = [
  "Dallas",
  "Plano",
  "Frisco",
  "Fort Worth",
  "Arlington",
  "Irving",
  "Austin",
  "Houston",
].map((city) => ({ value: city, label: city }));

export const VEHICLE_MODELS_BY_MAKE: Record<string, string[]> = {
  Toyota: ["Camry", "Corolla", "RAV4", "Highlander", "Tacoma"],
  Honda: ["Accord", "Civic", "CR-V", "Pilot"],
  Ford: ["F-150", "Explorer", "Escape"],
  Chevrolet: ["Silverado", "Equinox", "Malibu"],
  Nissan: ["Altima", "Rogue", "Sentra"],
  Jeep: ["Wrangler", "Grand Cherokee"],
  Ram: ["1500", "2500"],
  GMC: ["Sierra", "Terrain"],
};

export function getModelsForMake(make: string): string[] {
  return VEHICLE_MODELS_BY_MAKE[make] ?? [];
}

export function isModelValidForMake(make: string, model: string): boolean {
  return getModelsForMake(make).includes(model);
}

export function getModelOptionsForMake(make: string): AudienceOption[] {
  return getModelsForMake(make).map((model) => ({ value: model, label: model }));
}

export function serializeDateRange(startDate: string, endDate: string): string {
  return `${startDate}${DATE_RANGE_SEPARATOR}${endDate}`;
}

export function parseDateRange(value: string): {
  startDate: string;
  endDate: string;
} {
  const [startDate = "", endDate = ""] = value.split(DATE_RANGE_SEPARATOR);
  return { startDate: startDate.trim(), endDate: endDate.trim() };
}

function hasText(value: string): boolean {
  return value.trim().length > 0;
}

export function isPurchaseDateRangeComplete(value: string): boolean {
  const { startDate, endDate } = parseDateRange(value);
  return hasText(startDate) && hasText(endDate);
}

export function isPurchaseDateRangeValid(value: string): boolean {
  const { startDate, endDate } = parseDateRange(value);
  if (!hasText(startDate) || !hasText(endDate)) {
    return false;
  }

  return startDate <= endDate;
}

function formatDisplayDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  if (!year || !month || !day) {
    return isoDate;
  }

  return `${month}/${day}/${year}`;
}

export function formatPurchaseDateRangeLabel(value: string): string {
  const { startDate, endDate } = parseDateRange(value);
  if (!startDate && !endDate) {
    return "";
  }

  if (startDate && endDate) {
    return `${formatDisplayDate(startDate)} – ${formatDisplayDate(endDate)}`;
  }

  return startDate
    ? formatDisplayDate(startDate)
    : formatDisplayDate(endDate);
}

export const AUDIENCE_ATTRIBUTE_META: AudienceAttributeMeta[] = [
  {
    attribute: "vehicleYear",
    label: "Year",
    editor: "select",
    options: YEAR_OPTIONS,
  },
  {
    attribute: "vehicleMake",
    label: "Make",
    editor: "select",
    options: MAKE_OPTIONS,
  },
  {
    attribute: "vehicleModel",
    label: "Model",
    editor: "select",
  },
  {
    attribute: "customerZip",
    label: "Zip Code",
    editor: "text",
    inputType: "text",
    placeholder: "e.g. 75001",
  },
  {
    attribute: "customerCity",
    label: "City",
    editor: "select",
    options: CITY_OPTIONS,
  },
  {
    attribute: "vehiclePurchaseDate",
    label: "Vehicle Purchase Date",
    editor: "dateRange",
  },
  {
    attribute: "odometer",
    label: "Odometer",
    editor: "text",
    inputType: "number",
    placeholder: "e.g. 60000",
  },
];

const META_BY_ATTRIBUTE = new Map(
  AUDIENCE_ATTRIBUTE_META.map((meta) => [meta.attribute, meta]),
);

export function getAudienceAttributeMeta(
  attribute: AudienceAttribute,
): AudienceAttributeMeta {
  const meta = META_BY_ATTRIBUTE.get(attribute);
  if (!meta) {
    throw new Error(`Unknown audience attribute: ${attribute}`);
  }
  return meta;
}

/** Display label for a chosen value (maps select option values to labels). */
export function getAudienceValueLabel(
  attribute: AudienceAttribute,
  value: string,
): string {
  const meta = getAudienceAttributeMeta(attribute);
  if (meta.editor === "select") {
    if (attribute === "vehicleModel") {
      return value;
    }
    return meta.options?.find((option) => option.value === value)?.label ?? value;
  }

  if (attribute === "vehiclePurchaseDate") {
    return formatPurchaseDateRangeLabel(value);
  }

  return value;
}
