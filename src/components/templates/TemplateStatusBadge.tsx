"use client";

import {
  Badge,
  BadgeDot,
  type BadgeTone,
} from "@ikontechnologies-arlington/nxtg-design-shiftpackage/primitives/badge";
import type { TemplateStatus } from "@/types/template";

const STATUS_TONES: Record<TemplateStatus, BadgeTone> = {
  draft: "gray",
  published: "emerald",
  archived: "amber",
};

const STATUS_LABELS: Record<TemplateStatus, string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};

interface TemplateStatusBadgeProps {
  status: TemplateStatus;
}

export function TemplateStatusBadge({ status }: TemplateStatusBadgeProps) {
  const tone = STATUS_TONES[status];

  return (
    <Badge
      tone={tone}
      variant="soft"
      leadingVisual={<BadgeDot tone={tone} />}
      className="shadow-none"
    >
      {STATUS_LABELS[status]}
    </Badge>
  );
}
