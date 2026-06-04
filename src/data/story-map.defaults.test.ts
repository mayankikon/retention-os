import { describe, expect, it } from "vitest";
import {
  STORY_MAP_DEFAULT_FEATURE_TITLES,
  createDefaultStoryMapState,
  mergeStoryMapStateWithDefaults,
} from "@/data/story-map.defaults";

describe("story-map defaults", () => {
  it("includes all predefined capability titles", () => {
    expect(STORY_MAP_DEFAULT_FEATURE_TITLES).toHaveLength(24);
    expect(STORY_MAP_DEFAULT_FEATURE_TITLES).toContain("Campaign Builder");
    expect(STORY_MAP_DEFAULT_FEATURE_TITLES).toContain(
      "Lane & Loaner Management",
    );
  });

  it("creates separate backlog features with stable ids", () => {
    const state = createDefaultStoryMapState();
    const ids = new Set(state.features.map((feature) => feature.id));
    expect(state.features).toHaveLength(24);
    expect(ids.size).toBe(24);
    expect(state.features.every((feature) => feature.startDate === null)).toBe(
      true,
    );
    expect(state.features.every((feature) => feature.flow === "na")).toBe(true);
  });

  it("merges only missing titles into existing state", () => {
    const merged = mergeStoryMapStateWithDefaults({
      features: [
        {
          id: "custom-1",
          title: "Campaign Builder",
          startDate: "2026-06-01",
          durationDays: 7,
          priority: "mvp",
          flow: "flow-1",
          laneIndex: 0,
        },
      ],
    });
    expect(merged.features).toHaveLength(24);
    expect(merged.features.find((f) => f.id === "custom-1")?.startDate).toBe(
      "2026-06-01",
    );
  });
});
