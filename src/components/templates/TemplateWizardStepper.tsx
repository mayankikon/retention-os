import { Check } from "lucide-react";
import { TEMPLATE_WIZARD_STEP_META } from "@/data/template-wizard.defaults";
import type { TemplateWizardStepId } from "@/types/template";
import { cn } from "@/lib/utils";

interface TemplateWizardStepperProps {
  currentStepId: TemplateWizardStepId;
  completedSteps: Set<TemplateWizardStepId>;
}

export function TemplateWizardStepper({
  currentStepId,
  completedSteps,
}: TemplateWizardStepperProps) {
  const currentIndex = TEMPLATE_WIZARD_STEP_META.findIndex(
    (step) => step.id === currentStepId,
  );

  return (
    <nav aria-label="Template setup progress" className="w-full">
      <ol className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {TEMPLATE_WIZARD_STEP_META.map((step, index) => {
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
              <span className="min-w-0">
                <span className="block truncate">{step.label}</span>
                <span className="block truncate text-xs text-muted-foreground">
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
