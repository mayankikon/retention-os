import { describe, expect, it } from "vitest";
import { createDefaultSetupDraft } from "@/data/campaign-setup.defaults";
import {
  applyProductVersionToDraft,
  canSelectProductVersion,
  getAvailableDeliveryChannelOptions,
  getAvailableMessageTemplates,
  isEmailChannelAvailable,
  isExistingReportingAvailable,
} from "@/lib/product-version";

describe("product version feature gates", () => {
  it("allows selecting MVP V1.0 and Post MVP V1.1 only", () => {
    expect(canSelectProductVersion("mvp_v1_0")).toBe(true);
    expect(canSelectProductVersion("post_mvp_v1_1")).toBe(true);
    expect(canSelectProductVersion("post_mvp_v1_2")).toBe(false);
    expect(canSelectProductVersion("post_mvp_v1_3")).toBe(false);
    expect(canSelectProductVersion("post_mvp_v1_4")).toBe(false);
  });

  it("hides email for MVP V1.0 and keeps it for Post MVP V1.1", () => {
    expect(isEmailChannelAvailable("mvp_v1_0")).toBe(false);
    expect(isEmailChannelAvailable("post_mvp_v1_1")).toBe(true);

    expect(
      getAvailableDeliveryChannelOptions("mvp_v1_0").map((option) => option.value),
    ).toEqual(["sms"]);
    expect(
      getAvailableDeliveryChannelOptions("post_mvp_v1_1").map(
        (option) => option.value,
      ),
    ).toEqual(["sms", "email"]);
  });

  it("limits MVP V1.0 messaging templates to oil change only", () => {
    expect(
      getAvailableMessageTemplates("mvp_v1_0").map((template) => template.id),
    ).toEqual(["oil_change"]);
    expect(
      getAvailableMessageTemplates("post_mvp_v1_1").map((template) => template.id),
    ).toEqual(
      expect.arrayContaining([
        "oil_change",
        "service_reminder",
        "check_engine_light",
      ]),
    );
  });

  it("strips email and resets unavailable templates when applying MVP V1.0", () => {
    const draft = {
      ...createDefaultSetupDraft(),
      deliveryChannels: ["sms", "email"] as const,
      messageTemplateId: "service_reminder" as const,
      primaryPromoText: "custom service copy",
    };

    const patch = applyProductVersionToDraft(draft, "mvp_v1_0");

    expect(patch.deliveryChannels).toEqual(["sms"]);
    expect(patch.messageTemplateId).toBe("oil_change");
    expect(patch.primaryPromoText).toContain("oil change");
  });

  it("saves existing reporting on Post MVP V1.1 only", () => {
    expect(isExistingReportingAvailable("post_mvp_v1_1")).toBe(true);
    expect(isExistingReportingAvailable("mvp_v1_0")).toBe(false);
    expect(isExistingReportingAvailable("post_mvp_v1_2")).toBe(false);
  });

  it("does not change a compliant Post MVP V1.1 draft when applying that version", () => {
    const draft = {
      ...createDefaultSetupDraft(),
      deliveryChannels: ["sms", "email"] as const,
      messageTemplateId: "service_reminder" as const,
    };

    expect(applyProductVersionToDraft(draft, "post_mvp_v1_1")).toEqual({});
  });
});
