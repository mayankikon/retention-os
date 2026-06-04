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

- Campaign list with columns: Name, Dealer, Time Zone, Status, Messages, Conversion Rate, **Created By**
- Filters: Dealership, Time Zone, Status
- Search by campaign name
- Pagination (10 per page)
- Status badges for all campaign statuses
- Data refresh indicator (hourly cadence)
- Empty states: no data, no search results, filtered zero

### Campaign setup (Phase 2)

- Five-step wizard at `/campaigns/new` (General → Messaging → Reminders → Configuration → Review)
- SOP-default SMS templates, timezone schedule reference table, test send and activate (mock)

## External boundaries

- **In scope later**: REST/GraphQL API replacing mock data (`docs/architecture/api-contracts.md`)
- **Out of scope**: Campaign analytics, reporting, user management, campaign detail UX (minimal stub route only)
