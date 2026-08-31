"use client";

import { useMemo, useState } from "react";
import {
  Button,
  Input,
  InputContainer,
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
import {
  ReportingEmptyState,
  ReportingExportButton,
  ReportingFieldLabel,
  ReportingSelect,
  ReportingSummaryCard,
} from "@/components/reporting/reporting-ui";
import { FILTER_ALL } from "@/data/lookups";
import {
  ACTIVITY_DETAIL_ROWS,
  ACTIVITY_MESSAGES_SENT,
  ACTIVITY_UPLIFT_PERCENT,
} from "@/data/reporting.mock";
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
  downloadCsv,
  filterActivityRows,
  formatCerPercent,
  formatMileage,
  listActivityDealers,
  listActivityRooftops,
  summarizeActivity,
} from "@/lib/reporting";
import { cn } from "@/lib/utils";

const ACTIVITY_HEADERS = [
  { key: "customer", label: "Customer", widthClassName: "min-w-[160px] w-[180px]" },
  { key: "vin", label: "VIN", widthClassName: "min-w-[180px] w-[200px]" },
  { key: "phone", label: "Phone", widthClassName: "min-w-[130px] w-[150px]" },
  { key: "email", label: "Email", widthClassName: "min-w-[200px] w-[220px]" },
  { key: "date", label: "Click Date", widthClassName: "min-w-[110px] w-[120px]" },
  { key: "message", label: "Message", widthClassName: "min-w-[110px] w-[120px]" },
  { key: "mileage", label: "Mileage", widthClassName: "min-w-[100px] w-[110px]" },
] as const;

interface ActivityFilterDraft {
  dateFrom: string;
  dateTo: string;
  dealer: string;
  rooftop: string;
}

const DEFAULT_FILTERS: ActivityFilterDraft = {
  dateFrom: "2026-08-01",
  dateTo: "2026-08-31",
  dealer: FILTER_ALL,
  rooftop: FILTER_ALL,
};

