"use client";

import { useEffect, useState } from "react";

const TABLE_HEADER_HEIGHT_PX = 40;
const TABLE_ROW_HEIGHT_PX = 49;
const PAGINATION_HEIGHT_PX = 48;
const PAGE_CHROME_HEIGHT_PX = 300;
const MIN_PAGE_SIZE = 8;
const FALLBACK_PAGE_SIZE = 25;

interface UseViewportTablePageSizeOptions {
  hasPagination?: boolean;
}

export function useViewportTablePageSize(
  options: UseViewportTablePageSizeOptions = {},
): number {
  const { hasPagination = false } = options;
  const [pageSize, setPageSize] = useState(FALLBACK_PAGE_SIZE);

  useEffect(() => {
    const calculatePageSize = () => {
      const paginationReserve = hasPagination ? PAGINATION_HEIGHT_PX : 0;
      const availableHeight =
        window.innerHeight - PAGE_CHROME_HEIGHT_PX - paginationReserve;
      const bodyHeight = Math.max(0, availableHeight - TABLE_HEADER_HEIGHT_PX);
      const rows = Math.floor(bodyHeight / TABLE_ROW_HEIGHT_PX);

      setPageSize(Math.max(MIN_PAGE_SIZE, rows));
    };

    calculatePageSize();
    window.addEventListener("resize", calculatePageSize);

    return () => window.removeEventListener("resize", calculatePageSize);
  }, [hasPagination]);

  return pageSize;
}
