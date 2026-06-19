import type { AudienceAttribute } from "@/types/campaign-setup";

/**
 * Each audience attribute maps to a single value editor shown directly after
 * the field is chosen — there is no operator/condition step. The editor type
 * decides how the value is captured:
 *   - "select" → dropdown of pre-filled options
 *   - "text"   → free input (text or number)
 *   - "date"   → native date picker
 */

export interface AudienceOption {
  value: string;
  label: string;
}

export type AudienceEditor = "select" | "text" | "date";

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

const MODEL_OPTIONS: AudienceOption[] = [
  "Accord",
  "Civic",
  "CR-V",
  "Camry",
  "Corolla",
  "RAV4",
  "F-150",
  "Silverado",
  "Equinox",
  "Wrangler",
].map((model) => ({ value: model, label: model }));

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

export const AUDIENCE_ATTRIBUTE_META: AudienceAttributeMeta[] = [
  {
    attribute: "vehicleYear",
    label: "Vehicle Year",
    editor: "select",
    options: YEAR_OPTIONS,
  },
  {
    attribute: "vehicleMake",
    label: "Vehicle Make",
    editor: "select",
    options: MAKE_OPTIONS,
  },
  {
    attribute: "vehicleModel",
    label: "Vehicle Model",
    editor: "select",
    options: MODEL_OPTIONS,
  },
  {
    attribute: "customerName",
    label: "Customer Name",
    editor: "text",
    inputType: "text",
    placeholder: "e.g. Smith",
  },
  {
    attribute: "customerZip",
    label: "Customer Zip Code",
    editor: "text",
    inputType: "text",
    placeholder: "e.g. 75001",
  },
  {
    attribute: "customerCity",
    label: "Customer City",
    editor: "select",
    options: CITY_OPTIONS,
  },
  {
    attribute: "installedDate",
    label: "Installed Date",
    editor: "date",
  },
  {
    attribute: "registrationDate",
    label: "Registration Date",
    editor: "date",
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
    return meta.options?.find((option) => option.value === value)?.label ?? value;
  }
  return value;
}
