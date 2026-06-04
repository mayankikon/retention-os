"use client";

import { useState } from "react";
import { GripVertical, Trash2 } from "lucide-react";
import { FlowTagSelect } from "@/components/story-map/FlowTagSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getDependenciesForFeature } from "@/lib/story-map/dependencies";
import { PRIORITY_SWATCH_CLASSES } from "@/lib/story-map/constants";
import { cn } from "@/lib/utils";
import type {
  StoryMapDependency,
  StoryMapFeature,
  StoryMapFlowTag,
} from "@/types/story-map";

export const STORY_MAP_DRAG_TYPE = "application/x-story-map-feature-id";

interface FeatureSidebarProps {
  features: StoryMapFeature[];
  dependencies: StoryMapDependency[];
  onAddFeature: (title: string) => void;
  onRemoveFeature: (id: string) => void;
  onSelectFeature: (id: string) => void;
  onSetFlow: (id: string, flow: StoryMapFlowTag) => void;
  onOpenDependencies: (id: string) => void;
  selectedFeatureId: string | null;
}

export function FeatureSidebar({
  features,
  onAddFeature,
  onRemoveFeature,
  onSelectFeature,
  dependencies,
  onSetFlow,
  onOpenDependencies,
  selectedFeatureId,
}: FeatureSidebarProps) {
  const [title, setTitle] = useState("");

  const backlogFeatures = features.filter((feature) => !feature.startDate);
  const scheduledFeatures = features.filter((feature) => feature.startDate);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;
    onAddFeature(title);
    setTitle("");
  };

  return (
    <aside className="flex w-80 shrink-0 flex-col border-r border-border bg-card">
      <div className="border-b border-border p-4">
        <h2 className="text-sm font-semibold">Features</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Assign Flow 1–4, Dependency, or N/A. Use Dependencies to link areas.
        </p>
        <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="New feature"
            aria-label="Feature name"
          />
          <Button type="submit" size="sm">
            Add
          </Button>
        </form>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {features.length === 0 ? (
          <p className="px-1 text-xs text-muted-foreground">
            Add a feature to get started.
          </p>
        ) : null}

        {backlogFeatures.length > 0 ? (
          <FeatureGroup title="Backlog">
            {backlogFeatures.map((feature) => (
              <FeatureRow
                key={feature.id}
                feature={feature}
                isSelected={selectedFeatureId === feature.id}
                isDraggable
                onSelect={onSelectFeature}
                onRemove={onRemoveFeature}
                onSetFlow={onSetFlow}
                dependencies={dependencies}
                onOpenDependencies={onOpenDependencies}
              />
            ))}
          </FeatureGroup>
        ) : null}

        {scheduledFeatures.length > 0 ? (
          <FeatureGroup title="On timeline">
            {scheduledFeatures.map((feature) => (
              <FeatureRow
                key={feature.id}
                feature={feature}
                isSelected={selectedFeatureId === feature.id}
                isDraggable={false}
                onSelect={onSelectFeature}
                onRemove={onRemoveFeature}
                onSetFlow={onSetFlow}
                dependencies={dependencies}
                onOpenDependencies={onOpenDependencies}
              />
            ))}
          </FeatureGroup>
        ) : null}
      </div>
    </aside>
  );
}

function FeatureGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-4">
      <h3 className="mb-2 px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      <ul className="space-y-1">{children}</ul>
    </section>
  );
}

function FeatureRow({
  feature,
  isSelected,
  isDraggable,
  onSelect,
  onRemove,
  onSetFlow,
  dependencies,
  onOpenDependencies,
}: {
  feature: StoryMapFeature;
  isSelected: boolean;
  isDraggable: boolean;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onSetFlow: (id: string, flow: StoryMapFlowTag) => void;
  dependencies: StoryMapDependency[];
  onOpenDependencies: (id: string) => void;
}) {
  const dependencyCount = getDependenciesForFeature(
    dependencies,
    feature.id,
  ).length;

  return (
    <li>
      <div
        className={cn(
          "flex items-center gap-1 rounded-md border border-transparent px-1.5 py-1.5 text-sm",
          isSelected && "border-ring bg-muted/60",
          isDraggable && "cursor-grab hover:bg-muted/50",
        )}
        draggable={isDraggable}
        onDragStart={(event) => {
          if (!isDraggable) return;
          event.dataTransfer.setData(STORY_MAP_DRAG_TYPE, feature.id);
          event.dataTransfer.effectAllowed = "move";
        }}
        onClick={() => onSelect(feature.id)}
      >
        {isDraggable ? (
          <GripVertical
            className="h-4 w-4 shrink-0 text-muted-foreground"
            aria-hidden
          />
        ) : (
          <span
            className={cn(
              "ml-0.5 h-3 w-3 shrink-0 rounded-sm",
              PRIORITY_SWATCH_CLASSES[feature.priority],
            )}
            aria-hidden
          />
        )}
        <FlowTagSelect
          value={feature.flow}
          onChange={(flow) => onSetFlow(feature.id, flow)}
        />
        <span className="min-w-0 flex-1 truncate">{feature.title}</span>
        {feature.startDate ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 shrink-0 px-1.5 text-[10px]"
            onClick={(event) => {
              event.stopPropagation();
              onOpenDependencies(feature.id);
            }}
          >
            Dep{dependencyCount > 0 ? ` (${dependencyCount})` : ""}
          </Button>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 w-7 shrink-0 p-0"
          aria-label={`Remove ${feature.title}`}
          onClick={(event) => {
            event.stopPropagation();
            onRemove(feature.id);
          }}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </li>
  );
}
