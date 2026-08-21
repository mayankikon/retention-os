import { LayoutList, LayoutTemplate } from "lucide-react";

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
