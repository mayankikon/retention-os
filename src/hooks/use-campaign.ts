"use client";

import { useMemo } from "react";
import { useCampaigns } from "@/hooks/use-campaigns";
import type { Campaign } from "@/types/campaign";

export function useCampaign(campaignId: string): Campaign | undefined {
  const campaigns = useCampaigns();

  return useMemo(
    () => campaigns.find((campaign) => campaign.id === campaignId),
    [campaigns, campaignId],
  );
}
