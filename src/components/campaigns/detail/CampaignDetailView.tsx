"use client";

import {
  buttonVariants,
} from "@ikontechnologies-arlington/nxtg-design-shiftpackage/primitives";

import { Check, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CampaignChangelogTab } from "@/components/campaigns/detail/CampaignChangelogTab";
import { CampaignDetailHeader } from "@/components/campaigns/detail/CampaignDetailHeader";
import { CampaignDetailsTab } from "@/components/campaigns/detail/CampaignDetailsTab";
import { AppToast } from "@/components/layout/AppToast";
import { getCampaignAnalytics } from "@/lib/campaign-analytics";
import { buildCampaignChangelog } from "@/lib/campaign-changelog";
import {
  consumeCampaignFlashMessage,
  type CampaignFlashMessage,
} from "@/lib/campaign-store";
import { useCampaigns } from "@/hooks/use-campaigns";
import type { CampaignDetailTab } from "@/types/campaign-detail";
import { cn } from "@/lib/utils";

interface CampaignDetailViewProps {
  campaignId: string;
}

const DETAIL_TABS: { id: CampaignDetailTab; label: string }[] = [
  { id: "details", label: "Details" },
  { id: "changelog", label: "Change Log" },
];

function flashCopy(message: CampaignFlashMessage): string {
  switch (message.kind) {
    case "draft":
      return `${message.campaignName} saved as a draft.`;
    case "copyUpdated":
      return `${message.campaignName} copy updated for new and not-yet-sent recipients.`;
    case "activated":
      return `${message.campaignName} is now active.`;
    case "scheduled":
      return `${message.campaignName} will activate on the selected date${message.detail ? ` · ${message.detail}` : ""}.`;
    case "archived":
      return `${message.campaignName} was archived.`;
    default:
      return message.campaignName;
  }
}

export function CampaignDetailView({ campaignId }: CampaignDetailViewProps) {
  const campaigns = useCampaigns();
  const [activeTab, setActiveTab] = useState<CampaignDetailTab>("details");
  const [flash, setFlash] = useState<CampaignFlashMessage | null>(null);
  const dismissFlash = useCallback(() => setFlash(null), []);

  useEffect(() => {
    // Strict Mode runs mount effects twice; the second pass finds an empty
    // slot, so only a real message may replace current state.
    const message = consumeCampaignFlashMessage();
    if (message) setFlash(message);
  }, []);

  const copyUpdatedToast = flash?.kind === "copyUpdated" ? flash : null;
  const bannerFlash = flash && flash.kind !== "copyUpdated" ? flash : null;

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
        <h1 className="text-xl font-semibold">Campaign Not Found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We could not find a campaign with ID{" "}
          <span className="font-medium text-foreground">{campaignId}</span>.
        </p>
        <Link href="/campaigns" className={cn(buttonVariants({ variant: "outline" }), "mt-4")}>
          Back to Campaigns
        </Link>
      </div>
    );
  }

  return (
    <div className="app-shell-scrollbar-dashed flex min-h-0 flex-1 flex-col overflow-y-auto">
      <CampaignDetailHeader campaign={campaign} />

      <div className="app-shell-content-px app-shell-content-pb space-y-6 pt-6">
        {bannerFlash ? (
          <div
            className="flex items-start justify-between gap-3 rounded-lg border border-border bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
            role="status"
          >
            <div className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <p>{flashCopy(bannerFlash)}</p>
            </div>
            <button
              type="button"
              onClick={dismissFlash}
              className="rounded-sm p-1 hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : null}

        {copyUpdatedToast ? (
          <AppToast
            message={flashCopy(copyUpdatedToast)}
            onDismiss={dismissFlash}
          />
        ) : null}

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
