"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@ikontechnologies-arlington/nxtg-design-shiftpackage/primitives";
import { ArrowDown, ArrowUp, ArrowUpDown, Info } from "lucide-react";
import type {
  OverviewSort,
  OverviewSortKey,
} from "@/lib/smart-marketing-overview";
import { cn } from "@/lib/utils";
import type { Account } from "@/types/account";

/** Figma `neutral-2` row rule. */
const ROW_BORDER_CLASS = "border-y border-[#cbcbcb]";

/**
 * No widths: with `table-fixed`, the four columns split everything after the
 * 16px gutter equally, so the table fills any screen width.
 */
const COLUMNS: {
  key: OverviewSortKey;
  label: string;
  info?: string;
}[] = [
  { key: "dealership", label: "Dealership" },
  { key: "accountManager", label: "Account Manager" },
  { key: "eligibility", label: "Eligibility" },
  {
    key: "activeStatus",
    label: "Active Status",
    info: "Turn Smart Marketing on or off for a dealership. Ineligible dealerships stay off.",
  },
];

function SortButton({
  label,
  direction,
  onClick,
}: {
  label: string;
  direction: OverviewSort["direction"] | null;
  onClick: () => void;
}) {
  const Icon =
    direction === "asc" ? ArrowUp : direction === "desc" ? ArrowDown : ArrowUpDown;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex size-6 cursor-pointer items-center justify-center rounded-sm hover:bg-[#f4f4f4]",
        direction ? "text-foreground" : "text-[#b4b4b4]",
      )}
      aria-label={`Sort by ${label}`}
    >
      <Icon className="size-4" aria-hidden />
    </button>
  );
}

function EligibilityTag({ eligibility }: { eligibility: Account["eligibility"] }) {
  const isEligible = eligibility === "eligible";
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-[4px] border px-2 pb-px text-[14px] font-semibold leading-[19px] text-[#111]",
        isEligible
          ? "border-[#40c6b1] bg-[#bfece5]"
          : "border-[#ec7851] bg-[#f9d2c5]",
      )}
    >
      {isEligible ? "Eligible" : "Ineligible"}
    </span>
  );
}

/** Figma "Toggle / Small": 36×16 track with a 16px square knob. */
function ActiveStatusToggle({
  account,
  onChange,
}: {
  account: Account;
  onChange: (isEnabled: boolean) => void;
}) {
  const isLocked = account.eligibility !== "eligible";
  const isOn = account.isSmartMarketingEnabled;
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isOn}
      aria-label={`Smart Marketing for ${account.dealerName}`}
      disabled={isLocked}
      onClick={() => onChange(!isOn)}
      className={cn(
        "relative block h-4 w-9 shrink-0 rounded-[4px] border",
        isLocked
          ? "cursor-not-allowed border-[#dcdcdc] bg-[#f4f4f4]"
          : "cursor-pointer border-[#dcdcdc] bg-white",
      )}
    >
      <span
        className={cn(
          "absolute top-[12.5%] bottom-[12.5%] w-4 rounded-[2px] transition-[left] duration-150",
          isOn ? "left-[18px] bg-[#126550]" : "left-[2px]",
          !isOn && (isLocked ? "bg-[#dcdcdc]" : "bg-[#b4b4b4]"),
        )}
        aria-hidden
      />
    </button>
  );
}

interface OverviewAccountTableProps {
  accounts: Account[];
  sort: OverviewSort | null;
  onSortChange: (key: OverviewSortKey) => void;
  onSmartMarketingChange: (accountId: string, isEnabled: boolean) => void;
}

/** Smart Marketing overview table (Figma: Campaign Builder MVP › 2475:2983). */
export function OverviewAccountTable({
  accounts,
  sort,
  onSortChange,
  onSmartMarketingChange,
}: OverviewAccountTableProps) {
  return (
    <table className="w-full table-fixed border-collapse bg-white text-left">
      <thead>
        <tr className={cn("h-[50px]", ROW_BORDER_CLASS)}>
          {/* Left gutter column so cell text lines up with the 32px page inset. */}
          <th className="w-4 p-0" aria-hidden />
          {COLUMNS.map((column) => (
            <th
              key={column.key}
              scope="col"
              className="px-4 py-[13px]"
              aria-sort={
                sort?.key === column.key
                  ? sort.direction === "asc"
                    ? "ascending"
                    : "descending"
                  : undefined
              }
            >
              <span className="flex items-center gap-1 text-[14px] font-semibold leading-[19px] text-[#111]">
                {column.label}
                {column.info ? (
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <span
                          tabIndex={0}
                          className="flex size-4 items-center justify-center text-[#666]"
                          aria-label={column.info}
                        />
                      }
                    >
                      <Info className="size-4" aria-hidden />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-64">
                      {column.info}
                    </TooltipContent>
                  </Tooltip>
                ) : null}
                <SortButton
                  label={column.label}
                  direction={sort?.key === column.key ? sort.direction : null}
                  onClick={() => onSortChange(column.key)}
                />
              </span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {accounts.map((account) => (
          <tr key={account.id} className={cn("h-[50px]", ROW_BORDER_CLASS)}>
            <td className="p-0" aria-hidden />
            <td className="px-4 py-0">
              <span className="flex flex-col gap-0.5 whitespace-nowrap">
                <span className="truncate text-[14px] font-semibold leading-[19px] text-brand-primary">
                  {account.dealerName}
                </span>
                {account.groupName ? (
                  <span className="truncate text-[12px] leading-4 text-[color:var(--theme-text-secondary)]">
                    {account.groupName}
                  </span>
                ) : null}
              </span>
            </td>
            <td className="truncate px-4 text-[14px] leading-[19px] text-[#111]">
              {account.accountManager.name}
            </td>
            <td className="px-4">
              <EligibilityTag eligibility={account.eligibility} />
            </td>
            <td className="px-4">
              <ActiveStatusToggle
                account={account}
                onChange={(isEnabled) =>
                  onSmartMarketingChange(account.id, isEnabled)
                }
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
