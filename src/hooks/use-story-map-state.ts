"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createDefaultStoryMapState,
  mergeStoryMapStateWithDefaults,
} from "@/data/story-map.defaults";
import {
  DEFAULT_DURATION_DAYS,
  MIN_DURATION_DAYS,
  MIN_LANE_COUNT,
} from "@/lib/story-map/constants";
import {
  createDependencyId,
  isValidDependencyPair,
} from "@/lib/story-map/dependencies";
import {
  computeLaneCountFromFeatures,
  removeLaneAtIndex,
  reorderLaneIndices,
} from "@/lib/story-map/lanes";
import {
  clampDurationDays,
  clampStartDateForDuration,
} from "@/lib/story-map/timeline-math";
import {
  loadStoryMapState,
  saveStoryMapState,
} from "@/lib/story-map/storage";
import type {
  StoryMapFeature,
  StoryMapFlowTag,
  StoryMapPriorityTier,
  StoryMapDependency,
  StoryMapState,
} from "@/types/story-map";
import { DEFAULT_STORY_MAP_FLOW } from "@/types/story-map";

function createFeatureId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `feature-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function createDefaultFeature(title: string): StoryMapFeature {
  return {
    id: createFeatureId(),
    title: title.trim(),
    startDate: null,
    durationDays: DEFAULT_DURATION_DAYS,
    priority: "mvp",
    flow: DEFAULT_STORY_MAP_FLOW,
    laneIndex: 0,
  };
}

export function useStoryMapState() {
  const [features, setFeatures] = useState<StoryMapFeature[]>([]);
  const [dependencies, setDependencies] = useState<StoryMapDependency[]>([]);
  const [laneCount, setLaneCount] = useState(MIN_LANE_COUNT);
  const [isHydrated, setIsHydrated] = useState(false);
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const stored = loadStoryMapState();
    const initialState = stored
      ? mergeStoryMapStateWithDefaults(stored)
      : createDefaultStoryMapState();

    // eslint-disable-next-line react-hooks/set-state-in-effect -- external store read on mount
    setFeatures(initialState.features);
    setLaneCount(initialState.laneCount);
    setDependencies(initialState.dependencies);
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    const state: StoryMapState = { features, laneCount, dependencies };
    saveStoryMapState(state);
  }, [features, laneCount, dependencies, isHydrated]);

  const addFeature = useCallback((title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;

    setFeatures((prev) => [...prev, createDefaultFeature(trimmed)]);
  }, []);

  const removeFeature = useCallback((id: string) => {
    setFeatures((prev) => prev.filter((feature) => feature.id !== id));
    setDependencies((prev) =>
      prev.filter(
        (dependency) =>
          dependency.dependentFeatureId !== id &&
          dependency.blockerFeatureId !== id,
      ),
    );
    setSelectedFeatureId((current) => (current === id ? null : current));
  }, []);

  const updateFeature = useCallback(
    (id: string, patch: Partial<Omit<StoryMapFeature, "id">>) => {
      setFeatures((prev) =>
        prev.map((feature) =>
          feature.id === id ? { ...feature, ...patch } : feature,
        ),
      );
    },
    [],
  );

  const scheduleFeature = useCallback(
    (id: string, startDate: string, laneIndex?: number) => {
      setFeatures((prev) => {
        const moving = prev.find((feature) => feature.id === id);
        if (!moving) return prev;

        const targetLane = laneIndex ?? moving.laneIndex;
        const occupant = prev.find(
          (feature) =>
            feature.id !== id &&
            feature.startDate &&
            feature.laneIndex === targetLane,
        );

        const durationDays = clampDurationDays(moving.durationDays);
        const scheduled = {
          ...moving,
          startDate: clampStartDateForDuration(startDate, durationDays),
          durationDays,
          laneIndex: targetLane,
        };

        return prev.map((feature) => {
          if (feature.id === id) return scheduled;
          if (occupant && feature.id === occupant.id) {
            return { ...feature, laneIndex: moving.laneIndex };
          }
          return feature;
        });
      });
    },
    [],
  );

  const moveFeatureStart = useCallback((id: string, startDate: string) => {
    setFeatures((prev) =>
      prev.map((feature) => {
        if (feature.id !== id) return feature;
        return {
          ...feature,
          startDate: clampStartDateForDuration(
            startDate,
            feature.durationDays,
          ),
        };
      }),
    );
  }, []);

  const setDuration = useCallback((id: string, durationDays: number) => {
    const nextDuration = clampDurationDays(durationDays);
    setFeatures((prev) =>
      prev.map((feature) => {
        if (feature.id !== id) return feature;
        const startDate = feature.startDate
          ? clampStartDateForDuration(feature.startDate, nextDuration)
          : null;
        return { ...feature, durationDays: nextDuration, startDate };
      }),
    );
  }, []);

  const setPriority = useCallback((id: string, priority: StoryMapPriorityTier) => {
    updateFeature(id, { priority });
  }, [updateFeature]);

  const setFlow = useCallback((id: string, flow: StoryMapFlowTag) => {
    updateFeature(id, { flow });
  }, [updateFeature]);

  const addDependency = useCallback(
    (dependentFeatureId: string, blockerFeatureId: string) => {
      setDependencies((prev) => {
        if (
          !isValidDependencyPair(dependentFeatureId, blockerFeatureId, prev)
        ) {
          return prev;
        }

        return [
          ...prev,
          {
            id: createDependencyId(),
            dependentFeatureId,
            blockerFeatureId,
          },
        ];
      });

      updateFeature(dependentFeatureId, { flow: "dependency" });
    },
    [updateFeature],
  );

  const removeDependency = useCallback((dependencyId: string) => {
    setDependencies((prev) =>
      prev.filter((dependency) => dependency.id !== dependencyId),
    );
  }, []);

  const setLane = useCallback((id: string, laneIndex: number) => {
    const nextLane = Math.max(0, Math.min(laneCount - 1, laneIndex));
    setFeatures((prev) => {
      const moving = prev.find((feature) => feature.id === id);
      if (!moving) return prev;

      const occupant = prev.find(
        (feature) =>
          feature.id !== id &&
          feature.startDate &&
          feature.laneIndex === nextLane,
      );

      return prev.map((feature) => {
        if (feature.id === id) return { ...feature, laneIndex: nextLane };
        if (occupant && feature.id === occupant.id) {
          return { ...feature, laneIndex: moving.laneIndex };
        }
        return feature;
      });
    });
  }, [laneCount]);

  const addLane = useCallback(() => {
    setLaneCount((count) => count + 1);
  }, []);

  const reorderLanes = useCallback((fromIndex: number, toIndex: number) => {
    setFeatures((prev) => reorderLaneIndices(prev, laneCount, fromIndex, toIndex));
  }, [laneCount]);

  const clearLane = useCallback((laneIndex: number) => {
    setFeatures((prev) =>
      prev.map((feature) =>
        feature.startDate && feature.laneIndex === laneIndex
          ? { ...feature, startDate: null }
          : feature,
      ),
    );
  }, []);

  const removeLane = useCallback((laneIndex: number) => {
    setFeatures((prev) => {
      const result = removeLaneAtIndex(prev, laneCount, laneIndex);
      setLaneCount(result.laneCount);
      return result.features;
    });
  }, [laneCount]);

  const unscheduleFeature = useCallback((id: string) => {
    updateFeature(id, { startDate: null });
  }, [updateFeature]);

  const resizeFeatureFromStart = useCallback(
    (id: string, startDate: string, durationDays: number) => {
      const nextDuration = Math.max(
        MIN_DURATION_DAYS,
        clampDurationDays(durationDays),
      );
      setFeatures((prev) =>
        prev.map((feature) => {
          if (feature.id !== id) return feature;
          return {
            ...feature,
            startDate: clampStartDateForDuration(startDate, nextDuration),
            durationDays: nextDuration,
          };
        }),
      );
    },
    [],
  );

  return {
    features,
    dependencies,
    laneCount,
    isHydrated,
    selectedFeatureId,
    setSelectedFeatureId,
    addFeature,
    removeFeature,
    updateFeature,
    scheduleFeature,
    moveFeatureStart,
    setDuration,
    setPriority,
    setFlow,
    addDependency,
    removeDependency,
    setLane,
    addLane,
    reorderLanes,
    clearLane,
    removeLane,
    unscheduleFeature,
    resizeFeatureFromStart,
  };
}

export type UseStoryMapStateReturn = ReturnType<typeof useStoryMapState>;
