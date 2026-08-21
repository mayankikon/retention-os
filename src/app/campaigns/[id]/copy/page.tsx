import { Suspense } from "react";
import { CampaignLiveCopyEditor } from "@/components/campaigns/detail/CampaignLiveCopyEditor";
import { AppShell } from "@/components/layout/AppShell";
import { LoadingSkeleton } from "@/components/layout/LoadingSkeleton";

interface EditCampaignCopyPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCampaignCopyPage({
  params,
}: EditCampaignCopyPageProps) {
  const { id } = await params;

  return (
    <AppShell>
      <Suspense
        fallback={
          <div className="space-y-4 p-6" aria-busy="true">
            <LoadingSkeleton className="h-8 w-64" />
            <LoadingSkeleton className="h-24 w-full" />
            <LoadingSkeleton className="h-96 w-full" />
          </div>
        }
      >
        <CampaignLiveCopyEditor campaignId={id} />
      </Suspense>
    </AppShell>
  );
}
