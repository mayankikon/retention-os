# Activation gating and success toast

## Status

Accepted — 2026-09-18

## Context

Activate on Review appeared dead. Two things made it fail silently: the SOP test send was a hard gate, and any blocking error from an earlier step was written into the wizard error map but only rendered on that step. A creator standing on Review clicked Activate and saw nothing — the test-phone error sits far above the button, and General/Messaging/Configuration errors are not on screen at all.

## Decisions

1. The Review test send is recommended, not required. It no longer gates Activate.
2. Only the required setup fields validated by `validateAllStepsBeforeActivate` (General → Messaging → Reminders → Configuration) can block activation.
3. When that preflight fails, the wizard navigates to `findFirstInvalidSetupStep(draft)` with the errors still set, so the creator lands on the fields at fault.
4. Campaign list flash messages render through the shared `AppToast` (bottom-right, auto-dismiss) instead of an inline banner, matching campaign detail.

## Consequences

- Activating a complete draft always completes the loop: campaign persisted, redirect to `/campaigns`, success toast, new row at the top of the table.
- Activate can no longer be a dead end; every rejection moves the creator somewhere with a visible error.
- A campaign can be activated without a test send. Enforcement of the SOP test step, if required, belongs server-side when activation moves off the prototype store.
