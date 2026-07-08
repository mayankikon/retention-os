"use client";

import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
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
    <div className="space-y-6">
      <AccountListHeader
        totalCount={accounts.length}
        filteredCount={result.total}
      />

      <AccountFilters />

      {emptyVariant ? (
        <AccountEmptyState variant={emptyVariant} onReset={handleResetFilters} />
      ) : (
        <>
          <AccountTable accounts={result.rows} />
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
