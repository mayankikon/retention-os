"use client";

import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ikontechnologies-arlington/nxtg-design-shiftpackage/primitives";
import {
  APP_DIALOG_CONTENT_MOTION_CLASS,
  APP_DIALOG_CONTENT_SHELL_CLASS,
  APP_DIALOG_FOOTER_CLASS,
  APP_DIALOG_FOOTER_SHELL_CLASS,
  APP_DIALOG_HEADER_CLASS,
  APP_DIALOG_HEADER_SHELL_CLASS,
  APP_DIALOG_OVERLAY_CLASS,
  APP_DIALOG_SCROLL_BODY_CLASS,
  APP_DIALOG_SIZE_CLASS,
  APP_DIALOG_TITLE_CLASS,
  type AppDialogSize,
} from "@/lib/app-dialog-shell";
import { cn } from "@/lib/utils";

interface AppDialogShellProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: AppDialogSize;
  showCloseButton?: boolean;
  bodyClassName?: string;
}

/**
 * Productdemo-style modal shell (inventory brochure / open-in-app pattern):
 * titled header, scroll body, borderless footer, main-column centering.
 */
export function AppDialogShell({
  open,
  onOpenChange,
  title,
  children,
  footer,
  size = "narrow",
  showCloseButton = true,
  bodyClassName,
}: AppDialogShellProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={showCloseButton}
        overlayClassName={APP_DIALOG_OVERLAY_CLASS}
        className={cn(
          "app-shell-dialog-content",
          APP_DIALOG_CONTENT_SHELL_CLASS,
          APP_DIALOG_SIZE_CLASS[size],
          APP_DIALOG_CONTENT_MOTION_CLASS,
        )}
      >
        <DialogHeader
          className={cn(APP_DIALOG_HEADER_SHELL_CLASS, APP_DIALOG_HEADER_CLASS)}
        >
          <DialogTitle className={APP_DIALOG_TITLE_CLASS}>{title}</DialogTitle>
        </DialogHeader>

        <div className={cn(APP_DIALOG_SCROLL_BODY_CLASS, bodyClassName)}>
          {children}
        </div>

        {footer ? (
          <DialogFooter
            className={cn(
              APP_DIALOG_FOOTER_SHELL_CLASS,
              APP_DIALOG_FOOTER_CLASS,
            )}
          >
            {footer}
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
