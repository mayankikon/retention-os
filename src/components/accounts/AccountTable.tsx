"use client";

import {
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableHeaderCell,
  TableRow,
  TableSlotCell,
} from "@ikontechnologies-arlington/nxtg-design-shiftpackage/primitives";
import { EligibilityBadge } from "@/components/accounts/EligibilityBadge";
import { useUpdateSmartMarketing } from "@/hooks/use-accounts";
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
import type { Account } from "@/types/account";
import { cn } from "@/lib/utils";

const ACCOUNT_HEADERS = [
  { key: "dealerName", label: "Dealer Name", widthClassName: "min-w-[180px] w-[220px]" },
  { key: "groupName", label: "Group Name", widthClassName: "min-w-[140px] w-[160px]" },
  { key: "accountManager", label: "Account Manager", widthClassName: "min-w-[160px] w-[180px]" },
  { key: "eligibility", label: "Eligibility", widthClassName: "min-w-[120px] w-[140px]" },
  { key: "smartMarketing", label: "Smart Marketing", widthClassName: "min-w-[140px] w-[160px]" },
] as const;

interface AccountTableProps {
  accounts: Account[];
}

/** Shift file-cabinet table — wrap with `DesignSystemTableShellNoTabs` at the list level. */
export function AccountTable({ accounts }: AccountTableProps) {
  const updateSmartMarketing = useUpdateSmartMarketing();
  const headerThStyle = getDataTableHeaderThStyle();
  const headerCellStyle = getDataTableHeaderCellStyle();
  const innerStyle = getDataTableInnerCellStyle();

  return (
    <Table className={DATA_TABLE_CLASS}>
      <TableHeader className={DATA_TABLE_HEADER_CLASS}>
        <TableRow size="compact" className={DATA_TABLE_HEADER_ROW_CLASS}>
          {ACCOUNT_HEADERS.map((header) => (
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
        {accounts.map((account, rowIndex) => {
          const isLastRow = rowIndex === accounts.length - 1;
          const cellFrame = getDataTableBodyCellFrameClass(isLastRow);
          const isToggleDisabled = account.eligibility === "not_eligible";

          return (
            <TableRow
              key={account.id}
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
                  className={cn("flex items-center", DATA_TABLE_CELL_INNER_HOVER_CLASS)}
                  style={innerStyle}
                >
                  <span className="truncate text-sm font-medium leading-5 text-foreground">
                    {account.dealerName}
                  </span>
                </div>
              </TableCell>

              <TableCell className={cellFrame}>
                <TableSlotCell
                  label={account.groupName}
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
                  label={account.accountManager.name}
                  avatarFallback={account.accountManager.initials}
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
                  <EligibilityBadge eligibility={account.eligibility} />
                </div>
              </TableCell>

              <TableCell className={cellFrame}>
                <div
                  className={cn("flex items-center gap-2", DATA_TABLE_CELL_INNER_HOVER_CLASS)}
                  style={innerStyle}
                >
                  <Switch
                    checked={account.isSmartMarketingEnabled}
                    disabled={isToggleDisabled}
                    onCheckedChange={(checked) =>
                      updateSmartMarketing(account.id, checked)
                    }
                    aria-label={`Smart marketing for ${account.dealerName}`}
                  />
                  <span className="text-sm text-muted-foreground">
                    {account.isSmartMarketingEnabled ? "On" : "Off"}
                  </span>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
