"use client";

import { useEffect, useMemo, useState } from "react";
import { DELIVERY_CHANNEL_OPTIONS } from "@/data/delivery-channels";
import {
  EmailPreviewFrame,
  SmsPreviewFrame,
} from "@/components/campaigns/setup/MessagePreviewFrames";
import { getPreviewSenderName, resolveMessagePreviewText } from "@/lib/preview-message";
import {
  getEnabledReminderIndices,
  getReminderImagePreviewUrl,
} from "@/lib/reminder-setup";
import type { CampaignSetupDraft, DeliveryChannel, SetupStepId } from "@/types/campaign-setup";
import { cn } from "@/lib/utils";

interface MessagePreviewPanelProps {
  draft: CampaignSetupDraft;
  currentStepId: SetupStepId;
}

export function MessagePreviewPanel({
  draft,
  currentStepId,
}: MessagePreviewPanelProps) {
  const senderName = getPreviewSenderName(
    draft.subfleets,
    draft.campaignName,
  );

  const messages = useMemo(
    () => buildPreviewMessages(draft, currentStepId),
    [draft, currentStepId],
  );

  const highlightedId = getHighlightedMessageId(draft, currentStepId);
  const enabledChannels = draft.deliveryChannels;
  const [activeChannel, setActiveChannel] = useState<DeliveryChannel>(
    enabledChannels[0] ?? "sms",
  );

  useEffect(() => {
    if (enabledChannels.includes(activeChannel)) return;
    setActiveChannel(enabledChannels[0] ?? "sms");
  }, [activeChannel, enabledChannels]);

  const showChannelTabs = enabledChannels.length > 1;

  const channelDescription =
    enabledChannels.length === 0
      ? "Select at least one delivery channel to preview."
      : enabledChannels.length === 1 && enabledChannels[0] === "email"
        ? currentStepId === "reminders"
          ? "Preview the reminder emails your customers receive."
          : "Preview the primary email your customer receives."
        : enabledChannels.length === 1
          ? currentStepId === "reminders"
            ? "How customers see your reminder SMS — scroll inside the device for more messages."
            : "How customers see your primary SMS."
          : currentStepId === "reminders"
            ? "Switch channels to preview reminder SMS and email."
            : "Switch channels to preview primary SMS and email.";

  return (
    <aside
      className="w-full min-w-0 lg:sticky lg:top-8"
      aria-label="Customer message preview"
    >
      <div className="mb-3">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">
          Message preview
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {channelDescription}
        </p>
      </div>

      {showChannelTabs ? (
        <div
          className="mb-3 flex gap-2"
          role="tablist"
          aria-label="Preview delivery channel"
        >
          {enabledChannels.map((channel) => {
            const option = DELIVERY_CHANNEL_OPTIONS.find(
              (item) => item.value === channel,
            );
            return (
              <button
                key={channel}
                type="button"
                role="tab"
                aria-selected={activeChannel === channel}
                onClick={() => setActiveChannel(channel)}
                className={cn(
                  "rounded-full border border-border px-3 py-1 text-xs font-medium transition-colors",
                  activeChannel === channel
                    ? "border-brand-primary bg-brand-primary text-white"
                    : "bg-background text-foreground hover:bg-muted/50",
                )}
              >
                {option?.label ?? channel}
              </button>
            );
          })}
        </div>
      ) : null}

      {enabledChannels.length === 0 ? (
        <div className="rounded-md border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
          Enable SMS, email, or both on the Messaging step.
        </div>
      ) : activeChannel === "email" ? (
        <EmailPreviewFrame
          senderName={senderName}
          campaignName={draft.campaignName}
          dealerUrl={draft.dealerUrl}
          messages={messages}
          highlightedId={highlightedId}
        />
      ) : (
        <SmsPreviewFrame
          senderName={senderName}
          messages={messages}
          highlightedId={highlightedId}
        />
      )}

      {messages.length > 0 && enabledChannels.length > 0 ? (
        <p className="mt-3 text-center text-[11px] text-muted-foreground">
          Highlighted message matches your current step.
        </p>
      ) : null}
    </aside>
  );
}

function buildPreviewMessages(
  draft: CampaignSetupDraft,
  currentStepId: SetupStepId,
) {
  const messages: Array<{
    id: string;
    label: string;
    body: string;
    imagePreviewUrl: string | null;
  }> = [];

  const isRemindersStep = currentStepId === "reminders";

  if (!isRemindersStep) {
    const primaryBody = resolveMessagePreviewText(draft.primaryPromoText);

    if (primaryBody) {
      messages.push({
        id: "primary",
        label:
          currentStepId === "messaging" || currentStepId === "general"
            ? "Primary promo"
            : "",
        body: primaryBody,
        imagePreviewUrl: draft.campaignImagePreviewUrl,
      });
    }

    return messages;
  }

  const reminderConfigs = [
    {
      id: "reminder1" as const,
      label: "Reminder 1",
      index: 1 as const,
      text: draft.reminder1Text,
      enabled: draft.reminder1Enabled,
    },
    {
      id: "reminder2" as const,
      label: "Reminder 2",
      index: 2 as const,
      text: draft.reminder2Text,
      enabled: draft.reminder2Enabled,
    },
    {
      id: "reminder3" as const,
      label: "Reminder 3",
      index: 3 as const,
      text: draft.reminder3Text,
      enabled: draft.reminder3Enabled,
    },
  ];

  for (const reminder of reminderConfigs) {
    if (!reminder.enabled) continue;

    const body = resolveMessagePreviewText(reminder.text);
    if (!body) continue;

    messages.push({
      id: reminder.id,
      label: reminder.label,
      body,
      imagePreviewUrl: getReminderImagePreviewUrl(draft, reminder.index),
    });
  }

  return messages;
}

function getHighlightedMessageId(
  draft: CampaignSetupDraft,
  currentStepId: SetupStepId,
): string | null {
  switch (currentStepId) {
    case "general":
    case "messaging":
    case "configuration":
    case "review":
      return "primary";
    case "reminders": {
      const enabled = getEnabledReminderIndices(draft);
      if (enabled.length === 0) return null;
      return `reminder${enabled[0]}`;
    }
    default:
      return null;
  }
}
