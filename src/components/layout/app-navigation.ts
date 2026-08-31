import { BarChart3, LayoutList, LayoutTemplate } from "lucide-react";
import { isExistingReportingAvailable } from "@/lib/product-version";
import type { ProductVersionId } from "@/types/product-version";

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
    href: "/reporting",
    label: "Reporting",
    icon: BarChart3,
  },
] as const;

export function getSmartMarketingNavItems(versionId: ProductVersionId) {
  return SMART_MARKETING_NAV_ITEMS.filter((item) => {
    if (item.href === "/reporting") {
      return isExistingReportingAvailable(versionId);
    }
    return true;
  });
}

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
