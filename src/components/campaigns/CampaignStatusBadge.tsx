"use client";

import {
  Badge,
  BadgeDot,
  type BadgeTone,
} from "@ikontechnologies-arlington/nxtg-design-shiftpackage/primitives/badge";
import { STATUS_LABELS } from "@/data/lookups";
import type { CampaignStatus } from "@/types/campaign";

const STATUS_TONES: Record<CampaignStatus, BadgeTone> = {
  draft: "gray",
  active: "green",
  paused: "amber",
  completed: "cyan",
  archived: "gray",
};

interface CampaignStatusBadgeProps {
  status: CampaignStatus | string;
}

export function CampaignStatusBadge({ status }: CampaignStatusBadgeProps) {
  const isKnown = status in STATUS_TONES;
  const tone = isKnown
    ? STATUS_TONES[status as CampaignStatus]
    : ("gray" as BadgeTone);
  const label = isKnown
    ? STATUS_LABELS[status as CampaignStatus]
    : "Unknown";

  return (
    <Badge
      tone={tone}
      variant="soft"
      leadingVisual={<BadgeDot tone={tone} />}
      className="shadow-none"
    >
      {label}
    </Badge>
  );
}

export function getStatusBadgeConfig(status: CampaignStatus | string) {
  const isKnown = status in STATUS_TONES;
  return {
    label: isKnown ? STATUS_LABELS[status as CampaignStatus] : "Unknown",
    tone: isKnown
      ? STATUS_TONES[status as CampaignStatus]
      : ("gray" as BadgeTone),
  };
}
