import { describe, expect, it } from "vitest";
import {
  CAMPAIGN_IMAGE_MAX_BYTES,
  validateCampaignImageFile,
} from "@/lib/campaign-image";

describe("validateCampaignImageFile", () => {
  it("accepts PNG, JPG, WebP and GIF", () => {
    for (const type of ["image/png", "image/jpeg", "image/webp", "image/gif"]) {
      expect(validateCampaignImageFile({ type, size: 1024 })).toBeNull();
    }
  });

  it("rejects other file types", () => {
    expect(validateCampaignImageFile({ type: "image/svg+xml", size: 1024 })).toMatch(/Unsupported file type/);
    expect(validateCampaignImageFile({ type: "application/pdf", size: 1024 })).toMatch(/Unsupported file type/);
  });

  it("rejects files over 5 MB", () => {
    expect(validateCampaignImageFile({ type: "image/gif", size: CAMPAIGN_IMAGE_MAX_BYTES + 1 })).toMatch(/too large/);
    expect(validateCampaignImageFile({ type: "image/gif", size: CAMPAIGN_IMAGE_MAX_BYTES })).toBeNull();
  });
});
