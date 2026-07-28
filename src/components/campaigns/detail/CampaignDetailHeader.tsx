"use client";

import {
  Button,
} from "@ikontechnologies-arlington/nxtg-design-shiftpackage/primitives";

import { Pause, Play, Square } from "lucide-react";
import { CampaignStatusBadge } from "@/components/campaigns/CampaignStatusBadge";
import { TitleBar } from "@/components/layout/TitleBar";
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
    <TitleBar
      breadcrumbs={[
        { label: "Campaigns", href: "/campaigns" },
        { label: campaign.name },
      ]}
      title={campaign.name}
      titleTrailing={<CampaignStatusBadge status={campaign.status} />}
      right={
        <div className="flex flex-wrap gap-2">
          {canPause ? (
            <Button
              type="button"
              variant="secondary"
              size="header"
              leadingIcon={<Pause aria-hidden />}
              onClick={() => handleStatusChange("paused")}
            >
              Pause
            </Button>
          ) : null}
          {canResume ? (
            <Button
              type="button"
              size="header"
              leadingIcon={<Play aria-hidden />}
              onClick={() => handleStatusChange("active")}
            >
              Resume
            </Button>
          ) : null}
          {canStop ? (
            <Button
              type="button"
              variant="secondary"
              size="header"
              leadingIcon={<Square aria-hidden />}
              onClick={() => handleStatusChange("stopped")}
            >
              Stop
            </Button>
          ) : null}
        </div>
      }
    />
  );
}
