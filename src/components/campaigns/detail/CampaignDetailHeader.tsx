"use client";

import {
  Button,
} from "@ikontechnologies-arlington/nxtg-design-shiftpackage/primitives";

import { Archive, Pause, Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { CampaignStatusBadge } from "@/components/campaigns/CampaignStatusBadge";
import { TitleBar } from "@/components/layout/TitleBar";
import {
  setCampaignFlashMessage,
  updateCampaignStatus,
} from "@/lib/campaign-store";
import type { Campaign, CampaignStatus } from "@/types/campaign";

interface CampaignDetailHeaderProps {
  campaign: Campaign;
}

const ARCHIVEABLE_STATUSES: ReadonlySet<CampaignStatus> = new Set([
  "active",
  "paused",
  "completed",
]);

export function CampaignDetailHeader({ campaign }: CampaignDetailHeaderProps) {
  const router = useRouter();
  const canPause = campaign.status === "active";
  const canResume = campaign.status === "paused";
  const canArchive = ARCHIVEABLE_STATUSES.has(campaign.status);

  const handleStatusChange = (status: CampaignStatus) => {
    updateCampaignStatus(campaign.id, status);
  };

  const handleArchive = () => {
    const confirmed = window.confirm(
      `Archive “${campaign.name}”? This stops sending and cannot be undone.`,
    );
    if (!confirmed) return;

    updateCampaignStatus(campaign.id, "archived");
    setCampaignFlashMessage({
      kind: "archived",
      campaignName: campaign.name,
    });
    router.push("/campaigns");
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
          {canArchive ? (
            <Button
              type="button"
              variant="secondary"
              size="header"
              leadingIcon={<Archive aria-hidden />}
              onClick={handleArchive}
            >
              Archive
            </Button>
          ) : null}
        </div>
      }
    />
  );
}
