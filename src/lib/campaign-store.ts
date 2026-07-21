import type { Campaign, CampaignStatus } from "@/types/campaign";

const STORAGE_KEY = "retention-os-user-campaigns";
const STATUS_OVERRIDES_KEY = "retention-os-campaign-status-overrides";
export const CAMPAIGNS_UPDATED_EVENT = "campaigns-updated";
export const CAMPAIGN_FLASH_STORAGE_KEY = "retention-os-campaign-flash";

export type CampaignFlashKind = "activated" | "scheduled" | "draft" | "status";

export interface CampaignFlashMessage {
  kind: CampaignFlashKind;
  campaignName: string;
  detail?: string;
}

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
  const existing = getUserCreatedCampaigns().filter(
    (item) => item.id !== campaign.id,
  );
  saveUserCreatedCampaigns([campaign, ...existing]);
}

export function getCampaignStatusOverrides(): Record<string, CampaignStatus> {
  if (!isBrowser()) return {};

  try {
    const raw = window.localStorage.getItem(STATUS_OVERRIDES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, CampaignStatus>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function updateCampaignStatus(
  campaignId: string,
  status: CampaignStatus,
): void {
  if (!isBrowser()) return;

  const userCampaigns = getUserCreatedCampaigns();
  const userIndex = userCampaigns.findIndex((item) => item.id === campaignId);

  if (userIndex >= 0) {
    const now = new Date().toISOString();
    userCampaigns[userIndex] = {
      ...userCampaigns[userIndex],
      status,
      lastUpdatedAt: now,
    };
    saveUserCreatedCampaigns(userCampaigns);
    return;
  }

  const overrides = getCampaignStatusOverrides();
  overrides[campaignId] = status;
  window.localStorage.setItem(STATUS_OVERRIDES_KEY, JSON.stringify(overrides));
  window.dispatchEvent(new CustomEvent(CAMPAIGNS_UPDATED_EVENT));
}

export function setCampaignFlashMessage(message: CampaignFlashMessage): void {
  if (!isBrowser()) return;
  window.sessionStorage.setItem(
    CAMPAIGN_FLASH_STORAGE_KEY,
    JSON.stringify(message),
  );
}

export function consumeCampaignFlashMessage(): CampaignFlashMessage | null {
  if (!isBrowser()) return null;

  try {
    const raw = window.sessionStorage.getItem(CAMPAIGN_FLASH_STORAGE_KEY);
    if (!raw) return null;
    window.sessionStorage.removeItem(CAMPAIGN_FLASH_STORAGE_KEY);
    return JSON.parse(raw) as CampaignFlashMessage;
  } catch {
    return null;
  }
}
