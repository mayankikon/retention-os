"use client";

import { cn } from "@/lib/utils";

interface ReportToggleOption<T extends string> {
  id: T;
  label: string;
}

interface ReportToggleGroupProps<T extends string> {
  label: string;
  value: T;
  options: ReportToggleOption<T>[];
  onValueChange: (value: T) => void;
}

export function ReportToggleGroup<T extends string>({
  label,
  value,
  options,
  onValueChange,
}: ReportToggleGroupProps<T>) {
  return (
    <div
      className="inline-flex rounded-[var(--radius-sm)] border border-border bg-card p-1"
      role="group"
      aria-label={label}
    >
      {options.map((option) => {
        const isActive = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onValueChange(option.id)}
            className={cn(
              "cursor-pointer rounded-[6px] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.02em] transition-colors",
              isActive
                ? "bg-emerald-600 text-white"
                : "text-foreground hover:bg-muted",
            )}
            aria-pressed={isActive}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
