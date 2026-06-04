import { normalizeStoryMapDependencies } from "@/lib/story-map/dependencies";
import { computeLaneCountFromFeatures } from "@/lib/story-map/lanes";
import {
  DEFAULT_STORY_MAP_FLOW,
  isStoryMapFlowTag,
  STORY_MAP_PRIORITY_TIERS,
  type StoryMapFeature,
  type StoryMapState,
} from "@/types/story-map";

export function normalizeStoryMapFeature(value: unknown): StoryMapFeature | null {
  if (!value || typeof value !== "object") return null;

  const raw = value as Partial<StoryMapFeature>;
  if (
    typeof raw.id !== "string" ||
    typeof raw.title !== "string" ||
    (raw.startDate !== null &&
      raw.startDate !== undefined &&
      typeof raw.startDate !== "string") ||
    typeof raw.durationDays !== "number" ||
    !STORY_MAP_PRIORITY_TIERS.includes(
      raw.priority as (typeof STORY_MAP_PRIORITY_TIERS)[number],
    ) ||
    typeof raw.laneIndex !== "number"
  ) {
    return null;
  }

  return {
    id: raw.id,
    title: raw.title,
    startDate: raw.startDate ?? null,
    durationDays: raw.durationDays,
    priority: raw.priority as StoryMapFeature["priority"],
    flow: isStoryMapFlowTag(raw.flow) ? raw.flow : DEFAULT_STORY_MAP_FLOW,
    laneIndex: raw.laneIndex,
  };
}

export function normalizeStoryMapFeatures(
  features: unknown[],
): StoryMapFeature[] {
  return features
    .map(normalizeStoryMapFeature)
    .filter((feature): feature is StoryMapFeature => feature !== null);
}

export function normalizeStoryMapState(parsed: unknown): StoryMapState | null {
  if (!parsed || typeof parsed !== "object") return null;

  const raw = parsed as {
    features?: unknown;
    laneCount?: unknown;
    dependencies?: unknown;
  };
  if (!Array.isArray(raw.features)) return null;

  const features = normalizeStoryMapFeatures(raw.features);
  const featureIds = new Set(features.map((feature) => feature.id));
  const laneCount = computeLaneCountFromFeatures(
    features,
    typeof raw.laneCount === "number" ? raw.laneCount : undefined,
  );
  const dependencies = normalizeStoryMapDependencies(
    raw.dependencies,
    featureIds,
  );

  return { features, laneCount, dependencies };
}
