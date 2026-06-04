"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { ConfirmationView } from "@/components/campaigns/setup/ConfirmationView";
import { StepShellLayout } from "@/components/campaigns/setup/StepShellLayout";
import { ConfigurationStep } from "@/components/campaigns/setup/steps/ConfigurationStep";
import { GeneralStep } from "@/components/campaigns/setup/steps/GeneralStep";
import { MessagingStep } from "@/components/campaigns/setup/steps/MessagingStep";
import { RemindersStep } from "@/components/campaigns/setup/steps/RemindersStep";
import { ReviewStep } from "@/components/campaigns/setup/steps/ReviewStep";
import { Button } from "@/components/ui/button";
import { createDefaultSetupDraft } from "@/data/campaign-setup.defaults";
import { useCurrentUser } from "@/contexts/session-context";
import { addUserCreatedCampaign } from "@/lib/campaign-store";
import { createCampaignFromDraft } from "@/lib/create-campaign-from-draft";
import {
  validateAllStepsBeforeActivate,
  validateSetupStep,
} from "@/lib/campaign-setup-validation";
import type { CampaignSetupDraft, SetupStepId } from "@/types/campaign-setup";
import { SETUP_STEPS } from "@/types/campaign-setup";

const stepParser = parseAsStringLiteral(SETUP_STEPS).withDefault("general");

export function CampaignSetupWizard() {
  const currentUser = useCurrentUser();
  const [step, setStep] = useQueryState("step", stepParser);
  const [draft, setDraft] = useState<CampaignSetupDraft>(createDefaultSetupDraft);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [completedSteps, setCompletedSteps] = useState<Set<SetupStepId>>(
    () => new Set(),
  );
  const [isTestSent, setIsTestSent] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [isActivated, setIsActivated] = useState(false);
  const [activatedName, setActivatedName] = useState("");

  const currentIndex = SETUP_STEPS.indexOf(step);
  const isFirstStep = currentIndex === 0;
  const isLastStep = step === "review";

  const updateDraft = useCallback((patch: Partial<CampaignSetupDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
    setErrors({});
  }, []);

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

  const handleActivate = useCallback(async () => {
    const preflight = validateAllStepsBeforeActivate(draft);
    if (!preflight.isValid) {
      setErrors(preflight.errors);
      return;
    }

    if (!isTestSent) {
      const testResult = validateSetupStep("review", draft, {
        requireTestSend: true,
        requireTcpaCompliance: true,
      });
      if (!testResult.isValid) {
        setErrors(testResult.errors);
        return;
      }
    } else {
      const complianceResult = validateSetupStep("review", draft, {
        requireTcpaCompliance: true,
      });
      if (!complianceResult.isValid) {
        setErrors(complianceResult.errors);
        return;
      }
    }

    setIsActivating(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const campaign = createCampaignFromDraft(draft, currentUser);
    addUserCreatedCampaign(campaign);

    setActivatedName(draft.campaignName);
    setIsActivated(true);
    setIsActivating(false);
  }, [draft, isTestSent, currentUser]);

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
            onActivate={handleActivate}
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
    handleActivate,
  ]);

  if (isActivated) {
    return <ConfirmationView campaignName={activatedName} />;
  }

  return (
    <StepShellLayout
      currentStepId={step}
      completedSteps={completedSteps}
      draft={draft}
    >
      {stepContent}

      <div className="mt-8 flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-between">
        <Button variant="ghost" asChild>
          <Link href="/campaigns">Cancel</Link>
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
    </StepShellLayout>
  );
}
