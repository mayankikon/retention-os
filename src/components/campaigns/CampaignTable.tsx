"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CampaignStatusBadge } from "@/components/campaigns/CampaignStatusBadge";
import { formatTimestamp, formatRelativeTime } from "@/lib/dates";
import { getTimeZoneLabel } from "@/data/campaign-setup.defaults";
import { formatMessageCount } from "@/lib/format";
import type { Campaign } from "@/types/campaign";

const columnHelper = createColumnHelper<Campaign>();

const columns = [
  columnHelper.accessor("name", {
    header: "Campaign Name",
    cell: (info) => (
      <Link
        href={`/campaigns/${info.row.original.id}`}
        className="font-medium text-brand-primary hover:text-brand-primary-hover hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
      >
        {info.getValue()}
      </Link>
    ),
  }),
  columnHelper.accessor("dealer", {
    header: "Dealer",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("timeZone", {
    header: "Time Zone",
    cell: (info) => getTimeZoneLabel(info.getValue()),
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => <CampaignStatusBadge status={info.getValue()} />,
  }),
  columnHelper.accessor("messages", {
    header: "Messages",
    cell: (info) => formatMessageCount(info.getValue()),
  }),
  columnHelper.accessor("createdBy", {
    header: "Created By",
    cell: (info) => {
      const creator = info.getValue();
      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="text-[10px]">
              {creator.initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-foreground">{creator.name}</span>
        </div>
      );
    },
  }),
  columnHelper.accessor("lastUpdatedAt", {
    header: "Last Updated",
    cell: (info) => (
      <TimestampCell iso={info.getValue()} label="Last updated" />
    ),
  }),
  columnHelper.accessor("group", {
    header: "Group",
    cell: (info) => info.getValue(),
  }),
];

interface CampaignTableProps {
  campaigns: Campaign[];
}

export function CampaignTable({ campaigns }: CampaignTableProps) {
  const table = useReactTable({
    data: campaigns,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <TooltipProvider>
      <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                tabIndex={0}
                className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring active:bg-muted/80"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
}

function TimestampCell({
  iso,
  label,
  className,
}: {
  iso: string;
  label: string;
  className?: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <time
          dateTime={iso}
          className={
            className ??
            "text-sm text-foreground underline decoration-dotted decoration-muted-foreground underline-offset-2"
          }
        >
          {formatTimestamp(iso)}
        </time>
      </TooltipTrigger>
      <TooltipContent>
        {label}: {formatRelativeTime(iso)}
      </TooltipContent>
    </Tooltip>
  );
}
