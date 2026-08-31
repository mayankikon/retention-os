"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Megaphone } from "lucide-react";
import {
  AppGroovedMainColumn,
  Sidebar,
  type SidebarNavSectionConfig,
  type SidebarProductConfig,
} from "@ikontechnologies-arlington/nxtg-design-shiftpackage";
import { ToolboxRetentionOsLogo } from "@/components/layout/ToolboxRetentionOsLogo";
import { VersionSwitcher } from "@/components/layout/VersionSwitcher";
import {
  getSmartMarketingNavItems,
  isSmartMarketingNavItemActive,
} from "@/components/layout/app-navigation";
import { useOptionalCampaignSetupLeaveGuard } from "@/contexts/campaign-setup-leave-guard";
import { useProductVersion } from "@/contexts/product-version-context";
import { useCurrentUser } from "@/contexts/session-context";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

const PRODUCTS: SidebarProductConfig[] = [
  { id: "smart-marketing", label: "Smart Marketing", icon: Megaphone },
];

export function AppShell({
  children,
  className,
  contentClassName,
}: AppShellProps) {
  const pathname = usePathname();
  const user = useCurrentUser();
  const { versionId } = useProductVersion();
  const leaveGuard = useOptionalCampaignSetupLeaveGuard();
  const isSetupActive = Boolean(leaveGuard?.isSetupActive);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const navItems = useMemo(
    () => getSmartMarketingNavItems(versionId),
    [versionId],
  );

  const mainSections = useMemo<SidebarNavSectionConfig[]>(
    () => [
      {
        items: navItems.map((item) => ({
          label: item.label,
          icon: item.icon,
          isActive: isSmartMarketingNavItemActive(item.href, pathname),
          // Omit href while setup leave-guard is active so Sidebar renders
          // buttons we can intercept (Links cannot be preventDefault'd via API).
          href: isSetupActive ? undefined : item.href,
        })),
      },
    ],
    [navItems, pathname, isSetupActive],
  );

  const handleNavItemClick = (label: string) => {
    const item = navItems.find((navItem) => navItem.label === label);
    if (!item) return;
    if (leaveGuard?.isSetupActive) {
      leaveGuard.requestNavigation(item.href);
    }
  };

  return (
    <div className="flex h-svh min-h-0 overflow-hidden bg-shell font-sans dark:bg-background">
      <Sidebar
        homeHref="/campaigns"
        // Full Toolbox / Retention OS lockup only while expanded; the collapsed
        // rail falls back to Shift's condensed mark, which fits the icon column.
        logo={isSidebarCollapsed ? undefined : <ToolboxRetentionOsLogo />}
        showTopProductSwitcher={false}
        showFooterProductToggle={false}
        showRightDivider={false}
        collapsible
        collapsed={isSidebarCollapsed}
        onCollapsedChange={setIsSidebarCollapsed}
        products={PRODUCTS}
        activeProductId="smart-marketing"
        mainSections={mainSections}
        // Hide Shift's default Settings block (General / Alerts / Marketing /
        // Configurations) until those destinations exist in this app.
        settingsSections={[]}
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
