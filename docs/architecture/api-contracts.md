# API contracts (placeholder)

Phase 1 uses mock data. The list view is structured for a future `GET /campaigns` endpoint.

## Planned: List campaigns

**`GET /campaigns`**

Query parameters (mirror URL state):

| Param | Type | Description |
|-------|------|-------------|
| `q` | string | Search by campaign name |
| `group` | string | Dealer group filter (`all` = no filter); cascades dealer options |
| `dealer` | string | Dealership filter (`all` = no filter) |
| `timeZone` | string | `CST` \| `EST` \| `PST` \| `MST` \| `all` |
| `status` | string | Campaign status \| `all` |
| `page` | integer | 1-based page index |
| `pageSize` | integer | Default 10 |

**Response (proposed)**

```json
{
  "items": [/* Campaign[] */],
  "total": 30,
  "page": 1,
  "pageSize": 10,
  "totalPages": 3,
  "dataRefresh": {
    "lastUpdatedAt": "ISO-8601",
    "nextUpdateAt": "ISO-8601",
    "cadenceLabel": "Data is updated every hour"
  }
}
```

**Campaign object** — see `src/types/campaign.ts` (`createdBy` includes `id`, `name`, `initials`; `createdAt` ISO timestamp; `clickThroughRate` percentage 0–100 for list display; statuses: draft, active, paused, completed, archived; optional `startsAt` / `endsAt` ISO instants for the campaign run window collected on the Configuration step; `scheduledActivateAt` is a legacy prototype field and must not drive a new Schedule flow; `dealer` is the primary/first dealership, optional `dealers` lists every selected dealership for multi-dealer campaigns; optional `setupDraft` holds the full wizard payload for draft resume/edit; optional `liveCopy` and `copyUpdatedAt` represent the latest live message-body edit).

**POST /campaigns** (proposed) — create from setup wizard; `createdBy` and `createdAt` set server-side from session.

**PATCH /campaigns/:id** (proposed) — update draft setup in place (same id); accept setup fields / `setupDraft`; bump `updatedAt` / `lastUpdatedAt`. Not implemented in POC (local store `updateCampaignFromDraft` + upsert).

**PATCH /campaigns/:id/copy** (proposed) — update body copy for an `active` or `paused` campaign only.

```json
{
  "initialMessage": "Hi [@FN@], your [@MOD@] is due for service.",
  "reminders": [
    {
      "id": "reminder1",
      "body": "A quick reminder for [@FN@] about [@MOD@]."
    }
  ]
}
```

The server must reject changes to the personalization-variable sequence, campaign status, targeting, timing, links, or reminder structure. Success preserves the current status, updates `copyUpdatedAt` / `lastUpdatedAt`, emits an `updated` changelog event, and applies only to new or not-yet-sent recipients. It must not resend completed steps or bypass consent, STOP, quiet-hours, or suppression controls.

## Planned: Get campaign detail

**`GET /campaigns/:id`**

Returns a single `Campaign` object (see `src/types/campaign.ts`) plus derived analytics:

| Field | Type | Description |
|-------|------|-------------|
| `recipientsSent` | integer | Customers the campaign was sent to |
| `openedCount` | integer | Messages opened |
| `clickedCount` | integer | Link clicks |
| `revenueGenerated` | number | Estimated attributed revenue (USD) |

Phase 1 derives analytics client-side via `getCampaignAnalytics()` from mock/list fields.

## Planned: Campaign changelog

**`GET /campaigns/:id/changelog`**

Returns `CampaignChangelogEntry[]` — see `src/types/campaign-detail.ts` (`timestamp`, `actor`, `action`, `summary`, optional `details`). Phase 1 builds mock changelog from campaign lifecycle in `buildCampaignChangelog()`.

## Planned: Reporting

Phase 1 uses mock data in `src/data/reporting.mock.ts`. Screens are structured for future reporting endpoints.

**`GET /reporting/leaderboard`**

Query: `period=mtd|lm|ytd`, `q`, `scope=portfolio|ungrouped`

Response: ranked rooftop rows (`rank`, `rooftop`, `dealerGroup`, `sent`, `retried`, `clickedFirstTime`, `cerPercent`, `isLowSample`). Server must omit single-rooftop groups and apply the min-sent sample guardrail (`MIN_CER_SAMPLE_SENT = 50`).

**`GET /reporting/weekly-cer`**

Query: `year`, `month`, `dealer`

Response: weekly performance cards with Initial / Reminder 1–3 sent, clicks, and CER%.

**`GET /reporting/activity`**

Query: `dateFrom`, `dateTo`, `dealer`, `rooftop`

Response: summary cards (`messagesSent`, `totalClicks`, `upliftPercent`, `cerPercent`) plus customer rows including `mileage` (null when unknown).

CSV export is currently client-side from the filtered mock set.

## Data refresh

Global indicator values may come from a separate `GET /campaigns/sync-status` or be embedded in the list response.
