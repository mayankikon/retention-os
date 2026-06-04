import { describe, expect, it } from "vitest";
import { MIN_LANE_COUNT } from "@/lib/story-map/constants";
import {
  computeLaneCountFromFeatures,
  reorderLaneIndices,
  removeLaneAtIndex,
} from "@/lib/story-map/lanes";
import type { StoryMapFeature } from "@/types/story-map";

function scheduledFeature(
  overrides: Partial<StoryMapFeature> & { id: string; laneIndex: number },
): StoryMapFeature {
  return {
    id: overrides.id,
    title: overrides.title ?? overrides.id,
    startDate: "2026-06-01",
    durationDays: 7,
    priority: "mvp",
    flow: "na",
    laneIndex: overrides.laneIndex,
  };
}

describe("reorderLaneIndices", () => {
  it("moves a feature when its lane row is reordered", () => {
    const features = [
      scheduledFeature({ id: "a", laneIndex: 0 }),
      scheduledFeature({ id: "b", laneIndex: 1 }),
    ];

    const reordered = reorderLaneIndices(features, 4, 0, 2);
    expect(reordered.find((feature) => feature.id === "a")?.laneIndex).toBe(2);
    expect(reordered.find((feature) => feature.id === "b")?.laneIndex).toBe(0);
  });
});

describe("removeLaneAtIndex", () => {
  it("unschedules feature and compacts lanes below minimum count", () => {
    const features = [scheduledFeature({ id: "a", laneIndex: 1 })];
    const result = removeLaneAtIndex(features, MIN_LANE_COUNT, 1);
    expect(result.features[0]?.startDate).toBeNull();
    expect(result.laneCount).toBe(MIN_LANE_COUNT);
  });
});

describe("computeLaneCountFromFeatures", () => {
  it("uses explicit lane count when larger than scheduled lanes", () => {
    const count = computeLaneCountFromFeatures(
      [scheduledFeature({ id: "a", laneIndex: 2 })],
      10,
    );
    expect(count).toBe(10);
  });
});
