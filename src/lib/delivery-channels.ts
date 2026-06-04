import type { CampaignSetupDraft, DeliveryChannel } from "@/types/campaign-setup";

export function isDeliveryChannelEnabled(
  draft: CampaignSetupDraft,
  channel: DeliveryChannel,
): boolean {
  return draft.deliveryChannels.includes(channel);
}

export function toggleDeliveryChannel(
  draft: CampaignSetupDraft,
  channel: DeliveryChannel,
  enabled: boolean,
): DeliveryChannel[] {
  if (enabled) {
    return [...new Set([...draft.deliveryChannels, channel])];
  }

  return draft.deliveryChannels.filter((value) => value !== channel);
}

export function validateDeliveryChannels(
  draft: CampaignSetupDraft,
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (draft.deliveryChannels.length === 0) {
    errors.deliveryChannels = "Select at least one delivery channel.";
  }

  return errors;
}

export function getDeliveryChannelSummary(draft: CampaignSetupDraft): string {
  if (draft.deliveryChannels.length === 0) {
    return "None selected";
  }

  return draft.deliveryChannels
    .map((channel) => (channel === "sms" ? "SMS" : "Email"))
    .join(" + ");
}
