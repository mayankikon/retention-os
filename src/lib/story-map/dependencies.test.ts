import { describe, expect, it } from "vitest";
import {
  buildDependencyArrowGeometry,
  isValidDependencyPair,
  normalizeStoryMapDependencies,
} from "@/lib/story-map/dependencies";
import type { StoryMapFeature } from "@/types/story-map";

const featureA: StoryMapFeature = {
  id: "a",
  title: "A",
  startDate: "2026-06-01",
  durationDays: 14,
  priority: "mvp",
  flow: "dependency",
  laneIndex: 0,
};

const featureB: StoryMapFeature = {
  id: "b",
  title: "B",
  startDate: "2026-07-01",
  durationDays: 7,
  priority: "mvp",
  flow: "flow-1",
  laneIndex: 1,
};

describe("normalizeStoryMapDependencies", () => {
  it("filters invalid and duplicate pairs", () => {
    const result = normalizeStoryMapDependencies(
      [
        {
          id: "d1",
          dependentFeatureId: "a",
          blockerFeatureId: "b",
        },
        {
          id: "d2",
          dependentFeatureId: "a",
          blockerFeatureId: "b",
        },
        {
          id: "d3",
          dependentFeatureId: "a",
          blockerFeatureId: "a",
        },
      ],
      new Set(["a", "b"]),
    );
    expect(result).toHaveLength(1);
  });
});

describe("isValidDependencyPair", () => {
  it("rejects self-dependencies", () => {
    expect(isValidDependencyPair("a", "a", [])).toBe(false);
  });
});

describe("buildDependencyArrowGeometry", () => {
  it("builds a path between scheduled features", () => {
    const geometry = buildDependencyArrowGeometry(
      { id: "d1", dependentFeatureId: "b", blockerFeatureId: "a" },
      [featureA, featureB],
      1000,
    );
    expect(geometry?.path).toMatch(/^M /);
  });
});
