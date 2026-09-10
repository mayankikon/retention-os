"use client";

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

interface ReportWeeklyPerformanceProps {
  sections: ReportWeeklySection[];
  scope: ReportWeeklyScope;
}

export function ReportWeeklyPerformance({
  sections,
  scope,
}: ReportWeeklyPerformanceProps) {
  return (
    <section className="flex flex-col gap-4" aria-label="Weekly snapshot">
      {sections.map((section) => (
        <WeeklySectionCard
          key={section.weekId}
          section={section}
          scope={scope}
        />
      ))}
    </section>
  );
}

interface WeeklySectionCardProps {
  section: ReportWeeklySection;
  scope: ReportWeeklyScope;
}

/** One week, standalone: each card repeats the column header so it reads alone. */
function WeeklySectionCard({ section, scope }: WeeklySectionCardProps) {
  return (
    <article className="surface-stroke-sharp overflow-hidden rounded-[var(--radius-sm)] bg-card">
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground">
          {section.label}
        </h3>
        {shouldShowSectionCoverage(scope, section) ? (
          <span className="text-xs text-muted-foreground">
            {formatRooftopCount(section.dealershipCount)} reporting
          </span>
        ) : null}
      </div>
      <div className="overflow-x-auto">
        <table
          className="w-full min-w-[720px] text-sm"
          aria-label={`Weekly snapshot for ${section.label}`}
        >
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
          <tbody>
            {WEEKLY_METRIC_ROWS.map((metric) => (
              <tr
                key={`${section.weekId}-${metric.key}`}
                className="border-t border-border"
              >
                <td className="px-4 py-2.5 font-medium text-foreground">
                  {metric.label}
                </td>
                {WEEKLY_MESSAGE_TYPES.map((type) => (
                  <td key={type} className={getWeeklyCellClassName(metric.key)}>
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
