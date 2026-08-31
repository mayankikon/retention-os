"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TitleBar } from "@/components/layout/TitleBar";
import { cn } from "@/lib/utils";
import type { ReportingTab } from "@/types/reporting";

const REPORTING_TAB_ITEMS: {
  id: ReportingTab;
  href: string;
  label: string;
}[] = [
  { id: "leaderboard", href: "/reporting", label: "Leaderboard" },
  { id: "weekly", href: "/reporting/weekly", label: "Weekly CER" },
  { id: "activity", href: "/reporting/activity", label: "Activity Detail" },
];

const TITLE_BY_TAB: Record<ReportingTab, string> = {
  leaderboard: "Top rooftops by CER",
  weekly: "Smart Service Lead Weekly CER (By Message)",
  activity: "Smart Service Lead Activity Detail",
};

const SUBTITLE_BY_TAB: Record<ReportingTab, string> = {
  leaderboard:
    "Compare Smart Marketing rooftops in multi-rooftop dealer groups, ranked by click engagement rate.",
  weekly:
    "Review weekly Smart Service Lead CER by message type — Initial through Reminder 3.",
  activity:
    "Explore customer-level Smart Service Lead click detail, attribution, and mileage at the time of click.",
};

function resolveActiveTab(pathname: string): ReportingTab {
  if (pathname.startsWith("/reporting/weekly")) return "weekly";
  if (pathname.startsWith("/reporting/activity")) return "activity";
  return "leaderboard";
}

interface ReportingShellProps {
  children: React.ReactNode;
}

export function ReportingShell({ children }: ReportingShellProps) {
  const pathname = usePathname();
  const activeTab = resolveActiveTab(pathname);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <TitleBar
        breadcrumbs={[
          { label: "Smart Marketing", href: "/campaigns" },
          { label: "Reporting" },
        ]}
        title={TITLE_BY_TAB[activeTab]}
        subtitle={SUBTITLE_BY_TAB[activeTab]}
      />

      <div className="app-shell-content-px shrink-0">
        <div
          className="flex gap-6 border-b border-border"
          role="tablist"
          aria-label="Reporting sections"
        >
          {REPORTING_TAB_ITEMS.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <Link
                key={tab.id}
                href={tab.href}
                role="tab"
                aria-selected={isActive}
                className={cn(
                  "-mb-px cursor-pointer border-b-[3px] px-1 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "border-brand-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground",
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="app-shell-content-px app-shell-content-pb app-shell-scrollbar-dashed flex min-h-0 flex-1 flex-col overflow-y-auto pt-6">
        {children}
      </div>
    </div>
  );
}
