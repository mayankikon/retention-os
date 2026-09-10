"use client";

import { useMemo, useState } from "react";
import {
  Calendar,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@ikontechnologies-arlington/nxtg-design-shiftpackage/primitives";
import { subMonths } from "date-fns";
import { CalendarDays, ChevronDown } from "lucide-react";
import type { DateRange } from "react-day-picker";
import {
  formatReportDateRange,
  listReportDatePresets,
  matchReportDatePreset,
  parseIsoDate,
  REPORT_DATE_PRESET_LABELS,
  toIsoDate,
} from "@/lib/report-date-range";
import { cn } from "@/lib/utils";
import type { ReportDateRange } from "@/types/reports";

interface ReportDateRangeFilterProps {
  value: ReportDateRange;
  /** Today as ISO `YYYY-MM-DD`; anchors every relative preset. */
  today: string;
  disabled?: boolean;
  onValueChange: (range: ReportDateRange) => void;
  className?: string;
}

export function ReportDateRangeFilter({
  value,
  today,
  disabled = false,
  onValueChange,
  className,
}: ReportDateRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  // Set while the calendar waits for the second click of a new range.
  const [pendingStartDate, setPendingStartDate] = useState<Date | null>(null);

  const presets = useMemo(() => listReportDatePresets(today), [today]);
  const selectedPresetId = matchReportDatePreset(value, today);
  const selectedRange = useMemo(() => toCalendarRange(value), [value]);
  const calendarRange: DateRange = pendingStartDate
    ? { from: pendingStartDate, to: undefined }
    : selectedRange;

  // Two months are visible, so leading with the month before the range end
  // keeps the selection in view instead of showing an empty future month.
  const firstVisibleMonth = selectedRange.to
    ? subMonths(selectedRange.to, 1)
    : selectedRange.from;

  const commitRange = (range: ReportDateRange) => {
    setPendingStartDate(null);
    setIsOpen(false);
    onValueChange(range);
  };

  const handleDayClick = (day: Date) => {
    if (!pendingStartDate) {
      setPendingStartDate(day);
      return;
    }
    const isBackwards = day < pendingStartDate;
    commitRange({
      startDate: toIsoDate(isBackwards ? day : pendingStartDate),
      endDate: toIsoDate(isBackwards ? pendingStartDate : day),
    });
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) setPendingStartDate(null);
    setIsOpen(nextOpen);
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        render={
          <button
            type="button"
            disabled={disabled}
            aria-label={`Date range: ${formatReportDateRange(value)}`}
            title={
              disabled
                ? "Date range applies to custom performance"
                : undefined
            }
            className={cn(
              "flex h-[calc(2.25rem+8px)] w-[17.5rem] shrink-0 cursor-pointer items-center gap-2 rounded-[var(--radius-sm)]",
              "border border-border bg-white px-3 text-sm transition-colors dark:bg-sidebar",
              "hover:border-input-hover hover:bg-[var(--theme-background-input-hover)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isOpen && "border-input-hover",
              disabled &&
                "pointer-events-none border-border bg-muted text-muted-foreground hover:bg-muted",
              className,
            )}
          >
            <CalendarDays
              className="size-4 shrink-0 text-muted-foreground"
              aria-hidden
            />
            <span className="min-w-0 flex-1 truncate text-left">
              <span className="font-medium text-foreground">
                {selectedPresetId
                  ? REPORT_DATE_PRESET_LABELS[selectedPresetId]
                  : "Custom"}
              </span>
              <span className="text-muted-foreground">
                {" · "}
                {formatReportDateRange(value)}
              </span>
            </span>
            <ChevronDown
              className="size-4 shrink-0 text-muted-foreground"
              aria-hidden
            />
          </button>
        }
      />
      <PopoverContent
        align="end"
        sideOffset={4}
        className="w-auto gap-0 overflow-clip p-0"
      >
        <div className="flex items-stretch">
          <div
            role="group"
            aria-label="Date range presets"
            className="flex w-[152px] shrink-0 flex-col gap-0.5 border-r border-border p-2"
          >
            {presets.map((preset) => {
              const isSelected = preset.id === selectedPresetId;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => commitRange(preset.range)}
                  aria-pressed={isSelected}
                  className={cn(
                    "cursor-pointer rounded-xs px-2 py-1 text-left text-sm font-medium transition-colors",
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
          <Calendar
            mode="range"
            selected={calendarRange}
            onDayClick={handleDayClick}
            numberOfMonths={2}
            defaultMonth={firstVisibleMonth}
            disabled={{ after: parseIsoDate(today) ?? new Date() }}
            className="w-auto"
            classNames={{
              months: "flex gap-0",
              month:
                "flex h-[304px] w-[250px] flex-col overflow-clip first:border-r first:border-border",
              // Shift paints today as a red circle; this filter does not need that marker.
              today: "",
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

function toCalendarRange(range: ReportDateRange): DateRange {
  return {
    from: parseIsoDate(range.startDate) ?? undefined,
    to: parseIsoDate(range.endDate) ?? undefined,
  };
}
