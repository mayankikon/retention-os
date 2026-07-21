export const CAMPAIGN_STATUSES = [
  "scheduled",
  "active",
  "paused",
  "stopped",
  "completed",
  "draft",
] as const;

export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number];

export const CAMPAIGN_TIME_ZONES = ["CST", "EST", "PST", "MST"] as const;

export type CampaignTimeZone = (typeof CAMPAIGN_TIME_ZONES)[number];

export interface CampaignCreator {
  id: string;
  name: string;
  initials: string;
}

export interface Campaign {
  id: string;
  name: string;
  dealer: string;
  timeZone: CampaignTimeZone;
  status: CampaignStatus;
  messages: number;
  /** Click-through rate percentage 0–100 (e.g. 12.5 = 12.5%). */
  clickThroughRate: number;
  createdBy: CampaignCreator;
  createdAt: string;
  group: string;
  lastUpdatedAt: string;
  nextUpdateAt: string;
  /** Linked message template id when created from a managed template. */
  messageTemplateId?: string | null;
  /** ISO date when a scheduled campaign should activate. */
  scheduledActivateAt?: string | null;
}

export interface CampaignFilters {
  q: string;
  dealer: string;
  timeZone: string;
  status: string;
  page: number;
}

export const DEFAULT_PAGE_SIZE = 10;
