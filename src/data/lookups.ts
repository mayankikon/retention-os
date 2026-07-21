import {
  CAMPAIGN_STATUSES,
  CAMPAIGN_TIME_ZONES,
  type CampaignStatus,
  type CampaignTimeZone,
} from "@/types/campaign";

const TIME_ZONE_LABELS: Record<CampaignTimeZone, string> = {
  CST: "Central Time (CST)",
  EST: "Eastern Time (EST)",
  PST: "Pacific Time (PST)",
  MST: "Mountain Time (MST)",
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

/** Parent dealer group / company each dealership rolls up to (shown under the dealer name). */
export const DEALER_GROUP_BY_DEALER: Record<string, string> = {
  "Ikon Motors North": "Ikon Motors",
  "Ikon Motors South": "Ikon Motors",
  "Ikon Motors West": "Ikon Motors",
  "Ikon Motors East": "Ikon Motors",
  "Premier Auto Group": "Premier Auto Group",
  "Summit Chevrolet": "Summit Automotive Group",
};

export function getDealerGroup(dealer: string): string {
  return DEALER_GROUP_BY_DEALER[dealer] ?? dealer;
}

export const STATUS_LABELS: Record<CampaignStatus, string> = {
  scheduled: "Scheduled",
  active: "Active",
  paused: "Paused",
  stopped: "Stopped",
  completed: "Completed",
  draft: "Draft",
};

export const FILTER_ALL = "all";

export const dealerFilterOptions = DEALERS.map((dealer) => ({
  value: dealer === "All Dealerships" ? FILTER_ALL : dealer,
  label: dealer,
}));

/** Assignable dealerships for campaign setup (excludes the list filter sentinel). */
export const dealershipOptions = DEALERS.filter(
  (dealer) => dealer !== "All Dealerships",
).map((dealer) => ({
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
