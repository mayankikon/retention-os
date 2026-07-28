"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TitleBarBreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface TitleBarProps {
  breadcrumbs?: TitleBarBreadcrumbItem[];
  titleLeading?: React.ReactNode;
  title?: React.ReactNode;
  titleTrailing?: React.ReactNode;
  subtitle?: React.ReactNode;
  right?: React.ReactNode;
  titleRowFullBleedX?: boolean;
  className?: string;
}

/**
 * Page title bar (Shift 2.0 Sort UI pattern from productdemo).
 * Not shipped by the shiftpackage — lives in each app.
 */
export function TitleBar({
  breadcrumbs,
  titleLeading,
  title,
  titleTrailing,
  subtitle,
  right,
  titleRowFullBleedX = false,
  className,
}: TitleBarProps) {
  const hasLeftContent =
    (breadcrumbs != null && breadcrumbs.length > 0) ||
    title != null ||
    subtitle != null ||
    titleLeading != null;
  const hasMultiLineContent =
    (breadcrumbs != null && breadcrumbs.length > 0) || subtitle != null;
  const hasAnyContent = hasLeftContent || right != null;
  const hasTitleOrActionsRow =
    title != null || right != null || titleLeading != null;

  if (!hasAnyContent) {
    return null;
  }

  return (
    <header
      className={cn(
        "mt-[var(--spacing-16,16px)] flex w-full min-w-0 shrink-0 flex-col",
        hasMultiLineContent ? "min-h-[4.5rem] pt-4 pb-4" : "pt-4 pb-2",
        "gap-1",
        className,
      )}
      role="banner"
      aria-label="Title bar"
    >
      {breadcrumbs != null && breadcrumbs.length > 0 ? (
        <nav
          aria-label="Breadcrumb"
          className="app-shell-content-px flex min-w-0 flex-wrap items-center gap-1 text-[12px] text-muted-foreground"
        >
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            const label = <span className="truncate">{item.label}</span>;
            const isInteractive =
              item.onClick != null || (item.href != null && !isLast);

            return (
              <span key={`${item.label}-${index}`} className="flex items-center gap-1">
                {isInteractive && item.href != null ? (
                  <Link
                    href={item.href}
                    className="truncate rounded-sm hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {label}
                  </Link>
                ) : isInteractive && item.onClick != null ? (
                  <button
                    type="button"
                    onClick={item.onClick}
                    className="truncate rounded-sm text-left hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {label}
                  </button>
                ) : (
                  <span
                    className={
                      isLast ? "font-medium text-foreground" : undefined
                    }
                  >
                    {label}
                  </span>
                )}
                {!isLast ? (
                  <ChevronRight
                    className="size-4 shrink-0 text-muted-foreground/70"
                    aria-hidden
                  />
                ) : null}
              </span>
            );
          })}
        </nav>
      ) : null}

      {hasTitleOrActionsRow ? (
        <div
          className={cn(
            "flex min-w-0 items-center justify-between gap-6",
            !titleRowFullBleedX && "app-shell-content-px",
          )}
        >
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {titleLeading}
            {title != null ? (
              <h1
                className={cn(
                  "min-w-0 truncate text-[30px] font-medium leading-tight tracking-[-0.6px] text-foreground",
                  titleTrailing == null && "flex-1",
                )}
              >
                {title}
              </h1>
            ) : null}
            {title != null && titleTrailing != null ? (
              <span className="flex shrink-0 items-center gap-2">
                {titleTrailing}
              </span>
            ) : null}
          </div>
          {right != null ? (
            <div className="flex shrink-0 items-center gap-2">{right}</div>
          ) : null}
        </div>
      ) : null}

      {subtitle != null ? (
        <p className="app-shell-content-px min-w-0 text-pretty text-[14px] font-normal leading-normal text-muted-foreground">
          {subtitle}
        </p>
      ) : null}
    </header>
  );
}
