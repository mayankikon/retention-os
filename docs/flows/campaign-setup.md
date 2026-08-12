# Campaign setup flow

Mapped to **Campaign Manager: Standard Operating Procedure for Campaign Setup** (PDF).

## In-app wizard (Phase 2 — Campaign Configuration)

Planet X / Super Admin user provisioning (SOP Phase 1) is documented in the General step “Before you begin” callout only — not implemented as app screens.

```mermaid
flowchart LR
  general[General] --> messaging[Messaging]
  messaging --> reminders[Reminders]
  reminders --> configuration[Configuration]
  configuration --> review[Review_and_activate]
  review --> done[Confirmation]
```

| Step | Route `?step=` | SOP section | Key fields |
|------|----------------|-------------|------------|
| General | `general` | General Identification | Group, multi-select Dealerships (per-dealer timezone), campaign name |
| Messaging | `messaging` | Messaging & Variables | Delivery channels, templates, primary promo, dealer URL, optional image |
| Reminders | `reminders` | Reminder Sequences | Enable 1–3 reminders, text + image or reuse primary image |
| Configuration | `configuration` | Standard Configuration | Service trigger mode (interval, OEM, or audience query), campaign duration (optional start date + time, required end date), schedule days, optional send time + timezone table that recomputes from the selected send time |
| Review | `review` | QA & Activation | Test send, suppression list, TCPA confirmation, Activate |

## Components

| Component | Path |
|-----------|------|
| Wizard orchestrator | `CampaignSetupWizard.tsx` |
| Shell | `StepShellLayout.tsx`, `StepperHeader.tsx`, `MessagePreviewPanel.tsx` |
| Steps | `setup/steps/*.tsx` |
| Success | `ConfirmationView.tsx` |
| Message preview | `MessagePreviewPanel.tsx` — SMS device + email inbox mockups; channel tabs when both enabled; primary promo on General/Messaging/Configuration/Review, reminders only on Reminders step. Sender uses the first selected dealership. |
| Send time | `setup/SendTimeField.tsx` — hour / minute / AM-PM design-system selects (no native `input[type=time]`); conversions in `src/lib/send-time.ts`. `timeLabel` prefixes the select accessible names so the same control can serve send time and campaign start time on one step |
| Campaign duration | Native `input[type=date]` pair on the Configuration step; window resolution and rules in `src/lib/campaign-window.ts` |
| Schedule timezone table | Rows come from `src/lib/schedule-time-zones.ts`. With no pinned send time it renders the authored SOP lunch windows (expressed against CST). Once a send time is pinned, every dealership sends at that same local clock time and each row converts back to the primary dealership's zone, flagging `(prev day)` / `(next day)` rolls. |

## Validation

`src/lib/campaign-setup-validation.ts` — per-step rules aligned with SOP required fields.

- General requires group + ≥1 dealership; missing dealer TZ needs a row-level fallback.
- Configuration accepts empty optional `sendTimeLocal`; when set it must be `HH:mm` (24-hour). The picker only emits valid values and offers 5-minute steps, keeping an off-step minute selectable if a draft already holds one.
- Configuration requires `campaignEndDate`. `campaignStartDate` and `campaignStartTimeLocal` are optional; the end date must land on or after the start date, or on or after today when no start date is set (`validateCampaignWindow`).

## State

- Form draft: React `useState` (session-local)
- Current step: URL `?step=` via `nuqs` (bookmarkable)
- Draft fields include `groupId`, `subfleets` (dealership ids), `timezoneOverrides`, `sendTimeLocal`, derived `timeZone`, and the run window (`campaignStartDate`, `campaignStartTimeLocal`, `campaignEndDate`)

## Campaign run window

Configuration collects how long the campaign runs, separate from Review's activation date.

- Blank `campaignStartDate` = the campaign starts the moment it is created; `campaignStartTimeLocal` is only offered once a start date is chosen, and blank means the start of that day.
- `createCampaignFromDraft` resolves the fields into `startsAt` / `endsAt` instants via `resolveCampaignWindow(draft, now)`; the end date always runs through 23:59:59.999 local.

## Campaign statuses (list / filters)

`draft` · `active` · `paused` · `completed` · `archived`  
Future activation date is stored on `scheduledActivateAt` while status remains `draft` (Scheduled is not a status).

Default list (`status=All`) hides `archived` campaigns. Filter Status → Archived to see them. From detail: Pause / Resume when live; Archive (confirm, irreversible) from active, paused, or completed.

## Mock behaviors

- Image upload: client preview only
- Send test / Activate: simulated delay, then confirmation screen
