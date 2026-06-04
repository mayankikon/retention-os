"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  FLOW_TAG_BADGE_CLASSES,
  FLOW_TAG_SHORT_LABELS,
  LANE_HEIGHT_PX,
  PRIORITY_BAR_CLASSES,
} from "@/lib/story-map/constants";
import {
  clampDayIndex,
  durationToWidthPercent,
  getDateFromDayIndex,
  getTimelineDayIndex,
  snapDayIndexFromContainer,
  startDateToLeftPercent,
} from "@/lib/story-map/timeline-math";
import { cn } from "@/lib/utils";
import type { StoryMapFeature } from "@/types/story-map";

type DragMode = "move" | "resize-start" | "resize-end";

interface TimelineBarProps {
  feature: StoryMapFeature;
  isSelected: boolean;
  laneCount: number;
  gridOriginRef: React.RefObject<HTMLDivElement | null>;
  onSelect: (id: string) => void;
  onOpenPriority: (id: string) => void;
  onMoveStart: (id: string, startDate: string) => void;
  onResizeFromStart: (
    id: string,
    startDate: string,
    durationDays: number,
  ) => void;
  onSetDuration: (id: string, durationDays: number) => void;
  onSetLane: (id: string, laneIndex: number) => void;
  isDependencyLinkMode?: boolean;
  dependencyLinkDependentId?: string | null;
  onDependencyLinkClick?: (featureId: string) => void;
}

interface DragState {
  mode: DragMode;
  pointerId: number;
  startClientX: number;
  pointerStartDayIndex: number;
  initialStartIndex: number;
  initialDuration: number;
  initialLaneIndex: number;
  didDrag: boolean;
}

