"use client";

import { useMemo } from "react";
import {
  Badge,
  Input,
  InputActionButton,
  InputContainer,
  InputIcon,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableHeaderCell,
  TableRow,
  TableSlotCell,
} from "@ikontechnologies-arlington/nxtg-design-shiftpackage/primitives";
import { DesignSystemTableShellNoTabs } from "@ikontechnologies-arlington/nxtg-design-shiftpackage";
import { Search, X } from "lucide-react";
import { parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";
import {
  ReportingEmptyState,
  ReportingExportButton,
} from "@/components/reporting/reporting-ui";
import { REPORTING_ROOFTOPS } from "@/data/reporting.mock";
import {
  DATA_TABLE_BODY_CELL_HEIGHT_PX,
  DATA_TABLE_CELL_INNER_HOVER_CLASS,
  DATA_TABLE_CELL_INSET_CLASS,
  DATA_TABLE_CLASS,
  DATA_TABLE_HEADER_CLASS,
  DATA_TABLE_HEADER_LABEL_CLASS,
  DATA_TABLE_HEADER_ROW_CLASS,
  DATA_TABLE_ROW_GROUP_CLASS,
  DATA_TABLE_ROW_HOVER_BACKGROUND_CLASS,
  DATA_TABLE_SHELL_BORDER_CLASS,
  DATA_TABLE_SLOT_LABEL_CLASS,
  getDataTableBodyCellFrameClass,
  getDataTableHeaderCellStyle,
  getDataTableHeaderThStyle,
  getDataTableInnerCellStyle,
} from "@/lib/data-table-chrome";
import { formatMessageCount } from "@/lib/format";
import {
  buildCsv,
  canShowCerLeaderboard,
  CER_TIME_PERIOD_LABELS,
  downloadCsv,
  formatCerPercent,
  MIN_CER_SAMPLE_SENT,
  rankRooftopsByCer,
} from "@/lib/reporting";
import { cn } from "@/lib/utils";
import { CER_TIME_PERIODS, REPORTING_SCOPES } from "@/types/reporting";

const LEADERBOARD_HEADERS = [
  { key: "rank", label: "Rank", widthClassName: "min-w-[72px] w-[88px]" },
  { key: "rooftop", label: "Rooftop", widthClassName: "min-w-[200px] w-[240px]" },
  {
    key: "group",
    label: "Dealer group",
    widthClassName: "min-w-[180px] w-[220px]",
  },
  { key: "sent", label: "Sent", widthClassName: "min-w-[88px] w-[104px]" },
  { key: "retried", label: "Retried", widthClassName: "min-w-[88px] w-[104px]" },
  {
    key: "clicked",
    label: "Clicked (1st-time)",
    widthClassName: "min-w-[140px] w-[160px]",
  },
  { key: "cer", label: "CER%", widthClassName: "min-w-[96px] w-[112px]" },
] as const;

const leaderboardParsers = {
  q: parseAsString.withDefault(""),
  period: parseAsStringLiteral(CER_TIME_PERIODS).withDefault("mtd"),
  scope: parseAsStringLiteral(REPORTING_SCOPES).withDefault("portfolio"),
};

export function CerLeaderboardView() {
  const [filters, setFilters] = useQueryStates(leaderboardParsers);
  const rows = useMemo(
    () => rankRooftopsByCer(REPORTING_ROOFTOPS, filters.period, filters.q),
    [filters.period, filters.q],
  );
  const isVisible = canShowCerLeaderboard(filters.scope);

  const handleExport = () => {
    const csv = buildCsv(
      [
        "Rank",
        "Rooftop",
        "Dealer group",
        "Sent",
        "Retried",
        "Clicked (1st-time)",
        "CER%",
        "Sample",
      ],
      rows.map((row) => [
        row.rank == null ? "NR" : String(row.rank),
        row.rooftop,
        row.dealerGroup,
        String(row.sent),
        String(row.retried),
        String(row.clickedFirstTime),
        formatCerPercent(row.cerPercent),
        row.isLowSample ? "Low sample" : "Qualified",
      ]),
    );
    downloadCsv("top-rooftops-by-cer.csv", csv);
  };

  const headerThStyle = getDataTableHeaderThStyle();
  const headerCellStyle = getDataTableHeaderCellStyle();
  const innerStyle = getDataTableInnerCellStyle();

  return (
    <div className="flex flex-col gap-6 pb-2">
      <section className="space-y-3" aria-label="Leaderboard filters">
        <div className="flex flex-wrap items-end gap-2.5">
          <InputContainer size="lg" className="control-hover-stroke w-full max-w-sm">
            <InputIcon position="lead">
              <Search className="size-4" aria-hidden />
            </InputIcon>
            <Input
              standalone={false}
              size="lg"
              type="search"
              placeholder="Search rooftop or dealer group"
              value={filters.q}
              onChange={(event) => {
                void setFilters({ q: event.target.value });
              }}
              aria-label="Search rooftop or dealer group"
            />
            {filters.q ? (
              <InputActionButton
                position="tail"
                type="button"
                onClick={() => void setFilters({ q: "" })}
                aria-label="Clear search"
              >
                <X className="size-4" />
              </InputActionButton>
            ) : null}
          </InputContainer>

          <div
            className="inline-flex rounded-[var(--radius-sm)] border border-border bg-card p-1"
            role="group"
            aria-label="Time period"
          >
            {CER_TIME_PERIODS.map((period) => {
              const isActive = filters.period === period;
              return (
                <button
                  key={period}
                  type="button"
                  onClick={() => void setFilters({ period })}
                  className={cn(
                    "cursor-pointer rounded-[6px] px-3 py-1.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  aria-pressed={isActive}
                >
                  {CER_TIME_PERIOD_LABELS[period]}
                </button>
              );
            })}
          </div>

          <div className="ml-auto">
            <ReportingExportButton
              onExport={handleExport}
              disabled={!isVisible || rows.length === 0}
            />
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Ranked rooftops need at least {MIN_CER_SAMPLE_SENT} messages sent.
          Lower volume stays visible with a Low sample badge and is not ranked,
          so a 100% CER on a handful of sends cannot take first place.
        </p>
      </section>

      {!isVisible ? (
        <ReportingEmptyState
          title="Leaderboard is for multi-rooftop groups"
          description="This rooftop is not part of a dealer group. The CER leaderboard is only available when a dealer group has two or more Smart Marketing rooftops."
          actionLabel="Back to portfolio view"
          onAction={() => void setFilters({ scope: "portfolio" })}
        />
      ) : rows.length === 0 ? (
        <ReportingEmptyState
          title="No rooftops match this search"
          description="Try a different rooftop or dealer group name, or clear search to see the full portfolio ranking."
          actionLabel="Clear search"
          onAction={() => void setFilters({ q: "" })}
        />
      ) : (
        <DesignSystemTableShellNoTabs
          className="min-w-0"
          cardBorderClassName={DATA_TABLE_SHELL_BORDER_CLASS}
        >
          <Table className={DATA_TABLE_CLASS} aria-label="Top rooftops by CER">
            <TableHeader className={DATA_TABLE_HEADER_CLASS}>
              <TableRow size="compact" className={DATA_TABLE_HEADER_ROW_CLASS}>
                {LEADERBOARD_HEADERS.map((header) => (
                  <TableHead
                    key={header.key}
                    className={cn(
                      header.widthClassName,
                      "h-auto align-middle",
                      DATA_TABLE_CELL_INSET_CLASS,
                    )}
                    style={headerThStyle}
                  >
                    <TableHeaderCell
                      variant="label"
                      label={header.label}
                      className={DATA_TABLE_HEADER_LABEL_CLASS}
                      style={headerCellStyle}
                    />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, rowIndex) => {
                const isLastRow = rowIndex === rows.length - 1;
                const cellFrame = getDataTableBodyCellFrameClass(isLastRow);
                return (
                  <TableRow
                    key={row.rooftopId}
                    size="default"
                    className={cn(
                      DATA_TABLE_ROW_GROUP_CLASS,
                      "!border-0 !bg-transparent",
                      DATA_TABLE_ROW_HOVER_BACKGROUND_CLASS,
                    )}
                    style={{ minHeight: DATA_TABLE_BODY_CELL_HEIGHT_PX }}
                  >
                    <TableCell className={cellFrame}>
                      <TableSlotCell
                        label={row.rank == null ? "—" : String(row.rank)}
                        className={cn(
                          DATA_TABLE_SLOT_LABEL_CLASS,
                          DATA_TABLE_CELL_INNER_HOVER_CLASS,
                        )}
                        style={innerStyle}
                      />
                    </TableCell>
                    <TableCell className={cellFrame}>
                      <div
                        className={cn(
                          "flex min-w-0 items-center gap-2",
                          DATA_TABLE_CELL_INNER_HOVER_CLASS,
                        )}
                        style={innerStyle}
                      >
                        <span
                          className={cn(
                            DATA_TABLE_SLOT_LABEL_CLASS,
                            "min-w-0 truncate font-medium",
                          )}
                        >
                          {row.rooftop}
                        </span>
                        {row.isLowSample ? (
                          <Badge tone="amber" variant="soft" className="shadow-none">
                            Low sample
                          </Badge>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className={cellFrame}>
                      <TableSlotCell
                        label={row.dealerGroup}
                        className={cn(
                          DATA_TABLE_SLOT_LABEL_CLASS,
                          DATA_TABLE_CELL_INNER_HOVER_CLASS,
                          "text-muted-foreground",
                        )}
                        style={innerStyle}
                      />
                    </TableCell>
                    <TableCell className={cellFrame}>
                      <TableSlotCell
                        label={formatMessageCount(row.sent)}
                        className={cn(
                          DATA_TABLE_SLOT_LABEL_CLASS,
                          DATA_TABLE_CELL_INNER_HOVER_CLASS,
                        )}
                        style={innerStyle}
                      />
                    </TableCell>
                    <TableCell className={cellFrame}>
                      <TableSlotCell
                        label={formatMessageCount(row.retried)}
                        className={cn(
                          DATA_TABLE_SLOT_LABEL_CLASS,
                          DATA_TABLE_CELL_INNER_HOVER_CLASS,
                        )}
                        style={innerStyle}
                      />
                    </TableCell>
                    <TableCell className={cellFrame}>
                      <TableSlotCell
                        label={formatMessageCount(row.clickedFirstTime)}
                        className={cn(
                          DATA_TABLE_SLOT_LABEL_CLASS,
                          DATA_TABLE_CELL_INNER_HOVER_CLASS,
                        )}
                        style={innerStyle}
                      />
                    </TableCell>
                    <TableCell className={cellFrame}>
                      <TableSlotCell
                        label={formatCerPercent(row.cerPercent)}
                        className={cn(
                          DATA_TABLE_SLOT_LABEL_CLASS,
                          DATA_TABLE_CELL_INNER_HOVER_CLASS,
                          row.isLowSample
                            ? "text-muted-foreground"
                            : "font-medium text-emerald-700",
                        )}
                        style={innerStyle}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </DesignSystemTableShellNoTabs>
      )}

      {isVisible ? (
        <p className="text-xs text-muted-foreground">
          Ikon SM Admin portfolio only. Dealer Admin in-group ranking is
          post-MVP.{" "}
          <button
            type="button"
            className="cursor-pointer underline-offset-2 hover:underline"
            onClick={() => void setFilters({ scope: "ungrouped" })}
          >
            Preview ungrouped rooftop
          </button>
        </p>
      ) : null}
    </div>
  );
}
