"use client";

import { Paginator } from "@ikontechnologies-arlington/nxtg-design-shiftpackage/primitives/paginator";

interface PaginationBarProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
}

/** Thin wrapper around Shift `Paginator` (inline chrome for table shells). */
export function PaginationBar({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
}: PaginationBarProps) {
  return (
    <Paginator
      variant="inline"
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={totalItems}
      pageSize={pageSize}
      onPageChange={onPageChange}
    />
  );
}
