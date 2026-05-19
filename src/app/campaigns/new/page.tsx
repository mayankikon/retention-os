import { Suspense } from "react";
import { CampaignSetupWizard } from "@/components/campaigns/setup/CampaignSetupWizard";
import { AppShell } from "@/components/layout/AppShell";
import { Skeleton } from "@/components/ui/skeleton";

export default function CampaignSetupPage() {
  return (
    <AppShell>
      <Suspense
        fallback={
          <div className="space-y-4" aria-busy="true">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
            <Skeleton className="h-96 w-full" />
          </div>
        }
      >
        <CampaignSetupWizard />
      </Suspense>
    </AppShell>
  );
}
