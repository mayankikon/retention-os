"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { mockCampaigns } from "@/data/campaigns.mock";
import {
  CAMPAIGNS_UPDATED_EVENT,
  getCampaignStatusOverrides,
  getUserCreatedCampaigns,
} from "@/lib/campaign-store";
import type { Campaign } from "@/types/campaign";

function sortByCreatedAtDesc(campaigns: Campaign[]): Campaign[] {
  return [...campaigns].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function mergeCampaignCollections(
  userCreated: Campaign[],
  seededCampaigns: Campaign[],
  statusOverrides: Record<string, Campaign["status"]>,
): Campaign[] {
  const byId = new Map<string, Campaign>();
  for (const campaign of [...seededCampaigns, ...userCreated]) {
    const overrideStatus = statusOverrides[campaign.id];
    byId.set(
      campaign.id,
      overrideStatus ? { ...campaign, status: overrideStatus } : campaign,
    );
  }
  return sortByCreatedAtDesc(Array.from(byId.values()));
}

export function useCampaigns(): Campaign[] {
  const [userCreated, setUserCreated] = useState<Campaign[]>([]);
  const [statusOverrides, setStatusOverrides] = useState<
    Record<string, Campaign["status"]>
  >({});

  const refreshUserCampaigns = useCallback(() => {
    setUserCreated(getUserCreatedCampaigns());
    setStatusOverrides(getCampaignStatusOverrides());
  }, []);

  useEffect(() => {
    const handleUpdate = () => refreshUserCampaigns();
    window.addEventListener(CAMPAIGNS_UPDATED_EVENT, handleUpdate);
    queueMicrotask(refreshUserCampaigns);
    return () =>
      window.removeEventListener(CAMPAIGNS_UPDATED_EVENT, handleUpdate);
  }, [refreshUserCampaigns]);

  return useMemo(
    () => mergeCampaignCollections(userCreated, mockCampaigns, statusOverrides),
    [userCreated, statusOverrides],
  );
}
