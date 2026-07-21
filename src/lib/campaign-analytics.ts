import type { Campaign } from "@/types/campaign";
import type { CampaignAnalytics } from "@/types/campaign-detail";

function getCampaignSequence(campaign: Campaign): number {
  const digits = campaign.id.replace(/\D/g, "");
  return Number.parseInt(digits, 10) || 1;
}

export function getCampaignAnalytics(campaign: Campaign): CampaignAnalytics {
  const sent = campaign.messages;

  if (
    sent === 0 ||
    campaign.status === "draft" ||
    campaign.status === "scheduled"
  ) {
    return {
      recipientsSent: 0,
      openedCount: 0,
      deliveredCount: 0,
    };
  }

  const sequence = getCampaignSequence(campaign);
  const deliveryRate = 0.94 + (sequence % 6) * 0.01;
  const openRate = 0.52 + (sequence % 18) * 0.012;
  const deliveredCount = Math.round(sent * deliveryRate);
  const openedCount = Math.round(deliveredCount * openRate);

  return {
    recipientsSent: sent,
    deliveredCount: Math.min(deliveredCount, sent),
    openedCount: Math.min(openedCount, deliveredCount),
  };
}
