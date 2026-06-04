import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatRelativeTime, formatTimestamp } from "@/lib/dates";
import type { CampaignChangelogEntry } from "@/types/campaign-detail";

const ACTION_LABELS: Record<CampaignChangelogEntry["action"], string> = {
  created: "Created",
  updated: "Updated",
  status_changed: "Status",
  message_edited: "Messaging",
  activated: "Activated",
  paused: "Paused",
  completed: "Completed",
  stopped: "Stopped",
};

interface CampaignChangelogTabProps {
  entries: CampaignChangelogEntry[];
}

export function CampaignChangelogTab({ entries }: CampaignChangelogTabProps) {
  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No activity recorded for this campaign yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold">Activity</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Recent changes and lifecycle events for this campaign.
        </p>
      </div>

      <ol className="space-y-0 divide-y divide-border rounded-lg border border-border">
        {entries.map((entry) => (
          <li
            key={entry.id}
            className="flex gap-4 px-4 py-4 first:rounded-t-lg last:rounded-b-lg"
          >
            <Avatar className="mt-0.5 h-8 w-8 shrink-0">
              <AvatarFallback className="text-xs">
                {entry.actor.initials}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <p className="text-sm font-medium text-foreground">
                  {entry.summary}
                </p>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                  {ACTION_LABELS[entry.action]}
                </span>
              </div>

              {entry.details ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  {entry.details}
                </p>
              ) : null}

              <p className="mt-2 text-xs text-muted-foreground">
                {entry.actor.name} · {formatTimestamp(entry.timestamp)} (
                {formatRelativeTime(entry.timestamp)})
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
