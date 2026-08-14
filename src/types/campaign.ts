import type { CampaignSetupDraft } from "@/types/campaign-setup";

export const CAMPAIGN_STATUSES = [
  "draft",
  "active",
  "paused",
  "completed",
  "archived",
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
  /**
   * Primary dealership (first selected). Kept for filters, group rollup, and
   * legacy rows that predate multi-dealership campaigns.
   */
  dealer: string;
  /**
   * All dealerships this campaign covers within the group.
   * When omitted, the campaign covers only `dealer`.
   */
  dealers?: string[];
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
  /**
   * ISO date when a draft campaign should activate.
   * Future start is a date field — not a separate status.
   */
  scheduledActivateAt?: string | null;
  /** ISO instant the campaign run window opens. Defaults to `createdAt`. */
  startsAt?: string | null;
  /** ISO instant the campaign run window closes (end of the selected end day). */
  endsAt?: string | null;
  /**
   * Full wizard state for draft resume/edit.
   * Absent on legacy thin drafts and most mock seed rows.
   */
  setupDraft?: CampaignSetupDraft | null;
}

export interface CampaignFilters {
  q: string;
  group: string;
  dealer: string;
  timeZone: string;
  status: string;
  page: number;
}

export const DEFAULT_PAGE_SIZE = 10;
