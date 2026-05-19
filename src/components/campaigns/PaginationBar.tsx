"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPageNumbers } from "@/lib/pagination";
import { cn } from "@/lib/utils";

interface PaginationBarProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function PaginationBar({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationBarProps) {
  const pageNumbers = getPageNumbers(currentPage, totalPages);
  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;

  return (
    <nav
      className="flex items-center justify-end gap-1"
      aria-label="Campaign list pagination"
    >
      <Button
        variant="outline"
        size="sm"
        disabled={isFirstPage}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
        Prev
      </Button>

      <ul className="flex items-center gap-1">
        {pageNumbers.map((page, index) =>
          page === "ellipsis" ? (
            <li
              key={`ellipsis-${index}`}
              className="px-2 text-sm text-muted-foreground"
              aria-hidden
            >
              …
            </li>
          ) : (
            <li key={page}>
              <Button
                variant={page === currentPage ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "min-w-9",
                  page === currentPage && "pointer-events-none",
                )}
                onClick={() => onPageChange(page)}
                aria-label={`Page ${page}`}
                aria-current={page === currentPage ? "page" : undefined}
              >
                {page}
              </Button>
            </li>
          ),
        )}
      </ul>

      <Button
        variant="outline"
        size="sm"
        disabled={isLastPage}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Next page"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}
