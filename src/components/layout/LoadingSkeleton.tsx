import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
}

/** Server-safe pulse placeholder — avoids Shift barrel (createContext) in loading.tsx. */
export function LoadingSkeleton({ className }: LoadingSkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      aria-hidden
    />
  );
}
