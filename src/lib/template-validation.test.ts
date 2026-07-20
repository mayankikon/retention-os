import { describe, expect, it } from "vitest";
import { createEmptyTemplateDraft } from "@/lib/template-store";
import { validateTemplateStep } from "@/lib/template-validation";

describe("validateTemplateStep", () => {
  it("requires heading and message on details", () => {
    const result = validateTemplateStep("details", createEmptyTemplateDraft());
    expect(result.isValid).toBe(false);
    expect(result.errors.heading).toBeTruthy();
    expect(result.errors.message).toBeTruthy();
  });

  it("requires primary promo on content", () => {
    const draft = {
      ...createEmptyTemplateDraft(),
      heading: "Test",
      message: "Summary",
    };
    const result = validateTemplateStep("content", draft);
    expect(result.isValid).toBe(false);
    expect(result.errors.primaryPromoText).toBeTruthy();
  });

  it("requires enabled reminder text", () => {
    const draft = {
      ...createEmptyTemplateDraft(),
      heading: "Test",
      message: "Summary",
      primaryPromoText: "Hello",
      reminder1Enabled: true,
      reminder1Text: "",
    };
    const result = validateTemplateStep("reminders", draft);
    expect(result.isValid).toBe(false);
    expect(result.errors.reminder1Text).toBeTruthy();
  });
});
