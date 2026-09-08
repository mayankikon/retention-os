import { BarChart3, LayoutList, LayoutTemplate } from "lucide-react";

/** Reports ship in every product version, so no nav item is version-gated. */
export const SMART_MARKETING_NAV_ITEMS = [
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
    href: "/reports",
    label: "Reports",
    icon: BarChart3,
  },
] as const;

export function isSmartMarketingNavItemActive(
  href: string,
  pathname: string,
): boolean {
  if (href === "/campaigns") {
    return (
      pathname === "/campaigns" ||
      (pathname.startsWith("/campaigns/") &&
        !pathname.startsWith("/campaigns/redlines"))
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
