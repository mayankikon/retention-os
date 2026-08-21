# Smart Marketing Campaign Manager — Overview

## Purpose

Web UI for Ikon's Smart Marketing Campaign Manager. Phase 1 delivers the **Campaign Summary / List View**. Phase 2 delivers the **Campaign Setup** multi-step wizard mapped to the SOP (mock activate/test until API is wired).

## Runtime dependencies

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS v4, Shift design system (`@ikontechnologies-arlington/nxtg-design-shiftpackage`) — primitives + `Sidebar` / `AppGroovedMainColumn` chrome; light theme tokens aligned with new-toolbox workspace |
| Table | Shift file-cabinet table (`TableHeaderCell` + `TableSlotCell`, 16px cell insets) |
| URL state | nuqs |
| Data (current) | In-memory mock (`src/data/campaigns.mock.ts`) |

## Domain capabilities

### Campaign list (Phase 1)

- Campaign list with columns: Name, Dealership, Time Zone, Status, Messages, Click-Through Rate, **Created By**
- Filters: Time Zone, Status; primary dealership scope bar with Group + Dealer
- Search by campaign name
- Pagination (10 per page)
- Status badges: draft, active, paused, completed, archived
- Detail actions: live copy-only Edit (active / paused), Pause (active), Resume (paused), Archive (active / paused / completed) with confirm; archive is terminal
- Live copy edit at `/campaigns/[id]/copy`: initial and enabled reminder bodies only; variables and all campaign configuration stay locked; saving preserves status and applies only to future eligible sends
- Default list excludes archived rows; set Status filter to Archived to view them
- Data refresh indicator (hourly cadence)
- Empty states: no data, no search results, filtered zero
- Success banner after activate / schedule / save draft / archive

### Campaign setup (Phase 2)

- Five-step wizard at `/campaigns/new` (General → Messaging → Reminders → Configuration → Review)
- Draft resume/edit at `/campaigns/[id]/edit` — detail CTAs Continue setup / Edit / Review & activate; Save Draft updates in place with full `setupDraft`
- General: Group → multi-select Dealerships with per-dealer timezone (fallback when unknown)
- Configuration: Time+Mileage or OEM trigger, each with nested audience query; campaign duration (required start date, optional end date); schedule days; required send time plus a timezone table that recomputes each zone's manager time from the selected send time
- Review: audience reach card; Activate / Save Draft; timing comes from Configuration start/end dates and send time; Audience suppression hidden on MVP V1.0
- Activate always moves Draft → Active. A future start date gates sends without adding a Scheduled status. Edit-mode Save Draft returns to campaign detail.
- New Campaign Setup leave guard uses unfinished-draft language with Keep editing, Discard draft, and Save draft actions.
- SOP-default SMS templates, timezone schedule reference table, test send (mock)

### Product versions

- Sidebar **Version** switcher (bottom of left nav) with selectable **MVP V1.0** and **Post MVP V1.1**
- Post-MVP versions (**V1.2**, **V1.3**, **V1.4**) are listed but disabled for now
- **MVP V1.0** gates: SMS only (no email channel); Oil Change Campaign template only in campaign setup
- Version preference persists in `localStorage` (`retention-os-product-version`); schema v2 remaps legacy POC/MVP ids

### Templates

- Top-level **Templates** nav (`/templates`) available in all product versions
- Create/edit via multi-step wizard; Draft / Published / Archived statuses
- Detail shows content, campaigns using the template, and audit history
- Published templates populate campaign Messaging (plus Custom); MVP V1.0 setup still Oil Change–only
- Persistence: `localStorage` (`retention-os-message-templates-v2`) seeded with system templates

### Product boundary

- Smart Marketing navigation contains Campaigns and Templates only.
- Account administration belongs to the Toolbox Web host; Smart Marketing does not expose an `/accounts` route.

## External boundaries

- **In scope later**: REST/GraphQL API replacing mock data (`docs/architecture/api-contracts.md`)
- **Out of scope**: Campaign analytics backend, reporting dashboards, user management
