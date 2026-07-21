"use client";

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
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
import {
  consumeCampaignFlashMessage,
  type CampaignFlashMessage,
} from "@/lib/campaign-store";
import { useCampaigns } from "@/hooks/use-campaigns";

const listParsers = {
  q: parseAsString.withDefault(""),
  dealer: parseAsString.withDefault(FILTER_ALL),
  timeZone: parseAsString.withDefault(FILTER_ALL),
  status: parseAsString.withDefault(FILTER_ALL),
  page: parseAsInteger.withDefault(1),
};

function flashCopy(message: CampaignFlashMessage): string {
  switch (message.kind) {
    case "activated":
      return `${message.campaignName} is now active.`;
    case "scheduled":
      return `${message.campaignName} is scheduled${message.detail ? ` · ${message.detail}` : ""}.`;
    case "draft":
      return `${message.campaignName} saved as a draft.`;
    default:
      return message.campaignName;
  }
}

export function CampaignListView() {
  const campaigns = useCampaigns();
  const [filters, setFilters] = useQueryStates(listParsers);
  const [flash, setFlash] = useState<CampaignFlashMessage | null>(null);

  useEffect(() => {
    setFlash(consumeCampaignFlashMessage());
  }, []);

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
      {flash ? (
        <div
          className="flex items-start justify-between gap-3 rounded-lg border border-border bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
          role="status"
        >
          <div className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <p>{flashCopy(flash)}</p>
          </div>
          <button
            type="button"
            onClick={() => setFlash(null)}
            className="rounded-sm p-1 hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

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
