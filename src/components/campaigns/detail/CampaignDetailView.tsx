"use client";

import {
  buttonVariants,
} from "@ikontechnologies-arlington/nxtg-design-shiftpackage/primitives";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CampaignChangelogTab } from "@/components/campaigns/detail/CampaignChangelogTab";
import { CampaignDetailHeader } from "@/components/campaigns/detail/CampaignDetailHeader";
import { CampaignDetailsTab } from "@/components/campaigns/detail/CampaignDetailsTab";
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
      <div className="surface-stroke-sharp rounded-[var(--radius-sm)] bg-card p-6">
        <h1 className="text-xl font-semibold">Campaign not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We could not find a campaign with ID{" "}
          <span className="font-medium text-foreground">{campaignId}</span>.
        </p>
        <Link href="/campaigns" className={cn(buttonVariants({ variant: "outline" }), "mt-4")}>
          Back to campaigns
        </Link>
      </div>
    );
  }

  return (
    <div className="app-shell-scrollbar-dashed flex min-h-0 flex-1 flex-col overflow-y-auto">
      <CampaignDetailHeader campaign={campaign} />

      <div className="app-shell-content-px app-shell-content-pb space-y-6 pt-6">
        <div
          className="flex gap-6 border-b border-border"
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
                "-mb-px cursor-pointer border-b-[3px] px-1 py-2.5 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "border-brand-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="surface-stroke-sharp rounded-[var(--radius-sm)] bg-card p-6">
          {activeTab === "details" && analytics ? (
            <CampaignDetailsTab campaign={campaign} analytics={analytics} />
          ) : null}
          {activeTab === "changelog" ? (
            <CampaignChangelogTab entries={changelog} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
