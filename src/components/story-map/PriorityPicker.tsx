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
  PRIORITY_SWATCH_CLASSES,
  PRIORITY_TIER_LABELS,
} from "@/lib/story-map/constants";
import { cn } from "@/lib/utils";
import type { StoryMapFeature, StoryMapPriorityTier } from "@/types/story-map";
import { STORY_MAP_PRIORITY_TIERS } from "@/types/story-map";

interface PriorityPickerProps {
  feature: StoryMapFeature | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectPriority: (priority: StoryMapPriorityTier) => void;
}

export function PriorityPicker({
  feature,
  open,
  onOpenChange,
  onSelectPriority,
}: PriorityPickerProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Priority</DialogTitle>
          <DialogDescription>
            {feature
              ? `Set priority for “${feature.title}”.`
              : "Select a feature on the timeline."}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          {STORY_MAP_PRIORITY_TIERS.map((tier) => (
            <Button
              key={tier}
              type="button"
              variant={feature?.priority === tier ? "default" : "outline"}
              className="justify-start gap-3"
              onClick={() => {
                onSelectPriority(tier);
                onOpenChange(false);
              }}
            >
              <span
                className={cn(
                  "h-4 w-4 shrink-0 rounded-sm border border-border",
                  PRIORITY_SWATCH_CLASSES[tier],
                )}
                aria-hidden
              />
              {PRIORITY_TIER_LABELS[tier]}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
