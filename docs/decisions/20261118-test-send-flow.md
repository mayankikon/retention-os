# Test send: Review step and campaign detail (SM2-796)

## Status

Accepted — 2026-11-18

## Context

SM2-381 built a test send on Review. SM2-796 asked for design decisions on the confirmation, a detail-page entry point, its modal, success feedback, failure behavior, and paused campaigns.

## Decisions

1. **Review step confirmation stays inline, no toast.** The creator is still on the step and the note has to stay until they activate. Copy: "Test sent to +1 (555) 555-0123. Check the message, variables, and image on your phone before activating." Changing the number clears it; the button then reads **Send Test** again, and **Send again** while the sent number is unchanged.
2. **Detail page button:** secondary header button **Send test** (Send icon), first in the action row before Edit copy, Pause/Resume and Archive. It's a check rather than a live control, so it sits apart from the status actions.
3. **Paused campaigns get it too.** Same statuses as Edit copy (Active, Paused), so a user can check edited copy before Resume. Hidden on Draft (use Review), Completed and Archived.
4. **Modal:** title "Send a test message"; description "We'll text the current campaign message to this number, including variables and the image. The campaign, its audience, and its reporting don't change."; Test Mobile Number field (prefilled from setup); Cancel and **Send Test**. While sending, the primary button shows the spinner, the field and Cancel are disabled, and the dialog can't be dismissed.
5. **Detail page success:** the dialog closes and the shared `AppToast` shows "Test sent to +1 (555) 555-0123. Check your phone."
6. **Failure:** never a toast. On Review, a red inline line replaces the confirmation: "The test didn't send to {number}. Check the number and try again." In the modal, an inline red alert above the footer: "The test didn't send. Check the number and try again. If it keeps failing, contact support." The modal stays open with the number kept for retry.
7. **Validation:** a number must be 10 US digits (a leading +1 is allowed); otherwise "Enter a 10-digit US mobile number." shows on the field and nothing is sent.

## Consequences

- Shared logic and copy live in `src/lib/test-message.ts`.
- The prototype fails any send to **+1 (555) 555-0199** so the failure state can be demoed.
- The test send is still recommended, not required (see 20260918-activation-gating-and-success-toast).
