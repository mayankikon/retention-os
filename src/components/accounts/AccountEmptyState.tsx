import { FileSearch, FilterX, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AccountEmptyStateVariant } from "@/lib/account-filters";

const EMPTY_STATE_CONFIG: Record<
  AccountEmptyStateVariant,
  {
    icon: typeof Inbox;
    title: string;
    description: string;
    actionLabel: string;
  }
> = {
  noData: {
    icon: Inbox,
    title: "No accounts yet",
    description:
      "Dealership accounts will appear here once they are onboarded.",
    actionLabel: "Clear filters",
  },
  noSearchResults: {
    icon: FileSearch,
    title: "No accounts match your search",
    description:
      "Try adjusting your search term or clearing filters to see more results.",
    actionLabel: "Clear search",
  },
  filteredZero: {
    icon: FilterX,
    title: "No accounts match these filters",
    description:
      "Broaden your eligibility or smart marketing filters to find matching accounts.",
    actionLabel: "Clear all filters",
  },
};

interface AccountEmptyStateProps {
  variant: AccountEmptyStateVariant;
  onReset: () => void;
}

export function AccountEmptyState({ variant, onReset }: AccountEmptyStateProps) {
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
