export const STORY_MAP_PRIORITY_TIERS = [
  "mvp",
  "post-mvp",
  "future-2027",
] as const;

export type StoryMapPriorityTier = (typeof STORY_MAP_PRIORITY_TIERS)[number];

export const STORY_MAP_FLOW_TAGS = [
  "flow-1",
  "flow-2",
  "flow-3",
  "flow-4",
  "dependency",
  "na",
] as const;

export type StoryMapFlowTag = (typeof STORY_MAP_FLOW_TAGS)[number];

export const DEFAULT_STORY_MAP_FLOW: StoryMapFlowTag = "na";

export function isStoryMapFlowTag(value: unknown): value is StoryMapFlowTag {
  return (
    typeof value === "string" &&
    (STORY_MAP_FLOW_TAGS as readonly string[]).includes(value)
  );
}

export interface StoryMapFeature {
  id: string;
  title: string;
  /** ISO date YYYY-MM-DD; null when feature is backlog-only */
  startDate: string | null;
  durationDays: number;
  priority: StoryMapPriorityTier;
  /** Product flow bucket (1–4) or not applicable */
  flow: StoryMapFlowTag;
  laneIndex: number;
}

/** Directed link: dependent feature waits on blocker (predecessor) */
export interface StoryMapDependency {
  id: string;
  /** Feature that cannot start until the blocker completes */
  dependentFeatureId: string;
  /** Feature that must finish first */
  blockerFeatureId: string;
}

export interface StoryMapState {
  features: StoryMapFeature[];
  /** Total timeline rows (lanes), including empty rows */
  laneCount: number;
  dependencies: StoryMapDependency[];
}
