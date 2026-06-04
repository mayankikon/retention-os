import { describe, expect, it } from "vitest";
import { createDefaultSetupDraft } from "@/data/campaign-setup.defaults";
import {
  toggleDeliveryChannel,
  validateDeliveryChannels,
} from "@/lib/delivery-channels";

describe("delivery channels", () => {
  it("defaults to SMS only", () => {
    expect(createDefaultSetupDraft().deliveryChannels).toEqual(["sms"]);
  });

  it("allows SMS and email together", () => {
    const draft = createDefaultSetupDraft();
    const channels = toggleDeliveryChannel(draft, "email", true);
    expect(channels).toEqual(["sms", "email"]);
  });

  it("requires at least one channel", () => {
    const draft = {
      ...createDefaultSetupDraft(),
      deliveryChannels: [] as const,
    };
    expect(validateDeliveryChannels(draft).deliveryChannels).toBeDefined();
  });
});
