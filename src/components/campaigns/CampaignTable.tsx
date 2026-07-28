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
} from "@ikontechnologies-arlington/nxtg-design-shiftpackage/primitives";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CampaignStatusBadge } from "@/components/campaigns/CampaignStatusBadge";
import { getTimeZoneLabel } from "@/data/campaign-setup.defaults";
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
  DATA_TABLE_SLOT_LABEL_CLASS,
  getDataTableBodyCellFrameClass,
  getDataTableHeaderCellStyle,
  getDataTableHeaderThStyle,
  getDataTableInnerCellStyle,
} from "@/lib/data-table-chrome";
import { formatClickThroughRate, formatMessageCount } from "@/lib/format";
import type { Campaign } from "@/types/campaign";
import { cn } from "@/lib/utils";

const CAMPAIGN_HEADERS = [
  { key: "name", label: "Campaign Name", widthClassName: "min-w-[180px] w-[220px]" },
  { key: "dealer", label: "Dealership", widthClassName: "min-w-[160px] w-[180px]" },
  { key: "timeZone", label: "Time Zone", widthClassName: "min-w-[120px] w-[140px]" },
  { key: "status", label: "Status", widthClassName: "min-w-[120px] w-[140px]" },
  { key: "messages", label: "Messages", widthClassName: "min-w-[100px] w-[120px]" },
  { key: "ctr", label: "Click-Through Rate", widthClassName: "min-w-[120px] w-[140px]" },
  { key: "createdBy", label: "Created By", widthClassName: "min-w-[160px] w-[180px]" },
] as const;

interface CampaignTableProps {
  campaigns: Campaign[];
}

/** Shift file-cabinet table — wrap with `DesignSystemTableShellNoTabs` at the list level. */
export function CampaignTable({ campaigns }: CampaignTableProps) {
  const router = useRouter();
  const headerThStyle = getDataTableHeaderThStyle();
  const headerCellStyle = getDataTableHeaderCellStyle();
  const innerStyle = getDataTableInnerCellStyle();

  return (
    <Table className={DATA_TABLE_CLASS}>
      <TableHeader className={DATA_TABLE_HEADER_CLASS}>
        <TableRow size="compact" className={DATA_TABLE_HEADER_ROW_CLASS}>
          {CAMPAIGN_HEADERS.map((header) => (
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
        {campaigns.map((campaign, rowIndex) => {
          const isLastRow = rowIndex === campaigns.length - 1;
          const cellFrame = getDataTableBodyCellFrameClass(isLastRow);

          return (
            <TableRow
              key={campaign.id}
              size="default"
              tabIndex={0}
              className={cn(
                DATA_TABLE_ROW_GROUP_CLASS,
                "!border-0 !bg-transparent",
                DATA_TABLE_ROW_HOVER_BACKGROUND_CLASS,
                "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
              )}
              style={{ minHeight: DATA_TABLE_BODY_CELL_HEIGHT_PX }}
              onClick={() => router.push(`/campaigns/${campaign.id}`)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  router.push(`/campaigns/${campaign.id}`);
                }
              }}
            >
              <TableCell className={cellFrame}>
                <div
                  className={cn("flex items-center", DATA_TABLE_CELL_INNER_HOVER_CLASS)}
                  style={innerStyle}
                >
                  <Link
                    href={`/campaigns/${campaign.id}`}
                    className="min-w-0 truncate rounded-sm text-sm font-medium leading-5 text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    onClick={(event) => event.stopPropagation()}
                  >
                    {campaign.name}
                  </Link>
                </div>
              </TableCell>

              <TableCell className={cellFrame}>
                <TableSlotCell
                  label={campaign.dealer}
                  className={cn(
                    DATA_TABLE_SLOT_LABEL_CLASS,
                    DATA_TABLE_CELL_INNER_HOVER_CLASS,
                  )}
                  style={innerStyle}
                />
              </TableCell>

              <TableCell className={cellFrame}>
                <TableSlotCell
                  label={getTimeZoneLabel(campaign.timeZone)}
                  className={cn(
                    DATA_TABLE_SLOT_LABEL_CLASS,
                    DATA_TABLE_CELL_INNER_HOVER_CLASS,
                  )}
                  style={innerStyle}
                />
              </TableCell>

              <TableCell className={cellFrame}>
                <div
                  className={cn("flex items-center", DATA_TABLE_CELL_INNER_HOVER_CLASS)}
                  style={innerStyle}
                >
                  <CampaignStatusBadge status={campaign.status} />
                </div>
              </TableCell>

              <TableCell className={cellFrame}>
                <TableSlotCell
                  label={formatMessageCount(campaign.messages)}
                  className={cn(
                    DATA_TABLE_SLOT_LABEL_CLASS,
                    DATA_TABLE_CELL_INNER_HOVER_CLASS,
                  )}
                  style={innerStyle}
                />
              </TableCell>

              <TableCell className={cellFrame}>
                <TableSlotCell
                  label={formatClickThroughRate(campaign.clickThroughRate)}
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
                  label={campaign.createdBy.name}
                  avatarFallback={campaign.createdBy.initials}
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
  );
}
