import { describe, expect, it } from "vitest";
import { normalizeStoryMapState } from "@/lib/story-map/normalize-state";

describe("normalizeStoryMapState", () => {
  it("defaults missing flow on legacy features", () => {
    const state = normalizeStoryMapState({
      features: [
        {
          id: "a",
          title: "Test",
          startDate: null,
          durationDays: 7,
          priority: "mvp",
          laneIndex: 0,
        },
      ],
    });

    expect(state?.features[0]?.flow).toBe("na");
    expect(state?.laneCount).toBeGreaterThan(0);
    expect(state?.dependencies).toEqual([]);
  });

  it("ignores legacy scoreFields in saved JSON", () => {
    const state = normalizeStoryMapState({
      scoreFields: [{ id: "impact", label: "Impact" }],
      features: [
        {
          id: "a",
          title: "Test",
          startDate: null,
          durationDays: 7,
          priority: "mvp",
          flow: "na",
          laneIndex: 0,
          scores: { impact: 5 },
        },
      ],
    });

    expect(state?.features).toHaveLength(1);
    expect(state).not.toHaveProperty("scoreFields");
  });
});
