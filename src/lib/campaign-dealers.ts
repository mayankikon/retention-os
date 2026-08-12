import type { Campaign } from "@/types/campaign";

/**
 * Dealerships covered by a campaign.
 * Falls back to the legacy single `dealer` field when `dealers` is unset.
 */
export function getCampaignDealers(campaign: Pick<Campaign, "dealer" | "dealers">): string[] {
  if (campaign.dealers && campaign.dealers.length > 0) {
    return campaign.dealers;
  }

  return campaign.dealer ? [campaign.dealer] : [];
}

export interface DealershipColumnDisplay {
  /** First selected dealership — the name shown in the list cell. */
  primaryLabel: string;
  /**
   * Remaining dealership count for a compact "+N" badge.
   * Zero when the campaign covers only one dealership.
   */
  additionalCount: number;
  /** Full list for tooltips / detail views. */
  allDealers: string[];
}

/**
 * List-column representation: primary name + how many more are covered.
 * Three dealerships → primaryLabel "Ikon Motors North", additionalCount 2 → "… +2".
 */
export function getDealershipColumnDisplay(
  campaign: Pick<Campaign, "dealer" | "dealers">,
): DealershipColumnDisplay {
  const allDealers = getCampaignDealers(campaign);

  if (allDealers.length === 0) {
    return {
      primaryLabel: "Unassigned",
      additionalCount: 0,
      allDealers: [],
    };
  }

  return {
    primaryLabel: allDealers[0],
    additionalCount: Math.max(0, allDealers.length - 1),
    allDealers,
  };
}

/** Detail / changelog copy: full names, comma-separated. */
export function formatDealershipList(dealers: string[]): string {
  if (dealers.length === 0) return "Unassigned";
  return dealers.join(", ");
}
