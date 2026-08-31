# Product version switcher (MVP / Post MVP)

Date: 2026-07-20

## Context

We need to demo and iterate on incremental product slices (MVP → Post MVP) without maintaining separate apps. Features must be addable/removable per version.

## Decision

Add a left-nav **Version** dropdown that persists the active product version in `localStorage` and gates UI capabilities through `src/lib/product-version.ts`.

Selectable now:

- MVP V1.0
- Post MVP V1.1 (default)

Listed but disabled:

- Post MVP V1.2
- Post MVP V1.3
- Post MVP V1.4

MVP V1.0 feature gates for the current slice:

- No email delivery channel
- Oil Change Campaign messaging template only
- No Existing reporting dropdown and no Reporting nav

Post MVP V1.1 adds:

- Email delivery channel
- Additional messaging templates
- Sidebar **Existing reporting** dropdown with the single value `Existing reporting` (SM2-207 / SM2-208 / SM2-209 prototype)

Ladder rename (2026-08-18): POC V0.5 → MVP V1.0; MVP V1.0 → Post MVP V1.1; V1.1 → V1.2; V1.2 → V1.3. Storage schema `2` remaps legacy ids once so saved preferences land on the equivalent slice.

## Consequences

- Messaging and reminders steps read version context for available channels/templates
- Campaign setup draft is reconciled on version change so gated values cannot linger
- Future Post-MVP features can unlock by flipping `isSelectable` and adding gate helpers
