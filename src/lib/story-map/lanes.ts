import { MIN_LANE_COUNT } from "@/lib/story-map/constants";
import type { StoryMapFeature } from "@/types/story-map";

export function computeLaneCountFromFeatures(
  features: StoryMapFeature[],
  explicitLaneCount?: number,
): number {
  const maxLaneIndex = features
    .filter((feature) => feature.startDate)
    .reduce((max, feature) => Math.max(max, feature.laneIndex), -1);

  const fromFeatures = maxLaneIndex < 0 ? MIN_LANE_COUNT : maxLaneIndex + 1;
  const fromState =
    typeof explicitLaneCount === "number"
      ? Math.max(MIN_LANE_COUNT, explicitLaneCount)
      : MIN_LANE_COUNT;

  return Math.max(fromFeatures, fromState);
}

/** Reorder lane rows by moving the lane at `fromIndex` to `toIndex`. */
export function reorderLaneIndices(
  features: StoryMapFeature[],
  laneCount: number,
  fromIndex: number,
  toIndex: number,
): StoryMapFeature[] {
  if (fromIndex === toIndex) return features;
  if (fromIndex < 0 || toIndex < 0 || fromIndex >= laneCount || toIndex >= laneCount) {
    return features;
  }

  const order = Array.from({ length: laneCount }, (_, index) => index);
  const [moved] = order.splice(fromIndex, 1);
  order.splice(toIndex, 0, moved);

  const laneRemap = new Map(order.map((oldIndex, newIndex) => [oldIndex, newIndex]));

  return features.map((feature) => {
    if (!feature.startDate) return feature;
    const nextLane = laneRemap.get(feature.laneIndex);
    if (nextLane === undefined) return feature;
    return { ...feature, laneIndex: nextLane };
  });
}

/** After removing a lane, shift higher lanes down and clamp lane count. */
export function removeLaneAtIndex(
  features: StoryMapFeature[],
  laneCount: number,
  laneIndex: number,
): { features: StoryMapFeature[]; laneCount: number } {
  if (laneCount <= MIN_LANE_COUNT) {
    return {
      features: features.map((feature) =>
        feature.laneIndex === laneIndex && feature.startDate
          ? { ...feature, startDate: null }
          : feature,
      ),
      laneCount,
    };
  }

  const nextFeatures = features.map((feature) => {
    if (feature.laneIndex === laneIndex) {
      return { ...feature, startDate: null };
    }
    if (feature.startDate && feature.laneIndex > laneIndex) {
      return { ...feature, laneIndex: feature.laneIndex - 1 };
    }
    return feature;
  });

  return {
    features: nextFeatures,
    laneCount: laneCount - 1,
  };
}

export function getFeatureOnLane(
  features: StoryMapFeature[],
  laneIndex: number,
): StoryMapFeature | undefined {
  return features.find(
    (feature) => feature.startDate && feature.laneIndex === laneIndex,
  );
}
