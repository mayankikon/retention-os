import { AppShell } from "@/components/layout/AppShell";
import { Skeleton } from "@/components/ui/skeleton";

export default function AccountsLoadingPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div className="space-y-2 border-b border-border pb-6">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:max-w-xl lg:flex-1">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-full lg:max-w-xs" />
        </div>
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    </AppShell>
  );
}
