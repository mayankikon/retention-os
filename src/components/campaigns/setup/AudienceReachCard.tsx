"use client";

import { CarFront, type LucideIcon } from "lucide-react";
import {
  estimateAudienceReach,
  summarizeAudienceFilters,
} from "@/lib/audience-filters";
import { cn } from "@/lib/utils";
import type { AudienceFilterRule } from "@/types/campaign-setup";

/**
 * Estimated reach callout for the Audience Query header (and the Review
 * step's Customers Targeted). Uses theme tokens only, so it reads correctly
 * in both the Shift and Toolbox UI styles.
 */
export function AudienceReachCard({
  rules,
  label = "Estimated Reach",
  unit = "vehicles",
  showFilterSummary = true,
  icon: Icon = CarFront,
  className,
}: {
  rules: AudienceFilterRule[];
  label?: string;
  unit?: string;
  showFilterSummary?: boolean;
  icon?: LucideIcon;
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
        "flex items-center gap-3 rounded-[var(--radius-sm)] border border-border bg-card py-2.5 pr-4 pl-3",
        className,
      )}
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-brand-primary/10 text-brand-primary">
        <Icon className="size-5" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          {label}
        </p>
        <p className="text-lg font-semibold leading-tight tabular-nums text-foreground">
          ~{reach.toLocaleString("en-US")}{" "}
          <span className="text-sm font-normal text-muted-foreground">
            {unit}
          </span>
        </p>
        {showFilterSummary && appliedFilterCount > 0 ? (
          <p className="text-xs text-muted-foreground">
            {appliedFilterCount === 1
              ? "Matching 1 filter"
              : `Matching all ${appliedFilterCount} filters (AND)`}
          </p>
        ) : null}
      </div>
    </div>
  );
}
