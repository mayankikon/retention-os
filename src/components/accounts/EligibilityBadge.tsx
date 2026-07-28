"use client";

import {
  Badge,
  BadgeDot,
  type BadgeTone,
} from "@ikontechnologies-arlington/nxtg-design-shiftpackage/primitives/badge";
import type { AccountEligibility } from "@/types/account";

const ELIGIBILITY_TONES: Record<
  AccountEligibility,
  { label: string; tone: BadgeTone }
> = {
  eligible: {
    label: "Eligible",
    tone: "green",
  },
  not_eligible: {
    label: "Not eligible",
    tone: "gray",
  },
};

interface EligibilityBadgeProps {
  eligibility: AccountEligibility;
}

export function EligibilityBadge({ eligibility }: EligibilityBadgeProps) {
  const config = ELIGIBILITY_TONES[eligibility];

  return (
    <Badge
      tone={config.tone}
      variant="soft"
      leadingVisual={<BadgeDot tone={config.tone} />}
      className="shadow-none"
    >
      {config.label}
    </Badge>
  );
}
