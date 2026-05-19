import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConfirmationViewProps {
  campaignName: string;
}

export function ConfirmationView({ campaignName }: ConfirmationViewProps) {
  return (
    <div
      className="mx-auto max-w-lg rounded-lg border border-border bg-card p-8 text-center shadow-sm"
      role="status"
    >
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--status-active-bg)]">
        <CheckCircle2
          className="h-7 w-7 text-[var(--status-active-fg)]"
          aria-hidden
        />
      </div>
      <h1 className="text-2xl font-semibold text-foreground">
        Campaign activated
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{campaignName}</span> is
        now live. Monitor status and message delivery from the campaign list.
      </p>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Button asChild>
          <Link href="/campaigns">View campaigns</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/campaigns/new">Create another</Link>
        </Button>
      </div>
    </div>
  );
}
