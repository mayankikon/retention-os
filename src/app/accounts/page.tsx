import { Suspense } from "react";
import { AccountListView } from "@/components/accounts/AccountListView";
import { AppShell } from "@/components/layout/AppShell";
import { accountSearchParamsCache } from "@/lib/account-search-params";

interface AccountsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AccountsPage({ searchParams }: AccountsPageProps) {
  await accountSearchParamsCache.parse(searchParams);

  return (
    <AppShell>
      <Suspense fallback={null}>
        <AccountListView />
      </Suspense>
    </AppShell>
  );
}
