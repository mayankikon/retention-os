"use client";

import { AppShell } from "@/components/layout/AppShell";
import { StoryMapView } from "@/components/story-map/StoryMapView";

export default function StoryMapPage() {
  return (
    <AppShell contentClassName="max-w-none">
      <StoryMapView />
    </AppShell>
  );
}
