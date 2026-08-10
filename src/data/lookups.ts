import {
  CAMPAIGN_STATUSES,
  CAMPAIGN_TIME_ZONES,
  type CampaignStatus,
  type CampaignTimeZone,
} from "@/types/campaign";
import type { SetupTimeZone } from "@/types/campaign-setup";

const TIME_ZONE_LABELS: Record<CampaignTimeZone, string> = {
  CST: "Central Time (CST)",
  EST: "Eastern Time (EST)",
  PST: "Pacific Time (PST)",
  MST: "Mountain Time (MST)",
};

/** Known dealership local time zones for campaign setup. */
export const DEALER_TIME_ZONE_BY_DEALER: Partial<
  Record<string, SetupTimeZone>
> = {
  "Ikon Motors North": "CST",
  "Ikon Motors South": "CST",
  "Ikon Motors West": "PST",
  "Ikon Motors East": "EST",
  "Premier Auto Group": "MST",
  // Summit Chevrolet intentionally omitted to exercise missing-TZ fallback UI.
};

export const DEALERS = [
  "All Dealerships",
  "Ikon Motors North",
  "Ikon Motors South",
  "Ikon Motors West",
  "Ikon Motors East",
  "Premier Auto Group",
  "Summit Chevrolet",
] as const;

/** Parent dealer group / company each dealership rolls up to. */
export const DEALER_GROUP_BY_DEALER: Record<string, string> = {
  "Ikon Motors North": "Ikon Motors",
  "Ikon Motors South": "Ikon Motors",
  "Ikon Motors West": "Ikon Motors",
  "Ikon Motors East": "Ikon Motors",
  "Premier Auto Group": "Premier Auto Group",
  "Summit Chevrolet": "Summit Automotive Group",
};

/** Explicit dealer-group placeholders for the campaigns scope bar. */
export const DEALER_GROUPS = [
  "Ikon Motors",
  "Premier Auto Group",
  "Summit Automotive Group",
  "Lakeside Auto Group",
  "Metro Automotive",
  "Valley Motor Company",
  "Coastal Auto Group",
  "Heritage Luxury Motors",
] as const;

export const FILTER_ALL = "all";

export function getDealerGroup(dealer: string): string {
  return DEALER_GROUP_BY_DEALER[dealer] ?? dealer;
}

export function getAssignableDealers(): string[] {
  return DEALERS.filter((dealer) => dealer !== "All Dealerships");
}

export function getDealersForGroup(group: string): string[] {
  const dealers = getAssignableDealers();
  if (!group || group === FILTER_ALL) {
    return dealers;
  }

  return dealers.filter((dealer) => getDealerGroup(dealer) === group);
}

export function isDealerInGroup(dealer: string, group: string): boolean {
  if (!group || group === FILTER_ALL) {
    return true;
  }
  if (!dealer || dealer === FILTER_ALL) {
    return true;
  }
  return getDealerGroup(dealer) === group;
}

export function getKnownDealerTimeZone(
  dealer: string,
): SetupTimeZone | undefined {
  return DEALER_TIME_ZONE_BY_DEALER[dealer];
}

export function resolveDealerTimeZone(
  dealer: string,
  overrides: Partial<Record<string, SetupTimeZone>> = {},
): SetupTimeZone | undefined {
  return overrides[dealer] ?? getKnownDealerTimeZone(dealer);
}

/** Primary schedule TZ = first selected dealership with a resolved timezone. */
export function getPrimaryTimeZoneFromDealerships(
  dealershipIds: string[],
  overrides: Partial<Record<string, SetupTimeZone>> = {},
  fallback: SetupTimeZone = "CST",
): SetupTimeZone {
  for (const dealer of dealershipIds) {
    const timeZone = resolveDealerTimeZone(dealer, overrides);
    if (timeZone) return timeZone;
  }
  return fallback;
}

export const groupSelectOptions = DEALER_GROUPS.map((group) => ({
  value: group,
  label: group,
}));

export const STATUS_LABELS: Record<CampaignStatus, string> = {
  draft: "Draft",
  active: "Active",
  paused: "Paused",
  completed: "Completed",
  archived: "Archived",
};

export const dealerGroupFilterOptions = [
  { value: FILTER_ALL, label: "All Groups" },
  ...DEALER_GROUPS.map((group) => ({
    value: group,
    label: group,
  })),
];

export const dealerFilterOptions = DEALERS.map((dealer) => ({
  value: dealer === "All Dealerships" ? FILTER_ALL : dealer,
  label: dealer,
}));

export function getDealerFilterOptionsForGroup(group: string): {
  value: string;
  label: string;
}[] {
  return [
    { value: FILTER_ALL, label: "All Dealers" },
    ...getDealersForGroup(group).map((dealer) => ({
      value: dealer,
      label: dealer,
    })),
  ];
}

/** Assignable dealerships for campaign setup (excludes the list filter sentinel). */
export const dealershipOptions = getAssignableDealers().map((dealer) => ({
  value: dealer,
  label: dealer,
}));

export const timeZoneFilterOptions = [
  { value: FILTER_ALL, label: "All Time Zones" },
  ...CAMPAIGN_TIME_ZONES.map((timeZone) => ({
    value: timeZone,
    label: TIME_ZONE_LABELS[timeZone],
  })),
];

export const statusFilterOptions = [
  { value: FILTER_ALL, label: "All Statuses" },
  ...CAMPAIGN_STATUSES.map((status) => ({
    value: status,
    label: STATUS_LABELS[status],
  })),
];
