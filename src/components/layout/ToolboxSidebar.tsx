"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ChartNoAxesCombined,
  ChevronsUpDown,
  CircleUserRound,
  ClipboardList,
  List,
  Megaphone,
  TabletSmartphone,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { ToolboxRetentionOsLogo } from "@/components/layout/ToolboxRetentionOsLogo";
import { UiStyleToggle } from "@/components/layout/UiStyleToggle";
import { VersionSwitcher } from "@/components/layout/VersionSwitcher";
import { cn } from "@/lib/utils";

export interface ToolboxSidebarNavItem {
  label: string;
  /** Omitted while the setup leave-guard is active so clicks can be intercepted. */
  href?: string;
  isActive: boolean;
}

interface ToolboxSidebarProps {
  /** Smart Marketing destinations (Overview, Campaigns, Templates, Reports). */
  navItems: ToolboxSidebarNavItem[];
  onNavItemClick: (label: string) => void;
}

/** Figma icons per Smart Marketing destination (Campaign Builder MVP › 2475:2974). */
const SMART_MARKETING_ICONS: Record<string, LucideIcon> = {
  Overview: List,
  Campaigns: Megaphone,
  Templates: ClipboardList,
  Reports: ChartNoAxesCombined,
};

/**
 * Other Toolbox products shown for context only; this app does not own them,
 * so they render as inert rows.
 */
const TOOLBOX_PRODUCT_ITEMS: { label: string; icon: LucideIcon }[] = [
  { label: "Accounts", icon: UsersRound },
  { label: "Employees", icon: CircleUserRound },
  { label: "Devices", icon: TabletSmartphone },
];

const ROW_CONTENT_CLASS =
  "flex items-center gap-3 rounded-lg px-4 py-2 text-[14px] font-semibold leading-[19px] whitespace-nowrap";

function NavRow({
  label,
  icon: Icon,
  href,
  isActive = false,
  isInert = false,
  onClick,
}: {
  label: string;
  icon: LucideIcon;
  href?: string;
  isActive?: boolean;
  isInert?: boolean;
  onClick?: () => void;
}) {
  const content = (
    <>
      <Icon className="size-4 shrink-0" strokeWidth={2} aria-hidden />
      {label}
    </>
  );
  const contentClassName = cn(
    ROW_CONTENT_CLASS,
    isActive && "bg-[var(--toolbox-sidebar-overlay)]",
    !isActive && !isInert && "hover:bg-[rgb(24_27_30/0.1)]",
  );

  // Row box: 44px tall with the icon 24px from the edge, active or not.
  return (
    <div className="flex w-full pt-1 pr-6 pb-[5px] pl-2">
      {isInert ? (
        <span className={contentClassName} aria-disabled="true">
          {content}
        </span>
      ) : href ? (
        <Link
          href={href}
          onClick={onClick}
          className={contentClassName}
          aria-current={isActive ? "page" : undefined}
        >
          {content}
        </Link>
      ) : (
        <button
          type="button"
          onClick={onClick}
          className={cn(contentClassName, "cursor-pointer")}
          aria-current={isActive ? "page" : undefined}
        >
          {content}
        </button>
      )}
    </div>
  );
}

/** Toolbox UI style side panel (Figma: Smart Marketing - Updated Side Nav Bar). */
export function ToolboxSidebar({ navItems, onNavItemClick }: ToolboxSidebarProps) {
  return (
    <aside
      aria-label="Main navigation"
      className="hidden h-full w-[248px] shrink-0 flex-col toolbox:flex items-center gap-4 border-r border-[var(--toolbox-sidebar-border)] bg-[var(--toolbox-sidebar-bg)] py-6 text-[var(--toolbox-sidebar-fg)]"
    >
      <div className="flex w-full px-5">
        <ToolboxRetentionOsLogo
          showProductName={false}
          className="h-[28px] w-[75px] text-white"
        />
      </div>

      <div
        className="flex h-16 w-[232px] shrink-0 items-center gap-2 rounded-md bg-[var(--toolbox-sidebar-overlay)] py-2 pr-3 pl-2"
        aria-disabled="true"
      >
        <span className="relative size-9 shrink-0 overflow-hidden rounded-md border border-[#dcdcdc] bg-white">
          <Image
            src="/brand/ikon-account-logo.png"
            alt="Ikon"
            fill
            sizes="36px"
            className="object-contain"
          />
        </span>
        <span className="min-w-0 flex-1 truncate text-[14px] font-semibold leading-[19px]">
          Ikon Employee View
        </span>
        <ChevronsUpDown className="size-4 shrink-0" aria-hidden />
      </div>

      <nav className="flex min-h-0 w-full flex-1 flex-col overflow-y-auto">
        {TOOLBOX_PRODUCT_ITEMS.map((item) => (
          <NavRow key={item.label} label={item.label} icon={item.icon} isInert />
        ))}

        <p className="pt-6 pb-2 pl-4 text-[10px] font-semibold uppercase tracking-[1px] text-[#dceae7]">
          Smart Marketing
        </p>
        {navItems.map((item) => (
          <NavRow
            key={item.label}
            label={item.label}
            icon={SMART_MARKETING_ICONS[item.label] ?? List}
            href={item.href}
            isActive={item.isActive}
            onClick={() => onNavItemClick(item.label)}
          />
        ))}
      </nav>

      {/* Same controls as the Shift sidebar footer, recolored for the green panel. */}
      <div className="toolbox-sidebar-controls w-full shrink-0 border-t border-[var(--toolbox-sidebar-border)] px-4 pt-3">
        <VersionSwitcher />
        <UiStyleToggle />
      </div>

      <p className="text-center text-[12px] leading-4">
        <span className="mb-1 block">ikon Technologies 2026</span>
        <span className="block">All Copyrights Reserved</span>
      </p>
    </aside>
  );
}
