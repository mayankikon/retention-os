"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { Building2, LayoutList, LayoutTemplate, Megaphone } from "lucide-react";
import {
  AppGroovedMainColumn,
  Sidebar,
  type SidebarNavSectionConfig,
  type SidebarProductConfig,
} from "@ikontechnologies-arlington/nxtg-design-shiftpackage";
import { VersionSwitcher } from "@/components/layout/VersionSwitcher";
import { useOptionalCampaignSetupLeaveGuard } from "@/contexts/campaign-setup-leave-guard";
import { useCurrentUser } from "@/contexts/session-context";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

const NAV_ITEMS = [
  {
    href: "/campaigns",
    label: "Campaigns",
    icon: LayoutList,
  },
  {
    href: "/templates",
    label: "Templates",
    icon: LayoutTemplate,
  },
  {
    href: "/accounts",
    label: "Accounts",
    icon: Building2,
  },
] as const;

const PRODUCTS: SidebarProductConfig[] = [
  { id: "smart-marketing", label: "Smart Marketing", icon: Megaphone },
];

function isNavItemActive(href: string, pathname: string): boolean {
  if (href === "/campaigns") {
    return (
      pathname === "/campaigns" ||
      (pathname.startsWith("/campaigns/") &&
        !pathname.startsWith("/campaigns/redlines"))
    );
  }
  if (href === "/accounts") {
    return pathname === "/accounts" || pathname.startsWith("/accounts/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({
  children,
  className,
  contentClassName,
}: AppShellProps) {
  const pathname = usePathname();
  const user = useCurrentUser();
  const leaveGuard = useOptionalCampaignSetupLeaveGuard();
  const isSetupActive = Boolean(leaveGuard?.isSetupActive);

  const mainSections = useMemo<SidebarNavSectionConfig[]>(
    () => [
      {
        items: NAV_ITEMS.map((item) => ({
          label: item.label,
          icon: item.icon,
          isActive: isNavItemActive(item.href, pathname),
          // Omit href while setup leave-guard is active so Sidebar renders
          // buttons we can intercept (Links cannot be preventDefault'd via API).
          href: isSetupActive ? undefined : item.href,
        })),
      },
    ],
    [pathname, isSetupActive],
  );

  const handleNavItemClick = (label: string) => {
    const item = NAV_ITEMS.find((navItem) => navItem.label === label);
    if (!item) return;
    if (leaveGuard?.isSetupActive) {
      leaveGuard.requestNavigation(item.href);
    }
  };

  return (
    <div className="flex h-svh min-h-0 overflow-hidden bg-shell font-sans dark:bg-background">
      <Sidebar
        homeHref="/campaigns"
        // Omit `logo` so Shift renders the Toolbox wordmark + condensed mark
        // (same size/weight morph as productdemo when the rail collapses).
        showTopProductSwitcher={false}
        showFooterProductToggle={false}
        showRightDivider={false}
        collapsible
        products={PRODUCTS}
        activeProductId="smart-marketing"
        mainSections={mainSections}
        onNavItemClick={handleNavItemClick}
        user={{
          primaryText: user.name,
          secondaryText: user.role,
          initials: user.initials,
        }}
        userFooterPanel={<VersionSwitcher />}
      />

      <AppGroovedMainColumn panelClassName="min-h-0">
        {/*
          Match new-toolbox workspace shell: main column is overflow-hidden;
          each page owns scroll (list pages pin the table; wizards/detail scroll).
          No max-width — content fills the grooved panel edge-to-edge.
        */}
        <main
          className={cn(
            "relative flex min-h-0 flex-1 flex-col overflow-hidden",
            className,
          )}
        >
          <div
            className={cn(
              "relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden",
              contentClassName,
            )}
          >
            {children}
          </div>
        </main>
      </AppGroovedMainColumn>
    </div>
  );
}
