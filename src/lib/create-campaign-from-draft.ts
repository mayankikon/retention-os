import type { Campaign, CampaignStatus } from "@/types/campaign";
import type { CampaignSetupDraft } from "@/types/campaign-setup";
import type { AppUser } from "@/types/user";
import { getDealerGroup } from "@/data/lookups";
import { resolveCampaignWindow } from "@/lib/campaign-window";

function resolveDealers(subfleets: string[]): {
  dealer: string;
  dealers: string[];
} {
  if (subfleets.length === 0) {
    return { dealer: "Unassigned", dealers: [] };
  }

  return {
    dealer: subfleets[0],
    dealers: [...subfleets],
  };
}

export interface CreateCampaignFromDraftOptions {
  status?: Extract<CampaignStatus, "draft" | "active">;
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
  const { startsAt, endsAt } = resolveCampaignWindow(draft, now);

  const { dealer, dealers } = resolveDealers(draft.subfleets);

  return {
    id: `cmp-${now.getTime()}`,
    name: draft.campaignName.trim() || "Untitled campaign",
    dealer,
    dealers,
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
    group:
      draft.groupId ||
      (draft.subfleets[0] ? getDealerGroup(draft.subfleets[0]) : "General"),
    lastUpdatedAt: now.toISOString(),
    nextUpdateAt: nextHour.toISOString(),
    messageTemplateId: draft.messageTemplateId,
    scheduledActivateAt: options.scheduledActivateAt ?? null,
    startsAt,
    endsAt,
  };
}
