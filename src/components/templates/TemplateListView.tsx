"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableHeaderCell,
  TableRow,
  TableSlotCell,
  Button,
} from "@ikontechnologies-arlington/nxtg-design-shiftpackage/primitives";
import { DesignSystemTableShellNoTabs } from "@ikontechnologies-arlington/nxtg-design-shiftpackage";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FilePlus2 } from "lucide-react";
import { TitleBar } from "@/components/layout/TitleBar";
import { TemplateStatusBadge } from "@/components/templates/TemplateStatusBadge";
import { useTemplates } from "@/hooks/use-templates";
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
import { formatTimestamp } from "@/lib/dates";
import { getTemplateUsageCount } from "@/lib/template-usage";
import { cn } from "@/lib/utils";

const TEMPLATE_HEADERS = [
  { key: "heading", label: "Heading", widthClassName: "min-w-[180px] w-[240px]" },
  { key: "status", label: "Status", widthClassName: "min-w-[120px] w-[140px]" },
  { key: "usage", label: "Campaigns Using", widthClassName: "min-w-[120px] w-[140px]" },
  { key: "updated", label: "Updated", widthClassName: "min-w-[140px] w-[160px]" },
  { key: "updatedBy", label: "Updated By", widthClassName: "min-w-[160px] w-[180px]" },
] as const;

export function TemplateListView() {
  const templates = useTemplates();
  const router = useRouter();
  const headerThStyle = getDataTableHeaderThStyle();
  const headerCellStyle = getDataTableHeaderCellStyle();
  const innerStyle = getDataTableInnerCellStyle();

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <TitleBar
        title="Templates"
        right={
          <Button
            size="header"
            leadingIcon={<FilePlus2 aria-hidden />}
            onClick={() => router.push("/templates/new")}
          >
            Create Template
          </Button>
        }
      />

      <div className="app-shell-content-px app-shell-content-pb flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden pt-6">
        <DesignSystemTableShellNoTabs
          className="flex min-h-0 min-w-0 flex-1 flex-col"
          cardBorderClassName={DATA_TABLE_SHELL_BORDER_CLASS}
          pagination={<span className="sr-only">All templates</span>}
        >
          <Table className={DATA_TABLE_CLASS}>
            <TableHeader className={DATA_TABLE_HEADER_CLASS}>
              <TableRow size="compact" className={DATA_TABLE_HEADER_ROW_CLASS}>
                {TEMPLATE_HEADERS.map((header) => (
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
              {templates.map((template, rowIndex) => {
                const isLastRow = rowIndex === templates.length - 1;
                const cellFrame = getDataTableBodyCellFrameClass(isLastRow);

                return (
                  <TableRow
                    key={template.id}
                    size="default"
                    className={cn(
                      DATA_TABLE_ROW_GROUP_CLASS,
                      "!border-0 !bg-transparent",
                      DATA_TABLE_ROW_HOVER_BACKGROUND_CLASS,
                    )}
                    style={{ minHeight: DATA_TABLE_BODY_CELL_HEIGHT_PX }}
                  >
                    <TableCell className={cellFrame}>
                      <div
                        className={cn(
                          "flex items-center",
                          DATA_TABLE_CELL_INNER_HOVER_CLASS,
                        )}
                        style={innerStyle}
                      >
                        <Link
                          href={`/templates/${template.id}`}
                          className="min-w-0 truncate rounded-sm text-sm font-medium leading-5 text-primary hover:underline"
                        >
                          {template.heading}
                        </Link>
                      </div>
                    </TableCell>

                    <TableCell className={cellFrame}>
                      <div
                        className={cn(
                          "flex items-center",
                          DATA_TABLE_CELL_INNER_HOVER_CLASS,
                        )}
                        style={innerStyle}
                      >
                        <TemplateStatusBadge status={template.status} />
                      </div>
                    </TableCell>

                    <TableCell className={cellFrame}>
                      <TableSlotCell
                        label={String(getTemplateUsageCount(template.id))}
                        className={cn(
                          DATA_TABLE_SLOT_LABEL_CLASS,
                          DATA_TABLE_CELL_INNER_HOVER_CLASS,
                        )}
                        style={innerStyle}
                      />
                    </TableCell>

                    <TableCell className={cellFrame}>
                      <TableSlotCell
                        label={formatTimestamp(template.updatedAt)}
                        className={cn(
                          DATA_TABLE_SLOT_LABEL_CLASS,
                          DATA_TABLE_CELL_INNER_HOVER_CLASS,
                        )}
                        style={innerStyle}
                      />
                    </TableCell>

                    <TableCell className={cellFrame}>
                      <TableSlotCell
                        variant="avatar"
                        label={template.updatedBy.name}
                        avatarFallback={template.updatedBy.initials}
                        className={cn(
                          DATA_TABLE_SLOT_LABEL_CLASS,
                          DATA_TABLE_CELL_INNER_HOVER_CLASS,
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
      </div>
    </div>
  );
}
