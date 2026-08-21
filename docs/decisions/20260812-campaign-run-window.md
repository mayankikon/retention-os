# ADR: Campaign run window on the Configuration step

**Date:** 2026-08-12  
**Status:** Superseded in part by `20260814-campaign-window-and-review-requirements.md` and `20260821-live-copy-and-activation-actions.md`

## Context

Campaign setup described *when in the week* a campaign sends (`scheduleDays`, optional `sendTimeLocal`) but never *how long it runs*. The only date on a campaign was `scheduledActivateAt`, which answers a different question — when a draft flips to active. Operators had no way to say "run this promotion until the end of September", so nothing bounded a live campaign.

## Decision

Add a campaign run window to the Configuration step (step 4 of the wizard):

- Originally: `campaignEndDate` required; `campaignStartDate` / `campaignStartTimeLocal` optional.
- Current rules (see `20260814-campaign-window-and-review-requirements.md`): start date and send time required; end date optional; start time removed.
- Resolution to instants lives in `src/lib/campaign-window.ts` (`resolveCampaignWindow`) and runs at creation time.
- `createCampaignFromDraft` persists the resolved instants as `startsAt` / `endsAt` on `Campaign`; both are optional so seeded mock campaigns stay valid.

Date values are compared and formatted as local `yyyy-MM-dd` text. `toDateInputValue` uses local date getters instead of `toISOString().slice(0, 10)`, which shifts to UTC and reports the wrong day for operators west of Greenwich.

## Consequences

- Review has a single **Activate** launch button. Activate moves the campaign to Active; `startsAt` gates eligible sends when the configured start date is in the future. `scheduledActivateAt` remains only as a legacy prototype field.
- `startsAt` / `endsAt` are stored but not yet surfaced on the list or detail views, and no job enforces the end date — that is follow-up work when the campaign lifecycle moves server-side.
