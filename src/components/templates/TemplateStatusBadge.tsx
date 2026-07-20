import { Badge } from "@/components/ui/badge";
import type { TemplateStatus } from "@/types/template";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<TemplateStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  published: "bg-emerald-100 text-emerald-800",
  archived: "bg-amber-100 text-amber-900",
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
  return (
    <Badge
      className={cn(
        "border-transparent font-medium capitalize",
        STATUS_STYLES[status],
      )}
    >
      {STATUS_LABELS[status]}
    </Badge>
  );
}
