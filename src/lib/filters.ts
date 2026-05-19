import { FILTER_ALL } from "@/data/lookups";
import {
  DEFAULT_PAGE_SIZE,
  type Campaign,
  type CampaignFilters,
} from "@/types/campaign";
import { getTotalPages, paginateItems } from "@/lib/pagination";

export interface SelectCampaignsResult {
  rows: Campaign[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function hasActiveFilters(filters: CampaignFilters): boolean {
  return Boolean(
    filters.q.trim() ||
      (filters.dealer && filters.dealer !== FILTER_ALL) ||
      (filters.timeZone && filters.timeZone !== FILTER_ALL) ||
      (filters.status && filters.status !== FILTER_ALL),
  );
}

export function filterCampaigns(
  campaigns: Campaign[],
  filters: CampaignFilters,
): Campaign[] {
  const query = filters.q.trim().toLowerCase();

  return campaigns.filter((campaign) => {
    if (query && !campaign.name.toLowerCase().includes(query)) {
      return false;
    }
    if (
      filters.dealer &&
      filters.dealer !== FILTER_ALL &&
      campaign.dealer !== filters.dealer
    ) {
      return false;
    }
    if (
      filters.timeZone &&
      filters.timeZone !== FILTER_ALL &&
      campaign.timeZone !== filters.timeZone
    ) {
      return false;
    }
    if (
      filters.status &&
      filters.status !== FILTER_ALL &&
      campaign.status !== filters.status
    ) {
      return false;
    }
    return true;
  });
}

export function selectCampaigns(
  campaigns: Campaign[],
  filters: CampaignFilters,
  pageSize = DEFAULT_PAGE_SIZE,
): SelectCampaignsResult {
  const filtered = filterCampaigns(campaigns, filters);
  const totalPages = getTotalPages(filtered.length, pageSize);
  const page = Math.min(Math.max(1, filters.page), totalPages);
  const rows = paginateItems(filtered, page, pageSize);

  return {
    rows,
    total: filtered.length,
    page,
    pageSize,
    totalPages,
  };
}

export type EmptyStateVariant = "noData" | "noSearchResults" | "filteredZero";

export function resolveEmptyStateVariant(
  totalCampaigns: number,
  filteredTotal: number,
  filters: CampaignFilters,
): EmptyStateVariant | null {
  if (totalCampaigns === 0) return "noData";
  if (filteredTotal > 0) return null;

  if (filters.q.trim()) return "noSearchResults";
  if (hasActiveFilters(filters)) return "filteredZero";
  return "noData";
}
