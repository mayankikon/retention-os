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

function cloneSetupDraft(draft: CampaignSetupDraft): CampaignSetupDraft {
  return structuredClone(draft);
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
    setupDraft: cloneSetupDraft(draft),
  };
}

export function updateCampaignFromDraft(
  existing: Campaign,
  draft: CampaignSetupDraft,
  options: CreateCampaignFromDraftOptions = {},
): Campaign {
  const now = new Date();
  const nextHour = new Date(now);
  nextHour.setHours(nextHour.getHours() + 1);
  const status = options.status ?? existing.status;
  const { startsAt, endsAt } = resolveCampaignWindow(draft, now);
  const { dealer, dealers } = resolveDealers(draft.subfleets);

  return {
    ...existing,
    name: draft.campaignName.trim() || existing.name || "Untitled campaign",
    dealer,
    dealers,
    timeZone: draft.timeZone,
    status,
    group:
      draft.groupId ||
      (draft.subfleets[0] ? getDealerGroup(draft.subfleets[0]) : existing.group),
    lastUpdatedAt: now.toISOString(),
    nextUpdateAt: nextHour.toISOString(),
    messageTemplateId: draft.messageTemplateId,
    scheduledActivateAt:
      options.scheduledActivateAt !== undefined
        ? options.scheduledActivateAt
        : existing.scheduledActivateAt,
    startsAt,
    endsAt,
    setupDraft: cloneSetupDraft(draft),
  };
}
