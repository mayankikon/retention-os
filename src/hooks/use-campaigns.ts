"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { mockCampaigns } from "@/data/campaigns.mock";
import {
  CAMPAIGNS_UPDATED_EVENT,
  getUserCreatedCampaigns,
} from "@/lib/campaign-store";
import type { Campaign } from "@/types/campaign";

function sortByCreatedAtDesc(campaigns: Campaign[]): Campaign[] {
  return [...campaigns].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function useCampaigns(): Campaign[] {
  const [userCreated, setUserCreated] = useState<Campaign[]>([]);

  const refreshUserCampaigns = useCallback(() => {
    setUserCreated(getUserCreatedCampaigns());
  }, []);

  useEffect(() => {
    refreshUserCampaigns();

    const handleUpdate = () => refreshUserCampaigns();
    window.addEventListener(CAMPAIGNS_UPDATED_EVENT, handleUpdate);
    return () =>
      window.removeEventListener(CAMPAIGNS_UPDATED_EVENT, handleUpdate);
  }, [refreshUserCampaigns]);

  return useMemo(() => {
    const merged = [...userCreated, ...mockCampaigns];
    const byId = new Map<string, Campaign>();
    for (const campaign of merged) {
      byId.set(campaign.id, campaign);
    }
    return sortByCreatedAtDesc(Array.from(byId.values()));
  }, [userCreated]);
}
