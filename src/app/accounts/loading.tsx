import { LoadingSkeleton } from "@/components/layout/LoadingSkeleton";
import { AppShell } from "@/components/layout/AppShell";

export default function AccountsLoadingPage() {
  return (
    <AppShell>
      <div className="app-shell-content-px app-shell-content-pt app-shell-content-pb space-y-6">
        <div className="space-y-2 border-b border-border pb-6">
          <LoadingSkeleton className="h-8 w-40" />
          <LoadingSkeleton className="h-4 w-28" />
        </div>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:max-w-xl lg:flex-1">
            <LoadingSkeleton className="h-10 w-full" />
            <LoadingSkeleton className="h-10 w-full" />
          </div>
          <LoadingSkeleton className="h-10 w-full lg:max-w-xs" />
        </div>
        <LoadingSkeleton className="h-96 w-full rounded-lg" />
      </div>
    </AppShell>
  );
}
