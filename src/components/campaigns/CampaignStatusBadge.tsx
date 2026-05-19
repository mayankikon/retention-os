import { STATUS_LABELS } from "@/data/lookups";
import { cn } from "@/lib/utils";
import type { CampaignStatus } from "@/types/campaign";

const STATUS_STYLES: Record<
  CampaignStatus,
  { label: string; className: string }
> = {
  scheduled: {
    label: STATUS_LABELS.scheduled,
    className:
      "bg-[var(--status-scheduled-bg)] text-[var(--status-scheduled-fg)]",
  },
  active: {
    label: STATUS_LABELS.active,
    className: "bg-[var(--status-active-bg)] text-[var(--status-active-fg)]",
  },
  paused: {
    label: STATUS_LABELS.paused,
    className: "bg-[var(--status-paused-bg)] text-[var(--status-paused-fg)]",
  },
  stopped: {
    label: STATUS_LABELS.stopped,
    className:
      "bg-[var(--status-stopped-bg)] text-[var(--status-stopped-fg)]",
  },
  completed: {
    label: STATUS_LABELS.completed,
    className:
      "bg-[var(--status-completed-bg)] text-[var(--status-completed-fg)]",
  },
  draft: {
    label: STATUS_LABELS.draft,
    className: "bg-[var(--status-draft-bg)] text-[var(--status-draft-fg)]",
  },
  failed: {
    label: STATUS_LABELS.failed,
    className: "bg-[var(--status-failed-bg)] text-[var(--status-failed-fg)]",
  },
};

const FALLBACK_STYLE = {
  label: "Unknown",
  className: "bg-muted text-muted-foreground",
};

interface CampaignStatusBadgeProps {
  status: CampaignStatus | string;
}

export function CampaignStatusBadge({ status }: CampaignStatusBadgeProps) {
  const config =
    status in STATUS_STYLES
      ? STATUS_STYLES[status as CampaignStatus]
      : FALLBACK_STYLE;

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

export function getStatusBadgeConfig(status: CampaignStatus | string) {
  return status in STATUS_STYLES
    ? STATUS_STYLES[status as CampaignStatus]
    : FALLBACK_STYLE;
}
