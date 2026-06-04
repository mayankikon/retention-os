import { mockCampaigns } from "@/data/campaigns.mock";
import { getUserCreatedCampaigns } from "@/lib/campaign-store";
import type { Campaign } from "@/types/campaign";

export function getAllCampaigns(): Campaign[] {
  const userCreated = getUserCreatedCampaigns();
  const byId = new Map<string, Campaign>();

  for (const campaign of [...userCreated, ...mockCampaigns]) {
    byId.set(campaign.id, campaign);
  }

  return Array.from(byId.values());
}

export function findCampaignById(campaignId: string): Campaign | undefined {
  return getAllCampaigns().find((campaign) => campaign.id === campaignId);
}
