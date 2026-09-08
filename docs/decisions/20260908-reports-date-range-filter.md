# ADR: Reports date range filter drives monthly mode

Date: 2026-09-08

## Status

Accepted. Extends [ADR: Weekly performance sections are weeks, not dealer cards](20260903-cumulative-weekly-performance.md), which set the monthly/weekly split this filter respects.

## Context

`/reports` could only report the month-to-date bucket. Monthly rows read `ReportingRooftop.metricsByPeriod`, which holds three fixed buckets — `mtd`, `lm`, `ytd` — so there was no way to ask for "last 7 days" or an arbitrary window, and Uplift was hardwired to compare `mtd` against `lm`.

Two constraints shaped the design. Mock rooftops carry period totals rather than daily rows, so arbitrary ranges have no data to sum. And weekly mode reports whole calendar weeks, so a day-level range has no meaning there.

## Decision

- The range is an inclusive pair of local ISO `YYYY-MM-DD` days (`ReportDateRange`), held in the `from`/`to` query params so a filtered report is shareable. `normalizeReportDateRange` falls back to the default for anything unparseable or reversed, since query params are user-editable.
- Presets are resolved against a `today` argument rather than reading the clock inside the helpers, keeping `src/lib/report-date-range.ts` pure and testable. `ReportView` reads the clock once and passes the value down, so "this month" always means the real current month rather than a date baked into the mock.
- `sumRooftopMetricsInRange` spreads each period bucket evenly over the days it covers: `mtd` over the current month to date, `lm` over the previous calendar month, and the `ytd` remainder over January 1 through the end of the month before last. A range matching a bucket therefore returns that bucket exactly, and every other range interpolates. Days outside the covered year report zero.
- Uplift compares the range against the equally long window immediately before it, replacing the fixed `mtd` vs `lm` comparison. `rankReportDealerships` takes `dateRange`/`today` instead of `monthlyPeriod`.
- Monthly rows with zero messages in range are dropped, so an empty window reaches the existing empty state instead of listing every rooftop at zero.
- The filter is disabled in weekly mode and keeps its selection for the return to monthly.
- `ReportDateRangeFilter` composes the Shift `Popover` and `Calendar` primitives rather than using the package's prebuilt `DateRangePicker`. That component renders its trigger as fixed-width `dd / mm / yyyy` segments, which overflowed the filter row and contradicted the `en-US` `Sep 8, 2026` convention the rest of the app uses. The composed trigger reads `This month · Sep 1 – 8, 2026`, naming the matched preset and sizing to its text. Composing also allows closing on selection and disabling future days, neither of which the prebuilt component exposes.
- Presets use a Monday-first week so "Last week" agrees with the design system calendar, which sets `weekStartsOn: 1`.

## Consequences

- Any range can be reported without adding daily mock rows, but figures between bucket boundaries are interpolations, not recorded numbers. Real daily data would replace `listRooftopPeriodSegments` and leave the rest of the pipeline intact.
- `CerTimePeriod` no longer reaches `rankReportDealerships`; the bucket names survive only inside `sumRooftopMetricsInRange`.
- The preset sidebar and trigger are app-owned, so a future Shift `DateRangePicker` that supports locale formatting and a custom trigger would let `ReportDateRangeFilter` collapse back onto the package component. The calendar itself is already the package's, so day styling still tracks the design system.
