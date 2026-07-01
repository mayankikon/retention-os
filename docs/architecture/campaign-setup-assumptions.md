# Campaign Setup — SOP mapping

> **Status:** Implemented from SOP PDF (Campaign Manager – How to set up a campaign).

## Source of truth

Standard Operating Procedure for Campaign Setup in Smart Marketing Campaign Manager.

## SOP → implementation

| SOP phase | In app? | Notes |
|-----------|---------|-------|
| Preparation & user provisioning (Planet X, Super Admin user) | Callout only | Operational; not in wizard |
| + New Campaign | `/campaigns/new` | Entry from list “Create campaign” |
| General Identification | Step `general` | Name template, dealership time zone |
| Messaging & Variables | Step `messaging` | Delivery channels (SMS/email), templates, primary promo, dealer URL, optional image |
| Reminder Sequences | Step `reminders` | Per-reminder enable toggles, optional image or reuse primary image |
| Standard Configuration | Step `configuration` | Service trigger mode: interval, OEM, or audience query; Mon–Sat + TZ table |
| QA & Activation | Step `review` | Test send, optional suppression list upload, TCPA compliance confirmation, Activate |

## Defaults (from SOP)

- Primary promo and Reminder 1/2 copy: `src/data/campaign-setup.defaults.ts`
- Service triggers: interval (time + mileage), OEM make/model, or audience query with vehicle/location/purchase filters (`src/data/service-triggers.ts`, `src/data/audience-attributes.ts`); default interval mode with time preset 180 days / 5,000 miles and mileage preset 2,000 miles
- Campaign type: Predefined (only supported type in wizard)
- Schedule days: Monday–Saturday

## Deferred / mock

- Real API persistence and Planet X DSP sync
- Official Ikon design tokens (placeholder CSS until provided)

## Open items

1. Official Ikon tokens — user will provide later
2. Whether Reminder 3 is required when reminders enabled (currently optional)
