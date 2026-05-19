import { Check } from "lucide-react";
import { SETUP_STEP_META } from "@/data/campaign-setup.defaults";
import type { SetupStepId } from "@/types/campaign-setup";
import { cn } from "@/lib/utils";

interface StepperHeaderProps {
  currentStepId: SetupStepId;
  completedSteps: Set<SetupStepId>;
}

export function StepperHeader({
  currentStepId,
  completedSteps,
}: StepperHeaderProps) {
  const currentIndex = SETUP_STEP_META.findIndex((s) => s.id === currentStepId);

  return (
    <nav aria-label="Campaign setup progress" className="w-full">
      <ol className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {SETUP_STEP_META.map((step, index) => {
          const isComplete = completedSteps.has(step.id);
          const isCurrent = step.id === currentStepId;
          const isPast = index < currentIndex;

          return (
            <li
              key={step.id}
              className={cn(
                "flex flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-sm",
                isCurrent && "bg-muted font-medium",
                !isCurrent && !isComplete && !isPast && "text-muted-foreground",
              )}
            >
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
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
