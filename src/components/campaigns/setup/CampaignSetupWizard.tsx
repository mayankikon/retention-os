"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { StepShellLayout } from "@/components/campaigns/setup/StepShellLayout";
import { ConfigurationStep } from "@/components/campaigns/setup/steps/ConfigurationStep";
import { GeneralStep } from "@/components/campaigns/setup/steps/GeneralStep";
import { MessagingStep } from "@/components/campaigns/setup/steps/MessagingStep";
import { RemindersStep } from "@/components/campaigns/setup/steps/RemindersStep";
import { ReviewStep } from "@/components/campaigns/setup/steps/ReviewStep";
import { Button } from "@/components/ui/button";
import { createDefaultSetupDraft } from "@/data/campaign-setup.defaults";
import { useCampaignSetupLeaveGuard } from "@/contexts/campaign-setup-leave-guard";
import { useProductVersion } from "@/contexts/product-version-context";
import { useCurrentUser } from "@/contexts/session-context";
import {
  addUserCreatedCampaign,
  setCampaignFlashMessage,
} from "@/lib/campaign-store";
import { createCampaignFromDraft } from "@/lib/create-campaign-from-draft";
import {
  validateAllStepsBeforeActivate,
  validateSetupStep,
} from "@/lib/campaign-setup-validation";
import { applyProductVersionToDraft } from "@/lib/product-version";
import type { CampaignSetupDraft, SetupStepId } from "@/types/campaign-setup";
import { SETUP_STEPS } from "@/types/campaign-setup";

const stepParser = parseAsStringLiteral(SETUP_STEPS).withDefault("general");

export function CampaignSetupWizard() {
  const router = useRouter();
  const currentUser = useCurrentUser();
  const { versionId } = useProductVersion();
  const { registerSetup, unregisterSetup, clearSetup, requestNavigation } =
    useCampaignSetupLeaveGuard();
  const [step, setStep] = useQueryState("step", stepParser);
  const [draft, setDraft] = useState<CampaignSetupDraft>(() => {
    const base = createDefaultSetupDraft();
    if (currentUser.dealership) {
      return { ...base, subfleets: [currentUser.dealership] };
    }
    return base;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [completedSteps, setCompletedSteps] = useState<Set<SetupStepId>>(
    () => new Set(),
  );
  const [isTestSent, setIsTestSent] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  const currentIndex = SETUP_STEPS.indexOf(step);
  const isFirstStep = currentIndex === 0;
  const isLastStep = step === "review";

  const updateDraft = useCallback((patch: Partial<CampaignSetupDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
    setErrors({});
  }, []);

  useEffect(() => {
    setDraft((prev) => {
      const patch = applyProductVersionToDraft(prev, versionId);
      if (Object.keys(patch).length === 0) return prev;
      return { ...prev, ...patch };
    });
  }, [versionId]);

  const goToStep = useCallback(
    (nextStep: SetupStepId) => {
      void setStep(nextStep);
      setErrors({});
    },
    [setStep],
  );

  const handleNext = () => {
    const result = validateSetupStep(step, draft);
    if (!result.isValid) {
      setErrors(result.errors);
      return;
    }

    setCompletedSteps((prev) => new Set(prev).add(step));

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
        requireTcpaCompliance: true,
      });
      if (!testResult.isValid) {
        setErrors(testResult.errors);
        return false;
      }
    } else {
      const complianceResult = validateSetupStep("review", draft, {
        requireTcpaCompliance: true,
      });
      if (!complianceResult.isValid) {
        setErrors(complianceResult.errors);
        return false;
      }
    }

    return true;
  }, [draft, isTestSent]);

  const finishAndReturnHome = useCallback(
    (
      kind: "activated" | "scheduled" | "draft",
      campaignName: string,
      detail?: string,
    ) => {
      clearSetup();
      setCampaignFlashMessage({ kind, campaignName, detail });
      router.push("/campaigns");
    },
    [router, clearSetup],
  );

  const handleActivateNow = useCallback(async () => {
    if (!validateLaunch()) return;

    setIsActivating(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    const campaign = createCampaignFromDraft(draft, currentUser, {
      status: "active",
    });
    addUserCreatedCampaign(campaign);
    setIsActivating(false);
    finishAndReturnHome("activated", campaign.name);
  }, [draft, currentUser, validateLaunch, finishAndReturnHome]);

  const handleSchedule = useCallback(
    async (activateOnDate: string) => {
      if (!validateLaunch()) return;
      if (!activateOnDate) {
        setErrors({ scheduledActivateAt: "Select an activation date." });
        return;
      }

      setIsActivating(true);
      await new Promise((resolve) => setTimeout(resolve, 800));

      const campaign = createCampaignFromDraft(draft, currentUser, {
        status: "scheduled",
        scheduledActivateAt: `${activateOnDate}T12:00:00.000Z`,
      });
      addUserCreatedCampaign(campaign);
      setIsActivating(false);
      finishAndReturnHome(
        "scheduled",
        campaign.name,
        `Activates ${new Date(`${activateOnDate}T12:00:00.000Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
      );
    },
    [draft, currentUser, validateLaunch, finishAndReturnHome],
  );

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

      const campaign = createCampaignFromDraft(draft, currentUser, {
        status: "draft",
      });
      addUserCreatedCampaign(campaign);
      finishAndReturnHome("draft", campaign.name);
      return true;
    },
    [draft, currentUser, finishAndReturnHome, goToStep],
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
      onSaveDraft: () => leaveSaveDraftRef.current(),
    });
    return () => unregisterSetup();
  }, [registerSetup, unregisterSetup]);

  const handleCancel = () => {
    requestNavigation("/campaigns");
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
            onSchedule={handleSchedule}
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
    handleSchedule,
    handleSaveDraftFromReview,
  ]);

  return (
    <StepShellLayout
      currentStepId={step}
      completedSteps={completedSteps}
      draft={draft}
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
