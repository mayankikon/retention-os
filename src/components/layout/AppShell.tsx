"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, LayoutList, LayoutTemplate } from "lucide-react";
import { AppTitleBar } from "@/components/layout/AppTitleBar";
import { VersionSwitcher } from "@/components/layout/VersionSwitcher";
import { useOptionalCampaignSetupLeaveGuard } from "@/contexts/campaign-setup-leave-guard";
import { cn } from "@/lib/utils";

const LOGO_WIDTH_PX = Math.round(113 * 1.3 * 0.85);
const LOGO_HEIGHT_PX = Math.round(42 * 1.3 * 0.85);

/** Shared horizontal inset so logo and nav active states share the same left edge. */
const SIDEBAR_INSET_X = "px-5";

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
  const leaveGuard = useOptionalCampaignSetupLeaveGuard();

  const handleGuardedNavClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (!leaveGuard?.isSetupActive) return;
    event.preventDefault();
    leaveGuard.requestNavigation(href);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-card">
        <div className={cn(SIDEBAR_INSET_X, "pt-5 pb-4")}>
          <Link
            href="/campaigns"
            onClick={(event) => handleGuardedNavClick(event, "/campaigns")}
            className="inline-flex max-w-full items-center justify-start rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Image
              src="/logo.svg"
              alt="Ikon"
              width={LOGO_WIDTH_PX}
              height={LOGO_HEIGHT_PX}
              priority
              className="block w-auto max-w-full"
              style={{ height: `${LOGO_HEIGHT_PX}px` }}
            />
          </Link>
        </div>

        <nav
          className={cn("flex flex-1 flex-col gap-1 pb-4", SIDEBAR_INSET_X)}
          aria-label="Main"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = isNavItemActive(item.href, pathname);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={(event) => handleGuardedNavClick(event, item.href)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <VersionSwitcher />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <AppTitleBar />
        <main
          className={cn(
            "min-w-0 flex-1 px-6 py-8 lg:px-10",
            className ?? "overflow-auto",
          )}
        >
          <div className={cn("mx-auto w-full max-w-7xl", contentClassName)}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