export function TimelineBar({
  feature,
  isSelected,
  laneCount,
  gridOriginRef,
  onSelect,
  onOpenPriority,
  onMoveStart,
  onResizeFromStart,
  onSetDuration,
  onSetLane,
  isDependencyLinkMode = false,
  dependencyLinkDependentId = null,
  onDependencyLinkClick,
}: TimelineBarProps) {
  const dragStateRef = useRef<DragState | null>(null);
  const onMoveStartRef = useRef(onMoveStart);
  const onResizeFromStartRef = useRef(onResizeFromStart);
  const onSetDurationRef = useRef(onSetDuration);
  const onSetLaneRef = useRef(onSetLane);
  const onSelectRef = useRef(onSelect);
  const onOpenPriorityRef = useRef(onOpenPriority);
  const onDependencyLinkClickRef = useRef(onDependencyLinkClick);
  const isDependencyLinkModeRef = useRef(isDependencyLinkMode);
  const featureRef = useRef(feature);
  const laneCountRef = useRef(laneCount);

  useEffect(() => {
    onMoveStartRef.current = onMoveStart;
    onResizeFromStartRef.current = onResizeFromStart;
    onSetDurationRef.current = onSetDuration;
    onSetLaneRef.current = onSetLane;
    onSelectRef.current = onSelect;
    onOpenPriorityRef.current = onOpenPriority;
    onDependencyLinkClickRef.current = onDependencyLinkClick;
    isDependencyLinkModeRef.current = isDependencyLinkMode;
    featureRef.current = feature;
    laneCountRef.current = laneCount;
  });

  const getDayIndexFromClientX = useCallback((clientX: number) => {
    const originEl = gridOriginRef.current;
    const startDate = featureRef.current.startDate;
    if (!originEl) {
      return startDate ? getTimelineDayIndex(startDate) : 0;
    }

    const originRect = originEl.getBoundingClientRect();
    return snapDayIndexFromContainer(
      clientX,
      originRect.left,
      originRect.width,
    );
  }, [gridOriginRef]);

  const endDragRef = useRef(() => {
    const state = dragStateRef.current;
    dragStateRef.current = null;

    if (state && !state.didDrag) {
      onSelectRef.current(featureRef.current.id);
      if (
        isDependencyLinkModeRef.current &&
        onDependencyLinkClickRef.current
      ) {
        onDependencyLinkClickRef.current(featureRef.current.id);
      } else {
        onOpenPriorityRef.current(featureRef.current.id);
      }
    }
  });

  const handlePointerMoveRef = useRef((event: PointerEvent) => {
    const state = dragStateRef.current;
    if (!state || event.pointerId !== state.pointerId) return;

    if (Math.abs(event.clientX - state.startClientX) > 3) {
      state.didDrag = true;
    }

    const originEl = gridOriginRef.current;
    const startDate = featureRef.current.startDate;
    let dayIndex = state.initialStartIndex;

    if (originEl) {
      const originRect = originEl.getBoundingClientRect();
      dayIndex = snapDayIndexFromContainer(
        event.clientX,
        originRect.left,
        originRect.width,
      );
    } else if (startDate) {
      dayIndex = getTimelineDayIndex(startDate);
    }

    const featureId = featureRef.current.id;

    if (state.mode === "move") {
      const delta = dayIndex - state.pointerStartDayIndex;
      const nextIndex = clampDayIndex(state.initialStartIndex + delta);
      onMoveStartRef.current(featureId, getDateFromDayIndex(nextIndex));

      if (originEl) {
        const originRect = originEl.getBoundingClientRect();
        const relativeY = event.clientY - originRect.top;
        const nextLane = Math.max(
          0,
          Math.min(
            laneCountRef.current - 1,
            Math.floor(relativeY / LANE_HEIGHT_PX),
          ),
        );
        if (nextLane !== featureRef.current.laneIndex) {
          onSetLaneRef.current(featureId, nextLane);
        }
      }
      return;
    }

    if (state.mode === "resize-end") {
      const endIndex = Math.max(state.initialStartIndex, dayIndex);
      const nextDuration = endIndex - state.initialStartIndex + 1;
      onSetDurationRef.current(featureId, nextDuration);
      return;
    }

    const nextStartIndex = Math.min(
      dayIndex,
      state.initialStartIndex + state.initialDuration - 1,
    );
    const nextDuration =
      state.initialStartIndex + state.initialDuration - nextStartIndex;
    onResizeFromStartRef.current(
      featureId,
      getDateFromDayIndex(nextStartIndex),
      nextDuration,
    );
  });

  const handlePointerUpRef = useRef((event: PointerEvent) => {
    const state = dragStateRef.current;
    if (!state || event.pointerId !== state.pointerId) return;

    endDragRef.current();
    window.removeEventListener("pointermove", handlePointerMoveRef.current);
    window.removeEventListener("pointerup", handlePointerUpRef.current);
  });

  useEffect(() => {
    const onPointerMove = handlePointerMoveRef.current;
    const onPointerUp = handlePointerUpRef.current;
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, []);

  const beginDrag = useCallback(
    (mode: DragMode, event: React.PointerEvent) => {
      event.preventDefault();
      event.stopPropagation();

      const startDate = feature.startDate;
      if (!startDate) return;

      dragStateRef.current = {
        mode,
        pointerId: event.pointerId,
        startClientX: event.clientX,
        pointerStartDayIndex: getDayIndexFromClientX(event.clientX),
        initialStartIndex: getTimelineDayIndex(startDate),
        initialDuration: feature.durationDays,
        initialLaneIndex: feature.laneIndex,
        didDrag: false,
      };

      onSelectRef.current(feature.id);
      window.addEventListener("pointermove", handlePointerMoveRef.current);
      window.addEventListener("pointerup", handlePointerUpRef.current);
    },
    [feature.startDate, feature.durationDays, feature.id, getDayIndexFromClientX],
  );

  const startDate = feature.startDate;
  if (!startDate) return null;

  const topPx = feature.laneIndex * LANE_HEIGHT_PX + 8;

  return (
    <div
      role="group"
      tabIndex={0}
      aria-label={`${feature.title}, ${feature.durationDays} days`}
      data-selected={isSelected || undefined}
      className={cn(
        "absolute z-10 flex min-w-[2px] cursor-grab items-center overflow-hidden rounded-md border px-1 text-[10px] font-medium shadow-sm active:cursor-grabbing sm:px-2 sm:text-xs motion-reduce:transition-none",
        PRIORITY_BAR_CLASSES[feature.priority],
        isSelected && "z-20 ring-2 ring-ring ring-offset-1",
        isDependencyLinkMode &&
          dependencyLinkDependentId === feature.id &&
          "ring-2 ring-indigo-500 ring-offset-1",
        isDependencyLinkMode &&
          dependencyLinkDependentId &&
          dependencyLinkDependentId !== feature.id &&
          "ring-2 ring-indigo-300/80 ring-offset-1",
      )}
      style={{
        left: startDateToLeftPercent(startDate),
        width: durationToWidthPercent(feature.durationDays),
        top: topPx,
        height: LANE_HEIGHT_PX - 16,
      }}
      onPointerDown={(event) => beginDrag("move", event)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(feature.id);
          if (isDependencyLinkMode && onDependencyLinkClick) {
            onDependencyLinkClick(feature.id);
          } else {
            onOpenPriority(feature.id);
          }
        }
      }}
    >
      <div
        className="absolute left-0 top-0 h-full w-1.5 min-w-[4px] cursor-ew-resize sm:w-1.5"
        aria-hidden
        onPointerDown={(event) => beginDrag("resize-start", event)}
      />
      <span
        className={cn(
          "pointer-events-none mr-1 shrink-0 rounded border px-0.5 text-[9px] leading-tight font-semibold sm:text-[10px]",
          FLOW_TAG_BADGE_CLASSES[feature.flow],
        )}
      >
        {FLOW_TAG_SHORT_LABELS[feature.flow]}
      </span>
      <span className="pointer-events-none min-w-0 truncate">
        {feature.title}
      </span>
      <div
        className="absolute right-0 top-0 h-full w-1.5 min-w-[4px] cursor-ew-resize sm:w-1.5"
        aria-hidden
        onPointerDown={(event) => beginDrag("resize-end", event)}
      />
    </div>
  );
}
