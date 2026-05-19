# API contracts (placeholder)

Phase 1 uses mock data. The list view is structured for a future `GET /campaigns` endpoint.

## Planned: List campaigns

**`GET /campaigns`**

Query parameters (mirror URL state):

| Param | Type | Description |
|-------|------|-------------|
| `q` | string | Search by campaign name |
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

**Campaign object** — see `src/types/campaign.ts` (`createdBy` includes `id`, `name`, `initials`; `createdAt` ISO timestamp).

**POST /campaigns** (proposed) — create from setup wizard; `createdBy` and `createdAt` set server-side from session.

## Data refresh

Global indicator values may come from a separate `GET /campaigns/sync-status` or be embedded in the list response.
