import { Check } from "lucide-react";
import { SETUP_STEP_META } from "@/data/campaign-setup.defaults";
import { isStepSelectable } from "@/lib/campaign-setup-resume";
import type { SetupStepId } from "@/types/campaign-setup";
import { cn } from "@/lib/utils";

interface StepperHeaderProps {
  currentStepId: SetupStepId;
  completedSteps: Set<SetupStepId>;
  onStepSelect?: (stepId: SetupStepId) => void;
}

export function StepperHeader({
  currentStepId,
  completedSteps,
  onStepSelect,
}: StepperHeaderProps) {
  const currentIndex = SETUP_STEP_META.findIndex((s) => s.id === currentStepId);
  const canNavigate = typeof onStepSelect === "function";

  return (
    <nav aria-label="Campaign setup progress" className="w-full">
      <ol className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {SETUP_STEP_META.map((step, index) => {
          const isComplete = completedSteps.has(step.id);
          const isCurrent = step.id === currentStepId;
          const isPast = index < currentIndex;
          const isSelectable =
            canNavigate &&
            isStepSelectable(step.id, completedSteps, currentStepId);

          const content = (
            <>
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                  isComplete || isPast
                    ? "border-brand-primary bg-brand-primary text-white"
                    : isCurrent
                      ? "border-brand-primary text-brand-primary"
                      : "border-border text-muted-foreground",
                )}
                aria-hidden
              >
                {isComplete || isPast ? (
                  <Check className="h-4 w-4" />
                ) : (
                  index + 1
                )}
              </span>
              <span className="hidden min-w-0 lg:block">
                <span className="block truncate">{step.label}</span>
                <span className="block truncate text-xs font-normal text-muted-foreground">
                  {step.description}
                </span>
              </span>
            </>
          );

          return (
            <li key={step.id} className="flex flex-1">
              {canNavigate ? (
                <button
                  type="button"
                  aria-current={isCurrent ? "step" : undefined}
                  aria-disabled={!isSelectable}
                  disabled={!isSelectable}
                  onClick={() => {
                    if (!isSelectable) return;
                    onStepSelect(step.id);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md border border-border bg-card p-2 text-left text-sm",
                    isCurrent &&
                      "border-brand-primary bg-brand-primary/5 font-medium",
                    !isCurrent &&
                      !isComplete &&
                      !isPast &&
                      "text-muted-foreground",
                    isSelectable
                      ? "cursor-pointer hover:border-brand-primary/60"
                      : "cursor-not-allowed opacity-70",
                  )}
                >
                  {content}
                </button>
              ) : (
                <div
                  aria-current={isCurrent ? "step" : undefined}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md border border-border bg-card p-2 text-sm",
                    isCurrent &&
                      "border-brand-primary bg-brand-primary/5 font-medium",
                    !isCurrent &&
                      !isComplete &&
                      !isPast &&
                      "text-muted-foreground",
                  )}
                >
                  {content}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
