"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getDependenciesForFeature } from "@/lib/story-map/dependencies";
import type { StoryMapDependency, StoryMapFeature } from "@/types/story-map";

interface DependencyLinkerProps {
  feature: StoryMapFeature | null;
  features: StoryMapFeature[];
  dependencies: StoryMapDependency[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddDependency: (dependentFeatureId: string, blockerFeatureId: string) => void;
  onRemoveDependency: (dependencyId: string) => void;
}

export function DependencyLinker({
  feature,
  features,
  dependencies,
  open,
  onOpenChange,
  onAddDependency,
  onRemoveDependency,
}: DependencyLinkerProps) {
  const scheduledOthers = features.filter(
    (item) =>
      item.startDate &&
      item.id !== feature?.id,
  );

  const featureDependencies = feature
    ? getDependenciesForFeature(dependencies, feature.id)
    : [];

  const blockerById = new Map(features.map((item) => [item.id, item]));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dependencies</DialogTitle>
          <DialogDescription>
            {feature
              ? `Link “${feature.title}” to features it depends on. Arrows run from blocker → dependent on the timeline.`
              : "Select a scheduled feature on the timeline."}
          </DialogDescription>
        </DialogHeader>

        {feature && !feature.startDate ? (
          <p className="text-sm text-muted-foreground">
            Schedule this feature on the timeline before adding dependencies.
          </p>
        ) : null}

        {feature?.startDate ? (
          <div className="space-y-4">
            <DependencyAddForm
              scheduledOthers={scheduledOthers}
              onAdd={(blockerFeatureId) =>
                onAddDependency(feature.id, blockerFeatureId)
              }
            />

            {featureDependencies.length > 0 ? (
              <ul className="space-y-2">
                {featureDependencies.map((dependency) => {
                  const blocker = blockerById.get(dependency.blockerFeatureId);
                  return (
                    <li
                      key={dependency.id}
                      className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2 text-sm"
                    >
                      <span>
                        Depends on{" "}
                        <span className="font-medium">
                          {blocker?.title ?? "Unknown"}
                        </span>
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveDependency(dependency.id)}
                      >
                        Remove
                      </Button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No dependencies yet. Pick a blocker feature above or use Link
                mode on the timeline.
              </p>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function DependencyAddForm({
  scheduledOthers,
  onAdd,
}: {
  scheduledOthers: StoryMapFeature[];
  onAdd: (blockerFeatureId: string) => void;
}) {
  if (scheduledOthers.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Schedule at least one other feature on the timeline to link a dependency.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
      <div className="flex-1 space-y-1">
        <label className="text-xs font-medium text-muted-foreground">
          Depends on (blocker)
        </label>
        <Select onValueChange={onAdd}>
          <SelectTrigger aria-label="Blocker feature">
            <SelectValue placeholder="Select feature area" />
          </SelectTrigger>
          <SelectContent>
            {scheduledOthers.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
