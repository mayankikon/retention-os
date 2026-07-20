import type { Campaign } from "@/types/campaign";
import { getUserCreatedCampaigns } from "@/lib/campaign-store";
import { mockCampaigns } from "@/data/campaigns.mock";
import { CUSTOM_TEMPLATE_ID } from "@/types/template";

export interface TemplateUsageCampaign {
  id: string;
  name: string;
  dealer: string;
  status: Campaign["status"];
}

function getAllCampaigns(): Campaign[] {
  return [...getUserCreatedCampaigns(), ...mockCampaigns];
}

export function getCampaignsUsingTemplate(
  templateId: string,
): TemplateUsageCampaign[] {
  if (!templateId || templateId === CUSTOM_TEMPLATE_ID) return [];

  return getAllCampaigns()
    .filter((campaign) => campaign.messageTemplateId === templateId)
    .map((campaign) => ({
      id: campaign.id,
      name: campaign.name,
      dealer: campaign.dealer,
      status: campaign.status,
    }));
}

export function getTemplateUsageCount(templateId: string): number {
  return getCampaignsUsingTemplate(templateId).length;
}

export function canHardDeleteTemplate(templateId: string): boolean {
  return getTemplateUsageCount(templateId) === 0;
}
