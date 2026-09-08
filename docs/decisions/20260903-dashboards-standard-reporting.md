# ADR: Dashboards is the standard reporting surface

Date: 2026-09-03

## Status

Accepted. Renamed to **Reports** (`/reports`) by [20260903-rename-dashboards-to-reports](20260903-rename-dashboards-to-reports.md). Supersedes [20260831-mvp-reporting-ia](20260831-mvp-reporting-ia.md) and amends [20260901-mayank-dashboards](20260901-mayank-dashboards.md) and [20260720-product-version-switcher](20260720-product-version-switcher.md).

## Context

Reporting shipped as two competing slices behind a sidebar **Reporting functionality** dropdown: Robert's version (Leaderboard, Weekly CER, Activity Detail at `/reporting*`) and Mayank's version (Dashboards at `/dashboards*`). Both were gated to Post MVP V1.1, so MVP V1.0 had no reporting at all.

Dashboards won the comparison. Keeping the loser meant maintaining two IA slices over one mock dataset, and keeping the dropdown meant demoing reporting required setting two controls instead of one.

## Decision

- Remove Robert's version entirely: the `/reporting`, `/reporting/weekly`, and `/reporting/activity` routes, their views (`CerLeaderboardView`, `WeeklyCerView`, `ActivityDetailView`), the reporting tab shell, and the **Reporting** nav item.
- Remove the **Reporting functionality** dropdown and the whole reporting-mode concept: `ReportingModeId`, its option list, the `retention-os-reporting-mode` storage key, and the `reportingModeId` value on the product-version context. The sidebar footer now holds only the **Version** dropdown.
- Ship **Dashboards** in every product version, including **MVP V1.0** and **Post MVP V1.1**. Reporting is no longer a version-gated capability, so `/dashboards` has no route gate and the nav list is no longer filtered by version.
- Keep the shared modules Dashboards depends on: `src/components/reporting/reporting-ui.tsx` (cards, selects, empty states), `src/lib/reporting.ts` (CER math, CSV helpers), and `src/data/reporting.mock.ts`.

## Consequences

- `getSmartMarketingNavItems()` and both route gates (`ReportingVersionGate`, `DashboardVersionGate`) are gone; `AppShell` renders `SMART_MARKETING_NAV_ITEMS` directly.
- `src/lib/product-version.ts` now gates only delivery channels and messaging templates.
- `/reporting*` returns 404. Nothing links to it, and no redirect was added because the two IAs do not map route-for-route.
- A stored `retention-os-reporting-mode` value from an earlier session is ignored and harmless; nothing reads that key.
- `src/lib/reporting.ts` retains leaderboard and activity helpers that only its own unit tests exercise now. They stay because Dashboards shares the module and the reporting API will need the same math.
