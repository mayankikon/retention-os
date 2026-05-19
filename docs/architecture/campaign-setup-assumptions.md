# Campaign Setup — SOP mapping

> **Status:** Implemented from SOP PDF (Campaign Manager – How to set up a campaign).

## Source of truth

Standard Operating Procedure for Campaign Setup in Smart Marketing Campaign Manager.

## SOP → implementation

| SOP phase | In app? | Notes |
|-----------|---------|-------|
| Preparation & user provisioning (Planet X, Super Admin user) | Callout only | Operational; not in wizard |
| + New Campaign | `/campaigns/new` | Entry from list “Create campaign” |
| General Identification | Step `general` | Name template + image upload |
| Messaging & Variables | Step `messaging` | Default templates pre-filled |
| Reminder Sequences | Step `reminders` | DID + 3 reminders |
| Standard Configuration | Step `configuration` | Predefined type, 180d/5k service, subfleets, ongoing/once, Mon–Sat + TZ table |
| QA & Activation | Step `review` | Test send + Activate |

## Defaults (from SOP)

- Primary promo and Reminder 1/2 copy: `src/data/campaign-setup.defaults.ts`
- Service interval: Every 180 Days / 5000 Mile
- Campaign type: Predefined (Custom/Push disabled)
- Schedule days: Monday–Saturday
- Delivery: Ongoing (Send once optional)

## Deferred / mock

- Real API persistence and Planet X DSP sync
- Leadership-only campaign types (UI disabled)
- Official Ikon design tokens (placeholder CSS until provided)

## Open items

1. Official Ikon tokens — user will provide later
2. Whether Reminder 3 is required when reminders enabled (currently optional)
