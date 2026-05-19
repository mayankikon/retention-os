import type { Campaign } from "@/types/campaign";

const STORAGE_KEY = "retention-os-user-campaigns";
export const CAMPAIGNS_UPDATED_EVENT = "campaigns-updated";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function getUserCreatedCampaigns(): Campaign[] {
  if (!isBrowser()) return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Campaign[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveUserCreatedCampaigns(campaigns: Campaign[]): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns));
  window.dispatchEvent(new CustomEvent(CAMPAIGNS_UPDATED_EVENT));
}

export function addUserCreatedCampaign(campaign: Campaign): void {
  const existing = getUserCreatedCampaigns();
  saveUserCreatedCampaigns([campaign, ...existing]);
}
