"use client";

import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { CampaignFilters } from "@/components/campaigns/CampaignFilters";
import { CampaignListHeader } from "@/components/campaigns/CampaignListHeader";
import { CampaignTable } from "@/components/campaigns/CampaignTable";
import { EmptyState } from "@/components/campaigns/EmptyState";
import { PaginationBar } from "@/components/campaigns/PaginationBar";
import { FILTER_ALL } from "@/data/lookups";
import {
  resolveEmptyStateVariant,
  selectCampaigns,
} from "@/lib/filters";
import { useCampaigns } from "@/hooks/use-campaigns";

const listParsers = {
  q: parseAsString.withDefault(""),
  dealer: parseAsString.withDefault(FILTER_ALL),
  timeZone: parseAsString.withDefault(FILTER_ALL),
  status: parseAsString.withDefault(FILTER_ALL),
  page: parseAsInteger.withDefault(1),
};

export function CampaignListView() {
  const campaigns = useCampaigns();
  const [filters, setFilters] = useQueryStates(listParsers);

  const result = selectCampaigns(campaigns, {
    q: filters.q,
    dealer: filters.dealer,
    timeZone: filters.timeZone,
    status: filters.status,
    page: filters.page,
  });

  const emptyVariant = resolveEmptyStateVariant(
    campaigns.length,
    result.total,
    {
      q: filters.q,
      dealer: filters.dealer,
      timeZone: filters.timeZone,
      status: filters.status,
      page: filters.page,
    },
  );

  const handleResetFilters = () => {
    void setFilters({
      q: "",
      dealer: FILTER_ALL,
      timeZone: FILTER_ALL,
      status: FILTER_ALL,
      page: 1,
    });
  };

  const handlePageChange = (page: number) => {
    void setFilters({ page });
  };

  return (
    <div className="space-y-6">
      <CampaignListHeader
        totalCount={campaigns.length}
        filteredCount={result.total}
      />

      <CampaignFilters />

      {emptyVariant ? (
        <EmptyState variant={emptyVariant} onReset={handleResetFilters} />
      ) : (
        <>
          <CampaignTable campaigns={result.rows} />
          {result.totalPages > 1 ? (
            <PaginationBar
              currentPage={result.page}
              totalPages={result.totalPages}
              onPageChange={handlePageChange}
            />
          ) : null}
        </>
      )}
    </div>
  );
}
