export function getTotalPages(totalItems: number, pageSize: number): number {
  if (totalItems <= 0) return 1;
  return Math.ceil(totalItems / pageSize);
}

export function paginateItems<T>(
  items: T[],
  page: number,
  pageSize: number,
): T[] {
  const safePage = Math.max(1, page);
  const start = (safePage - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export function getPageNumbers(
  currentPage: number,
  totalPages: number,
  siblingCount = 1,
): (number | "ellipsis")[] {
  if (totalPages <= 1) return [1];

  const pages: (number | "ellipsis")[] = [];
  const left = Math.max(2, currentPage - siblingCount);
  const right = Math.min(totalPages - 1, currentPage + siblingCount);

  pages.push(1);

  if (left > 2) pages.push("ellipsis");

  for (let page = left; page <= right; page += 1) {
    pages.push(page);
  }

  if (right < totalPages - 1) pages.push("ellipsis");

  if (totalPages > 1) pages.push(totalPages);

  return pages;
}
