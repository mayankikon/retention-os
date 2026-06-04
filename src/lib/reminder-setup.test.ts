import { describe, expect, it } from "vitest";
import { createDefaultSetupDraft } from "@/data/campaign-setup.defaults";
import { getReminderImagePreviewUrl } from "@/lib/reminder-setup";

describe("reminder setup", () => {
  it("falls back to primary campaign image when enabled", () => {
    const draft = {
      ...createDefaultSetupDraft(),
      campaignImagePreviewUrl: "blob:primary",
      reminder1ImagePreviewUrl: null,
      reminder1UsePrimaryImage: true,
    };

    expect(getReminderImagePreviewUrl(draft, 1)).toBe("blob:primary");
  });

  it("prefers a custom reminder image over the primary image", () => {
    const draft = {
      ...createDefaultSetupDraft(),
      campaignImagePreviewUrl: "blob:primary",
      reminder1ImagePreviewUrl: "blob:custom",
      reminder1UsePrimaryImage: true,
    };

    expect(getReminderImagePreviewUrl(draft, 1)).toBe("blob:custom");
  });

  it("returns null when primary image reuse is disabled and no custom image exists", () => {
    const draft = {
      ...createDefaultSetupDraft(),
      campaignImagePreviewUrl: "blob:primary",
      reminder1ImagePreviewUrl: null,
      reminder1UsePrimaryImage: false,
    };

    expect(getReminderImagePreviewUrl(draft, 1)).toBeNull();
  });
});
