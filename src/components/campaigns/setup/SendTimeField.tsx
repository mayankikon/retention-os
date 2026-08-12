"use client";

import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ikontechnologies-arlington/nxtg-design-shiftpackage/primitives";

import { useEffect, useState } from "react";
import {
  getSendTimeHourOptions,
  getSendTimeMinuteOptions,
  parseSendTimeLocal,
  SEND_TIME_MERIDIEMS,
  toSendTimeLocal,
  type SendTimeMeridiem,
} from "@/lib/send-time";

interface SendTimeFieldProps {
  /** Stored 24-hour `HH:mm` value, or null when no send time is set. */
  value: string | null;
  onChange: (value: string | null) => void;
  /** Id applied to the hour select so an external label can point at it. */
  id?: string;
  /** Prefix for the select accessible names, e.g. "Send hour" or "Start hour". */
  timeLabel?: string;
  hasError?: boolean;
}

interface SendTimeSelection {
  hour: string;
  minute: string;
  meridiem: string;
}

const EMPTY_SELECTION: SendTimeSelection = {
  hour: "",
  minute: "",
  meridiem: "",
};

const HOUR_OPTIONS = getSendTimeHourOptions();

const MERIDIEM_OPTIONS = SEND_TIME_MERIDIEMS.map((meridiem) => ({
  value: meridiem,
  label: meridiem,
}));

function toSelection(value: string | null): SendTimeSelection {
  const parts = parseSendTimeLocal(value);
  if (!parts) return EMPTY_SELECTION;

  return {
    hour: String(parts.hour12),
    minute: String(parts.minute),
    meridiem: parts.meridiem,
  };
}

export function SendTimeField({
  value,
  onChange,
  id = "sendTimeLocal",
  timeLabel = "Send",
  hasError,
}: SendTimeFieldProps) {
  const [selection, setSelection] = useState<SendTimeSelection>(() =>
    toSelection(value),
  );

  // Re-sync when the stored time changes outside this control (draft reset).
  useEffect(() => {
    setSelection(toSelection(value));
  }, [value]);

  const minuteOptions = getSendTimeMinuteOptions(
    selection.minute ? Number.parseInt(selection.minute, 10) : undefined,
  );

  const applySelection = (patch: Partial<SendTimeSelection>) => {
    // Choosing an hour first fills the rest so a single pick is already valid.
    const next: SendTimeSelection = {
      ...selection,
      ...patch,
      minute: patch.minute ?? (selection.minute || "0"),
      meridiem: patch.meridiem ?? (selection.meridiem || "PM"),
    };

    setSelection(next);

    if (!next.hour) {
      onChange(null);
      return;
    }

    onChange(
      toSendTimeLocal({
        hour12: Number.parseInt(next.hour, 10),
        minute: Number.parseInt(next.minute, 10),
        meridiem: next.meridiem as SendTimeMeridiem,
      }),
    );
  };

  const handleClear = () => {
    setSelection(EMPTY_SELECTION);
    onChange(null);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={selection.hour || null}
        onValueChange={(next) => {
          if (next == null) return;
          applySelection({ hour: next });
        }}
        items={HOUR_OPTIONS}
      >
        <SelectTrigger
          id={id}
          aria-label={`${timeLabel} hour`}
          aria-invalid={hasError}
          className="w-[5.5rem]"
        >
          <SelectValue placeholder="Hour" />
        </SelectTrigger>
        <SelectContent>
          {HOUR_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <span aria-hidden className="text-sm text-muted-foreground">
        :
      </span>

      <Select
        value={selection.minute || null}
        onValueChange={(next) => {
          if (next == null) return;
          applySelection({ minute: next });
        }}
        items={minuteOptions}
      >
        <SelectTrigger
          aria-label={`${timeLabel} minutes`}
          aria-invalid={hasError}
          className="w-[5.5rem]"
        >
          <SelectValue placeholder="Min" />
        </SelectTrigger>
        <SelectContent>
          {minuteOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={selection.meridiem || null}
        onValueChange={(next) => {
          if (next == null) return;
          applySelection({ meridiem: next });
        }}
        items={MERIDIEM_OPTIONS}
      >
        <SelectTrigger
          aria-label={`${timeLabel} AM or PM`}
          aria-invalid={hasError}
          className="w-[6.75rem]"
        >
          <SelectValue placeholder="AM/PM" />
        </SelectTrigger>
        <SelectContent>
          {MERIDIEM_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {value ? (
        <Button type="button" variant="ghost" size="sm" onClick={handleClear}>
          Clear
        </Button>
      ) : null}
    </div>
  );
}
