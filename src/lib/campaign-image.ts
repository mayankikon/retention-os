/**
 * Campaign and reminder images are sent as MMS attachments: PNG, JPG, WebP
 * or GIF (animated GIFs supported), up to 5 MB.
 */
export const CAMPAIGN_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
] as const;

export const CAMPAIGN_IMAGE_ACCEPT = CAMPAIGN_IMAGE_TYPES.join(",");
export const CAMPAIGN_IMAGE_TYPES_LABEL = "PNG, JPG, WebP, or GIF";
export const CAMPAIGN_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

/** Error message for a file that can't be used, or null when it's valid. */
export function validateCampaignImageFile(file: Pick<File, "type" | "size">): string | null {
  if (!(CAMPAIGN_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return `Unsupported file type. Upload a ${CAMPAIGN_IMAGE_TYPES_LABEL} image.`;
  }
  if (file.size > CAMPAIGN_IMAGE_MAX_BYTES) {
    return "File is too large. Upload an image under 5 MB.";
  }
  return null;
}
