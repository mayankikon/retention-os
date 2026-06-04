"use client";

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
import { cn } from "@/lib/utils";
import {
  buildEmailPreviewContent,
  getSenderEmailAddress,
  getSenderInitials,
  getEmailPreviewSubject,
} from "@/lib/email-preview";

export interface PreviewMessageItem {
  id: string;
  label: string;
  body: string;
  imagePreviewUrl: string | null;
}

interface SmsPreviewFrameProps {
  senderName: string;
  messages: PreviewMessageItem[];
  highlightedId: string | null;
}

export function SmsPreviewFrame({
  senderName,
  messages,
  highlightedId,
}: SmsPreviewFrameProps) {
  return (
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
              aria-label="SMS message thread"
            >
              <PreviewMessageList
                messages={messages}
                highlightedId={highlightedId}
                variant="sms"
              />
            </div>

            <div className="flex shrink-0 justify-center bg-zinc-100 py-3">
              <div className="h-1 w-[120px] rounded-full bg-zinc-300" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface EmailPreviewFrameProps {
  senderName: string;
  campaignName: string;
  dealerUrl: string;
  messages: PreviewMessageItem[];
  highlightedId: string | null;
}

export function EmailPreviewFrame({
  senderName,
  campaignName,
  dealerUrl,
  messages,
  highlightedId,
}: EmailPreviewFrameProps) {
  const activeMessage =
    messages.find((message) => message.id === highlightedId) ?? messages[0];

  if (!activeMessage) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-12 text-center text-sm text-muted-foreground">
        Your email will appear here as you compose it.
      </div>
    );
  }

  const subject = getEmailPreviewSubject(
    senderName,
    campaignName,
    activeMessage.id,
  );
  const content = buildEmailPreviewContent(activeMessage.body, dealerUrl);
  const senderEmail = getSenderEmailAddress(senderName);
  const senderInitials = getSenderInitials(senderName);

  return (
    <div
      className="w-full overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-md"
      aria-label="Email preview"
    >
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-2.5">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span className="font-medium text-zinc-700">Mail</span>
          <span aria-hidden>·</span>
          <span>Inbox</span>
        </div>
        <span className="text-[11px] text-zinc-400">Today, 9:41 AM</span>
      </div>

      <div className="space-y-3 border-b border-zinc-200 px-4 py-4">
        <h3 className="text-[17px] font-semibold leading-snug text-zinc-900">
          {subject}
        </h3>

        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-primary text-sm font-semibold text-white">
            {senderInitials}
          </div>
          <div className="min-w-0 flex-1 text-sm">
            <p className="font-medium text-zinc-900">{senderName}</p>
            <p className="truncate text-zinc-500">
              &lt;{senderEmail}&gt;
            </p>
            <p className="mt-1 text-zinc-500">
              to{" "}
              <span className="text-zinc-700">John Smith</span>
              {" · "}
              <span className="text-zinc-600">john.smith@example.com</span>
            </p>
          </div>
        </div>
      </div>

      <div className="max-h-[480px] overflow-y-auto [scrollbar-width:thin]">
        <div className="border-b border-zinc-100 bg-zinc-50 px-4 py-3 text-center">
          <p className="text-base font-semibold text-zinc-900">{senderName}</p>
          <p className="mt-0.5 text-xs text-zinc-500">Service Department</p>
        </div>

        <div className="select-none space-y-4 px-4 py-5 text-[14px] leading-6 text-zinc-800">
          {content.paragraphs.map((paragraph) => (
            <p key={paragraph} className="break-words">
              {paragraph}
            </p>
          ))}

          {activeMessage.imagePreviewUrl ? (
            <img
              src={activeMessage.imagePreviewUrl}
              alt="Email attachment"
              className="w-full rounded-md border border-zinc-200 object-cover"
            />
          ) : null}

          {content.ctaHref ? (
            <div className="pt-1">
              <span className="inline-block rounded-md bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm">
                {content.ctaLabel}
              </span>
            </div>
          ) : null}

          {content.phoneNumber ? (
            <p className="text-sm text-zinc-600">
              Questions? Call us at{" "}
              <span className="font-medium text-zinc-900">{content.phoneNumber}</span>
            </p>
          ) : null}

          <p className="border-t border-zinc-100 pt-4 text-sm text-zinc-600">
            — {senderName} Service Team
          </p>
        </div>

        <div className="border-t border-zinc-100 bg-zinc-50 px-4 py-4 text-center text-[11px] leading-relaxed text-zinc-500">
          <p>You received this email because you are a valued customer.</p>
          <p className="mt-1">
            <span className="text-zinc-600">Unsubscribe</span>
            {" · "}
            <span className="text-zinc-600">Privacy policy</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function PreviewMessageList({
  messages,
  highlightedId,
  variant,
}: {
  messages: PreviewMessageItem[];
  highlightedId: string | null;
  variant: "sms" | "email";
}) {
  if (messages.length === 0) {
    return (
      <p className="px-2 py-12 text-center text-sm text-zinc-500">
        Your message will appear here as you compose it.
      </p>
    );
  }

  return (
    <div className={cn("space-y-4", variant === "email" && "space-y-6")}>
      {messages.map((message) => (
        <div key={message.id} className="space-y-3">
          {message.label ? (
            <span
              className={cn(
                "block font-medium text-zinc-500",
                variant === "sms" ? "px-1 text-[10px]" : "text-xs",
              )}
            >
              {message.label}
            </span>
          ) : null}

          {message.imagePreviewUrl ? (
            <PreviewImage
              src={message.imagePreviewUrl}
              alt={`${message.label || "Message"} attachment`}
              isActive={message.id === highlightedId}
              variant={variant}
            />
          ) : null}

          <PreviewBody
            body={message.body}
            isActive={message.id === highlightedId}
            variant={variant}
          />

          {variant === "sms" ? (
            <span className="px-1 text-[11px] text-zinc-400">Just now</span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function PreviewImage({
  src,
  alt,
  isActive,
  variant,
}: {
  src: string;
  alt: string;
  isActive: boolean;
  variant: "sms" | "email";
}) {
  if (variant === "email") {
    return (
      <img
        src={src}
        alt={alt}
        className={cn(
          "max-h-48 w-full rounded-md border border-border object-cover",
          isActive && "ring-2 ring-brand-primary",
        )}
      />
    );
  }

  return (
    <div className="flex justify-start">
      <div
        className={cn(
          "max-w-[85%] overflow-hidden rounded-2xl rounded-tl-sm border border-zinc-200 bg-white",
          isActive && "ring-2 ring-brand-primary",
        )}
      >
        <img src={src} alt={alt} className="max-h-36 w-full object-cover" />
      </div>
    </div>
  );
}

function PreviewBody({
  body,
  isActive,
  variant,
}: {
  body: string;
  isActive: boolean;
  variant: "sms" | "email";
}) {
  if (variant === "email") {
    return (
      <p
        className={cn(
          "whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground",
          isActive && "rounded-md ring-2 ring-brand-primary ring-offset-2",
        )}
      >
        {body}
      </p>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <div
        className={cn(
          "max-w-[92%] rounded-2xl rounded-tl-sm border border-zinc-200/80 bg-white px-3.5 py-2.5 text-left text-[16px] leading-relaxed text-zinc-900",
          isActive && "ring-2 ring-brand-primary",
        )}
      >
        <p className="whitespace-pre-wrap break-words">{body}</p>
      </div>
    </div>
  );
}
