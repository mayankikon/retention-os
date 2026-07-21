"use client";

import Link from "next/link";
import { ArrowLeft, Pause, Play, Square } from "lucide-react";
import { CampaignStatusBadge } from "@/components/campaigns/CampaignStatusBadge";
import { Button } from "@/components/ui/button";
import { getTimeZoneLabel } from "@/data/campaign-setup.defaults";
import { updateCampaignStatus } from "@/lib/campaign-store";
import type { Campaign, CampaignStatus } from "@/types/campaign";

interface CampaignDetailHeaderProps {
  campaign: Campaign;
}

export function CampaignDetailHeader({ campaign }: CampaignDetailHeaderProps) {
  const canPause = campaign.status === "active" || campaign.status === "scheduled";
  const canResume = campaign.status === "paused";
  const canStop =
    campaign.status === "active" ||
    campaign.status === "paused" ||
    campaign.status === "scheduled";

  const handleStatusChange = (status: CampaignStatus) => {
    updateCampaignStatus(campaign.id, status);
  };

  return (
    <div className="space-y-4">
      <Link
        href="/campaigns"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to campaigns
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
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
          {campaign.status === "scheduled" && campaign.scheduledActivateAt ? (
            <p className="text-sm text-muted-foreground">
              Activates{" "}
              {new Date(campaign.scheduledActivateAt).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          {canPause ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => handleStatusChange("paused")}
            >
              <Pause className="h-4 w-4" aria-hidden />
              Pause
            </Button>
          ) : null}
          {canResume ? (
            <Button
              type="button"
              onClick={() => handleStatusChange("active")}
            >
              <Play className="h-4 w-4" aria-hidden />
              Resume
            </Button>
          ) : null}
          {canStop ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => handleStatusChange("stopped")}
            >
              <Square className="h-4 w-4" aria-hidden />
              Stop
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
