"use client";

import { useState } from "react";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  LANE_GUTTER_WIDTH_PX,
  LANE_HEIGHT_PX,
  MIN_LANE_COUNT,
  TIMELINE_HEADER_HEIGHT_PX,
} from "@/lib/story-map/constants";
import { getFeatureOnLane } from "@/lib/story-map/lanes";
import { cn } from "@/lib/utils";
import type { StoryMapFeature } from "@/types/story-map";

export const STORY_MAP_LANE_DRAG_TYPE = "application/x-story-map-lane-index";

interface TimelineLaneGutterProps {
  features: StoryMapFeature[];
  laneCount: number;
  onReorderLanes: (fromIndex: number, toIndex: number) => void;
  onClearLane: (laneIndex: number) => void;
  onRemoveLane: (laneIndex: number) => void;
  onAddLane: () => void;
}

export function TimelineLaneGutter({
  features,
  laneCount,
  onReorderLanes,
  onClearLane,
  onRemoveLane,
  onAddLane,
}: TimelineLaneGutterProps) {
  const [dragOverLaneIndex, setDragOverLaneIndex] = useState<number | null>(null);
  const lanesHeightPx = laneCount * LANE_HEIGHT_PX;

  const handleLaneDragStart = (
    event: React.DragEvent,
    laneIndex: number,
  ) => {
    event.dataTransfer.setData(STORY_MAP_LANE_DRAG_TYPE, String(laneIndex));
    event.dataTransfer.effectAllowed = "move";
  };

  const handleLaneDragOver = (
    event: React.DragEvent,
    laneIndex: number,
  ) => {
    if (!event.dataTransfer.types.includes(STORY_MAP_LANE_DRAG_TYPE)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDragOverLaneIndex(laneIndex);
  };

  const handleLaneDrop = (event: React.DragEvent, toIndex: number) => {
    event.preventDefault();
    const fromRaw = event.dataTransfer.getData(STORY_MAP_LANE_DRAG_TYPE);
    const fromIndex = Number.parseInt(fromRaw, 10);
    setDragOverLaneIndex(null);
    if (Number.isNaN(fromIndex)) return;
    onReorderLanes(fromIndex, toIndex);
  };

  return (
    <div
      className="flex shrink-0 flex-col border-r border-border bg-card"
      style={{ width: LANE_GUTTER_WIDTH_PX }}
    >
      <div
        className="flex shrink-0 items-end justify-center border-b border-border px-1 pb-2"
        style={{ height: TIMELINE_HEADER_HEIGHT_PX }}
      >
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 w-7 p-0"
          aria-label="Add timeline row"
          title="Add row"
          onClick={onAddLane}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="relative" style={{ height: lanesHeightPx }}>
        {Array.from({ length: laneCount }, (_, laneIndex) => {
          const featureOnLane = getFeatureOnLane(features, laneIndex);
          const isEmpty = !featureOnLane;

          return (
            <div
              key={`lane-gutter-${laneIndex}`}
              className={cn(
                "absolute right-0 left-0 flex items-center justify-center gap-0.5 border-b border-border/40 px-0.5",
                dragOverLaneIndex === laneIndex && "bg-brand-primary/10",
              )}
              style={{
                top: laneIndex * LANE_HEIGHT_PX,
                height: LANE_HEIGHT_PX,
              }}
              onDragOver={(event) => handleLaneDragOver(event, laneIndex)}
              onDragLeave={() => setDragOverLaneIndex(null)}
              onDrop={(event) => handleLaneDrop(event, laneIndex)}
            >
              <button
                type="button"
                draggable
                className="flex h-7 w-5 cursor-grab items-center justify-center rounded text-muted-foreground hover:bg-muted active:cursor-grabbing"
                aria-label={`Reorder row ${laneIndex + 1}`}
                onDragStart={(event) => handleLaneDragStart(event, laneIndex)}
              >
                <GripVertical className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                className="flex h-7 w-5 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-destructive"
                aria-label={
                  isEmpty
                    ? `Remove empty row ${laneIndex + 1}`
                    : `Remove ${featureOnLane.title} from timeline`
                }
                onClick={() => {
                  if (isEmpty && laneCount > MIN_LANE_COUNT) {
                    onRemoveLane(laneIndex);
                  } else {
                    onClearLane(laneIndex);
                  }
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
