"use client";

import {
  Button,
} from "@ikontechnologies-arlington/nxtg-design-shiftpackage/primitives";
import { FileSearch, FilterX, Inbox } from "lucide-react";
import type { EmptyStateVariant } from "@/lib/filters";

const EMPTY_STATE_CONFIG: Record<
  EmptyStateVariant,
  {
    icon: typeof Inbox;
    title: string;
    description: string;
    actionLabel: string;
  }
> = {
  noData: {
    icon: Inbox,
    title: "No Campaigns Yet",
    description:
      "Create your first campaign to start reaching customers. Campaigns will appear here once they are set up.",
    actionLabel: "Create Campaign",
  },
  noSearchResults: {
    icon: FileSearch,
    title: "No Campaigns Match Your Search",
    description:
      "Try adjusting your search term or clearing filters to see more results.",
    actionLabel: "Clear Search",
  },
  filteredZero: {
    icon: FilterX,
    title: "No Campaigns Match These Filters",
    description:
      "Broaden your time zone or status filters to see more results, or reset the dealership scope above.",
    actionLabel: "Clear All Filters",
  },
};

interface EmptyStateProps {
  variant: EmptyStateVariant;
  onReset: () => void;
}

export function EmptyState({ variant, onReset }: EmptyStateProps) {
  const config = EMPTY_STATE_CONFIG[variant];
  const Icon = config.icon;

  return (
    <div
      className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card px-6 py-16 text-center"
      role="status"
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Icon className="h-6 w-6 text-muted-foreground" aria-hidden />
      </div>
      <h3 className="text-lg font-semibold text-foreground">{config.title}</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {config.description}
      </p>
      <Button variant="outline" className="mt-6" onClick={onReset}>
        {config.actionLabel}
      </Button>
    </div>
  );
}
