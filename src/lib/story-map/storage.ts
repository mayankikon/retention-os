import { STORY_MAP_STORAGE_KEY } from "@/lib/story-map/constants";
import { normalizeStoryMapState } from "@/lib/story-map/normalize-state";
import type { StoryMapState } from "@/types/story-map";

export function loadStoryMapState(): StoryMapState | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORY_MAP_STORAGE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    return normalizeStoryMapState(parsed);
  } catch {
    return null;
  }
}

export function saveStoryMapState(state: StoryMapState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORY_MAP_STORAGE_KEY, JSON.stringify(state));
}
