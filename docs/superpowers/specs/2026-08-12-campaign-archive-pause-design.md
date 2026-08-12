# Campaign archive, pause, and resume

## Goal

Let operators stop a live campaign (pause/resume) and permanently put away finished or live campaigns (archive) from the campaign detail header. Archived campaigns stay out of the default list until the status filter is set to Archived.

## Status model (unchanged)

`draft` · `active` · `paused` · `completed` · `archived`

## Transitions

| From | Action | To | Confirm? |
|------|--------|-----|----------|
| active | Pause | paused | No |
| paused | Resume | active | No |
| active / paused / completed | Archive | archived | Yes (destructive, irreversible) |
| archived | — | terminal | No restore in this pass |

Draft cannot be archived from detail actions (finish or discard via setup flows instead).

## UI

- **Where:** Campaign detail `TitleBar` actions only (not list row actions).
- **Buttons:** Pause (active), Resume (paused), Archive (active / paused / completed).
- **Confirm copy:** Archive stops sending and cannot be undone.
- **After archive:** Persist status via existing local campaign store, set list flash, redirect to `/campaigns`.

## List visibility

- Status filter `All` (default): **exclude** `archived` rows.
- Status filter `archived`: show only archived campaigns.
- Other status filters: unchanged (archived never appears unless filter is `archived`).

## Persistence

Mock / localStorage only (`updateCampaignStatus` + existing overrides), same as Pause/Resume today. No backend API in this pass.

## Out of scope

- Restore / unarchive
- List-row archive actions
- Real send-pipeline halt (POC assumes status change is enough)
- Changelog redesign beyond status reflection already derived from current status
