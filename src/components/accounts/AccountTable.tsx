"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EligibilityBadge } from "@/components/accounts/EligibilityBadge";
import { useUpdateSmartMarketing } from "@/hooks/use-accounts";
import type { Account } from "@/types/account";

const columnHelper = createColumnHelper<Account>();

interface AccountTableProps {
  accounts: Account[];
}

export function AccountTable({ accounts }: AccountTableProps) {
  const updateSmartMarketing = useUpdateSmartMarketing();

  const columns = [
    columnHelper.accessor("dealerName", {
      header: "Dealer Name",
      cell: (info) => (
        <span className="font-medium text-foreground">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor("groupName", {
      header: "Group Name",
      cell: (info) => (
        <span className="text-foreground">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor("accountManager", {
      header: "Account Manager",
      cell: (info) => {
        const manager = info.getValue();

        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="text-[10px]">
                {manager.initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-foreground">{manager.name}</span>
          </div>
        );
      },
    }),
    columnHelper.accessor("eligibility", {
      header: "Eligibility",
      cell: (info) => <EligibilityBadge eligibility={info.getValue()} />,
    }),
    columnHelper.accessor("isSmartMarketingEnabled", {
      header: "Smart Marketing",
      cell: (info) => {
        const account = info.row.original;
        const isEnabled = info.getValue();
        const isToggleDisabled = account.eligibility === "not_eligible";

        return (
          <div className="flex items-center gap-2">
            <Switch
              checked={isEnabled}
              disabled={isToggleDisabled}
              onCheckedChange={(checked) =>
                updateSmartMarketing(account.id, checked)
              }
              aria-label={`Smart marketing for ${account.dealerName}`}
            />
            <span className="text-sm text-muted-foreground">
              {isEnabled ? "On" : "Off"}
            </span>
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: accounts,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
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
            <TableRow key={row.id}>
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
  );
}
