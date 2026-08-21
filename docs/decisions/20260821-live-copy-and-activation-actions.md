# Live copy edits and activation actions

## Status

Accepted — 2026-08-21

## Decisions

1. Active and Paused campaigns expose a dedicated copy-only editor at `/campaigns/[id]/copy`.
2. The editor can change only initial and enabled reminder body copy. Personalization variables must remain in the same sequence, and all setup/configuration fields stay locked.
3. Saving live copy preserves campaign status and affects only new or not-yet-sent recipients. It records `copyUpdatedAt` and an `updated` changelog entry.
4. Review & Activate exposes only **Activate Now** and **Save Draft**. Start/end dates and send time configured earlier govern delivery; a future start date remains `active` behind a start-date gate.
5. New Campaign Setup leave behavior uses **Keep editing**, **Discard draft**, and **Save draft**.
6. Accounts is a Toolbox Web host capability. Smart Marketing navigation and routes do not expose it.

## Consequences

- There is no separate Schedule action or Scheduled status in the prototype.
- Live copy edits cannot alter campaign targeting, timing, reminder structure, links, or personalization mapping.
- The prototype persists edited seeded campaigns as local overrides so subsequent detail views retain the new copy.
- Existing dormant account modules may remain temporarily, but they are not routed or presented as Smart Marketing functionality.
