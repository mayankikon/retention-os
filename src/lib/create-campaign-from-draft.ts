import type { Campaign } from "@/types/campaign";
import type { CampaignSetupDraft } from "@/types/campaign-setup";
import type { AppUser } from "@/types/user";

function resolveDealer(subfleets: string[]): string {
  if (subfleets.length === 0) return "Unassigned";
  if (subfleets.length === 1) return subfleets[0];
  return subfleets.join(", ");
}

export function createCampaignFromDraft(
  draft: CampaignSetupDraft,
  user: AppUser,
): Campaign {
  const now = new Date();
  const nextHour = new Date(now);
  nextHour.setHours(nextHour.getHours() + 1);

  return {
    id: `cmp-${now.getTime()}`,
    name: draft.campaignName.trim(),
    dealer: resolveDealer(draft.subfleets),
    timeZone: draft.timeZone,
    status: "scheduled",
    messages: 0,
    conversionRate: 0,
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
  };
}
