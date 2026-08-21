"use client";

import {
  Button,
} from "@ikontechnologies-arlington/nxtg-design-shiftpackage/primitives";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { StepShellLayout } from "@/components/campaigns/setup/StepShellLayout";
import { ConfigurationStep } from "@/components/campaigns/setup/steps/ConfigurationStep";
import { GeneralStep } from "@/components/campaigns/setup/steps/GeneralStep";
import { MessagingStep } from "@/components/campaigns/setup/steps/MessagingStep";
import { RemindersStep } from "@/components/campaigns/setup/steps/RemindersStep";
import { ReviewStep } from "@/components/campaigns/setup/steps/ReviewStep";
import { createDefaultSetupDraft } from "@/data/campaign-setup.defaults";
import {
  getDealerGroup,
  getPrimaryTimeZoneFromDealerships,
} from "@/data/lookups";
import { useCampaignSetupLeaveGuard } from "@/contexts/campaign-setup-leave-guard";
import { useProductVersion } from "@/contexts/product-version-context";
import { useCurrentUser } from "@/contexts/session-context";
import {
  addUserCreatedCampaign,
  setCampaignFlashMessage,
  upsertUserCreatedCampaign,
} from "@/lib/campaign-store";
import {
  createCampaignFromDraft,
  updateCampaignFromDraft,
} from "@/lib/create-campaign-from-draft";
import {
  getCompletedSetupSteps,
  isStepSelectable,
} from "@/lib/campaign-setup-resume";
import {
  validateAllStepsBeforeActivate,
  validateSetupStep,
} from "@/lib/campaign-setup-validation";
import { applyProductVersionToDraft } from "@/lib/product-version";
import { findCampaignById } from "@/lib/campaign-lookup";
import type { CampaignSetupDraft, SetupStepId } from "@/types/campaign-setup";
import { SETUP_STEPS } from "@/types/campaign-setup";

const stepParser = parseAsStringLiteral(SETUP_STEPS).withDefault("general");

function createInitialSetupDraft(dealership: string | null): CampaignSetupDraft {
  const base = createDefaultSetupDraft();
  if (!dealership) return base;

  const groupId = getDealerGroup(dealership);
  const subfleets = [dealership];

  return {
    ...base,
    groupId,
    subfleets,
    timezoneOverrides: {},
    timeZone: getPrimaryTimeZoneFromDealerships(subfleets, {}),
  };
}

export interface CampaignSetupWizardProps {
  mode?: "create" | "edit";
  campaignId?: string;
  initialDraft?: CampaignSetupDraft;
  initialStep?: SetupStepId;
}

