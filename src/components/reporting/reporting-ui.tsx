"use client";

import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ikontechnologies-arlington/nxtg-design-shiftpackage/primitives";
import { Download, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReportingEmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function ReportingEmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: ReportingEmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card px-6 py-16 text-center"
      role="status"
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Inbox className="h-6 w-6 text-muted-foreground" aria-hidden />
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      {actionLabel && onAction ? (
        <Button variant="outline" className="mt-6" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

interface ReportingExportButtonProps {
  onExport: () => void;
  disabled?: boolean;
}

export function ReportingExportButton({
  onExport,
  disabled = false,
}: ReportingExportButtonProps) {
  return (
    <Button
      variant="outline"
      size="lg"
      leadingIcon={<Download aria-hidden />}
      onClick={onExport}
      disabled={disabled}
    >
      Export CSV
    </Button>
  );
}

interface ReportingSelectProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onValueChange: (value: string) => void;
  className?: string;
}

export function ReportingSelect({
  label,
  value,
  options,
  onValueChange,
  className,
}: ReportingSelectProps) {
  return (
    <Select
      value={value}
      onValueChange={(next) => {
        if (next == null) return;
        onValueChange(next);
      }}
      items={options}
    >
      <SelectTrigger
        size="lg"
        aria-label={label}
        className={cn("control-hover-stroke", className)}
      >
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

interface ReportingSummaryCardProps {
  label: string;
  value: string;
  hint?: string;
}

export function ReportingSummaryCard({
  label,
  value,
  hint,
}: ReportingSummaryCardProps) {
  return (
    <div className="surface-stroke-sharp rounded-[var(--radius-sm)] bg-card px-4 py-4">
      <p className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-[28px] font-medium leading-none tracking-[-0.4px] text-foreground">
        {value}
      </p>
      {hint ? (
        <p className="mt-2 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

interface ReportingFieldLabelProps {
  htmlFor?: string;
  children: React.ReactNode;
}

export function ReportingFieldLabel({
  htmlFor,
  children,
}: ReportingFieldLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-xs font-medium text-muted-foreground"
    >
      {children}
    </label>
  );
}
