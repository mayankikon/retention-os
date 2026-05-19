import Link from "next/link";
import { Button } from "@/components/ui/button";

interface CampaignListHeaderProps {
  totalCount: number;
  filteredCount: number;
}

export function CampaignListHeader({
  totalCount,
  filteredCount,
}: CampaignListHeaderProps) {
  const countLabel =
    filteredCount === totalCount
      ? `${totalCount} campaigns`
      : `${filteredCount} of ${totalCount} campaigns`;

  return (
    <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Campaigns
        </h1>
        <p className="text-sm text-muted-foreground">{countLabel}</p>
      </div>
      <Button asChild>
        <Link href="/campaigns/new">Create Campaign</Link>
      </Button>
    </header>
  );
}
