# Templates feature design

Date: 2026-07-20

## Summary

Templates become a first-class, version-agnostic library: top-level nav, CRUD via wizard, detail with usage + audit history, and Published templates feed campaign setup (plus Custom). POC campaign setup remains Oil Change–only.

## Decisions

| Topic | Choice |
|-------|--------|
| Versions | All (POC → Post MVP) |
| Nav | Top-level Templates |
| POC campaign | Oil Change only; Templates home unrestricted |
| System templates | Editable + archive/remove |
| Status | Draft / Published / Archived |
| Create/edit | Multi-step wizard |
| Heading | Display name |
| Reminders | Up to 3 (enable, text, optional image) |
| History | Audit log (who/when/what) |
| Delete | Soft-archive always; hard delete only if unused |
| Persistence | localStorage + seeded mock |
| Campaign Custom | Keep blank Custom option |

## Surfaces

1. `/templates` — list + Create template
2. `/templates/new` — create wizard
3. `/templates/[id]` — detail (content, usage, audit, status actions)
4. `/templates/[id]/edit` — edit wizard
5. Campaign Messaging — Published templates from store (+ Custom)

## Data

`MessageTemplate`: heading, message, primaryPromoText, dealerUrl, image, reminders×3, status, auditEvents[], created/updated actors + timestamps, `isSystem`.

Campaign gains optional `messageTemplateId` for usage.
