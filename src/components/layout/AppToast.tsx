"use client";

import { Check, X } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";

interface AppToastProps {
  message: string;
  onDismiss: () => void;
  durationMs?: number;
}

export function AppToast({
  message,
  onDismiss,
  durationMs = 5000,
}: AppToastProps) {
  useEffect(() => {
    const timeoutId = window.setTimeout(onDismiss, durationMs);
    return () => window.clearTimeout(timeoutId);
  }, [durationMs, onDismiss]);

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      data-testid="app-toast"
      className="fixed right-6 bottom-6 z-50 flex w-[min(24rem,calc(100vw-3rem))] items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 shadow-lg"
      role="status"
      aria-live="polite"
    >
      <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <p className="min-w-0 flex-1">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="rounded-sm p-1 hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>,
    document.body,
  );
}
