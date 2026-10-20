"use client";

import { CarFront } from "lucide-react";
import {
  estimateAudienceReach,
  summarizeAudienceFilters,
} from "@/lib/audience-filters";
import { cn } from "@/lib/utils";
import type { AudienceFilterRule } from "@/types/campaign-setup";

/**
 * Estimated reach callout for the Audience Query header. Uses theme tokens
 * only, so it reads correctly in both the Shift and Toolbox UI styles.
 */
export function AudienceReachCard({
  rules,
  className,
}: {
  rules: AudienceFilterRule[];
  className?: string;
}) {
  const reach = estimateAudienceReach(rules);
  // Incomplete rules don't narrow the estimate, so don't count them here.
  const appliedFilterCount = summarizeAudienceFilters(rules).length;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex items-center gap-3 rounded-lg border border-brand-primary/30 bg-brand-primary/5 py-2.5 pr-4 pl-3",
        className,
      )}
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-brand-primary/10 text-brand-primary">
        <CarFront className="size-5" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          Estimated Reach
        </p>
        <p className="text-lg font-semibold leading-tight tabular-nums text-foreground">
          ~{reach.toLocaleString("en-US")}{" "}
          <span className="text-sm font-normal text-muted-foreground">
            vehicles
          </span>
        </p>
        <p className="text-xs text-muted-foreground">
          {appliedFilterCount === 0
            ? "No filters applied"
            : appliedFilterCount === 1
              ? "Matching 1 filter"
              : `Matching all ${appliedFilterCount} filters (AND)`}
        </p>
      </div>
    </div>
  );
}
