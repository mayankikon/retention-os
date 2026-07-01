import { describe, expect, it } from "vitest";
import { buildMessageTemplatePatch } from "@/data/campaign-message-templates";
import { createDefaultSetupDraft } from "@/data/campaign-setup.defaults";

describe("campaign message templates", () => {
  it("applies primary and reminder copy when a template is selected", () => {
    const patch = buildMessageTemplatePatch("check_engine_light");

    expect(patch.messageTemplateId).toBe("check_engine_light");
    expect(patch.primaryPromoText).toContain("check-engine");
    expect(patch.reminder1Text).toContain("check-engine");
    expect(patch.reminder3Text).toBeTruthy();
  });

  it("clears copy when custom is selected", () => {
    const patch = buildMessageTemplatePatch("custom");

    expect(patch.messageTemplateId).toBe("custom");
    expect(patch.primaryPromoText).toBe("");
    expect(patch.reminder1Text).toBe("");
    expect(patch.reminder2Text).toBe("");
    expect(patch.reminder3Text).toBe("");
  });

  it("defaults to oil change template content", () => {
    const draft = createDefaultSetupDraft();
    expect(draft.messageTemplateId).toBe("oil_change");
    expect(draft.primaryPromoText).toContain("oil change");
  });
});
