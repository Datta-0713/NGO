import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  // Build page number window: show up to 5 pages centered around current
  const buildPages = (): number[] => {
    const pages: number[] = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, start + 4);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };
  const pages = buildPages();

  return (
    <div className="flex items-center justify-center gap-1 mt-4">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={17} className="text-gray-500" />
      </button>

      {pages[0] > 1 && (
        <>
          <button onClick={() => onPageChange(1)} className="w-8 h-8 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors">1</button>
          {pages[0] > 2 && <span className="text-muted text-sm px-1">…</span>}
        </>
      )}

      {pages.map(p => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
            p === page
              ? 'bg-primary text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          {p}
        </button>
      ))}

      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && <span className="text-muted text-sm px-1">…</span>}
          <button onClick={() => onPageChange(totalPages)} className="w-8 h-8 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors">{totalPages}</button>
        </>
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight size={17} className="text-gray-500" />
      </button>
    </div>
  );
};
