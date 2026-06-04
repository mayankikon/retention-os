const PREVIEW_SAMPLE_VALUES: Record<string, string> = {
  "[@FN@]": "John",
  "[@YEA@]": "2019",
  "[@MAK@]": "Honda",
  "[@MOD@]": "Accord",
  "[@DSP@]": "schedule.dealer.com/appt",
  "(Dealer DID)": "(555) 123-4567",
};

export function resolveMessagePreviewText(template: string): string {
  let resolved = template;

  for (const [token, sample] of Object.entries(PREVIEW_SAMPLE_VALUES)) {
    resolved = resolved.split(token).join(sample);
  }

  return resolved.trim();
}

export function getPreviewSenderName(
  subfleets: string[],
  campaignName: string,
): string {
  if (subfleets.length === 1) {
    return subfleets[0];
  }
  if (subfleets.length > 1) {
    return "Your dealership";
  }

  const nameMatch = campaignName.match(/SM\s+(.+?)\s+(?:CST|EST|PST|MST)/i);
  if (nameMatch?.[1]) {
    return nameMatch[1].trim();
  }

  return "Your dealership";
}
