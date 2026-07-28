import { LoadingSkeleton } from "@/components/layout/LoadingSkeleton";
import { AppShell } from "@/components/layout/AppShell";

export default function CampaignsLoadingPage() {
  return (
    <AppShell>
      <div
        className="app-shell-content-px app-shell-content-pt app-shell-content-pb space-y-6"
        aria-busy="true"
        aria-label="Loading campaigns"
      >
        <div className="flex justify-between">
          <div className="space-y-2">
            <LoadingSkeleton className="h-8 w-48" />
            <LoadingSkeleton className="h-4 w-32" />
          </div>
          <LoadingSkeleton className="h-16 w-64" />
        </div>
        <div className="grid gap-3 sm:grid-cols-4">
          <LoadingSkeleton className="h-9" />
          <LoadingSkeleton className="h-9" />
          <LoadingSkeleton className="h-9" />
          <LoadingSkeleton className="h-9" />
        </div>
        <LoadingSkeleton className="h-96 w-full" />
      </div>
    </AppShell>
  );
}
