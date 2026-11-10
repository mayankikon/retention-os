import type { Campaign, CampaignStatus } from "@/types/campaign";
import type { CampaignChangelogEntry } from "@/types/campaign-detail";
import {
  formatDealershipList,
  getCampaignDealers,
} from "@/lib/campaign-dealers";

const STATUS_LABELS: Record<CampaignStatus, string> = {
  draft: "Draft",
  active: "Active",
  paused: "Paused",
  completed: "Completed",
  archived: "Archived",
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
      details: `"${campaign.name}" was created for ${formatDealershipList(getCampaignDealers(campaign))}.`,
    },
  ];

  if (campaign.status !== "draft" && campaign.status !== "archived") {
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
    campaign.status === "active" ||
    campaign.status === "paused" ||
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

  if (campaign.status === "archived") {
    entries.push(
      buildStatusEntry(
        campaign,
        "archived",
        campaign.lastUpdatedAt,
        "Campaign archived",
      ),
    );
  }

  const reminderToggleEvents = campaign.reminderToggleEvents ?? [];
  reminderToggleEvents.forEach((event, index) => {
    entries.push({
      id: `${campaign.id}-reminder-toggle-${index}`,
      timestamp: event.at,
      actor: campaign.createdBy,
      action: "reminder_toggled",
      summary: `${event.label} turned ${event.enabled ? "on" : "off"}`,
      details: event.enabled
        ? "Starts sending to recipients who haven't received it yet."
        : "Stops sending to recipients who haven't received it yet. Messages already sent aren't affected.",
    });
  });

  const isLiveCopyUpdate = campaign.copyUpdatedAt === campaign.lastUpdatedAt;
  const isReminderToggleOnly =
    !isLiveCopyUpdate &&
    reminderToggleEvents.some((event) => event.at === campaign.lastUpdatedAt);

  if (campaign.lastUpdatedAt !== campaign.createdAt && !isReminderToggleOnly) {
    entries.push({
      id: `${campaign.id}-updated`,
      timestamp: campaign.lastUpdatedAt,
      actor: campaign.createdBy,
      action: "updated",
      summary: isLiveCopyUpdate
        ? "Live message copy updated"
        : "Campaign settings updated",
      details: isLiveCopyUpdate
        ? "Initial and reminder body copy changed for future eligible sends only."
        : "Configuration or schedule changes were saved.",
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
