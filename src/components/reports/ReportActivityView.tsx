"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { parseAsString, useQueryState } from "nuqs";
import {
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
} from "@/components/reporting/reporting-ui";
import { ACTIVITY_DETAIL_ROWS, REPORTING_ROOFTOPS } from "@/data/reporting.mock";
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
import { getAllCampaigns } from "@/lib/campaign-lookup";
import {
  assignReportActivityCampaigns,
  filterReportActivityRows,
  findDealershipById,
  listReportActivityDealerships,
} from "@/lib/reports";
import { FILTER_ALL } from "@/data/lookups";
import { buildCsv, downloadCsv, formatMileage } from "@/lib/reporting";
import { cn } from "@/lib/utils";

const ACTIVITY_HEADERS = [
  { key: "customer", label: "Customer", widthClassName: "min-w-[160px] w-[180px]" },
  { key: "vin", label: "VIN", widthClassName: "min-w-[180px] w-[200px]" },
  { key: "phone", label: "Phone", widthClassName: "min-w-[130px] w-[150px]" },
  { key: "email", label: "Email", widthClassName: "min-w-[200px] w-[220px]" },
  { key: "date", label: "Click Date", widthClassName: "min-w-[110px] w-[120px]" },
  { key: "message", label: "Message", widthClassName: "min-w-[110px] w-[120px]" },
  { key: "campaign", label: "Campaign", widthClassName: "min-w-[190px] w-[210px]" },
  { key: "dealership", label: "Dealership", widthClassName: "min-w-[180px] w-[200px]" },
  { key: "mileage", label: "Mileage", widthClassName: "min-w-[100px] w-[110px]" },
] as const;

export function ReportActivityView() {
  const router = useRouter();
  const [dealershipId, setDealershipId] = useQueryState(
    "dealership",
    parseAsString.withDefault(""),
  );
  const dealership = findDealershipById(REPORTING_ROOFTOPS, dealershipId);
  // Attribute before filtering so a customer keeps the same campaign whether
  // the list is scoped to one dealership or showing every rooftop.
  const attributedRows = useMemo(
    () => assignReportActivityCampaigns(ACTIVITY_DETAIL_ROWS, getAllCampaigns()),
    [],
  );
  const rows = useMemo(
    () => filterReportActivityRows(attributedRows, dealership?.rooftop),
    [attributedRows, dealership],
  );
  const dealershipOptions = useMemo(
    () => [
      { value: FILTER_ALL, label: "All dealers" },
      ...listReportActivityDealerships(ACTIVITY_DETAIL_ROWS).map((name) => {
        const match = REPORTING_ROOFTOPS.find(
          (rooftop) => rooftop.rooftop === name,
        );
        return { value: match?.id ?? name, label: name };
      }),
    ],
    [],
  );

  const handleExport = () => {
    const csv = buildCsv(
      [
        "Customer",
        "VIN",
        "Phone",
        "Email",
        "Click Date",
        "Message",
        "Campaign",
        "Dealership",
        "Mileage",
      ],
      rows.map((row) => [
        row.customer,
        row.vin,
        row.phone,
        row.email,
        row.clickDate,
        row.message,
        row.campaign ?? "—",
        row.rooftop,
        formatMileage(row.mileage),
      ]),
    );
    downloadCsv("reports-activity.csv", csv);
  };

  const headerThStyle = getDataTableHeaderThStyle();
  const headerCellStyle = getDataTableHeaderCellStyle();
  const innerStyle = getDataTableInnerCellStyle();

  return (
    <div className="flex flex-col gap-6 pb-2">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="w-full min-w-[14rem] sm:w-[18rem]">
          <ReportingFieldLabel>Dealership</ReportingFieldLabel>
          <ReportingSelect
            label="Dealership"
            value={dealershipId || FILTER_ALL}
            options={dealershipOptions}
            onValueChange={(value) => {
              void setDealershipId(value === FILTER_ALL ? "" : value);
            }}
            className="w-full"
          />
        </div>
        <ReportingExportButton onExport={handleExport} disabled={rows.length === 0} />
      </div>

      {rows.length === 0 ? (
        <ReportingEmptyState
          title="No customers for this dealership"
          description="There is no click activity for this dealership in the current mock set."
          actionLabel={dealership ? "View all activity" : "Back to Reports"}
          onAction={() => {
            if (dealership) {
              void setDealershipId("");
              return;
            }
            router.push("/reports");
          }}
        />
      ) : (
        <DesignSystemTableShellNoTabs
          className="min-w-0"
          cardBorderClassName={DATA_TABLE_SHELL_BORDER_CLASS}
        >
          <Table
            className={DATA_TABLE_CLASS}
            aria-label={
              dealership
                ? `${dealership.rooftop} activity`
                : "All dealership activity"
            }
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
                  row.campaign ?? "—",
                  row.rooftop,
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
  );
}
