"use client";

import { TitleBar } from "@/components/layout/TitleBar";
import { StepperHeader } from "@/components/campaigns/setup/StepperHeader";
import { MessagePreviewPanel } from "@/components/campaigns/setup/MessagePreviewPanel";
import { useCampaignSetupLeaveGuard } from "@/contexts/campaign-setup-leave-guard";
import type { CampaignSetupDraft, SetupStepId } from "@/types/campaign-setup";

interface StepShellLayoutProps {
  currentStepId: SetupStepId;
  completedSteps: Set<SetupStepId>;
  draft: CampaignSetupDraft;
  children: React.ReactNode;
}

export function StepShellLayout({
  currentStepId,
  completedSteps,
  draft,
  children,
}: StepShellLayoutProps) {
  const { requestNavigation } = useCampaignSetupLeaveGuard();

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <TitleBar
        breadcrumbs={[
          {
            label: "Campaigns",
            onClick: () => requestNavigation("/campaigns"),
          },
          { label: "New Campaign Setup" },
        ]}
        title="New Campaign Setup"
      />

      <div className="app-shell-scrollbar-dashed app-shell-content-px app-shell-content-pb min-h-0 flex-1 space-y-8 overflow-y-auto pt-6">
        <StepperHeader
          currentStepId={currentStepId}
          completedSteps={completedSteps}
        />

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,360px)]">
          <div className="surface-stroke-sharp flex h-full min-w-0 flex-col overflow-hidden rounded-[var(--radius-sm)] bg-card">
            {children}
          </div>
          <div className="min-w-0">
            <MessagePreviewPanel draft={draft} currentStepId={currentStepId} />
          </div>
        </div>
      </div>
    </div>
  );
}
