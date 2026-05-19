import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/layout/AppShell";

interface CampaignDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CampaignDetailPage({
  params,
}: CampaignDetailPageProps) {
  const { id } = await params;

  return (
    <AppShell>
      <div className="rounded-lg border border-border bg-card p-6">
        <h1 className="text-xl font-semibold">Campaign {id}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Campaign detail view is out of scope for Phase 1. This route exists so
          list row links resolve correctly.
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/campaigns">Back to list</Link>
        </Button>
      </div>
    </AppShell>
  );
}
