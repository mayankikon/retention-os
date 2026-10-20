import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { SmartMarketingOverview } from "@/components/overview/SmartMarketingOverview";
import { accountSearchParamsCache } from "@/lib/account-search-params";

interface OverviewPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function OverviewPage({ searchParams }: OverviewPageProps) {
  await accountSearchParamsCache.parse(searchParams);

  return (
    <AppShell>
      <Suspense fallback={null}>
        <SmartMarketingOverview />
      </Suspense>
    </AppShell>
  );
}
