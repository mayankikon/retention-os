"use client";

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { DesignSystemTableShellNoTabs } from "@ikontechnologies-arlington/nxtg-design-shiftpackage";
import { CampaignFilters } from "@/components/campaigns/CampaignFilters";
import { CampaignListHeader } from "@/components/campaigns/CampaignListHeader";
import { CampaignTable } from "@/components/campaigns/CampaignTable";
import { DealershipScopeBar } from "@/components/campaigns/DealershipScopeBar";
import { EmptyState } from "@/components/campaigns/EmptyState";
import { PaginationBar } from "@/components/campaigns/PaginationBar";
import { FILTER_ALL } from "@/data/lookups";
import { DATA_TABLE_SHELL_BORDER_CLASS } from "@/lib/data-table-chrome";
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
  group: parseAsString.withDefault(FILTER_ALL),
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
      return `${message.campaignName} will activate on the selected date${message.detail ? ` · ${message.detail}` : ""}.`;
    case "draft":
      return `${message.campaignName} saved as a draft.`;
    case "archived":
      return `${message.campaignName} was archived.`;
    default:
      return message.campaignName;
  }
}

export function CampaignListView() {
  const campaigns = useCampaigns();
  const [filters, setFilters] = useQueryStates(listParsers);
  const [flash, setFlash] = useState<CampaignFlashMessage | null>(null);

  useEffect(() => {
    // Strict Mode runs mount effects twice; the second pass finds an empty
    // slot, so only a real message may replace current state.
    const message = consumeCampaignFlashMessage();
    if (message) setFlash(message);
  }, []);

  const result = selectCampaigns(campaigns, {
    q: filters.q,
    group: filters.group,
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
      group: filters.group,
      dealer: filters.dealer,
      timeZone: filters.timeZone,
      status: filters.status,
      page: filters.page,
    },
  );

  const handleResetFilters = () => {
    void setFilters({
      q: "",
      group: FILTER_ALL,
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
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {flash ? (
        <div
          className="app-shell-content-px mt-[var(--spacing-16,16px)] flex shrink-0 items-start justify-between gap-3 rounded-lg border border-border bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
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

      <CampaignListHeader />

      <div className="app-shell-content-px shrink-0">
        <DealershipScopeBar />
      </div>

      <div className="app-shell-content-px app-shell-content-pb flex min-h-0 min-w-0 flex-1 flex-col gap-6 overflow-hidden pt-6">
        <div className="shrink-0">
          <CampaignFilters />
        </div>

        {emptyVariant ? (
          <EmptyState variant={emptyVariant} onReset={handleResetFilters} />
        ) : (
          <DesignSystemTableShellNoTabs
            className="flex min-h-0 min-w-0 flex-1 flex-col"
            cardBorderClassName={DATA_TABLE_SHELL_BORDER_CLASS}
            pagination={
              result.totalPages > 1 ? (
                <PaginationBar
                  currentPage={result.page}
                  totalPages={result.totalPages}
                  totalItems={result.total}
                  pageSize={result.pageSize}
                  onPageChange={handlePageChange}
                />
              ) : null
            }
          >
            <CampaignTable campaigns={result.rows} />
          </DesignSystemTableShellNoTabs>
        )}
      </div>
    </div>
  );
}
