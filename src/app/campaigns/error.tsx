"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/layout/AppShell";

export default function CampaignsErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Campaign list error", error);
  }, [error]);

  return (
    <AppShell>
      <div
        className="rounded-lg border border-red-200 bg-red-50 p-6 text-center"
        role="alert"
      >
        <h2 className="text-lg font-semibold text-red-900">
          Unable to load campaigns
        </h2>
        <p className="mt-2 text-sm text-red-800">
          Something went wrong while loading the campaign list. Please try
          again.
        </p>
        <Button className="mt-4" onClick={reset}>
          Try again
        </Button>
      </div>
    </AppShell>
  );
}
