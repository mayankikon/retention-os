import { LoadingSkeleton } from "@/components/layout/LoadingSkeleton";

export default function ReportsLoadingPage() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading reports">
      <div className="grid gap-3 sm:grid-cols-4">
        <LoadingSkeleton className="h-24" />
        <LoadingSkeleton className="h-24" />
        <LoadingSkeleton className="h-24" />
        <LoadingSkeleton className="h-24" />
      </div>
      <LoadingSkeleton className="h-96 w-full" />
    </div>
  );
}
