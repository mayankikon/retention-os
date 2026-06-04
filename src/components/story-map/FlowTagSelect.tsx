"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FLOW_TAG_BADGE_CLASSES, FLOW_TAG_LABELS } from "@/lib/story-map/constants";
import { cn } from "@/lib/utils";
import {
  STORY_MAP_FLOW_TAGS,
  type StoryMapFlowTag,
} from "@/types/story-map";

interface FlowTagSelectProps {
  value: StoryMapFlowTag;
  onChange: (flow: StoryMapFlowTag) => void;
  /** Compact trigger for sidebar rows */
  size?: "sm" | "default";
  className?: string;
}

export function FlowTagSelect({
  value,
  onChange,
  size = "sm",
  className,
}: FlowTagSelectProps) {
  return (
    <Select value={value} onValueChange={(next) => onChange(next as StoryMapFlowTag)}>
      <SelectTrigger
        className={cn(
          "shrink-0 border font-medium",
          size === "sm" && "h-7 min-w-[4.5rem] max-w-[5.75rem] px-1.5 text-[10px]",
          FLOW_TAG_BADGE_CLASSES[value],
          className,
        )}
        aria-label="Flow tag"
        onClick={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STORY_MAP_FLOW_TAGS.map((flow) => (
          <SelectItem key={flow} value={flow} className="text-xs">
            <span className="flex items-center gap-2">
              <span
                className={cn(
                  "h-2.5 w-2.5 shrink-0 rounded-sm border",
                  FLOW_TAG_BADGE_CLASSES[flow],
                )}
                aria-hidden
              />
              {FLOW_TAG_LABELS[flow]}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
