import { DEFAULT_DURATION_DAYS, MIN_LANE_COUNT } from "@/lib/story-map/constants";
import { computeLaneCountFromFeatures } from "@/lib/story-map/lanes";
import { normalizeStoryMapFeatures } from "@/lib/story-map/normalize-state";
import {
  DEFAULT_STORY_MAP_FLOW,
  type StoryMapFeature,
  type StoryMapState,
} from "@/types/story-map";

/** Predefined roadmap capabilities shown in the story map backlog */
export const STORY_MAP_DEFAULT_FEATURE_TITLES = [
  "Campaign Builder",
  "Template Builder",
  "Coupon Builder",
  "Recall Manager",
  "Videos in SMS & Connect",
  "iMessage Integration",
  "Marketing Carousel",
  "Perfect Timing Engine",
  "White-labeled Dealer FAQs",
  "Service Scheduling Integration",
  "Apple/Google Wallet Integration",
  "Points Program",
  "QR Scan to Click App",
  "Post-Service Reviews",
  "AI Chatbot (Service Advisor)",
  "AI BDC Tools",
  "Smart Vehicle Assistant",
  "Unified Data Sources",
  "ROI Reporting",
  "Service Transactions E2E",
  "VX Integrations",
  "Loyalty Programs",
  "Service CRM",
  "Lane & Loaner Management",
] as const;

function titleToDefaultId(title: string): string {
  return `default-${title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`;
}

export function createDefaultStoryMapState(): StoryMapState {
  const features: StoryMapFeature[] = STORY_MAP_DEFAULT_FEATURE_TITLES.map(
    (title) => ({
      id: titleToDefaultId(title),
      title,
      startDate: null,
      durationDays: DEFAULT_DURATION_DAYS,
      priority: "mvp" as const,
      flow: DEFAULT_STORY_MAP_FLOW,
      laneIndex: 0,
    }),
  );

  return {
    features,
    laneCount: MIN_LANE_COUNT,
    dependencies: [],
  };
}

/** Add any predefined features missing from saved state (matched by title). */
export function mergeStoryMapStateWithDefaults(
  existing: StoryMapState,
): StoryMapState {
  const existingTitles = new Set(
    existing.features.map((feature) => feature.title.trim().toLowerCase()),
  );

  const defaultState = createDefaultStoryMapState();
  const missingDefaults = defaultState.features.filter(
    (feature) => !existingTitles.has(feature.title.toLowerCase()),
  );

  const features =
    missingDefaults.length === 0
      ? existing.features
      : [...existing.features, ...missingDefaults];

  const normalizedFeatures = normalizeStoryMapFeatures(features);
  return {
    features: normalizedFeatures,
    laneCount: computeLaneCountFromFeatures(
      normalizedFeatures,
      existing.laneCount,
    ),
    dependencies: existing.dependencies ?? [],
  };
}
