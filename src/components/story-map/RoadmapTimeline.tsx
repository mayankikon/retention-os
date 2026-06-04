"use client";

import { useCallback, useMemo, useRef } from "react";
import { TimelineBar } from "@/components/story-map/TimelineBar";
import { TimelineDependencyOverlay } from "@/components/story-map/TimelineDependencyOverlay";
import { TimelineLaneGutter } from "@/components/story-map/TimelineLaneGutter";
import { STORY_MAP_DRAG_TYPE } from "@/components/story-map/FeatureSidebar";
import {
  LANE_HEIGHT_PX,
  TIMELINE_HEADER_HEIGHT_PX,
  TOTAL_TIMELINE_DAYS,
} from "@/lib/story-map/constants";
import {
  buildMonthSegments,
  dayIndexToLeftPercent,
  durationToWidthPercent,
  getDateFromDayIndex,
  snapDayIndexFromContainer,
} from "@/lib/story-map/timeline-math";
import type { StoryMapDependency, StoryMapFeature } from "@/types/story-map";
import type { UseStoryMapStateReturn } from "@/hooks/use-story-map-state";

interface RoadmapTimelineProps {
  features: StoryMapFeature[];
  dependencies: StoryMapDependency[];
  laneCount: number;
  selectedFeatureId: string | null;
  isDependencyLinkMode: boolean;
  dependencyLinkDependentId: string | null;
  onSelectFeature: (id: string) => void;
  onOpenPriority: (id: string) => void;
  onDependencyLinkClick: (featureId: string) => void;
  scheduleFeature: UseStoryMapStateReturn["scheduleFeature"];
  moveFeatureStart: UseStoryMapStateReturn["moveFeatureStart"];
  setDuration: UseStoryMapStateReturn["setDuration"];
  resizeFeatureFromStart: UseStoryMapStateReturn["resizeFeatureFromStart"];
  setLane: UseStoryMapStateReturn["setLane"];
  reorderLanes: UseStoryMapStateReturn["reorderLanes"];
  clearLane: UseStoryMapStateReturn["clearLane"];
  removeLane: UseStoryMapStateReturn["removeLane"];
  addLane: UseStoryMapStateReturn["addLane"];
}

export function RoadmapTimeline({
  features,
  dependencies,
  laneCount,
  selectedFeatureId,
  isDependencyLinkMode,
  dependencyLinkDependentId,
  onSelectFeature,
  onOpenPriority,
  onDependencyLinkClick,
  scheduleFeature,
  moveFeatureStart,
  setDuration,
  resizeFeatureFromStart,
  setLane,
  reorderLanes,
  clearLane,
  removeLane,
  addLane,
}: RoadmapTimelineProps) {
  const gridOriginRef = useRef<HTMLDivElement>(null);

  const monthSegments = useMemo(() => buildMonthSegments(), []);

  const scheduledFeatures = features.filter((feature) => feature.startDate);
  const lanesHeightPx = laneCount * LANE_HEIGHT_PX;

  const weekLineBackground = useMemo(() => {
    const weekPercent = (7 / TOTAL_TIMELINE_DAYS) * 100;
    return `repeating-linear-gradient(
      to right,
      transparent,
      transparent calc(${weekPercent}% - 1px),
      color-mix(in srgb, var(--border) 55%, transparent) calc(${weekPercent}% - 1px),
      color-mix(in srgb, var(--border) 55%, transparent) ${weekPercent}%
    )`;
  }, []);

  const getDropCoordinates = useCallback(
    (clientX: number, clientY: number) => {
      const originEl = gridOriginRef.current;
      if (!originEl) {
        return { startDate: getDateFromDayIndex(0), laneIndex: 0 };
      }

      const originRect = originEl.getBoundingClientRect();
      const dayIndex = snapDayIndexFromContainer(
        clientX,
        originRect.left,
        originRect.width,
      );
      const relativeY = clientY - originRect.top;
      const laneIndex = Math.max(
        0,
        Math.min(laneCount - 1, Math.floor(relativeY / LANE_HEIGHT_PX)),
      );

      return {
        startDate: getDateFromDayIndex(dayIndex),
        laneIndex,
      };
    },
    [laneCount],
  );

  const handleDragOver = (event: React.DragEvent) => {
    if (!event.dataTransfer.types.includes(STORY_MAP_DRAG_TYPE)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const featureId = event.dataTransfer.getData(STORY_MAP_DRAG_TYPE);
    if (!featureId) return;

    const { startDate, laneIndex } = getDropCoordinates(
      event.clientX,
      event.clientY,
    );
    scheduleFeature(featureId, startDate, laneIndex);
    onSelectFeature(featureId);
  };

  return (
    <div className="flex min-w-0 flex-1 overflow-hidden">
      <TimelineLaneGutter
        features={features}
        laneCount={laneCount}
        onReorderLanes={reorderLanes}
        onClearLane={clearLane}
        onRemoveLane={removeLane}
        onAddLane={addLane}
      />

      <div
        className="flex min-w-0 flex-1 flex-col overflow-y-auto"
        aria-label="Story map timeline, June 2026 through June 2027"
      >
        <div
          className="sticky top-0 z-30 shrink-0 border-b border-border bg-card"
          style={{ height: TIMELINE_HEADER_HEIGHT_PX }}
        >
          <div className="relative h-full w-full">
            {monthSegments.map((segment) => (
              <div
                key={`${segment.label}-${segment.startDayIndex}`}
                className="absolute top-0 flex h-full flex-col justify-center overflow-hidden border-r border-border px-1 sm:px-2"
                style={{
                  left: dayIndexToLeftPercent(segment.startDayIndex),
                  width: durationToWidthPercent(segment.dayCount),
                }}
              >
                <span className="truncate text-[10px] font-semibold sm:text-xs">
                  {segment.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div
          ref={gridOriginRef}
          className="relative w-full"
          style={{ height: lanesHeightPx }}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{ backgroundImage: weekLineBackground }}
            aria-hidden
          />

          {monthSegments.map((segment) => (
            <div
              key={`grid-${segment.label}-${segment.startDayIndex}`}
              className="pointer-events-none absolute top-0 bottom-0 border-r border-border"
              style={{
                left: dayIndexToLeftPercent(segment.startDayIndex),
              }}
              aria-hidden
            />
          ))}

          {Array.from({ length: laneCount }, (_, laneIndex) => (
            <div
              key={`lane-${laneIndex}`}
              className="pointer-events-none absolute right-0 left-0 border-b border-border/40"
              style={{
                top: laneIndex * LANE_HEIGHT_PX,
                height: LANE_HEIGHT_PX,
              }}
              aria-hidden
            />
          ))}

          <TimelineDependencyOverlay
            gridOriginRef={gridOriginRef}
            features={features}
            dependencies={dependencies}
          />

          {scheduledFeatures.length === 0 ? (
            <p className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
              Drag a feature from the backlog onto the timeline.
            </p>
          ) : null}

          {scheduledFeatures.map((feature) => (
            <TimelineBar
              key={feature.id}
              feature={feature}
              isSelected={selectedFeatureId === feature.id}
              laneCount={laneCount}
              gridOriginRef={gridOriginRef}
              onSelect={onSelectFeature}
              onOpenPriority={onOpenPriority}
              onMoveStart={moveFeatureStart}
              onResizeFromStart={resizeFeatureFromStart}
              onSetDuration={setDuration}
              onSetLane={setLane}
              isDependencyLinkMode={isDependencyLinkMode}
              dependencyLinkDependentId={dependencyLinkDependentId}
              onDependencyLinkClick={onDependencyLinkClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
