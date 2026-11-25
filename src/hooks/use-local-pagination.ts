import { useState } from "react";

export const LIST_PAGE_SIZE = 3;

export function useLocalPagination<T>(items: T[], pageSize = LIST_PAGE_SIZE) {
  const [requestedPage, setRequestedPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const visibleItems = items.slice((page - 1) * pageSize, page * pageSize);

  return {
    page,
    totalPages,
    total: items.length,
    visibleItems,
    setPage: setRequestedPage,
  };
}