export function ActivityDetailView() {
  const [draft, setDraft] = useState<ActivityFilterDraft>(DEFAULT_FILTERS);
  const [applied, setApplied] = useState<ActivityFilterDraft>(DEFAULT_FILTERS);

  const dealerOptions = useMemo(
    () => [
      { value: FILTER_ALL, label: "All dealers" },
      ...listActivityDealers(ACTIVITY_DETAIL_ROWS).map((dealer) => ({
        value: dealer,
        label: dealer,
      })),
    ],
    [],
  );

  const rooftopOptions = useMemo(
    () => [
      { value: FILTER_ALL, label: "All rooftops" },
      ...listActivityRooftops(ACTIVITY_DETAIL_ROWS, draft.dealer).map(
        (rooftop) => ({ value: rooftop, label: rooftop }),
      ),
    ],
    [draft.dealer],
  );

  const rows = useMemo(
    () => filterActivityRows(ACTIVITY_DETAIL_ROWS, applied),
    [applied],
  );
  const summary = useMemo(
    () =>
      summarizeActivity(rows, ACTIVITY_MESSAGES_SENT, ACTIVITY_UPLIFT_PERCENT),
    [rows],
  );

  const handleDealerChange = (dealer: string) => {
    setDraft((current) => ({
      ...current,
      dealer,
      rooftop: FILTER_ALL,
    }));
  };

  const handleExport = () => {
    const csv = buildCsv(
      ["Customer", "VIN", "Phone", "Email", "Click Date", "Message", "Mileage"],
      rows.map((row) => [
        row.customer,
        row.vin,
        row.phone,
        row.email,
        row.clickDate,
        row.message,
        formatMileage(row.mileage),
      ]),
    );
    downloadCsv("smart-service-lead-activity-detail.csv", csv);
  };

  const headerThStyle = getDataTableHeaderThStyle();
  const headerCellStyle = getDataTableHeaderCellStyle();
  const innerStyle = getDataTableInnerCellStyle();

  return (
    <div className="flex flex-col gap-6 pb-2">
      <section className="space-y-3" aria-label="Activity detail filters">
        <div className="flex flex-wrap items-end gap-2.5">
          <div className="w-full min-w-[10rem] sm:w-[11rem]">
            <ReportingFieldLabel htmlFor="activity-date-from">
              Date From
            </ReportingFieldLabel>
            <InputContainer size="lg" className="control-hover-stroke">
              <Input
                id="activity-date-from"
                standalone={false}
                size="lg"
                type="date"
                value={draft.dateFrom}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    dateFrom: event.target.value,
                  }))
                }
              />
            </InputContainer>
          </div>
          <div className="w-full min-w-[10rem] sm:w-[11rem]">
            <ReportingFieldLabel htmlFor="activity-date-to">
              Date To
            </ReportingFieldLabel>
            <InputContainer size="lg" className="control-hover-stroke">
              <Input
                id="activity-date-to"
                standalone={false}
                size="lg"
                type="date"
                value={draft.dateTo}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    dateTo: event.target.value,
                  }))
                }
              />
            </InputContainer>
          </div>
          <div className="w-full min-w-[14rem] sm:w-[16rem]">
            <ReportingFieldLabel>Dealer</ReportingFieldLabel>
            <ReportingSelect
              label="Dealer"
              value={draft.dealer}
              options={dealerOptions}
              onValueChange={handleDealerChange}
              className="w-full"
            />
          </div>
          <div className="w-full min-w-[14rem] sm:w-[16rem]">
            <ReportingFieldLabel>Rooftop</ReportingFieldLabel>
            <ReportingSelect
              label="Rooftop"
              value={draft.rooftop}
              options={rooftopOptions}
              onValueChange={(rooftop) =>
                setDraft((current) => ({ ...current, rooftop }))
              }
              className="w-full"
            />
          </div>
          <Button size="lg" onClick={() => setApplied(draft)}>
            Apply Filters
          </Button>
          <ReportingExportButton
            onExport={handleExport}
            disabled={rows.length === 0}
          />
        </div>
      </section>

      <section
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Activity summary"
      >
        <ReportingSummaryCard
          label="Messages Sent"
          value={formatMessageCount(summary.messagesSent)}
        />
        <ReportingSummaryCard
          label="Total Clicks"
          value={formatMessageCount(summary.totalClicks)}
        />
        <ReportingSummaryCard
          label="Uplift %"
          value={formatCerPercent(summary.upliftPercent)}
        />
        <ReportingSummaryCard
          label="CER %"
          value={formatCerPercent(summary.cerPercent)}
          hint="First-time clicks ÷ messages sent"
        />
      </section>

      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          Smart Service Lead Activity Detail
        </h2>
        {rows.length === 0 ? (
          <ReportingEmptyState
            title="No click activity for these filters"
            description="Widen the date range or choose another dealer and rooftop, then apply filters."
            actionLabel="Reset filters"
            onAction={() => {
              setDraft(DEFAULT_FILTERS);
              setApplied(DEFAULT_FILTERS);
            }}
          />
        ) : (
          <DesignSystemTableShellNoTabs
            className="min-w-0"
            cardBorderClassName={DATA_TABLE_SHELL_BORDER_CLASS}
          >
            <Table
              className={DATA_TABLE_CLASS}
              aria-label="Smart Service Lead Activity Detail"
            >
              <TableHeader className={DATA_TABLE_HEADER_CLASS}>
                <TableRow size="compact" className={DATA_TABLE_HEADER_ROW_CLASS}>
                  {ACTIVITY_HEADERS.map((header) => (
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
                  const values = [
                    row.customer,
                    row.vin,
                    row.phone,
                    row.email,
                    row.clickDate,
                    row.message,
                    formatMileage(row.mileage),
                  ];
                  return (
                    <TableRow
                      key={row.id}
                      size="default"
                      className={cn(
                        DATA_TABLE_ROW_GROUP_CLASS,
                        "!border-0 !bg-transparent",
                        DATA_TABLE_ROW_HOVER_BACKGROUND_CLASS,
                      )}
                      style={{ minHeight: DATA_TABLE_BODY_CELL_HEIGHT_PX }}
                    >
                      {ACTIVITY_HEADERS.map((header, cellIndex) => {
                        const value = values[cellIndex] ?? "";
                        return (
                          <TableCell
                            key={`${row.id}-${header.key}`}
                            className={cellFrame}
                          >
                            <TableSlotCell
                              label={value}
                              className={cn(
                                DATA_TABLE_SLOT_LABEL_CLASS,
                                DATA_TABLE_CELL_INNER_HOVER_CLASS,
                                value === "—" && "text-muted-foreground",
                              )}
                              style={innerStyle}
                            />
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </DesignSystemTableShellNoTabs>
        )}
      </div>
    </div>
  );
}
