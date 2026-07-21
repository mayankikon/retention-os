import type { Campaign, CampaignStatus } from "@/types/campaign";
import type { CampaignSetupDraft } from "@/types/campaign-setup";
import type { AppUser } from "@/types/user";

function resolveDealer(subfleets: string[]): string {
  if (subfleets.length === 0) return "Unassigned";
  if (subfleets.length === 1) return subfleets[0];
  return subfleets.join(", ");
}

export interface CreateCampaignFromDraftOptions {
  status?: Extract<CampaignStatus, "draft" | "scheduled" | "active">;
  scheduledActivateAt?: string | null;
}

export function createCampaignFromDraft(
  draft: CampaignSetupDraft,
  user: AppUser,
  options: CreateCampaignFromDraftOptions = {},
): Campaign {
  const now = new Date();
  const nextHour = new Date(now);
  nextHour.setHours(nextHour.getHours() + 1);
  const status = options.status ?? "active";

  return {
    id: `cmp-${now.getTime()}`,
    name: draft.campaignName.trim() || "Untitled campaign",
    dealer: resolveDealer(draft.subfleets),
    timeZone: draft.timeZone,
    status,
    messages: 0,
    clickThroughRate: 0,
    createdBy: {
      id: user.id,
      name: user.name,
      initials: user.initials,
    },
    createdAt: now.toISOString(),
    group: draft.subfleets[0] ?? "General",
    lastUpdatedAt: now.toISOString(),
    nextUpdateAt: nextHour.toISOString(),
    messageTemplateId: draft.messageTemplateId,
    scheduledActivateAt:
      status === "scheduled" ? (options.scheduledActivateAt ?? null) : null,
  };
}
