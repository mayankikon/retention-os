import type { Campaign, CampaignStatus } from "@/types/campaign";
import type { CampaignChangelogEntry } from "@/types/campaign-detail";

const STATUS_LABELS: Record<CampaignStatus, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  active: "Active",
  paused: "Paused",
  stopped: "Stopped",
  completed: "Completed",
};

function hoursAfter(iso: string, hours: number): string {
  const date = new Date(iso);
  date.setHours(date.getHours() + hours);
  return date.toISOString();
}

function hoursBefore(iso: string, hours: number): string {
  const date = new Date(iso);
  date.setHours(date.getHours() - hours);
  return date.toISOString();
}

function buildStatusEntry(
  campaign: Campaign,
  status: CampaignStatus,
  timestamp: string,
  summary: string,
): CampaignChangelogEntry {
  return {
    id: `${campaign.id}-${status}-${timestamp}`,
    timestamp,
    actor: campaign.createdBy,
    action: "status_changed",
    summary,
    details: `Status set to ${STATUS_LABELS[status]}.`,
  };
}

export function buildCampaignChangelog(
  campaign: Campaign,
): CampaignChangelogEntry[] {
  const entries: CampaignChangelogEntry[] = [
    {
      id: `${campaign.id}-created`,
      timestamp: campaign.createdAt,
      actor: campaign.createdBy,
      action: "created",
      summary: "Campaign created",
      details: `"${campaign.name}" was created for ${campaign.dealer}.`,
    },
  ];

  if (campaign.status !== "draft") {
    entries.push({
      id: `${campaign.id}-message-configured`,
      timestamp: hoursAfter(campaign.createdAt, 2),
      actor: campaign.createdBy,
      action: "message_edited",
      summary: "Message templates configured",
      details: "Primary promo text and delivery channels were saved.",
    });
  }

  if (
    campaign.status === "scheduled" ||
    campaign.status === "active" ||
    campaign.status === "paused" ||
    campaign.status === "stopped" ||
    campaign.status === "completed"
  ) {
    entries.push(
      buildStatusEntry(
        campaign,
        "scheduled",
        hoursBefore(campaign.lastUpdatedAt, 12),
        "Campaign scheduled",
      ),
    );
  }

  if (
    campaign.status === "active" ||
    campaign.status === "paused" ||
    campaign.status === "stopped" ||
    campaign.status === "completed"
  ) {
    entries.push({
      id: `${campaign.id}-activated`,
      timestamp: hoursBefore(campaign.lastUpdatedAt, 6),
      actor: campaign.createdBy,
      action: "activated",
      summary: "Campaign activated",
      details: "Messages began sending to the target audience.",
    });
  }

  if (campaign.status === "paused") {
    entries.push({
      id: `${campaign.id}-paused`,
      timestamp: campaign.lastUpdatedAt,
      actor: campaign.createdBy,
      action: "paused",
      summary: "Campaign paused",
      details: "Outbound messages were temporarily halted.",
    });
  }

  if (campaign.status === "stopped") {
    entries.push({
      id: `${campaign.id}-stopped`,
      timestamp: campaign.lastUpdatedAt,
      actor: campaign.createdBy,
      action: "stopped",
      summary: "Campaign stopped",
      details: "No further messages will be sent for this campaign.",
    });
  }

  if (campaign.status === "completed") {
    entries.push({
      id: `${campaign.id}-completed`,
      timestamp: campaign.lastUpdatedAt,
      actor: campaign.createdBy,
      action: "completed",
      summary: "Campaign completed",
      details: "All scheduled sends have finished.",
    });
  }

  if (campaign.lastUpdatedAt !== campaign.createdAt) {
    entries.push({
      id: `${campaign.id}-updated`,
      timestamp: campaign.lastUpdatedAt,
      actor: campaign.createdBy,
      action: "updated",
      summary: "Campaign settings updated",
      details: "Configuration or schedule changes were saved.",
    });
  }

  const uniqueById = new Map<string, CampaignChangelogEntry>();
  for (const entry of entries) {
    uniqueById.set(entry.id, entry);
  }

  return Array.from(uniqueById.values()).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}
