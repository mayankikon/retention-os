# ADR: Campaign run window on the Configuration step

**Date:** 2026-08-12  
**Status:** Accepted

## Context

Campaign setup described *when in the week* a campaign sends (`scheduleDays`, optional `sendTimeLocal`) but never *how long it runs*. The only date on a campaign was `scheduledActivateAt`, which answers a different question — when a draft flips to active. Operators had no way to say "run this promotion until the end of September", so nothing bounded a live campaign.

## Decision

Add a campaign run window to the Configuration step (step 4 of the wizard):

- `campaignEndDate` (`yyyy-MM-dd`) is **required**. Sends stop after the end of that local day.
- `campaignStartDate` (`yyyy-MM-dd`) is **optional**. Blank means the campaign starts the moment it is created, so the common case needs no input.
- `campaignStartTimeLocal` (`HH:mm`) is optional and only offered once a start date is chosen. Blank means the start of that day.
- Resolution to instants lives in `src/lib/campaign-window.ts` (`resolveCampaignWindow`) and runs at creation time, so "starts on creation" is resolved from the same `now` used for `createdAt`.
- `createCampaignFromDraft` persists the resolved instants as `startsAt` / `endsAt` on `Campaign`; both are optional so seeded mock campaigns stay valid.

Date values are compared and formatted as local `yyyy-MM-dd` text. `toDateInputValue` uses local date getters instead of `toISOString().slice(0, 10)`, which shifts to UTC and reports the wrong day for operators west of Greenwich.

## Consequences

- The Configuration step can no longer be completed without an end date; `validateAllStepsBeforeActivate` therefore blocks activation until one is set.
- `campaignStartTimeLocal` reuses `SendTimeField`, which gained a `timeLabel` prop so its selects get distinct accessible names ("Start hour" vs "Send hour") when both controls appear on the step.
- The run window is deliberately separate from `scheduledActivateAt`. Activation scheduling stays on the Review step; a campaign can be scheduled to activate later and still carry its own start/end window.
- `startsAt` / `endsAt` are stored but not yet surfaced on the list or detail views, and no job enforces the end date — that is follow-up work when the campaign lifecycle moves server-side.
