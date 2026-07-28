/**
 * Dialog chrome shared with new-toolbox inventory / campaign wizard modals
 * (Send Brochure, Open in App, etc.).
 */

/** Header: title only — no divider; description lives in the scroll body. */
export const APP_DIALOG_HEADER_CLASS = "px-4 pt-4 pb-0";

export const APP_DIALOG_HEADER_SHELL_CLASS = "shrink-0";

/** One step above default DialogTitle (`text-base`). */
export const APP_DIALOG_TITLE_CLASS = "text-lg font-medium leading-snug normal-case";

/** Default DialogContent uses rounded-md (8px); toolbox modals use 12px. */
export const APP_DIALOG_RADIUS_CLASS = "rounded-[12px]";

/** Shared flex column shell. */
export const APP_DIALOG_CONTENT_SHELL_CLASS = `flex max-h-[min(900px,90vh)] flex-col gap-0 overflow-hidden p-0 ${APP_DIALOG_RADIUS_CLASS}`;

export type AppDialogSize = "narrow" | "compact";

export const APP_DIALOG_SIZE_CLASS: Record<AppDialogSize, string> = {
  narrow: "max-w-lg sm:max-w-lg",
  compact: "max-w-md sm:max-w-md",
};

/** Scrollable body — 8px below title. */
export const APP_DIALOG_SCROLL_BODY_CLASS =
  "min-h-0 flex-1 overflow-y-auto px-4 pb-2 pt-2";

export const APP_DIALOG_FOOTER_SHELL_CLASS = "shrink-0";

/** Footer: no gray fill, no top border; actions right-aligned. */
export const APP_DIALOG_FOOTER_CLASS =
  "mx-0 mb-0 gap-2 border-0 bg-transparent px-4 pt-4 pb-4 sm:flex-row sm:justify-end";

export const APP_DIALOG_INSTRUCTION_CLASS =
  "text-sm leading-snug text-foreground";

/**
 * Solid 50% dark scrim, no backdrop blur. Enter ~200ms / exit ~100ms ease-out.
 * Pass to DialogContent `overlayClassName`.
 */
export const APP_DIALOG_OVERLAY_CLASS =
  "bg-black/50 supports-backdrop-filter:backdrop-blur-none duration-200 ease-out data-closed:duration-100 motion-reduce:animate-none";

/** Content motion paired with the scrim above. */
export const APP_DIALOG_CONTENT_MOTION_CLASS =
  "duration-200 ease-out data-closed:duration-100 motion-reduce:animate-none";
