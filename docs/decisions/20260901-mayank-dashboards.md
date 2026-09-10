# ADR: Mayank's version Dashboards

Date: 2026-09-01

## Status

Accepted; availability amended by [20260903-dashboards-standard-reporting](20260903-dashboards-standard-reporting.md). Destination renamed to **Reports** (`/reports`) in [20260903-rename-dashboards-to-reports](20260903-rename-dashboards-to-reports.md). The layout, metrics, and copy decisions below still stand.

## Context

Robert's version splits reporting into Leaderboard, Weekly CER, and Activity Detail. Mayank's version should present the same mock facts in one **Dashboards** destination: portfolio KPIs, a dealership ranking table, a weekly/monthly performance toggle, and a drill-down page for the customers behind a dealership.

## Decision

- Add a **Dashboards** nav item on **Post MVP V1.1 / Mayank's version** only (`/dashboards`).
- Do not use Leaderboard, Weekly CER, Activity Detail, Rooftop, or Smart Service Lead copy on this slice.
- Top of `/dashboards`: four horizontal KPIs — Messages sent, Total clicks, Uplift, CER %.
- Top-right: **Weekly** / **Monthly** toggle plus Export CSV. Toggle labels are uppercase; idle black, selected green.
- Weekly mode reuses Robert’s weekly CER weeks as Initial / Reminder 1–3 performance tables.
- Table columns: Rank, Dealership, Group, Messages, First message, Retried, Clicks, First-time, CER %.
  - "First message" is the Initial send volume (speech "friend message").
  - "Retried" is retry volume (speech "retired").
  - CER % is the click engagement rate (speech "NCR" / "CR").
- Monthly mode ranks dealerships from the existing MTD rooftop metrics.
- Weekly mode shows the same week metrics Robert has (Messages Sent, Clicks, CER % by message type). Superseded by [20260903-cumulative-weekly-performance](20260903-cumulative-weekly-performance.md): one card whose sections are weeks, cumulative across the dealers in scope.
- Filters: Group (All Groups) and Dealer (All Dealers) use the same unlabeled scope selects as Campaigns. Changing group resets a dealer that is not in that group.
- Paginate weekly cards and monthly rows with the same Shift paginator as Campaigns. Do not use a View all activity link.
- Activity uses `ACTIVITY_DETAIL_ROWS`. Every dealership has at least 10 customer click rows. `/dashboards/activity` shows the full set; a dealership filter or row click scopes it.

## Consequences

- Dashboards reads `src/data/reporting.mock.ts` until reporting APIs exist.
