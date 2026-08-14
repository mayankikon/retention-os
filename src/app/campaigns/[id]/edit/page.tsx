"use client";

import {
  buttonVariants,
} from "@ikontechnologies-arlington/nxtg-design-shiftpackage/primitives";

import { Suspense, use, useMemo, useState } from "react";
import Link from "next/link";
import { useQueryState, parseAsStringLiteral } from "nuqs";
import { AppShell } from "@/components/layout/AppShell";
import { LoadingSkeleton } from "@/components/layout/LoadingSkeleton";
import { CampaignSetupWizard } from "@/components/campaigns/setup/CampaignSetupWizard";
import { useCampaigns } from "@/hooks/use-campaigns";
import {
  getResumeLandingStep,
  hasFullSetupDraft,
  hydrateSetupDraftFromCampaign,
} from "@/lib/campaign-setup-resume";
import { SETUP_STEPS, type SetupStepId } from "@/types/campaign-setup";
import { cn } from "@/lib/utils";

interface EditCampaignPageProps {
  params: Promise<{ id: string }>;
}

const stepParser = parseAsStringLiteral(SETUP_STEPS);

function EditCampaignSetup({ campaignId }: { campaignId: string }) {
  const campaigns = useCampaigns();
  const [stepParam] = useQueryState("step", stepParser);
  const [useRecoveredDraft, setUseRecoveredDraft] = useState(false);

  const campaign = useMemo(
    () => campaigns.find((item) => item.id === campaignId),
    [campaigns, campaignId],
  );

  if (!campaign) {
    return (
      <div className="surface-stroke-sharp rounded-[var(--radius-sm)] bg-card p-6">
        <h1 className="text-xl font-semibold">Campaign Not Found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We could not find a campaign with ID{" "}
          <span className="font-medium text-foreground">{campaignId}</span>.
        </p>
        <Link
          href="/campaigns"
          className={cn(buttonVariants({ variant: "outline" }), "mt-4")}
        >
          Back to Campaigns
        </Link>
      </div>
    );
  }

  if (campaign.status !== "draft") {
    return (
      <div className="surface-stroke-sharp rounded-[var(--radius-sm)] bg-card p-6">
        <h1 className="text-xl font-semibold">Drafts Only</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Only draft campaigns can be edited in setup. This campaign is{" "}
          <span className="font-medium text-foreground">{campaign.status}</span>.
        </p>
        <Link
          href={`/campaigns/${campaign.id}`}
          className={cn(buttonVariants({ variant: "outline" }), "mt-4")}
        >
          Back to Campaign
        </Link>
      </div>
    );
  }

  const hasFullDraft = hasFullSetupDraft(campaign);

  if (!hasFullDraft && !useRecoveredDraft) {
    return (
      <div className="surface-stroke-sharp rounded-[var(--radius-sm)] bg-card p-6">
        <h1 className="text-xl font-semibold">Incomplete Setup Data</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This draft was saved without full setup details. You can continue from
          the fields we still have; other steps will use defaults until you fill
          them in.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className={buttonVariants()}
            onClick={() => setUseRecoveredDraft(true)}
          >
            Start over from saved basics
          </button>
          <Link
            href={`/campaigns/${campaign.id}`}
            className={buttonVariants({ variant: "outline" })}
          >
            Back to detail
          </Link>
        </div>
      </div>
    );
  }

  const initialDraft = hydrateSetupDraftFromCampaign(campaign);
  const initialStep: SetupStepId = getResumeLandingStep(
    initialDraft,
    stepParam,
  );

  return (
    <CampaignSetupWizard
      mode="edit"
      campaignId={campaign.id}
      initialDraft={initialDraft}
      initialStep={initialStep}
    />
  );
}

export default function EditCampaignPage({ params }: EditCampaignPageProps) {
  const { id } = use(params);

  return (
    <AppShell>
      <Suspense
        fallback={
          <div className="space-y-4" aria-busy="true">
            <LoadingSkeleton className="h-8 w-64" />
            <LoadingSkeleton className="h-4 w-96" />
            <LoadingSkeleton className="h-96 w-full" />
          </div>
        }
      >
        <EditCampaignSetup campaignId={id} />
      </Suspense>
    </AppShell>
  );
}
