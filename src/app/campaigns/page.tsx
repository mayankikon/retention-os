import { Suspense } from "react";
import { CampaignListView } from "@/components/campaigns/CampaignListView";
import { AppShell } from "@/components/layout/AppShell";
import { campaignSearchParamsCache } from "@/lib/campaign-search-params";

interface CampaignsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function CampaignsPage({ searchParams }: CampaignsPageProps) {
  await campaignSearchParamsCache.parse(searchParams);

  return (
    <AppShell>
      <Suspense fallback={null}>
        <CampaignListView />
      </Suspense>
    </AppShell>
  );
}
