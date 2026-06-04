import type { StoryMapFlowTag, StoryMapPriorityTier } from "@/types/story-map";

export const STORY_MAP_STORAGE_KEY = "retention-os:story-map:v1";

export const TIMELINE_START_ISO = "2026-06-01";
export const TIMELINE_END_ISO = "2027-06-30";

/** Reference width for tests; UI uses 100% of container */
export const DAY_WIDTH_PX = 28;
export const LANE_HEIGHT_PX = 44;
export const MIN_LANE_COUNT = 6;
export const LANE_GUTTER_WIDTH_PX = 40;
export const TIMELINE_HEADER_HEIGHT_PX = 56;
export const DEFAULT_DURATION_DAYS = 7;
export const MIN_DURATION_DAYS = 1;

/** Inclusive day count from Jun 1 2026 through Jun 30 2027 */
export const TOTAL_TIMELINE_DAYS = daysBetweenInclusive(
  TIMELINE_START_ISO,
  TIMELINE_END_ISO,
);

export const PRIORITY_TIER_LABELS: Record<StoryMapPriorityTier, string> = {
  mvp: "MVP",
  "post-mvp": "Post-MVP",
  "future-2027": "2027 future",
};

export const PRIORITY_BAR_CLASSES: Record<StoryMapPriorityTier, string> = {
  mvp: "bg-brand-primary/90 border-brand-primary text-white",
  "post-mvp": "bg-amber-500/85 border-amber-600 text-white",
  "future-2027": "bg-violet-500/75 border-violet-600 text-white",
};

export const PRIORITY_SWATCH_CLASSES: Record<StoryMapPriorityTier, string> = {
  mvp: "bg-brand-primary",
  "post-mvp": "bg-amber-500",
  "future-2027": "bg-violet-500",
};

export const FLOW_TAG_LABELS: Record<StoryMapFlowTag, string> = {
  "flow-1": "Flow 1",
  "flow-2": "Flow 2",
  "flow-3": "Flow 3",
  "flow-4": "Flow 4",
  dependency: "Dependency",
  na: "N/A",
};

/** Short labels for compact timeline bars */
export const FLOW_TAG_SHORT_LABELS: Record<StoryMapFlowTag, string> = {
  "flow-1": "F1",
  "flow-2": "F2",
  "flow-3": "F3",
  "flow-4": "F4",
  dependency: "Dep",
  na: "N/A",
};

export const FLOW_TAG_BADGE_CLASSES: Record<StoryMapFlowTag, string> = {
  "flow-1": "bg-sky-600 text-white border-sky-700",
  "flow-2": "bg-emerald-600 text-white border-emerald-700",
  "flow-3": "bg-orange-600 text-white border-orange-700",
  "flow-4": "bg-rose-600 text-white border-rose-700",
  dependency:
    "border-2 border-dashed border-indigo-300 bg-indigo-600/90 text-white",
  na: "bg-muted text-muted-foreground border-border",
};

export const DEPENDENCY_ARROW_STROKE = "var(--brand-primary)";

function daysBetweenInclusive(startIso: string, endIso: string): number {
  const start = parseIsoDateUtc(startIso);
  const end = parseIsoDateUtc(endIso);
  const msPerDay = 86_400_000;
  return Math.floor((end.getTime() - start.getTime()) / msPerDay) + 1;
}

function parseIsoDateUtc(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}
