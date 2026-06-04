export interface EmailPreviewContent {
  paragraphs: string[];
  ctaHref: string | null;
  ctaLabel: string;
  phoneNumber: string | null;
}

const URL_PATTERN =
  /(https?:\/\/[^\s]+|[a-z0-9][a-z0-9-]*(?:\.[a-z0-9-]+)+(?:\/[^\s]*)?)/gi;

const PHONE_PATTERN = /\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g;

export function getEmailPreviewSubject(
  senderName: string,
  campaignName: string,
  messageId: string,
): string {
  const trimmedName = campaignName.trim();

  if (messageId.startsWith("reminder")) {
    if (trimmedName) {
      return `Reminder: ${trimmedName}`;
    }
    return `Service reminder from ${senderName}`;
  }

  if (trimmedName) {
    return trimmedName;
  }

  return `Service update from ${senderName}`;
}

export function buildEmailPreviewContent(
  body: string,
  dealerUrl: string,
): EmailPreviewContent {
  const urls = body.match(URL_PATTERN) ?? [];
  const phones = body.match(PHONE_PATTERN) ?? [];
  const ctaHref = dealerUrl.trim() || urls[0] || null;
  const phoneNumber = phones[0] ?? null;

  let textBody = body;
  for (const url of urls) {
    textBody = textBody.replace(url, " ");
  }
  for (const phone of phones) {
    textBody = textBody.replace(phone, " ");
  }

  textBody = textBody
    .replace(/\b(CLICK the link to schedule|Grab a spot here|BOOK NOW|Schedule here|visit)\s*:?\s*/gi, " ")
    .replace(/\b(or call us at|Call:|PHONE:)\s*/gi, " ")
    .replace(/[|]/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();

  const paragraphs = textBody
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 1);

  return {
    paragraphs,
    ctaHref,
    ctaLabel: "Schedule appointment",
    phoneNumber,
  };
}

export function getSenderEmailAddress(senderName: string): string {
  const slug = senderName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 24);

  return `service@${slug || "dealership"}.com`;
}

export function getSenderInitials(senderName: string): string {
  const parts = senderName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "DL";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}
