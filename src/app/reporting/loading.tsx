import { LoadingSkeleton } from "@/components/layout/LoadingSkeleton";

export default function ReportingLoadingPage() {
  return (
    <div
      className="space-y-6"
      aria-busy="true"
      aria-label="Loading reporting"
    >
      <div className="grid gap-3 sm:grid-cols-4">
        <LoadingSkeleton className="h-9" />
        <LoadingSkeleton className="h-9" />
        <LoadingSkeleton className="h-9" />
        <LoadingSkeleton className="h-9" />
      </div>
      <LoadingSkeleton className="h-96 w-full" />
    </div>
  );
}
