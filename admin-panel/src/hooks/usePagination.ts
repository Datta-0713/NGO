import { useState, useCallback } from 'react';

interface UsePaginationOptions {
  initialPage?: number;
  initialLimit?: number;
}

export const usePagination = ({ initialPage = 1, initialLimit = 20 }: UsePaginationOptions = {}) => {
  const [page, setPage] = useState(initialPage);
  const [limit] = useState(initialLimit);

  const goToPage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const reset = useCallback(() => {
    setPage(initialPage);
  }, [initialPage]);

  return { page, limit, goToPage, reset };
};
