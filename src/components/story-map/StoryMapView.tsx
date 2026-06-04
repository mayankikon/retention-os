"use client";

import { useCallback, useMemo, useState } from "react";
import { Link2 } from "lucide-react";
import { DependencyLinker } from "@/components/story-map/DependencyLinker";
import { FeatureSidebar } from "@/components/story-map/FeatureSidebar";
import { PriorityPicker } from "@/components/story-map/PriorityPicker";
import { RoadmapTimeline } from "@/components/story-map/RoadmapTimeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FLOW_TAG_BADGE_CLASSES,
  FLOW_TAG_LABELS,
  PRIORITY_SWATCH_CLASSES,
  PRIORITY_TIER_LABELS,
  TIMELINE_END_ISO,
  TIMELINE_START_ISO,
} from "@/lib/story-map/constants";
import { useStoryMapState } from "@/hooks/use-story-map-state";
import { cn } from "@/lib/utils";
import {
  STORY_MAP_FLOW_TAGS,
  STORY_MAP_PRIORITY_TIERS,
} from "@/types/story-map";

export function StoryMapView() {
  const {
    features,
    dependencies,
    laneCount,
    isHydrated,
    selectedFeatureId,
    setSelectedFeatureId,
    addFeature,
    removeFeature,
    scheduleFeature,
    moveFeatureStart,
    setDuration,
    resizeFeatureFromStart,
    setPriority,
    setFlow,
    addDependency,
    removeDependency,
    setLane,
    addLane,
    reorderLanes,
    clearLane,
    removeLane,
  } = useStoryMapState();

  const [priorityDialogOpen, setPriorityDialogOpen] = useState(false);
  const [dependencyDialogOpen, setDependencyDialogOpen] = useState(false);
  const [isDependencyLinkMode, setIsDependencyLinkMode] = useState(false);
  const [dependencyLinkDependentId, setDependencyLinkDependentId] = useState<
    string | null
  >(null);

  const selectedFeature = useMemo(
    () => features.find((feature) => feature.id === selectedFeatureId) ?? null,
    [features, selectedFeatureId],
  );

  const handleOpenPriority = (id: string) => {
    setSelectedFeatureId(id);
    setPriorityDialogOpen(true);
  };

  const handleOpenDependencies = (id: string) => {
    setSelectedFeatureId(id);
    setDependencyDialogOpen(true);
  };

  const handleDependencyLinkClick = useCallback(
    (featureId: string) => {
      const clicked = features.find((feature) => feature.id === featureId);
      if (!clicked?.startDate) return;

      if (!dependencyLinkDependentId) {
        setDependencyLinkDependentId(featureId);
        setSelectedFeatureId(featureId);
        return;
      }

      if (dependencyLinkDependentId === featureId) {
        setDependencyLinkDependentId(null);
        return;
      }

      addDependency(dependencyLinkDependentId, featureId);
      setDependencyLinkDependentId(null);
      setIsDependencyLinkMode(false);
    },
    [addDependency, dependencyLinkDependentId, features],
  );

  const toggleDependencyLinkMode = () => {
    setIsDependencyLinkMode((active) => {
      const next = !active;
      if (!next) setDependencyLinkDependentId(null);
      return next;
    });
  };

  if (!isHydrated) {
    return (
      <div className="flex h-[480px] items-center justify-center text-sm text-muted-foreground">
        Loading story map…
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] min-h-[560px] flex-col gap-4">
      <header className="shrink-0 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Story map</h1>
            <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
              Roadmap from {formatDisplayDate(TIMELINE_START_ISO)} through{" "}
              {formatDisplayDate(TIMELINE_END_ISO)}. Tag flows, link
              dependencies between feature areas, and drag rows to reorder.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant={isDependencyLinkMode ? "default" : "outline"}
              size="sm"
              className="gap-2"
              onClick={toggleDependencyLinkMode}
            >
              <Link2 className="h-4 w-4" />
              {isDependencyLinkMode ? "Cancel link" : "Link dependency"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!selectedFeature?.startDate}
              onClick={() => {
                if (selectedFeatureId) handleOpenDependencies(selectedFeatureId);
              }}
            >
              Dependencies…
            </Button>
          </div>
        </div>

        {isDependencyLinkMode ? (
          <p className="rounded-md border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm text-indigo-900 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-100">
            {dependencyLinkDependentId
              ? "Click the feature area this depends on (blocker). Arrow runs blocker → dependent."
              : "Click the dependent feature first, then click what it depends on."}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex flex-wrap gap-2" aria-label="Flow legend">
            <span className="text-xs font-medium text-muted-foreground">
              Flows
            </span>
            {STORY_MAP_FLOW_TAGS.map((flow) => (
              <Badge
                key={flow}
                variant="outline"
                className="gap-2 font-normal"
              >
                <span
                  className={cn(
                    "h-2.5 w-2.5 rounded-sm border",
                    FLOW_TAG_BADGE_CLASSES[flow],
                  )}
                  aria-hidden
                />
                {FLOW_TAG_LABELS[flow]}
              </Badge>
            ))}
          </div>
          <div className="flex flex-wrap gap-2" aria-label="Priority legend">
            <span className="text-xs font-medium text-muted-foreground">
              Priority
            </span>
            {STORY_MAP_PRIORITY_TIERS.map((tier) => (
              <Badge
                key={tier}
                variant="outline"
                className="gap-2 font-normal"
              >
                <span
                  className={cn(
                    "h-2.5 w-2.5 rounded-sm",
                    PRIORITY_SWATCH_CLASSES[tier],
                  )}
                  aria-hidden
                />
                {PRIORITY_TIER_LABELS[tier]}
              </Badge>
            ))}
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden rounded-lg border border-border bg-background">
        <FeatureSidebar
          features={features}
          dependencies={dependencies}
          onAddFeature={addFeature}
          onRemoveFeature={removeFeature}
          onSelectFeature={setSelectedFeatureId}
          onSetFlow={setFlow}
          onOpenDependencies={handleOpenDependencies}
          selectedFeatureId={selectedFeatureId}
        />
        <RoadmapTimeline
          features={features}
          dependencies={dependencies}
          laneCount={laneCount}
          selectedFeatureId={selectedFeatureId}
          isDependencyLinkMode={isDependencyLinkMode}
          dependencyLinkDependentId={dependencyLinkDependentId}
          onSelectFeature={setSelectedFeatureId}
          onOpenPriority={handleOpenPriority}
          onDependencyLinkClick={handleDependencyLinkClick}
          scheduleFeature={scheduleFeature}
          moveFeatureStart={moveFeatureStart}
          setDuration={setDuration}
          resizeFeatureFromStart={resizeFeatureFromStart}
          setLane={setLane}
          reorderLanes={reorderLanes}
          clearLane={clearLane}
          removeLane={removeLane}
          addLane={addLane}
        />
      </div>

      <PriorityPicker
        feature={selectedFeature}
        open={priorityDialogOpen}
        onOpenChange={setPriorityDialogOpen}
        onSelectPriority={(priority) => {
          if (selectedFeatureId) {
            setPriority(selectedFeatureId, priority);
          }
        }}
      />

      <DependencyLinker
        feature={selectedFeature}
        features={features}
        dependencies={dependencies}
        open={dependencyDialogOpen}
        onOpenChange={setDependencyDialogOpen}
        onAddDependency={addDependency}
        onRemoveDependency={removeDependency}
      />
    </div>
  );
}

function formatDisplayDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
