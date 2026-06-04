import type { CampaignCreator } from "@/types/campaign";

export interface CampaignAnalytics {
  /** Unique customers the campaign was sent to. */
  recipientsSent: number;
  openedCount: number;
  deliveredCount: number;
}

export const CHANGELOG_ACTIONS = [
  "created",
  "updated",
  "status_changed",
  "message_edited",
  "activated",
  "paused",
  "completed",
  "stopped",
] as const;

export type ChangelogAction = (typeof CHANGELOG_ACTIONS)[number];

export interface CampaignChangelogEntry {
  id: string;
  timestamp: string;
  actor: CampaignCreator;
  action: ChangelogAction;
  summary: string;
  details?: string;
}

export type CampaignDetailTab = "details" | "changelog";
