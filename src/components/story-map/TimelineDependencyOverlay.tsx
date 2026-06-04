"use client";

import { useEffect, useState } from "react";
import { DEPENDENCY_ARROW_STROKE } from "@/lib/story-map/constants";
import {
  buildAllDependencyArrows,
  isDependencyScheduleWarning,
} from "@/lib/story-map/dependencies";
import type { StoryMapDependency, StoryMapFeature } from "@/types/story-map";

interface TimelineDependencyOverlayProps {
  gridOriginRef: React.RefObject<HTMLDivElement | null>;
  features: StoryMapFeature[];
  dependencies: StoryMapDependency[];
}

export function TimelineDependencyOverlay({
  gridOriginRef,
  features,
  dependencies,
}: TimelineDependencyOverlayProps) {
  const [gridWidthPx, setGridWidthPx] = useState(0);

  useEffect(() => {
    const element = gridOriginRef.current;
    if (!element) return;

    const updateWidth = () => {
      setGridWidthPx(element.clientWidth);
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(element);
    return () => observer.disconnect();
  }, [gridOriginRef]);

  const arrows = buildAllDependencyArrows(dependencies, features, gridWidthPx);

  if (arrows.length === 0) return null;

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-[5] overflow-visible"
      width="100%"
      height="100%"
      aria-hidden
    >
      <defs>
        <marker
          id="story-map-arrowhead"
          markerWidth="8"
          markerHeight="8"
          refX="7"
          refY="4"
          orient="auto"
        >
          <path d="M0,0 L8,4 L0,8 Z" fill={DEPENDENCY_ARROW_STROKE} />
        </marker>
      </defs>
      {arrows.map((arrow) => {
        const dependency = dependencies.find((item) => item.id === arrow.id);
        const hasWarning =
          dependency &&
          isDependencyScheduleWarning(dependency, features);

        return (
          <path
            key={arrow.id}
            d={arrow.path}
            fill="none"
            stroke={hasWarning ? "#dc2626" : DEPENDENCY_ARROW_STROKE}
            strokeWidth={hasWarning ? 2.5 : 2}
            strokeDasharray={hasWarning ? "6 4" : undefined}
            markerEnd="url(#story-map-arrowhead)"
            opacity={0.85}
          />
        );
      })}
    </svg>
  );
}
