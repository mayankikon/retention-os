"use client";

import { useMemo } from "react";
import { Signal, Wifi, Battery } from "lucide-react";
import {
  IPHONE_DEVICE_BEZEL_PX,
  IPHONE_DEVICE_OUTER_HEIGHT_PX,
  IPHONE_DEVICE_OUTER_RADIUS_PX,
  IPHONE_DEVICE_OUTER_WIDTH_PX,
  IPHONE_PREVIEW_OUTER_HEIGHT_PX,
  IPHONE_PREVIEW_OUTER_RADIUS_PX,
  IPHONE_PREVIEW_OUTER_WIDTH_PX,
  IPHONE_PREVIEW_SCALE,
  IPHONE_SCREEN_RADIUS_PX,
} from "@/constants/iphone-preview";
import {
  getPreviewSenderName,
  resolveMessagePreviewText,
} from "@/lib/preview-message";
import type { CampaignSetupDraft, SetupStepId } from "@/types/campaign-setup";
import { cn } from "@/lib/utils";

interface MessagePreviewPanelProps {
  draft: CampaignSetupDraft;
  currentStepId: SetupStepId;
}

interface PreviewMessage {
  id: string;
  label: string;
  body: string;
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

  const highlightedId = getHighlightedMessageId(currentStepId);

  return (
    <aside
      className="lg:sticky lg:top-8"
      aria-label="Customer message preview"
    >
      <div className="mb-3">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">
          Message preview
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          How customers see your SMS — scroll inside the device for more
          messages.
        </p>
      </div>

      <div
        className="mx-auto overflow-hidden bg-zinc-900"
        style={{
          width: IPHONE_PREVIEW_OUTER_WIDTH_PX,
          height: IPHONE_PREVIEW_OUTER_HEIGHT_PX,
          borderRadius: IPHONE_PREVIEW_OUTER_RADIUS_PX,
          boxShadow:
            "0 4px 14px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.06)",
        }}
      >
        <div
          className="origin-top-left"
          style={{
            width: IPHONE_DEVICE_OUTER_WIDTH_PX,
            height: IPHONE_DEVICE_OUTER_HEIGHT_PX,
            transform: `scale(${IPHONE_PREVIEW_SCALE})`,
          }}
        >
          <div
            className="box-border h-full w-full bg-zinc-900"
            style={{
              padding: IPHONE_DEVICE_BEZEL_PX,
              borderRadius: IPHONE_DEVICE_OUTER_RADIUS_PX,
            }}
          >
            <div
              className="flex h-full w-full flex-col overflow-hidden bg-zinc-100"
              style={{ borderRadius: IPHONE_SCREEN_RADIUS_PX }}
            >
              <div className="shrink-0 bg-zinc-100">
                <div className="flex items-center justify-between px-6 pb-1 pt-3 text-[11px] font-semibold text-zinc-900">
                  <span>9:41</span>
                  <div className="flex items-center gap-1 text-zinc-700">
                    <Signal className="h-3.5 w-3.5" aria-hidden />
                    <Wifi className="h-3.5 w-3.5" aria-hidden />
                    <Battery className="h-3.5 w-3.5" aria-hidden />
                  </div>
                </div>

                <div className="mx-auto mb-1 h-[22px] w-[90px] rounded-full bg-zinc-900" />

                <div className="border-b border-zinc-200 bg-zinc-50 px-4 py-3 text-center">
                  <p className="truncate text-sm font-semibold text-zinc-900">
                    {senderName}
                  </p>
                  <p className="text-[11px] text-zinc-500">Text message</p>
                </div>
              </div>

              <div
                className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-zinc-100 px-4 py-4 [scrollbar-width:thin]"
                aria-label="Message thread"
              >
                <div className="space-y-3">
                  {draft.campaignImagePreviewUrl ? (
                    <div className="flex justify-start">
                      <div className="max-w-[85%] overflow-hidden rounded-2xl rounded-tl-sm border border-zinc-200 bg-white">
                        <img
                          src={draft.campaignImagePreviewUrl}
                          alt="Campaign attachment preview"
                          className="max-h-32 w-full object-cover"
                        />
                      </div>
                    </div>
                  ) : null}

                  {messages.length === 0 ? (
                    <p className="px-2 py-12 text-center text-xs text-zinc-500">
                      Your message will appear here as you compose it.
                    </p>
                  ) : (
                    messages.map((message) => (
                      <PreviewBubble
                        key={message.id}
                        message={message}
                        isActive={message.id === highlightedId}
                      />
                    ))
                  )}
                </div>
              </div>

              <div className="flex shrink-0 justify-center bg-zinc-100 py-3">
                <div className="h-1 w-[120px] rounded-full bg-zinc-300" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {messages.length > 0 ? (
        <p className="mt-3 text-center text-[11px] text-muted-foreground">
          Highlighted message matches your current step.
        </p>
      ) : null}
    </aside>
  );
}

function PreviewBubble({
  message,
  isActive,
}: {
  message: PreviewMessage;
  isActive: boolean;
}) {
  return (
    <div className="flex flex-col items-start gap-1">
      {message.label ? (
        <span className="px-1 text-[10px] font-medium text-zinc-500">
          {message.label}
        </span>
      ) : null}
      <div
        className={cn(
          "max-w-[88%] rounded-2xl rounded-tl-sm border border-zinc-200/80 bg-white px-3.5 py-2.5 text-left text-[15px] leading-snug text-zinc-900",
          isActive && "ring-2 ring-brand-primary",
        )}
      >
        <p className="whitespace-pre-wrap break-words">{message.body}</p>
      </div>
      <span className="px-1 text-[11px] text-zinc-400">Just now</span>
    </div>
  );
}

function buildPreviewMessages(
  draft: CampaignSetupDraft,
  currentStepId: SetupStepId,
): PreviewMessage[] {
  const dealerDid = draft.dealerDid;
  const messages: PreviewMessage[] = [];

  const primaryBody = resolveMessagePreviewText(
    draft.primaryPromoText,
    dealerDid,
  );

  if (primaryBody) {
    messages.push({
      id: "primary",
      label:
        currentStepId === "messaging" || currentStepId === "general"
          ? "Primary promo"
          : "",
      body: primaryBody,
    });
  }

  if (!draft.remindersEnabled) {
    return messages;
  }

  const reminderTemplates = [
    { id: "reminder1", label: "Reminder 1", text: draft.reminder1Text },
    { id: "reminder2", label: "Reminder 2", text: draft.reminder2Text },
    { id: "reminder3", label: "Reminder 3", text: draft.reminder3Text },
  ] as const;

  for (const reminder of reminderTemplates) {
    const body = resolveMessagePreviewText(reminder.text, dealerDid);
    if (!body) continue;

    messages.push({
      id: reminder.id,
      label: currentStepId === "reminders" ? reminder.label : "",
      body,
    });
  }

  return messages;
}

function getHighlightedMessageId(
  currentStepId: SetupStepId,
): string | null {
  switch (currentStepId) {
    case "general":
    case "messaging":
    case "configuration":
    case "review":
      return "primary";
    case "reminders":
      return "reminder1";
    default:
      return null;
  }
}
