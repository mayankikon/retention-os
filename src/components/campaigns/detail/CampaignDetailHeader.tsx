"use client";

import {
  Button,
  buttonVariants,
} from "@ikontechnologies-arlington/nxtg-design-shiftpackage/primitives";

import { Archive, Pause, Pencil, Play, Send } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { CampaignStatusBadge } from "@/components/campaigns/CampaignStatusBadge";
import { SendTestMessageDialog } from "@/components/campaigns/detail/SendTestMessageDialog";
import { AppToast } from "@/components/layout/AppToast";
import { TitleBar } from "@/components/layout/TitleBar";
import {
  setCampaignFlashMessage,
  updateCampaignStatus,
} from "@/lib/campaign-store";
import {
  hydrateSetupDraftFromCampaign,
  isSetupDraftComplete,
} from "@/lib/campaign-setup-resume";
import { testSendCopy } from "@/lib/test-message";
import type { Campaign, CampaignStatus } from "@/types/campaign";
import { cn } from "@/lib/utils";

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
  const canEditLiveCopy =
    campaign.status === "active" || campaign.status === "paused";
  // Same statuses as Edit copy: a paused campaign can still be checked before Resume.
  const canSendTest = canEditLiveCopy;
  const isDraft = campaign.status === "draft";
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [testSentTo, setTestSentTo] = useState<string | null>(null);
  const dismissTestToast = useCallback(() => setTestSentTo(null), []);

  const setupDraft = isDraft ? hydrateSetupDraftFromCampaign(campaign) : null;
  const isCompleteDraft =
    Boolean(setupDraft) && isSetupDraftComplete(setupDraft!);
  const editHref = `/campaigns/${campaign.id}/edit`;
  const reviewHref = `${editHref}?step=review`;

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
    <>
      <TitleBar
        breadcrumbs={[
          { label: "Campaigns", href: "/campaigns" },
          { label: campaign.name },
        ]}
        title={campaign.name}
        titleTrailing={<CampaignStatusBadge status={campaign.status} />}
        right={
          <div className="flex flex-wrap items-center gap-2">
            {isDraft && !isCompleteDraft ? (
              <Link
                href={editHref}
                className={cn(buttonVariants({ size: "header" }))}
              >
                Continue setup
              </Link>
            ) : null}
            {isDraft && isCompleteDraft ? (
              <>
                <Link
                  href={editHref}
                  className={cn(
                    buttonVariants({ variant: "secondary", size: "header" }),
                  )}
                >
                  Edit
                </Link>
                <Link
                  href={reviewHref}
                  className={cn(buttonVariants({ size: "header" }))}
                >
                  Review & activate
                </Link>
              </>
            ) : null}
            {canSendTest ? (
              <Button
                type="button"
                variant="secondary"
                size="header"
                leadingIcon={<Send aria-hidden />}
                onClick={() => setIsTestDialogOpen(true)}
              >
                Send test
              </Button>
            ) : null}
            {canEditLiveCopy ? (
              <Link
                href={`/campaigns/${campaign.id}/copy`}
                className={cn(
                  buttonVariants({ variant: "secondary", size: "header" }),
                )}
              >
                <Pencil className="h-4 w-4" aria-hidden />
                Edit copy
              </Link>
            ) : null}
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
      {canSendTest ? (
        <SendTestMessageDialog
          open={isTestDialogOpen}
          onOpenChange={setIsTestDialogOpen}
          defaultPhone={campaign.setupDraft?.testPhoneNumber ?? ""}
          onSent={setTestSentTo}
        />
      ) : null}
      {testSentTo ? (
        <AppToast
          message={testSendCopy.detailSuccessToast(testSentTo)}
          onDismiss={dismissTestToast}
        />
      ) : null}
    </>
  );
}
