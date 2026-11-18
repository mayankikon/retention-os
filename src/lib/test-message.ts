/**
 * Prototype test send (SM2-381 / SM2-796). Used by the Review step and the
 * campaign detail page so both surfaces share validation, timing, and copy.
 */

/** Digits of a number the prototype always fails, so the failure state can be demoed. */
export const TEST_SEND_FAILURE_DIGITS = "5555550199";

const SEND_DELAY_MS = 800;

/** Strip formatting and a leading US country code. */
export function normalizeTestPhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  return digits.length === 11 && digits.startsWith("1")
    ? digits.slice(1)
    : digits;
}

export function isValidTestPhone(value: string): boolean {
  return normalizeTestPhone(value).length === 10;
}

/** "+1 (555) 555-0123" for a valid US number; the raw input otherwise. */
export function formatTestPhone(value: string): string {
  const digits = normalizeTestPhone(value);
  if (digits.length !== 10) return value.trim();
  return `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export const TEST_PHONE_INVALID_ERROR = "Enter a 10-digit US mobile number.";

export type TestSendResult = { ok: true } | { ok: false };

export async function sendTestMessage(phone: string): Promise<TestSendResult> {
  await new Promise((resolve) => setTimeout(resolve, SEND_DELAY_MS));
  return normalizeTestPhone(phone) === TEST_SEND_FAILURE_DIGITS
    ? { ok: false }
    : { ok: true };
}

export const testSendCopy = {
  reviewSuccess: (phone: string) =>
    `Test sent to ${formatTestPhone(phone)}. Check the message, variables, and image on your phone before activating.`,
  reviewFailure: (phone: string) =>
    `The test didn't send to ${formatTestPhone(phone)}. Check the number and try again.`,
  reviewReminder: "Send a test before activating to meet SOP requirements.",
  dialogTitle: "Send a test message",
  dialogDescription:
    "We'll text the current campaign message to this number, including variables and the image. The campaign, its audience, and its reporting don't change.",
  dialogFailure:
    "The test didn't send. Check the number and try again. If it keeps failing, contact support.",
  detailSuccessToast: (phone: string) =>
    `Test sent to ${formatTestPhone(phone)}. Check your phone.`,
} as const;
