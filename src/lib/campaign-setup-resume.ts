import { createDefaultSetupDraft } from "@/data/campaign-setup.defaults";
import {
  validateSetupStep,
} from "@/lib/campaign-setup-validation";
import type { Campaign } from "@/types/campaign";
import type { CampaignSetupDraft, SetupStepId } from "@/types/campaign-setup";
import { SETUP_STEPS } from "@/types/campaign-setup";

const PROGRESS_STEPS: SetupStepId[] = [
  "general",
  "messaging",
  "reminders",
  "configuration",
];

export function hasFullSetupDraft(
  campaign: Campaign,
): campaign is Campaign & { setupDraft: CampaignSetupDraft } {
  return Boolean(campaign.setupDraft && typeof campaign.setupDraft === "object");
}

export function getCompletedSetupSteps(
  draft: CampaignSetupDraft,
): Set<SetupStepId> {
  const completed = new Set<SetupStepId>();

  for (const stepId of PROGRESS_STEPS) {
    if (validateSetupStep(stepId, draft).isValid) {
      completed.add(stepId);
    }
  }

  if (
    PROGRESS_STEPS.every((stepId) => completed.has(stepId)) &&
    validateSetupStep("review", draft).isValid
  ) {
    completed.add("review");
  }

  return completed;
}

export function isSetupDraftComplete(draft: CampaignSetupDraft): boolean {
  return PROGRESS_STEPS.every(
    (stepId) => validateSetupStep(stepId, draft).isValid,
  );
}

export function getFirstIncompleteSetupStep(
  draft: CampaignSetupDraft,
): SetupStepId {
  for (const stepId of PROGRESS_STEPS) {
    if (!validateSetupStep(stepId, draft).isValid) {
      return stepId;
    }
  }
  return "review";
}

export function getResumeLandingStep(
  draft: CampaignSetupDraft,
  preferredStep?: SetupStepId | null,
): SetupStepId {
  const completed = getCompletedSetupSteps(draft);
  const firstIncomplete = getFirstIncompleteSetupStep(draft);

  if (preferredStep && SETUP_STEPS.includes(preferredStep)) {
    const preferredIndex = SETUP_STEPS.indexOf(preferredStep);
    const incompleteIndex = SETUP_STEPS.indexOf(firstIncomplete);
    const isCompleteDraft = isSetupDraftComplete(draft);

    if (
      isCompleteDraft ||
      preferredStep === firstIncomplete ||
      completed.has(preferredStep) ||
      preferredIndex <= incompleteIndex
    ) {
      return preferredStep;
    }

    return firstIncomplete;
  }

  return isSetupDraftComplete(draft) ? "review" : firstIncomplete;
}

/**
 * Rebuild a setup draft from a campaign.
 * Full `setupDraft` wins; otherwise map known campaign fields onto defaults
 * (legacy thin drafts / recovery path).
 */
export function hydrateSetupDraftFromCampaign(
  campaign: Campaign,
): CampaignSetupDraft {
  if (hasFullSetupDraft(campaign)) {
    return {
      ...createDefaultSetupDraft(),
      ...campaign.setupDraft,
    };
  }

  const dealers =
    campaign.dealers && campaign.dealers.length > 0
      ? [...campaign.dealers]
      : campaign.dealer
        ? [campaign.dealer]
        : [];

  return {
    ...createDefaultSetupDraft(),
    campaignName: campaign.name,
    groupId: campaign.group,
    subfleets: dealers,
    timeZone: campaign.timeZone,
    messageTemplateId: campaign.messageTemplateId ?? null,
  };
}

export function isStepSelectable(
  stepId: SetupStepId,
  completedSteps: Set<SetupStepId>,
  currentStepId: SetupStepId,
): boolean {
  return stepId === currentStepId || completedSteps.has(stepId);
}
