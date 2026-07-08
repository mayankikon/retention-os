import { cn } from "@/lib/utils";
import type { AccountEligibility } from "@/types/account";

const ELIGIBILITY_STYLES: Record<
  AccountEligibility,
  { label: string; className: string }
> = {
  eligible: {
    label: "Eligible",
    className: "bg-[var(--status-active-bg)] text-[var(--status-active-fg)]",
  },
  not_eligible: {
    label: "Not eligible",
    className: "bg-muted text-muted-foreground",
  },
};

interface EligibilityBadgeProps {
  eligibility: AccountEligibility;
}

export function EligibilityBadge({ eligibility }: EligibilityBadgeProps) {
  const config = ELIGIBILITY_STYLES[eligibility];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        config.className,
      )}
    >
      {config.label}
    </span>
  );
}
