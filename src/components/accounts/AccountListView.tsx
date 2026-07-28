"use client";

import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { DesignSystemTableShellNoTabs } from "@ikontechnologies-arlington/nxtg-design-shiftpackage";
import { AccountEmptyState } from "@/components/accounts/AccountEmptyState";
import { AccountFilters } from "@/components/accounts/AccountFilters";
import { AccountListHeader } from "@/components/accounts/AccountListHeader";
import { AccountTable } from "@/components/accounts/AccountTable";
import { PaginationBar } from "@/components/campaigns/PaginationBar";
import { FILTER_ALL } from "@/data/lookups";
import { useAccounts } from "@/hooks/use-accounts";
import { useViewportTablePageSize } from "@/hooks/use-viewport-table-page-size";
import {
  resolveAccountEmptyStateVariant,
  selectAccounts,
} from "@/lib/account-filters";
import { DATA_TABLE_SHELL_BORDER_CLASS } from "@/lib/data-table-chrome";

const listParsers = {
  q: parseAsString.withDefault(""),
  eligibility: parseAsString.withDefault(FILTER_ALL),
  smartMarketing: parseAsString.withDefault(FILTER_ALL),
  page: parseAsInteger.withDefault(1),
};

export function AccountListView() {
  const accounts = useAccounts();
  const [filters, setFilters] = useQueryStates(listParsers);

  const provisionalResult = selectAccounts(accounts, {
    q: filters.q,
    eligibility: filters.eligibility,
    smartMarketing: filters.smartMarketing,
    page: filters.page,
  });

  const hasPagination = provisionalResult.totalPages > 1;
  const pageSize = useViewportTablePageSize({ hasPagination });

  const result = selectAccounts(
    accounts,
    {
      q: filters.q,
      eligibility: filters.eligibility,
      smartMarketing: filters.smartMarketing,
      page: filters.page,
    },
    pageSize,
  );

  const emptyVariant = resolveAccountEmptyStateVariant(
    accounts.length,
    result.total,
    {
      q: filters.q,
      eligibility: filters.eligibility,
      smartMarketing: filters.smartMarketing,
      page: filters.page,
    },
  );

  const handleResetFilters = () => {
    void setFilters({
      q: "",
      eligibility: FILTER_ALL,
      smartMarketing: FILTER_ALL,
      page: 1,
    });
  };

  const handlePageChange = (page: number) => {
    void setFilters({ page });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <AccountListHeader />

      <div className="app-shell-content-px app-shell-content-pb flex min-h-0 min-w-0 flex-1 flex-col gap-6 overflow-hidden pt-6">
        <div className="shrink-0">
          <AccountFilters />
        </div>

        {emptyVariant ? (
          <AccountEmptyState variant={emptyVariant} onReset={handleResetFilters} />
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
            <AccountTable accounts={result.rows} />
          </DesignSystemTableShellNoTabs>
        )}
      </div>
    </div>
  );
}
