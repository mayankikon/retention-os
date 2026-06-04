import { LANE_HEIGHT_PX } from "@/lib/story-map/constants";
import {
  getTimelineDayIndex,
  startDateToLeftPercent,
  durationToWidthPercent,
} from "@/lib/story-map/timeline-math";
import type {
  StoryMapDependency,
  StoryMapFeature,
} from "@/types/story-map";

export interface DependencyAnchor {
  xPx: number;
  yPx: number;
}

export interface DependencyArrowGeometry {
  id: string;
  path: string;
}

export function createDependencyId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `dep-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function normalizeStoryMapDependencies(
  raw: unknown,
  featureIds: Set<string>,
): StoryMapDependency[] {
  if (!Array.isArray(raw)) return [];

  const seen = new Set<string>();
  const dependencies: StoryMapDependency[] = [];

  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const { id, dependentFeatureId, blockerFeatureId } =
      item as Partial<StoryMapDependency>;

    if (
      typeof id !== "string" ||
      typeof dependentFeatureId !== "string" ||
      typeof blockerFeatureId !== "string" ||
      dependentFeatureId === blockerFeatureId ||
      !featureIds.has(dependentFeatureId) ||
      !featureIds.has(blockerFeatureId)
    ) {
      continue;
    }

    const pairKey = `${dependentFeatureId}->${blockerFeatureId}`;
    if (seen.has(pairKey)) continue;
    seen.add(pairKey);

    dependencies.push({ id, dependentFeatureId, blockerFeatureId });
  }

  return dependencies;
}

export function getDependenciesForFeature(
  dependencies: StoryMapDependency[],
  featureId: string,
): StoryMapDependency[] {
  return dependencies.filter(
    (dependency) => dependency.dependentFeatureId === featureId,
  );
}

function parsePercent(value: string): number {
  return Number.parseFloat(value.replace("%", "")) / 100;
}

function getBarAnchorPx(
  feature: StoryMapFeature,
  edge: "start" | "end",
  gridWidthPx: number,
): DependencyAnchor | null {
  if (!feature.startDate) return null;

  const leftPercent = parsePercent(startDateToLeftPercent(feature.startDate));
  const widthPercent = parsePercent(
    durationToWidthPercent(feature.durationDays),
  );
  const xPercent = edge === "start" ? leftPercent : leftPercent + widthPercent;

  return {
    xPx: xPercent * gridWidthPx,
    yPx: feature.laneIndex * LANE_HEIGHT_PX + LANE_HEIGHT_PX / 2,
  };
}

/** Elbow arrow from blocker end → dependent start */
export function buildDependencyArrowGeometry(
  dependency: StoryMapDependency,
  features: StoryMapFeature[],
  gridWidthPx: number,
): DependencyArrowGeometry | null {
  const blocker = features.find(
    (feature) => feature.id === dependency.blockerFeatureId,
  );
  const dependent = features.find(
    (feature) => feature.id === dependency.dependentFeatureId,
  );

  if (!blocker?.startDate || !dependent?.startDate) return null;

  const from = getBarAnchorPx(blocker, "end", gridWidthPx);
  const to = getBarAnchorPx(dependent, "start", gridWidthPx);
  if (!from || !to) return null;

  const midX = from.xPx + (to.xPx - from.xPx) / 2;
  const path = `M ${from.xPx} ${from.yPx} L ${midX} ${from.yPx} L ${midX} ${to.yPx} L ${to.xPx} ${to.yPx}`;

  return { id: dependency.id, path };
}

export function buildAllDependencyArrows(
  dependencies: StoryMapDependency[],
  features: StoryMapFeature[],
  gridWidthPx: number,
): DependencyArrowGeometry[] {
  if (gridWidthPx <= 0) return [];

  return dependencies
    .map((dependency) =>
      buildDependencyArrowGeometry(dependency, features, gridWidthPx),
    )
    .filter((geometry): geometry is DependencyArrowGeometry => geometry !== null);
}

export function isValidDependencyPair(
  dependentFeatureId: string,
  blockerFeatureId: string,
  existing: StoryMapDependency[],
): boolean {
  if (dependentFeatureId === blockerFeatureId) return false;
  return !existing.some(
    (dependency) =>
      dependency.dependentFeatureId === dependentFeatureId &&
      dependency.blockerFeatureId === blockerFeatureId,
  );
}

/** True when dependent starts before blocker ends (invalid schedule) */
export function isDependencyScheduleWarning(
  dependency: StoryMapDependency,
  features: StoryMapFeature[],
): boolean {
  const blocker = features.find(
    (feature) => feature.id === dependency.blockerFeatureId,
  );
  const dependent = features.find(
    (feature) => feature.id === dependency.dependentFeatureId,
  );
  if (!blocker?.startDate || !dependent?.startDate) return false;

  const blockerEndIndex =
    getTimelineDayIndex(blocker.startDate) + blocker.durationDays - 1;
  const dependentStartIndex = getTimelineDayIndex(dependent.startDate);

  return dependentStartIndex < blockerEndIndex;
}
