# ADR: Weekly performance sections are weeks, not dealer cards

Date: 2026-09-03

## Status

Accepted. Destination renamed to **Reports** in [20260903-rename-dashboards-to-reports](20260903-rename-dashboards-to-reports.md).

Amends [ADR: Mayank's version Dashboards](20260901-mayank-dashboards.md), which stacked one weekly card per dealer week.

## Context

The first weekly stack rendered one card per `WEEKLY_CER_WEEKS` record. Because each record is a dealer week, every card repeated the "Weekly performance" heading, a dealer name, and a full column header row — three lines of chrome per card carrying one line of new information. The stack also read as a list of dealers rather than a list of weeks, and the mock only held one dealer per week, so a group or portfolio scope could not show a combined number.

## Decision

- Weekly mode renders a **single card**. Its sections are weeks, sorted newest first.
- The card states its scope **once**, under the heading:
  - a selected dealership shows its name as a link to `/reports/activity`;
  - a selected group or the whole portfolio shows `<name> — cumulative (N rooftops)`, where N counts the dealerships that actually reported in the visible weeks.
- Each week section sums every dealer in scope per message type, and adds a **Total** column across Initial / Reminder 1–3. `CER %` is recomputed from summed sends and clicks rather than averaged across dealers.
- A week whose coverage is smaller than the scope notes `N rooftops reporting` on its section row, so partial weeks are not mistaken for a drop in volume.
- `WEEKLY_CER_WEEKS` keeps one record per dealer per week, and week records that belong to the same week share an `id`.
- Weekly ranking sums a dealership's visible weeks into one row, so a dealership that reports several weeks is ranked once.
- The weekly paginator pages week sections; the weekly CSV export has one row per week and metric, with a Scope column and a Total column.

## Consequences

- Weekly chrome drops from three repeated lines per dealer week to one section row per week.
- Group and portfolio scopes now show real cumulative weekly totals, which the previous single-dealer-per-week mock could not express.
- `aggregateReportWeeks` and `describeReportWeeklyScope` in `src/lib/reports.ts` are the only places that collapse weeks; `ReportWeeklyPerformance` stays presentational.
- Per-dealer weekly detail is no longer broken out on `/reports`; selecting a single dealer in the Dealer filter scopes the card to that dealership, and activity drill-down stays a click away from the scope line and the monthly ranking.
