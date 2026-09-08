"use client";

import Link from "next/link";
import { formatMessageCount } from "@/lib/format";
import {
  formatCerPercent,
  getWeeklyCerPercent,
  WEEKLY_MESSAGE_LABELS,
  WEEKLY_MESSAGE_TYPES,
  WEEKLY_METRIC_ROWS,
} from "@/lib/reporting";
import { cn } from "@/lib/utils";
import type {
  ReportWeeklyScope,
  ReportWeeklySection,
} from "@/types/reports";
import type { WeeklyMessageMetrics } from "@/types/reporting";

type WeeklyMetricKey = (typeof WEEKLY_METRIC_ROWS)[number]["key"];

const WEEKLY_COLUMN_COUNT = WEEKLY_MESSAGE_TYPES.length + 2;

interface ReportWeeklyPerformanceProps {
  sections: ReportWeeklySection[];
  scope: ReportWeeklyScope;
  scopeHref: string | null;
}

export function ReportWeeklyPerformance({
  sections,
  scope,
  scopeHref,
}: ReportWeeklyPerformanceProps) {
  return (
    <article className="surface-stroke-sharp overflow-hidden rounded-[var(--radius-sm)] bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            Weekly performance
          </h2>
          <p className="text-xs text-muted-foreground">
            {scopeHref ? (
              <Link
                href={scopeHref}
                className="font-medium text-brand-primary underline-offset-2 hover:underline"
              >
                {scope.name}
              </Link>
            ) : (
              <span className="font-medium text-foreground">{scope.name}</span>
            )}
            {scope.isCumulative
              ? ` — cumulative (${formatRooftopCount(scope.dealershipCount)})`
              : null}
          </p>
        </div>
        <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground">
          {sections.length === 1 ? "1 week" : `${sections.length} weeks`}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="bg-[#fafafa] text-left text-muted-foreground">
              <th className="px-4 py-2.5 font-medium">Metric</th>
              {WEEKLY_MESSAGE_TYPES.map((type) => (
                <th key={type} className="px-4 py-2.5 font-medium">
                  {WEEKLY_MESSAGE_LABELS[type]}
                </th>
              ))}
              <th className="px-4 py-2.5 font-medium">Total</th>
            </tr>
          </thead>
          {sections.map((section) => (
            <tbody key={section.weekId}>
              <tr className="border-t border-border bg-[#fafafa]">
                <th
                  scope="colgroup"
                  colSpan={WEEKLY_COLUMN_COUNT}
                  className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-foreground"
                >
                  {section.label}
                  {shouldShowSectionCoverage(scope, section) ? (
                    <span className="ml-2 font-normal normal-case tracking-normal text-muted-foreground">
                      {formatRooftopCount(section.dealershipCount)} reporting
                    </span>
                  ) : null}
                </th>
              </tr>
              {WEEKLY_METRIC_ROWS.map((metric) => (
                <tr
                  key={`${section.weekId}-${metric.key}`}
                  className="border-t border-border"
                >
                  <td className="px-4 py-2.5 font-medium text-foreground">
                    {metric.label}
                  </td>
                  {WEEKLY_MESSAGE_TYPES.map((type) => (
                    <td
                      key={type}
                      className={getWeeklyCellClassName(metric.key)}
                    >
                      {formatWeeklyMetric(
                        section.metricsByMessage[type],
                        metric.key,
                      )}
                    </td>
                  ))}
                  <td
                    className={cn(
                      getWeeklyCellClassName(metric.key),
                      "font-semibold",
                    )}
                  >
                    {formatWeeklyMetric(section.totals, metric.key)}
                  </td>
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>
    </article>
  );
}

/** A week can cover fewer rooftops than the scope when a store had no sends. */
function shouldShowSectionCoverage(
  scope: ReportWeeklyScope,
  section: ReportWeeklySection,
): boolean {
  return scope.isCumulative && section.dealershipCount !== scope.dealershipCount;
}

function formatWeeklyMetric(
  metrics: WeeklyMessageMetrics,
  metricKey: WeeklyMetricKey,
): string {
  if (metricKey === "cer") {
    return formatCerPercent(
      getWeeklyCerPercent(metrics.sent, metrics.clicks),
    );
  }
  return formatMessageCount(
    metricKey === "sent" ? metrics.sent : metrics.clicks,
  );
}

function getWeeklyCellClassName(metricKey: WeeklyMetricKey): string {
  return cn(
    "px-4 py-2.5",
    metricKey === "cer" ? "font-semibold text-emerald-700" : "text-foreground",
  );
}

function formatRooftopCount(count: number): string {
  return count === 1 ? "1 rooftop" : `${count} rooftops`;
}
