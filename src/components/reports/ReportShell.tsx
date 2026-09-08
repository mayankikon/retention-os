"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { TitleBar } from "@/components/layout/TitleBar";
import { REPORTING_ROOFTOPS } from "@/data/reporting.mock";
import { findDealershipById } from "@/lib/reports";

interface ReportShellProps {
  children: React.ReactNode;
}

export function ReportShell({ children }: ReportShellProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isActivity = pathname.startsWith("/reports/activity");
  const dealership = findDealershipById(
    REPORTING_ROOFTOPS,
    searchParams.get("dealership") ?? "",
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <TitleBar
        breadcrumbs={[
          { label: "Smart Marketing", href: "/campaigns" },
          isActivity
            ? { label: "Reports", href: "/reports" }
            : { label: "Reports" },
          ...(isActivity ? [{ label: dealership?.rooftop ?? "Activity" }] : []),
        ]}
        title={isActivity ? (dealership?.rooftop ?? "Activity") : "Reports"}
        subtitle={
          isActivity
            ? dealership
              ? "Customers who clicked for this dealership."
              : "Every customer click row, labeled by dealership."
            : "Compare dealership performance, then open a dealership to see the customers behind it."
        }
      />

      <div className="app-shell-content-px app-shell-content-pb app-shell-scrollbar-dashed flex min-h-0 flex-1 flex-col overflow-y-auto pt-6">
        {children}
      </div>
    </div>
  );
}
