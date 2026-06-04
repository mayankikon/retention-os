import { StepperHeader } from "@/components/campaigns/setup/StepperHeader";
import { MessagePreviewPanel } from "@/components/campaigns/setup/MessagePreviewPanel";
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
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          New campaign setup
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure a dealership campaign per the Smart Marketing SOP.
        </p>
      </div>

      <StepperHeader
        currentStepId={currentStepId}
        completedSteps={completedSteps}
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,360px)]">
        <div className="min-w-0 rounded-lg border border-border bg-card p-6 shadow-sm">
          {children}
        </div>
        <div className="min-w-0">
          <MessagePreviewPanel draft={draft} currentStepId={currentStepId} />
        </div>
      </div>
    </div>
  );
}
