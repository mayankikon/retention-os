import type { DeliveryChannel } from "@/types/campaign-setup";

export interface DeliveryChannelOption {
  value: DeliveryChannel;
  label: string;
  description: string;
}

export const DELIVERY_CHANNEL_OPTIONS: DeliveryChannelOption[] = [
  {
    value: "sms",
    label: "SMS",
    description: "Text message to the customer's mobile number.",
  },
  {
    value: "email",
    label: "Email",
    description: "HTML email to the address on file.",
  },
];

export function getDeliveryChannelLabel(channel: DeliveryChannel): string {
  return (
    DELIVERY_CHANNEL_OPTIONS.find((option) => option.value === channel)?.label ??
    channel
  );
}
