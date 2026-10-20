import { BarChart3, LayoutList, LayoutTemplate, List } from "lucide-react";

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

/** Smart Marketing landing page; listed only in the Toolbox UI style sidebar. */
export const SMART_MARKETING_OVERVIEW_NAV_ITEM = {
  href: "/overview",
  label: "Overview",
  icon: List,
} as const;

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
