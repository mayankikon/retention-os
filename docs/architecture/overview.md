# Smart Marketing Campaign Manager — Overview

## Purpose

Web UI for Ikon's Smart Marketing Campaign Manager. Phase 1 delivers the **Campaign Summary / List View**. Phase 2 delivers the **Campaign Setup** multi-step wizard mapped to the SOP (mock activate/test until API is wired).

## Runtime dependencies

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS v4, Shadcn-style primitives |
| Table | TanStack Table v8 |
| URL state | nuqs |
| Data (current) | In-memory mock (`src/data/campaigns.mock.ts`) |

## Domain capabilities

### Campaign list (Phase 1)

- Campaign list with columns: Name, Dealer, Time Zone, Status, Messages, Click-Through Rate, **Created By**
- Filters: Dealership, Time Zone, Status
- Search by campaign name
- Pagination (10 per page)
- Status badges: scheduled, active, paused, stopped, completed, draft
- Detail actions: Pause / Resume / Stop
- Data refresh indicator (hourly cadence)
- Empty states: no data, no search results, filtered zero
- Success banner after activate / schedule / save draft

### Campaign setup (Phase 2)

- Five-step wizard at `/campaigns/new` (General → Messaging → Reminders → Configuration → Review)
- Configuration: Time+Mileage or OEM trigger, each with nested audience query; schedule days
- Review: audience reach card; Activate now / Schedule / Save draft (draft only on this step); leave-guard modal when navigating away mid-setup; Audience suppression hidden on POC V0.5
- After activate/schedule/draft: success banner on `/campaigns` list
- SOP-default SMS templates, timezone schedule reference table, test send (mock)

### Product versions

- Sidebar **Version** switcher (bottom of left nav) with selectable **POC V0.5** and **MVP V1.0**
- Post-MVP versions (**V1.1**, **V1.2**, **V1.4**) are listed but disabled for now
- **POC V0.5** gates: SMS only (no email channel); Oil Change Campaign template only in campaign setup
- Version preference persists in `localStorage` (`retention-os-product-version`)

### Templates

- Top-level **Templates** nav (`/templates`) available in all product versions
- Create/edit via multi-step wizard; Draft / Published / Archived statuses
- Detail shows content, campaigns using the template, and audit history
- Published templates populate campaign Messaging (plus Custom); POC setup still Oil Change–only
- Persistence: `localStorage` (`retention-os-message-templates`) seeded with system templates

## External boundaries

- **In scope later**: REST/GraphQL API replacing mock data (`docs/architecture/api-contracts.md`)
- **Out of scope**: Campaign analytics backend, reporting dashboards, user management
