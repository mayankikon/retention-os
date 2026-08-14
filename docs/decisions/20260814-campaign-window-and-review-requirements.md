# ADR: Required start date and send time; optional end date

**Date:** 2026-08-14  
**Status:** Accepted  
**Supersedes:** parts of `20260812-campaign-run-window.md` (start/end/send-time requirements)

## Context

Operators asked to tighten Configuration and Review so the campaign run window and send schedule are explicit, and to drop TCPA legal copy from activation.

## Decision

On the Configuration step:

- `campaignStartDate` is **required**. The campaign starts at local midnight on that day.
- `campaignEndDate` is **optional**. Blank means no fixed end; when set, sends stop at the end of that local day.
- `campaignStartTimeLocal` is **removed**. Only `sendTimeLocal` persists as a clock-time field.
- `sendTimeLocal` is **required** (`HH:mm`).

On the Review & Activate step:

- TCPA compliance copy and the confirmation checkbox are removed.
- Activation / schedule no longer gate on `tcpaComplianceConfirmed` (field removed from the draft).

## Consequences

- `validateCampaignWindow` and `validateConfigurationStep` enforce the new required/optional rules.
- `resolveCampaignWindow` always starts at local midnight when a start date is present.
- Review launch buttons enable without a TCPA checkbox; test-send SOP gating remains.
