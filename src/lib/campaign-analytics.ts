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
    campaign.status === "archived"
  ) {
    return {
      recipientsSent: 0,
      deliveredCount: 0,
      clickedCount: 0,
    };
  }

  const sequence = getCampaignSequence(campaign);
  const deliveryRate = 0.94 + (sequence % 6) * 0.01;
  const deliveredCount = Math.min(Math.round(sent * deliveryRate), sent);
  // Click-through rate is "of customers sent", so clicks derive from it.
  const clickedCount = Math.round((sent * campaign.clickThroughRate) / 100);

  return {
    recipientsSent: sent,
    deliveredCount,
    clickedCount: Math.min(clickedCount, deliveredCount),
  };
}
