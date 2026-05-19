import { describe, expect, it } from "vitest";
import {
  getPreviewSenderName,
  resolveMessagePreviewText,
} from "@/lib/preview-message";

describe("resolveMessagePreviewText", () => {
  it("replaces message variables with sample values", () => {
    const result = resolveMessagePreviewText(
      "Hi [@FN@], your [@YEA@] [@MAK@] [@MOD@] — call (Dealer DID) or visit [@DSP@]",
    );

    expect(result).toContain("John");
    expect(result).toContain("2019");
    expect(result).toContain("Honda");
    expect(result).toContain("Accord");
    expect(result).toContain("schedule.dealer.com");
    expect(result).toContain("(555) 123-4567");
  });

  it("uses dealer DID when provided", () => {
    const result = resolveMessagePreviewText(
      "Call us at (Dealer DID)",
      "(800) 555-0199",
    );

    expect(result).toBe("Call us at (800) 555-0199");
  });
});

describe("getPreviewSenderName", () => {
  it("uses single subfleet name", () => {
    expect(getPreviewSenderName(["ABC Motors"], "")).toBe("ABC Motors");
  });

  it("falls back to campaign name segment", () => {
    expect(
      getPreviewSenderName([], "SM ABC Motors CST Oil Change"),
    ).toBe("ABC Motors");
  });
});
