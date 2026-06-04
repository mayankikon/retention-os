import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { CampaignDetailView } from "@/components/campaigns/detail/CampaignDetailView";

interface CampaignDetailPageProps {
  params: Promise<{ id: string }>;
}

function CampaignDetailFallback() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-48 rounded bg-muted" />
      <div className="h-24 rounded-lg bg-muted" />
      <div className="h-64 rounded-lg bg-muted" />
    </div>
  );
}

export default async function CampaignDetailPage({
  params,
}: CampaignDetailPageProps) {
  const { id } = await params;

  return (
    <AppShell>
      <Suspense fallback={<CampaignDetailFallback />}>
        <CampaignDetailView campaignId={id} />
      </Suspense>
    </AppShell>
  );
}
