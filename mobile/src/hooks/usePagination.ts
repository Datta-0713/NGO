import { useState } from 'react';

export const usePagination = (initialPage = 1, initialLimit = 10) => {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const nextPage = () => setPage((prev) => prev + 1);
  const resetPage = () => setPage(initialPage);

  return {
    page,
    limit,
    nextPage,
    resetPage,
    setLimit,
  };
};
