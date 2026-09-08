# ADR: Rename Dashboards to Reports

Date: 2026-09-03

## Status

Accepted. Amends [20260903-dashboards-standard-reporting](20260903-dashboards-standard-reporting.md), [20260901-mayank-dashboards](20260901-mayank-dashboards.md), and [20260903-cumulative-weekly-performance](20260903-cumulative-weekly-performance.md).

## Context

The portfolio performance surface shipped as **Dashboards** after Mayank's slice won over Robert's `/reporting` screens. The product name for that destination is now **Reports**.

`src/lib/reporting.ts`, `src/types/reporting.ts`, and `src/components/reporting/` stay as the shared CER math and UI kit. The product surface uses the shorter **reports** name so the two layers do not collide.

## Decision

- Nav label is **Reports**. Route is `/reports` (activity at `/reports/activity`).
- App, components, types, and helpers follow the same name: `src/app/reports/`, `src/components/reports/`, `src/lib/reports.ts`, `src/types/reports.ts`.
- Permanently redirect `/dashboards/:path*` to `/reports/:path*` so bookmarks and old links still land.

## Consequences

- Historical ADRs keep their original Dashboards wording; this record is the rename.
- CSV downloads use `reports-*.csv` filenames.
- Shared `reporting` modules are unchanged.
