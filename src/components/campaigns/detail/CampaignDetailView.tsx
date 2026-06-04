"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CampaignChangelogTab } from "@/components/campaigns/detail/CampaignChangelogTab";
import { CampaignDetailHeader } from "@/components/campaigns/detail/CampaignDetailHeader";
import { CampaignDetailsTab } from "@/components/campaigns/detail/CampaignDetailsTab";
import { Button } from "@/components/ui/button";
import { getCampaignAnalytics } from "@/lib/campaign-analytics";
import { buildCampaignChangelog } from "@/lib/campaign-changelog";
import { useCampaigns } from "@/hooks/use-campaigns";
import type { CampaignDetailTab } from "@/types/campaign-detail";
import { cn } from "@/lib/utils";

interface CampaignDetailViewProps {
  campaignId: string;
}

const DETAIL_TABS: { id: CampaignDetailTab; label: string }[] = [
  { id: "details", label: "Details" },
  { id: "changelog", label: "Change log" },
];

export function CampaignDetailView({ campaignId }: CampaignDetailViewProps) {
  const campaigns = useCampaigns();
  const [activeTab, setActiveTab] = useState<CampaignDetailTab>("details");

  const campaign = useMemo(
    () => campaigns.find((item) => item.id === campaignId),
    [campaigns, campaignId],
  );

  const analytics = useMemo(
    () => (campaign ? getCampaignAnalytics(campaign) : null),
    [campaign],
  );

  const changelog = useMemo(
    () => (campaign ? buildCampaignChangelog(campaign) : []),
    [campaign],
  );

  if (!campaign) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Campaign not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We could not find a campaign with ID{" "}
          <span className="font-medium text-foreground">{campaignId}</span>.
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/campaigns">Back to campaigns</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CampaignDetailHeader campaign={campaign} />

      <div
        className="flex gap-2 border-b border-border"
        role="tablist"
        aria-label="Campaign detail sections"
      >
        {DETAIL_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "rounded-t-md border border-b-0 px-4 py-2 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "border-border bg-card text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        {activeTab === "details" && analytics ? (
          <CampaignDetailsTab campaign={campaign} analytics={analytics} />
        ) : null}
        {activeTab === "changelog" ? (
          <CampaignChangelogTab entries={changelog} />
        ) : null}
      </div>
    </div>
  );
}
