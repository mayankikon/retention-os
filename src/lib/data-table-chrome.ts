import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

/** Matches new-toolbox file-cabinet / customers / staff tables. */
export const DATA_TABLE_BODY_CELL_HEIGHT_PX = 40;

export const DATA_TABLE_CLASS =
  "border-separate border-spacing-0 bg-transparent text-sm";

export const DATA_TABLE_HEADER_CLASS = "[&_tr]:border-0";

/** Header band + hover (new table state). */
export const DATA_TABLE_HEADER_ROW_CLASS =
  "!border-0 !bg-[#fafafa] dark:!bg-gray-800/50 hover:!bg-[#fafafa] dark:hover:!bg-gray-800/50";

/**
 * 16px L/R on `<th>` / `<td>` — pair with zero padding on `TableHeaderCell` /
 * inner cell wrappers so header labels and body text share the same left edge.
 */
export const DATA_TABLE_CELL_INSET_CLASS = "px-[var(--spacing-16,16px)] py-0";

export const DATA_TABLE_BODY_CELL_DIVIDER_CLASS =
  "border-b border-solid border-border";

export const DATA_TABLE_ROW_GROUP_CLASS = "group/data-row cursor-default";

export const DATA_TABLE_ROW_HOVER_BACKGROUND_CLASS =
  "hover:!bg-[#fafafa] dark:hover:!bg-gray-800/50";

export const DATA_TABLE_CELL_INNER_HOVER_CLASS =
  "origin-center transform-gpu cursor-default [&_*]:cursor-default [&_a[href]]:cursor-pointer [&_button]:cursor-pointer [&_[role=button]]:cursor-pointer transition-transform duration-150 ease-out motion-reduce:transition-none motion-reduce:group-hover/data-row:scale-100 group-hover/data-row:scale-[1.01]";

export const DATA_TABLE_HEADER_LABEL_CLASS = cn(
  "[&_span.truncate]:text-sm [&_span.truncate]:leading-5",
  "[&_span.truncate]:!text-muted-foreground",
  "h-full min-h-0 w-full rounded-none border-0 bg-transparent py-0 shadow-none",
);

export const DATA_TABLE_HEADER_CELL_INNER_CLASS =
  "h-full min-h-0 w-full rounded-none border-0 bg-transparent py-0 shadow-none";

export const DATA_TABLE_SHELL_BORDER_CLASS = "border-border";

export const DATA_TABLE_SLOT_LABEL_CLASS =
  "text-foreground [&_span.truncate]:text-sm [&_span.truncate]:leading-5";

export function getDataTableHeaderThStyle(
  heightPx: number = DATA_TABLE_BODY_CELL_HEIGHT_PX,
): CSSProperties {
  return {
    backgroundColor: "transparent",
    borderWidth: 0,
    borderStyle: "solid",
    borderColor: "transparent",
    borderBottomWidth: 1,
    borderBottomColor: "var(--border)",
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    height: heightPx,
    minHeight: heightPx,
    maxHeight: heightPx,
    boxSizing: "border-box",
    verticalAlign: "middle",
  };
}

export function getDataTableHeaderCellStyle(
  heightPx: number = DATA_TABLE_BODY_CELL_HEIGHT_PX,
): CSSProperties {
  return {
    height: heightPx,
    minHeight: heightPx,
    maxHeight: heightPx,
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: 0,
    paddingBottom: 0,
    boxSizing: "border-box",
  };
}

export function getDataTableInnerCellStyle(
  heightPx: number = DATA_TABLE_BODY_CELL_HEIGHT_PX,
): CSSProperties {
  return {
    height: heightPx,
    minHeight: heightPx,
    maxHeight: heightPx,
    paddingLeft: 0,
    paddingRight: 0,
    boxSizing: "border-box",
  };
}

export function getDataTableBodyCellFrameClass(isLastRow: boolean): string {
  return cn(
    "align-middle",
    DATA_TABLE_CELL_INSET_CLASS,
    !isLastRow && DATA_TABLE_BODY_CELL_DIVIDER_CLASS,
  );
}
