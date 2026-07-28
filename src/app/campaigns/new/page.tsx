import { Suspense } from "react";
import { CampaignSetupWizard } from "@/components/campaigns/setup/CampaignSetupWizard";
import { AppShell } from "@/components/layout/AppShell";
import { LoadingSkeleton } from "@/components/layout/LoadingSkeleton";

export default function CampaignSetupPage() {
  return (
    <AppShell>
      <Suspense
        fallback={
          <div className="space-y-4" aria-busy="true">
            <LoadingSkeleton className="h-8 w-64" />
            <LoadingSkeleton className="h-4 w-96" />
            <LoadingSkeleton className="h-96 w-full" />
          </div>
        }
      >
        <CampaignSetupWizard />
      </Suspense>
    </AppShell>
  );
}
