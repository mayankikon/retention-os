"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActiveFilterChipProps {
  label: string;
  onRemove: () => void;
  className?: string;
}

/** Removable filter chip — matches new-toolbox `FiltersPanelActiveChipsBar`. */
export function ActiveFilterChip({
  label,
  onRemove,
  className,
}: ActiveFilterChipProps) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className={cn(
        "inline-flex max-w-full items-center gap-1 rounded-sm border border-border bg-muted/30 px-2 py-1 text-xs font-medium text-foreground transition-[border-color] hover:border-input-hover hover:bg-muted/30",
        className,
      )}
    >
      <span className="truncate">{label}</span>
      <X className="size-3 shrink-0 text-muted-foreground" aria-hidden />
      <span className="sr-only">Remove {label}</span>
    </button>
  );
}

interface ActiveFilterChipsBarProps {
  children: React.ReactNode;
  onClearAll?: () => void;
  className?: string;
}

export function ActiveFilterChipsBar({
  children,
  onClearAll,
  className,
}: ActiveFilterChipsBarProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {children}
      {onClearAll ? (
        <button
          type="button"
          onClick={onClearAll}
          className="px-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Clear All
        </button>
      ) : null}
    </div>
  );
}
