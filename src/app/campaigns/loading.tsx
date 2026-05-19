import { AppShell } from "@/components/layout/AppShell";
import { Skeleton } from "@/components/ui/skeleton";

export default function CampaignsLoadingPage() {
  return (
    <AppShell>
      <div className="space-y-6" aria-busy="true" aria-label="Loading campaigns">
        <div className="flex justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-16 w-64" />
        </div>
        <div className="grid gap-3 sm:grid-cols-4">
          <Skeleton className="h-9" />
          <Skeleton className="h-9" />
          <Skeleton className="h-9" />
          <Skeleton className="h-9" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    </AppShell>
  );
}
