# ADR: Campaign list UX refinements

**Date:** 2026-05-18  
**Status:** Proposed (pending product sign-off)

Minor refinements beyond pure visual skinning. Business rules unchanged.

| Refinement | Rationale | Approval |
|------------|-----------|----------|
| **Created By** column shows avatar initials + full name | Accountability at a glance; aligns with SM2-25 | Assumed per ticket |
| Active filter chips below filter bar | Surfaces applied filters; one-click remove | Pending PO |
| Data refresh indicator in page header (right) | Matches reference layout; pairs with hourly cadence copy | Removed (built then reverted per stakeholder request) |
| Parent dealer group shown as secondary line under Dealer column (`getDealerGroup`) | Surfaces the group/company a dealership rolls up to without widening the table | Implemented |
| URL-bound filter state (`nuqs`) | Shareable/bookmarkable list views | Engineering default |
| Horizontal scroll on narrow viewports | Preserves all columns desktop-first | Pending PO (responsive) |
| `/campaigns/redlines` internal page | Engineering handoff without Figma dependency | Engineering |

## Rejected / deferred

- Changing filter dimensions or pagination size (stays 10/page per plan)
- Campaign detail page (stub only)
