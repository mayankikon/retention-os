# Product version switcher (POC / MVP)

Date: 2026-07-20

## Context

We need to demo and iterate on incremental product slices (POC → MVP → Post MVP) without maintaining separate apps. Features must be addable/removable per version.

## Decision

Add a left-nav **Version** dropdown that persists the active product version in `localStorage` and gates UI capabilities through `src/lib/product-version.ts`.

Selectable now:

- POC V0.5
- MVP V1.0 (default)

Listed but disabled:

- Post MVP V1.1
- Post MVP V1.2
- Post MVP V1.4

POC V0.5 feature gates for the current slice:

- No email delivery channel
- Oil Change Campaign messaging template only

## Consequences

- Messaging and reminders steps read version context for available channels/templates
- Campaign setup draft is reconciled on version change so gated values cannot linger
- Future Post-MVP features can unlock by flipping `isSelectable` and adding gate helpers
