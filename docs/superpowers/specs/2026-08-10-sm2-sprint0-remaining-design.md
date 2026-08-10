# SM2 Sprint 0 remaining prototype work

Date: 2026-08-10  
Tickets: SM2-75, SM2-126, SM2-57, SM2-56 (light)  
Out of scope this pass: SM2-55, SM2-59 (already in prototype), Jira updates, Figma-only ACs, template sets / rooftop activation, campaign start/end dates, SM2-57 live-control redesign

## Goal

Close the remaining prototype gaps for Sprint 0 design tickets in this repo only: Group + dealership multi-select on General, optional send time on Configuration, locked campaign status labels/filters, and a light Templates variable-parity check.

## Locked decisions

| Topic | Decision |
| --- | --- |
| Delivery | Prototype-only MVP |
| Product versions | Both POC V0.5 and MVP V1.0+ |
| List scope work | Build on existing `DealershipScopeBar` / group-dealer lookups |
| Message preview (multi-dealer) | Use first selected dealership name |
| Schedule | Keep SOP timezone table; add **optional** HH:mm send time |
| Start / end dates | Deferred (not in this pass) |
| Status (SM2-57) | Labels + badges + filters only; detail live controls deferred |
| Templates (SM2-56) | Light finish only; no sets / rooftop activation |
| Execution order | 75 → 126 → 57 → 56 |

## Status quo (verified)

- General: single Dealership + standalone Time Zone + SOP campaign-name hint
- Configuration: day chips + static SOP table; no send-time control
- Status model: `scheduled`, `active`, `paused`, `stopped`, `completed`, `draft`
- Templates: library + wizard exist; Messaging already has variable insert

## Requirements

### SM2-75 — General: Group + Dealership multi-select

1. Replace single Dealership control with **Group** select, then **Dealership** multi-select under that group.
2. Show **timezone per dealership** when known; missing-TZ fallback on that row only.
3. Remove standalone Dealership Time Zone field when TZ is known from dealership data.
4. Remove Campaign Name SOP helper text (changelog covers naming guidance).
5. Validation: at least one dealership required; dealers limited to selected group.
6. Preview sender / store name uses **first selected** dealership.
7. Draft stores group + dealership ids; primary timezone for schedule display is derived from the first selected dealership (or its fallback).

### SM2-126 — Configuration: optional send time

1. Keep day chips and the static SOP timezone reference table.
2. Add optional **Send Time** (HH:mm) with dealership timezone context from General.
3. Empty send time is valid (table remains guidance).
4. Persist `sendTimeLocal: string | null` on the setup draft.
5. Do not add start/end date controls in this pass.

### SM2-57 — Status labels and filters

1. Campaign statuses become: `draft`, `active`, `paused`, `completed`, `archived`.
2. Remove `scheduled` and `stopped` from types, badges, filters, and mocks.
3. Mock migration: `scheduled` → `draft`; `stopped` → `paused`.
4. Do not redesign detail Pause/Resume/Stop/Archive actions in this pass (may hide Stop if it only produced `stopped`).

### SM2-56 — Light Templates finish

1. Audit Templates create/edit wizard for variable/shortcode insert parity with Messaging.
2. Add insert UI only if missing; no template sets or rooftop activation flows.

## Data / interfaces

```ts
// Campaign setup draft (additive / evolving)
groupId: string;                 // selected group name/id
dealershipIds: string[];         // multi-select dealers in group
// timeZone remains as derived primary TZ for schedule display
sendTimeLocal: string | null;    // optional "HH:mm"

// CampaignStatus
type CampaignStatus =
  | "draft"
  | "active"
  | "paused"
  | "completed"
  | "archived";
```

Reuse `getDealerGroup`, `getDealersForGroup`, and dealer timezone lookups from `src/data/lookups.ts` (extend if TZ-by-dealer is missing).

## Testing

- Unit: General validation (group + ≥1 dealer); optional send time accepted empty or HH:mm; status filter options exclude scheduled/stopped; mock status migration.
- Manual: New Campaign General multi-select → Configuration optional time → Campaigns list status filter shows new set.

## Docs to update after code

- `docs/flows/campaign-setup.md` — General fields, optional send time
- `docs/architecture/overview.md` / list flow docs if status set or group targeting is documented there
