import { describe, expect, it } from "vitest";
import { createDefaultSetupDraft } from "@/data/campaign-setup.defaults";
import {
  applyProductVersionToDraft,
  canSelectProductVersion,
  getAvailableDeliveryChannelOptions,
  getAvailableMessageTemplates,
  isEmailChannelAvailable,
} from "@/lib/product-version";

describe("product version feature gates", () => {
  it("allows selecting POC and MVP only", () => {
    expect(canSelectProductVersion("poc_v0_5")).toBe(true);
    expect(canSelectProductVersion("mvp_v1_0")).toBe(true);
    expect(canSelectProductVersion("post_mvp_v1_1")).toBe(false);
    expect(canSelectProductVersion("post_mvp_v1_2")).toBe(false);
    expect(canSelectProductVersion("post_mvp_v1_4")).toBe(false);
  });

  it("hides email for POC V0.5 and keeps it for MVP V1.0", () => {
    expect(isEmailChannelAvailable("poc_v0_5")).toBe(false);
    expect(isEmailChannelAvailable("mvp_v1_0")).toBe(true);

    expect(
      getAvailableDeliveryChannelOptions("poc_v0_5").map((option) => option.value),
    ).toEqual(["sms"]);
    expect(
      getAvailableDeliveryChannelOptions("mvp_v1_0").map((option) => option.value),
    ).toEqual(["sms", "email"]);
  });

  it("limits POC messaging templates to oil change only", () => {
    expect(
      getAvailableMessageTemplates("poc_v0_5").map((template) => template.id),
    ).toEqual(["oil_change"]);
    expect(
      getAvailableMessageTemplates("mvp_v1_0").map((template) => template.id),
    ).toEqual(
      expect.arrayContaining([
        "oil_change",
        "service_reminder",
        "check_engine_light",
      ]),
    );
  });

  it("strips email and resets unavailable templates when applying POC", () => {
    const draft = {
      ...createDefaultSetupDraft(),
      deliveryChannels: ["sms", "email"] as const,
      messageTemplateId: "service_reminder" as const,
      primaryPromoText: "custom service copy",
    };

    const patch = applyProductVersionToDraft(draft, "poc_v0_5");

    expect(patch.deliveryChannels).toEqual(["sms"]);
    expect(patch.messageTemplateId).toBe("oil_change");
    expect(patch.primaryPromoText).toContain("oil change");
  });

  it("does not change a compliant MVP draft when applying MVP", () => {
    const draft = {
      ...createDefaultSetupDraft(),
      deliveryChannels: ["sms", "email"] as const,
      messageTemplateId: "service_reminder" as const,
    };

    expect(applyProductVersionToDraft(draft, "mvp_v1_0")).toEqual({});
  });
});