export function CampaignSetupWizard({
  mode = "create",
  campaignId,
  initialDraft,
  initialStep,
}: CampaignSetupWizardProps = {}) {
  const router = useRouter();
  const currentUser = useCurrentUser();
  const { versionId } = useProductVersion();
  const { registerSetup, unregisterSetup, clearSetup, requestNavigation } =
    useCampaignSetupLeaveGuard();
  const isEditMode = mode === "edit" && Boolean(campaignId);

  const [step, setStep] = useQueryState("step", stepParser);
  const [draft, setDraft] = useState<CampaignSetupDraft>(() =>
    initialDraft ?? createInitialSetupDraft(currentUser.dealership),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [completedSteps, setCompletedSteps] = useState<Set<SetupStepId>>(() =>
    getCompletedSetupSteps(
      initialDraft ?? createInitialSetupDraft(currentUser.dealership),
    ),
  );
  const [isTestSent, setIsTestSent] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const hasAppliedInitialStep = useRef(false);

  const currentIndex = SETUP_STEPS.indexOf(step);
  const isFirstStep = currentIndex === 0;
  const isLastStep = step === "review";
  const cancelHref = isEditMode ? `/campaigns/${campaignId}` : "/campaigns";

  const updateDraft = useCallback((patch: Partial<CampaignSetupDraft>) => {
    setDraft((prev) => {
      const next = { ...prev, ...patch };
      setCompletedSteps(getCompletedSetupSteps(next));
      return next;
    });
    setErrors({});
  }, []);

  useEffect(() => {
    setDraft((prev) => {
      const patch = applyProductVersionToDraft(prev, versionId);
      if (Object.keys(patch).length === 0) return prev;
      const next = { ...prev, ...patch };
      setCompletedSteps(getCompletedSetupSteps(next));
      return next;
    });
  }, [versionId]);

  useEffect(() => {
    if (hasAppliedInitialStep.current) return;
    if (!initialStep) return;
    hasAppliedInitialStep.current = true;
    void setStep(initialStep);
  }, [initialStep, setStep]);

  const goToStep = useCallback(
    (nextStep: SetupStepId) => {
      void setStep(nextStep);
      setErrors({});
    },
    [setStep],
  );

  const handleStepSelect = useCallback(
    (nextStep: SetupStepId) => {
      if (!isStepSelectable(nextStep, completedSteps, step)) return;
      goToStep(nextStep);
    },
    [completedSteps, step, goToStep],
  );

  const handleNext = () => {
    const result = validateSetupStep(step, draft);
    if (!result.isValid) {
      setErrors(result.errors);
      return;
    }

    const nextCompleted = new Set(getCompletedSetupSteps(draft)).add(step);
    setCompletedSteps(nextCompleted);

    if (isLastStep) return;

    const nextStep = SETUP_STEPS[currentIndex + 1];
    goToStep(nextStep);
  };

  const handleBack = () => {
    if (isFirstStep) return;
    goToStep(SETUP_STEPS[currentIndex - 1]);
  };

  const handleTestSend = useCallback(() => {
    const result = validateSetupStep("review", draft, {
      requireTestSend: true,
    });
    if (!result.isValid) {
      setErrors(result.errors);
      return;
    }
    setIsTestSent(true);
    setErrors({});
  }, [draft]);

  const validateLaunch = useCallback(() => {
    const preflight = validateAllStepsBeforeActivate(draft);
    if (!preflight.isValid) {
      setErrors(preflight.errors);
      return false;
    }

    if (!isTestSent) {
      const testResult = validateSetupStep("review", draft, {
        requireTestSend: true,
      });
      if (!testResult.isValid) {
        setErrors(testResult.errors);
        return false;
      }
    }

    return true;
  }, [draft, isTestSent]);

  const finishCreateAndReturnHome = useCallback(
    (
      kind: "activated" | "draft",
      campaignName: string,
      detail?: string,
    ) => {
      clearSetup();
      setCampaignFlashMessage({ kind, campaignName, detail });
      router.push("/campaigns");
    },
    [router, clearSetup],
  );

  const finishEditSaveToDetail = useCallback(
    (campaignName: string) => {
      clearSetup();
      setCampaignFlashMessage({ kind: "draft", campaignName });
      router.push(`/campaigns/${campaignId}`);
    },
    [router, clearSetup, campaignId],
  );

  const finishEditLaunch = useCallback(
    (campaignName: string) => {
      clearSetup();
      setCampaignFlashMessage({ kind: "activated", campaignName });
      router.push("/campaigns");
    },
    [router, clearSetup],
  );

  const persistEditCampaign = useCallback(
    (options: {
      status: "draft" | "active";
      scheduledActivateAt?: string | null;
    }) => {
      if (!campaignId) return null;
      const existing = findCampaignById(campaignId);
      if (!existing) return null;

      const campaign = updateCampaignFromDraft(existing, draft, {
        status: options.status,
        scheduledActivateAt: options.scheduledActivateAt,
      });
      upsertUserCreatedCampaign(campaign);
      return campaign;
    },
    [campaignId, draft],
  );

  const handleActivateNow = useCallback(async () => {
    if (!validateLaunch()) return;

    setIsActivating(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (isEditMode) {
      const campaign = persistEditCampaign({ status: "active" });
      setIsActivating(false);
      if (!campaign) return;
      finishEditLaunch(campaign.name);
      return;
    }

    const campaign = createCampaignFromDraft(draft, currentUser, {
      status: "active",
    });
    addUserCreatedCampaign(campaign);
    setIsActivating(false);
    finishCreateAndReturnHome("activated", campaign.name);
  }, [
    draft,
    currentUser,
    validateLaunch,
    finishCreateAndReturnHome,
    finishEditLaunch,
    isEditMode,
    persistEditCampaign,
  ]);

  const persistDraft = useCallback(
    (options?: { requireName?: boolean }) => {
      const requireName = options?.requireName ?? true;
      if (requireName && !draft.campaignName.trim()) {
        setErrors({
          campaignName: "Enter a campaign name before saving a draft.",
        });
        goToStep("general");
        return false;
      }

      if (isEditMode) {
        const campaign = persistEditCampaign({ status: "draft" });
        if (!campaign) return false;
        finishEditSaveToDetail(campaign.name);
        return true;
      }

      const campaign = createCampaignFromDraft(draft, currentUser, {
        status: "draft",
      });
      addUserCreatedCampaign(campaign);
      finishCreateAndReturnHome("draft", campaign.name);
      return true;
    },
    [
      draft,
      currentUser,
      finishCreateAndReturnHome,
      finishEditSaveToDetail,
      goToStep,
      isEditMode,
      persistEditCampaign,
    ],
  );

  const handleSaveDraftFromReview = useCallback(() => {
    persistDraft({ requireName: true });
  }, [persistDraft]);

  const leaveSaveDraftRef = useRef(() => {
    persistDraft({ requireName: false });
  });
  leaveSaveDraftRef.current = () => {
    persistDraft({ requireName: false });
  };

  useEffect(() => {
    registerSetup({
      mode: isEditMode ? "edit" : "create",
      onSaveDraft: () => leaveSaveDraftRef.current(),
    });
    return () => unregisterSetup();
  }, [isEditMode, registerSetup, unregisterSetup]);

  const handleCancel = () => {
    requestNavigation(cancelHref);
  };

  const stepContent = useMemo(() => {
    switch (step) {
      case "general":
        return (
          <GeneralStep draft={draft} errors={errors} onChange={updateDraft} />
        );
      case "messaging":
        return (
          <MessagingStep draft={draft} errors={errors} onChange={updateDraft} />
        );
      case "reminders":
        return (
          <RemindersStep draft={draft} errors={errors} onChange={updateDraft} />
        );
      case "configuration":
        return (
          <ConfigurationStep
            draft={draft}
            errors={errors}
            onChange={updateDraft}
          />
        );
      case "review":
        return (
          <ReviewStep
            draft={draft}
            errors={errors}
            onChange={updateDraft}
            onTestSend={handleTestSend}
            onActivateNow={handleActivateNow}
            onSaveDraft={handleSaveDraftFromReview}
            isTestSent={isTestSent}
            isActivating={isActivating}
          />
        );
      default:
        return null;
    }
  }, [
    step,
    draft,
    errors,
    updateDraft,
    isTestSent,
    isActivating,
    handleTestSend,
    handleActivateNow,
    handleSaveDraftFromReview,
  ]);

  return (
    <StepShellLayout
      currentStepId={step}
      completedSteps={completedSteps}
      draft={draft}
      mode={isEditMode ? "edit" : "create"}
      campaignName={draft.campaignName || undefined}
      cancelHref={cancelHref}
      onStepSelect={isEditMode ? handleStepSelect : undefined}
    >
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex-1 p-6">{stepContent}</div>

        <div className="mt-auto flex flex-col-reverse gap-3 border-t border-border px-6 py-6 sm:flex-row sm:justify-between">
          <Button type="button" variant="ghost" onClick={handleCancel}>
            Cancel
          </Button>
          <div className="flex gap-2">
            {!isFirstStep ? (
              <Button type="button" variant="outline" onClick={handleBack}>
                Back
              </Button>
            ) : null}
            {!isLastStep ? (
              <Button type="button" onClick={handleNext}>
                Continue
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </StepShellLayout>
  );
}
