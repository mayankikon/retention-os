"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CampaignStatusBadge } from "@/components/campaigns/CampaignStatusBadge";
import { getTimeZoneLabel } from "@/data/campaign-setup.defaults";
import type { Campaign } from "@/types/campaign";

interface CampaignDetailHeaderProps {
  campaign: Campaign;
}

export function CampaignDetailHeader({ campaign }: CampaignDetailHeaderProps) {
  return (
    <div className="space-y-4">
      <Link
        href="/campaigns"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to campaigns
      </Link>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            {campaign.name}
          </h1>
          <CampaignStatusBadge status={campaign.status} />
        </div>
        <p className="text-sm text-muted-foreground">
          {campaign.dealer} · {getTimeZoneLabel(campaign.timeZone)} ·{" "}
          {campaign.group}
        </p>
      </div>
    </div>
  );
}
